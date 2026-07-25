package com.nasmanager.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;

@Service
public class LocalStorageService {

    @Value("${nas.storage.root-directory}")
    private String rootDirectory;

    private Path rootPath;

    @PostConstruct
    public void init() {
        String resolvedRoot = rootDirectory.replace("${user.home}", System.getProperty("user.home"));
        this.rootPath = Paths.get(resolvedRoot);
        try {
            Files.createDirectories(this.rootPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize root storage directory at: " + resolvedRoot, e);
        }
    }

    public String storeFile(UUID userId, MultipartFile file) {
        try {
            Path userDir = rootPath.resolve(userId.toString());
            Files.createDirectories(userDir);

            String uniqueFilename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path targetLocation = userDir.resolve(uniqueFilename);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return targetLocation.toAbsolutePath().toString();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), ex);
        }
    }

    public Path getFilePath(String storagePath) {
        return Paths.get(storagePath);
    }

    public boolean deleteFile(String storagePath) {
        try {
            Path path = Paths.get(storagePath);
            return Files.deleteIfExists(path);
        } catch (IOException e) {
            return false;
        }
    }

    public String calculateChecksum(InputStream inputStream) {
        try {
            return DigestUtils.md5DigestAsHex(inputStream);
        } catch (IOException e) {
            return null;
        }
    }
}
