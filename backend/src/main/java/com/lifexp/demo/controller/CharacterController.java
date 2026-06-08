package com.lifexp.demo.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/character")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class CharacterController {

    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${openai.api.key:}")
    private String apiKey;

    private static final String[] CLASSES = {
            "BOOKWORM",
            "SPORT_MASTER",
            "CODER",
            "GAMER",
            "EXPLORER",
            "ZEN"
    };

    @PostMapping(value = "/generate-all-idle", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CharacterPackResponse generateAllIdle(
            @RequestPart("selfie") MultipartFile selfie
    ) throws Exception {

        System.out.println("========== GENERATE ALL IDLE CALLED ==========");
        System.out.println("OPENAI KEY LOADED: " + (apiKey != null && !apiKey.isBlank()));
        System.out.println("FILE NAME: " + selfie.getOriginalFilename());
        System.out.println("FILE TYPE: " + selfie.getContentType());
        System.out.println("FILE SIZE: " + selfie.getSize());

        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("OPENAI_API_KEY is missing.");
        }

        Map<String, String> sprites = new HashMap<>();

        for (String className : CLASSES) {
            try {
                System.out.println("----------------------------------------");
                System.out.println("GENERATING CLASS: " + className);

                String prompt = buildPrompt(className);
                String image = callOpenAi(selfie, prompt);

                System.out.println("RETURNING CLASS: " + className);
                System.out.println("IMAGE NULL? " + (image == null));
                System.out.println("IMAGE LENGTH: " + (image == null ? 0 : image.length()));
                System.out.println("IMAGE START: " + safeStart(image));

                sprites.put(className, image);

                System.out.println("SUCCESS: " + className);

            } catch (Exception e) {
                System.out.println("ERROR GENERATING CLASS: " + className);
                e.printStackTrace();

                // Keep app working even if one class fails
                sprites.put(className, "");
            }
        }

        System.out.println("========== FINAL SPRITES ==========");
        sprites.forEach((k, v) -> {
            System.out.println(k + " -> " + safeStart(v) + " | length=" + (v == null ? 0 : v.length()));
        });

        return new CharacterPackResponse(
                sprites,
                true,
                "Generated available sprites. Some may be blank if a class failed."
        );
    }

    private String buildPrompt(String className) {
        return """
                Convert the uploaded person photo into ONE small 2D cartoon RPG sprite.

                Keep the person's facial identity recognizable.
                Generate only one full-body character.
                Do NOT create:
                - poster
                - dashboard
                - UI layout
                - text

                Pose:
                - idle standing
                - full body visible
                - centered

                Class: %s

                Class clothing:
                BOOKWORM = magical scholar hoodie, green/brown colors, book accessory
                SPORT_MASTER = athletic outfit, sneakers, green energy aura
                CODER = cyber hoodie, black outfit, blue code accents
                GAMER = neon hoodie, headset, purple arcade style
                EXPLORER = adventure jacket, backpack, compass, orange theme
                ZEN = monk-inspired outfit, soft purple aura

                Style:
                - 2D cartoon sprite
                - chibi RPG
                - clean lines
                - bright colors
                - simple background
                - game-ready
                """.formatted(className);
    }

    private String callOpenAi(MultipartFile file, String prompt) throws Exception {

        String boundary = "----LifeXPBoundary" + System.currentTimeMillis();

        ByteArrayOutputStream body = new ByteArrayOutputStream();

        writeText(body, boundary, "model", "gpt-image-1");
        writeText(body, boundary, "prompt", prompt);
        writeText(body, boundary, "size", "1024x1024");

        writeFile(body, boundary, file);

        body.write(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/images/edits"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .timeout(java.time.Duration.ofSeconds(180))
                .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray()))
                .build();

        System.out.println("SENDING REQUEST TO OPENAI...");

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("OPENAI STATUS: " + response.statusCode());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            System.out.println("OPENAI ERROR BODY:");
            System.out.println(response.body());
            throw new RuntimeException("OpenAI image generation failed.");
        }

        JsonNode root = mapper.readTree(response.body());

        JsonNode first = root.path("data").get(0);

        if (first == null || first.isMissingNode()) {
            System.out.println("OPENAI RAW BODY:");
            System.out.println(response.body());
            throw new RuntimeException("OpenAI returned no image data.");
        }

        if (first.has("b64_json")) {
            String b64 = first.get("b64_json").asText();
            return "data:image/png;base64," + b64;
        }

        if (first.has("url")) {
            return first.get("url").asText();
        }

        System.out.println("OPENAI RAW BODY:");
        System.out.println(response.body());
        throw new RuntimeException("OpenAI returned unsupported image format.");
    }

    private String safeStart(String value) {
        if (value == null) return "NULL";
        if (value.isBlank()) return "BLANK";
        return value.substring(0, Math.min(value.length(), 45));
    }

    private void writeText(ByteArrayOutputStream body, String boundary, String name, String value) throws Exception {
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n")
                .getBytes(StandardCharsets.UTF_8));
        body.write((value + "\r\n").getBytes(StandardCharsets.UTF_8));
    }

    private void writeFile(ByteArrayOutputStream body, String boundary, MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename() == null ? "selfie.png" : file.getOriginalFilename();
        String contentType = file.getContentType() == null ? "image/png" : file.getContentType();

        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"image\"; filename=\"" + filename + "\"\r\n")
                .getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Type: " + contentType + "\r\n\r\n")
                .getBytes(StandardCharsets.UTF_8));
        body.write(file.getBytes());
        body.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    public record CharacterPackResponse(
            Map<String, String> sprites,
            boolean ai,
            String message
    ) {}
}