package com.nasmanager.service;

import com.nasmanager.dto.ShareDtos.*;
import com.nasmanager.model.*;
import com.nasmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShareService {

    private final FileShareRepository shareRepository;
    private final FileItemRepository fileItemRepository;
    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    @Transactional
    public ShareResponseDto createShare(UUID userId, ShareRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FileItem fileItem = null;
        if (request.getFileId() != null) {
            fileItem = fileItemRepository.findByIdAndOwner(request.getFileId(), owner)
                    .orElseThrow(() -> new IllegalArgumentException("File not found or access denied"));
        }

        Folder folder = null;
        if (request.getFolderId() != null) {
            folder = folderRepository.findByIdAndOwner(request.getFolderId(), owner)
                    .orElseThrow(() -> new IllegalArgumentException("Folder not found or access denied"));
        }

        User targetUser = null;
        if (request.getTargetUsername() != null && !request.getTargetUsername().isBlank()) {
            targetUser = userRepository.findByUsername(request.getTargetUsername())
                    .orElseThrow(() -> new IllegalArgumentException("Target user not found: " + request.getTargetUsername()));
        }

        String publicToken = null;
        if (Boolean.TRUE.equals(request.getCreatePublicLink())) {
            publicToken = UUID.randomUUID().toString();
        }

        LocalDateTime expiresAt = null;
        if (request.getExpirationDays() != null && request.getExpirationDays() > 0) {
            expiresAt = LocalDateTime.now().plusDays(request.getExpirationDays());
        }

        FileShare share = FileShare.builder()
                .fileItem(fileItem)
                .folder(folder)
                .sharedWithUser(targetUser)
                .permission(request.getPermission() != null ? request.getPermission() : SharePermission.READ)
                .publicToken(publicToken)
                .expiresAt(expiresAt)
                .build();

        shareRepository.save(share);
        return mapToDto(share);
    }

    public List<ShareResponseDto> getSharedWithMe(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<FileShare> shares = shareRepository.findBySharedWithUser(user);
        return shares.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public ShareResponseDto getByPublicToken(String token) {
        FileShare share = shareRepository.findByPublicToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired share token"));

        if (share.getExpiresAt() != null && share.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Share link has expired");
        }

        return mapToDto(share);
    }

    public ShareResponseDto mapToDto(FileShare share) {
        String publicUrl = share.getPublicToken() != null ? "/api/shares/public/" + share.getPublicToken() : null;

        return ShareResponseDto.builder()
                .id(share.getId())
                .fileId(share.getFileItem() != null ? share.getFileItem().getId() : null)
                .fileName(share.getFileItem() != null ? share.getFileItem().getName() : null)
                .folderId(share.getFolder() != null ? share.getFolder().getId() : null)
                .folderName(share.getFolder() != null ? share.getFolder().getName() : null)
                .sharedWithUsername(share.getSharedWithUser() != null ? share.getSharedWithUser().getUsername() : "Public Link")
                .permission(share.getPermission())
                .publicToken(share.getPublicToken())
                .publicUrl(publicUrl)
                .expiresAt(share.getExpiresAt())
                .createdAt(share.getCreatedAt())
                .build();
    }
}
