package com.nasmanager.controller;

import com.nasmanager.dto.FolderDtos.*;
import com.nasmanager.security.UserPrincipal;
import com.nasmanager.service.FolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @PostMapping
    public ResponseEntity<FolderDto> createFolder(@AuthenticationPrincipal UserPrincipal currentUser,
                                                  @RequestBody CreateFolderRequest request) {
        return ResponseEntity.ok(folderService.createFolder(currentUser.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<FolderDto>> getFolders(@AuthenticationPrincipal UserPrincipal currentUser,
                                                      @RequestParam(required = false) UUID parentId) {
        return ResponseEntity.ok(folderService.getFolders(currentUser.getId(), parentId));
    }

    @DeleteMapping("/{folderId}")
    public ResponseEntity<Void> deleteFolder(@AuthenticationPrincipal UserPrincipal currentUser,
                                             @PathVariable UUID folderId) {
        folderService.deleteFolder(currentUser.getId(), folderId);
        return ResponseEntity.noContent().build();
    }
}
