package com.nasmanager.dto;

import com.nasmanager.model.FileStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class FileDtos {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileItemDto {
        private UUID id;
        private String name;
        private String mimeType;
        private Long sizeBytes;
        private UUID folderId;
        private UUID ownerId;
        private String ownerUsername;
        private FileStatus status;
        private String checksum;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RenameFileRequest {
        private String newName;
    }
}
