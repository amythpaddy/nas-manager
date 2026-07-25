package com.nasmanager.service;

import com.nasmanager.dto.FolderDtos.*;
import com.nasmanager.model.Folder;
import com.nasmanager.model.User;
import com.nasmanager.repository.FolderRepository;
import com.nasmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;

    @Transactional
    public FolderDto createFolder(UUID userId, CreateFolderRequest request) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Folder parentFolder = null;
        if (request.getParentId() != null) {
            parentFolder = folderRepository.findByIdAndOwner(request.getParentId(), owner)
                    .orElseThrow(() -> new IllegalArgumentException("Parent folder not found or access denied"));
        }

        Folder folder = Folder.builder()
                .name(request.getName())
                .parent(parentFolder)
                .owner(owner)
                .build();

        folderRepository.save(folder);
        return mapToDto(folder);
    }

    public List<FolderDto> getFolders(UUID userId, UUID parentId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Folder> folders;
        if (parentId == null) {
            folders = folderRepository.findByOwnerAndParentIsNull(owner);
        } else {
            folders = folderRepository.findByOwnerAndParentId(owner, parentId);
        }

        return folders.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteFolder(UUID userId, UUID folderId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Folder folder = folderRepository.findByIdAndOwner(folderId, owner)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found or access denied"));

        folderRepository.delete(folder);
    }

    public FolderDto mapToDto(Folder folder) {
        return FolderDto.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
                .ownerId(folder.getOwner().getId())
                .ownerUsername(folder.getOwner().getUsername())
                .createdAt(folder.getCreatedAt())
                .build();
    }
}
