package com.nasmanager.service;

import com.nasmanager.dto.FileDtos.*;
import com.nasmanager.model.FileItem;
import com.nasmanager.model.FileStatus;
import com.nasmanager.model.Folder;
import com.nasmanager.model.User;
import com.nasmanager.repository.FileEmbeddingRepository;
import com.nasmanager.repository.FileItemRepository;
import com.nasmanager.repository.FolderRepository;
import com.nasmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileItemRepository fileItemRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final LocalStorageService localStorageService;
    private final FileIngestionService fileIngestionService;
    private final FileEmbeddingRepository fileEmbeddingRepository;
    private final RawImagePreviewService rawImagePreviewService;

    @Transactional
    public FileItemDto uploadFile(UUID userId, UUID folderId, MultipartFile file) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Folder folder = null;
        if (folderId != null) {
            folder = folderRepository.findByIdAndOwner(folderId, owner)
                    .orElseThrow(() -> new IllegalArgumentException("Folder not found"));
        }

        // Store physical file
        String storagePath = localStorageService.storeFile(userId, file);
        String mimeType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        FileItem fileItem = FileItem.builder()
                .name(file.getOriginalFilename())
                .storagePath(storagePath)
                .mimeType(mimeType)
                .sizeBytes(file.getSize())
                .folder(folder)
                .owner(owner)
                .status(FileStatus.PROCESSING)
                .build();

        fileItemRepository.save(fileItem);

        // Update user storage quota
        owner.setStorageUsedBytes(owner.getStorageUsedBytes() + file.getSize());
        userRepository.save(owner);

        // Trigger async text extraction and vector embedding ingestion
        fileIngestionService.processAndIndexFile(fileItem);

        return mapToDto(fileItem);
    }

    public List<FileItemDto> getFiles(UUID userId, UUID folderId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<FileItem> files;
        if (folderId == null) {
            files = fileItemRepository.findByOwnerAndFolderIsNull(owner);
        } else {
            files = fileItemRepository.findByOwnerAndFolderId(owner, folderId);
        }

        return files.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public Resource getFileResource(UUID userId, UUID fileId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FileItem fileItem = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        // Check ownership or shared access
        if (!fileItem.getOwner().getId().equals(userId)) {
            throw new SecurityException("Access denied to requested file");
        }

        try {
            Path filePath = localStorageService.getFilePath(fileItem.getStoragePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + fileItem.getName());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error reading file path", e);
        }
    }

    public FileItem getFileEntity(UUID fileId) {
        return fileItemRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));
    }

    @Transactional
    public FileItemDto renameFile(UUID userId, UUID fileId, String newName) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FileItem fileItem = fileItemRepository.findByIdAndOwner(fileId, owner)
                .orElseThrow(() -> new IllegalArgumentException("File not found or access denied"));

        fileItem.setName(newName);
        fileItemRepository.save(fileItem);
        return mapToDto(fileItem);
    }

    @Transactional
    public void deleteFile(UUID userId, UUID fileId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FileItem fileItem = fileItemRepository.findByIdAndOwner(fileId, owner)
                .orElseThrow(() -> new IllegalArgumentException("File not found or access denied"));

        // Delete physical file & embeddings
        fileEmbeddingRepository.deleteByFileItem(fileItem);
        localStorageService.deleteFile(fileItem.getStoragePath());

        // Reclaim storage quota
        owner.setStorageUsedBytes(Math.max(0L, owner.getStorageUsedBytes() - fileItem.getSizeBytes()));
        userRepository.save(owner);

        fileItemRepository.delete(fileItem);
    }

    public PreviewResult getFilePreviewResource(UUID userId, UUID fileId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FileItem fileItem = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        // Check ownership or shared access
        if (!fileItem.getOwner().getId().equals(userId)) {
            throw new SecurityException("Access denied to requested file");
        }

        Path filePath = localStorageService.getFilePath(fileItem.getStoragePath());

        // Extract raw image preview if it is a RAW image
        if (rawImagePreviewService.isRawImage(fileItem.getName(), fileItem.getMimeType())) {
            byte[] jpegBytes = rawImagePreviewService.extractPreviewJpeg(filePath);
            if (jpegBytes != null && jpegBytes.length > 0) {
                ByteArrayResource byteArrayResource = new ByteArrayResource(jpegBytes);
                String previewFilename = fileItem.getName() + "_preview.jpg";
                return new PreviewResult(byteArrayResource, "image/jpeg", previewFilename);
            }
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return new PreviewResult(resource, fileItem.getMimeType(), fileItem.getName());
            } else {
                throw new RuntimeException("Could not read file: " + fileItem.getName());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error reading file path", e);
        }
    }

    public static class PreviewResult {
        private final Resource resource;
        private final String mimeType;
        private final String filename;

        public PreviewResult(Resource resource, String mimeType, String filename) {
            this.resource = resource;
            this.mimeType = mimeType;
            this.filename = filename;
        }

        public Resource getResource() { return resource; }
        public String getMimeType() { return mimeType; }
        public String getFilename() { return filename; }
    }

    @Transactional
    public List<FileItemDto> reindexFolder(UUID userId, UUID folderId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<FileItem> files;
        if (folderId == null) {
            files = fileItemRepository.findByOwnerAndFolderIsNull(owner);
        } else {
            // Verify folder exists and belongs to the user
            Folder folder = folderRepository.findByIdAndOwner(folderId, owner)
                    .orElseThrow(() -> new IllegalArgumentException("Folder not found or access denied"));
            files = fileItemRepository.findByOwnerAndFolderId(owner, folderId);
        }

        for (FileItem fileItem : files) {
            fileItem.setStatus(FileStatus.PROCESSING);
            fileItemRepository.save(fileItem);
            fileIngestionService.processAndIndexFile(fileItem);
        }

        return files.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public FileItemDto mapToDto(FileItem fileItem) {
        return FileItemDto.builder()
                .id(fileItem.getId())
                .name(fileItem.getName())
                .mimeType(fileItem.getMimeType())
                .sizeBytes(fileItem.getSizeBytes())
                .folderId(fileItem.getFolder() != null ? fileItem.getFolder().getId() : null)
                .ownerId(fileItem.getOwner().getId())
                .ownerUsername(fileItem.getOwner().getUsername())
                .status(fileItem.getStatus())
                .checksum(fileItem.getChecksum())
                .createdAt(fileItem.getCreatedAt())
                .updatedAt(fileItem.getUpdatedAt())
                .build();
    }
}
