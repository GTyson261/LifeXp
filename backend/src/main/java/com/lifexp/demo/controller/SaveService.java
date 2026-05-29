package com.lifexp.demo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class SaveService {
    private static final String SAVE_FOLDER = "data";
    private static final String SAVE_FILE = "lifexp-save.json";

    private final ObjectMapper objectMapper;
    private final Path savePath;

    public SaveService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.savePath = Paths.get(SAVE_FOLDER, SAVE_FILE);
    }

    public PlayerState loadOrCreateNew() {
        try {
            if (!Files.exists(savePath)) {
                return new PlayerState();
            }

            return objectMapper.readValue(savePath.toFile(), PlayerState.class);
        } catch (IOException exception) {
            System.out.println("Could not load LifeXP save file. Starting fresh. Reason: " + exception.getMessage());
            return new PlayerState();
        }
    }

    public void save(PlayerState state) {
        if (state == null) {
            return;
        }

        try {
            Files.createDirectories(savePath.getParent());
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(savePath.toFile(), state);
        } catch (IOException exception) {
            System.out.println("Could not save LifeXP progress. Reason: " + exception.getMessage());
        }
    }

    public PlayerState resetSave() {
        PlayerState freshState = new PlayerState();
        save(freshState);
        return freshState;
    }

    public boolean saveExists() {
        return Files.exists(savePath);
    }

    public String getSaveLocation() {
        return savePath.toAbsolutePath().toString();
    }
}
