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
import java.util.Base64;

@RestController
@RequestMapping("/api/avatar")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AvatarController {

    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${openai.api.key:}")
    private String apiKey;

    @PostMapping(value = "/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AvatarResponse generateAvatar(
            @RequestPart("selfie") MultipartFile selfie,
            @RequestParam("className") String className
    ) throws Exception {

        System.out.println("OPENAI KEY LOADED: " + (apiKey != null && !apiKey.isBlank()));

        String prompt = buildPrompt(className);

        if (apiKey == null || apiKey.isBlank()) {
            return new AvatarResponse(
                    createFallbackSvg(className),
                    false,
                    "No API key. Using demo avatar."
            );
        }

        String imageUrl = callOpenAi(selfie, prompt, apiKey);

        return new AvatarResponse(
                imageUrl,
                true,
                "AI avatar generated"
        );
    }

    private String buildPrompt(String className) {
        return """
                Turn this selfie into a high-quality 2.5D RPG character.
                Keep the person's face recognizable and accurate.

                Style:
                - Semi-realistic
                - Game-ready character
                - Clean background
                - Hero pose
                - Cinematic lighting

                Class: %s

                BOOKWORM = magical scholar robes, glowing books
                SPORT_MASTER = athletic armor, energy aura
                CODER = cyber hoodie, holographic code effects
                GAMER = neon esports armor, controller energy
                EXPLORER = adventurer outfit, compass gear
                ZEN = calm monk robes, soft glowing aura
                """.formatted(className);
    }

    private String callOpenAi(MultipartFile file, String prompt, String key) throws Exception {

        String boundary = "----LifeXPBoundary";

        ByteArrayOutputStream body = new ByteArrayOutputStream();

        write(body, boundary, "model", "gpt-image-1");
        write(body, boundary, "prompt", prompt);

        // Faster than 1024x1024 for local demo
        write(body, boundary, "size", "1024x1024");

        writeFile(body, boundary, file);

        body.write(("--" + boundary + "--").getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/images/edits"))
                .header("Authorization", "Bearer " + key)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .timeout(java.time.Duration.ofSeconds(90))
                .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray()))
                .build();

        HttpResponse<String> res = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        if (res.statusCode() < 200 || res.statusCode() >= 300) {
            throw new RuntimeException("OpenAI error: " + res.body());
        }

        JsonNode json = mapper.readTree(res.body());

        return "data:image/png;base64," +
                json.get("data").get(0).get("b64_json").asText();
    }

    private void write(ByteArrayOutputStream body, String boundary, String name, String value) throws Exception {
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n")
                .getBytes(StandardCharsets.UTF_8));
        body.write((value + "\r\n").getBytes(StandardCharsets.UTF_8));
    }

    private void writeFile(ByteArrayOutputStream body, String boundary, MultipartFile file) throws Exception {
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"image\"; filename=\"selfie.png\"\r\n")
                .getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Type: image/png\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(file.getBytes());
        body.write("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private String createFallbackSvg(String className) {
        String svg = """
                <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
                  <rect width="500" height="500" fill="black"/>
                  <text x="50%%" y="50%%" fill="white" font-size="40" text-anchor="middle" dominant-baseline="middle">
                    %s
                  </text>
                </svg>
                """.formatted(className);

        return "data:image/svg+xml;base64," +
                Base64.getEncoder().encodeToString(svg.getBytes(StandardCharsets.UTF_8));
    }

    public record AvatarResponse(String imageUrl, boolean ai, String message) {}
}