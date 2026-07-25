package com.nasmanager.controller;

import com.nasmanager.dto.FileDtos.*;
import com.nasmanager.model.FileItem;
import com.nasmanager.security.UserPrincipal;
import com.nasmanager.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<FileItemDto> uploadFile(@AuthenticationPrincipal UserPrincipal currentUser,
                                                  @RequestParam(required = false) UUID folderId,
                                                  @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(fileService.uploadFile(currentUser.getId(), folderId, file));
    }

    @GetMapping
    public ResponseEntity<List<FileItemDto>> getFiles(@AuthenticationPrincipal UserPrincipal currentUser,
                                                      @RequestParam(required = false) UUID folderId) {
        return ResponseEntity.ok(fileService.getFiles(currentUser.getId(), folderId));
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@AuthenticationPrincipal UserPrincipal currentUser,
                                                 @PathVariable UUID fileId) {
        Resource resource = fileService.getFileResource(currentUser.getId(), fileId);
        FileItem fileEntity = fileService.getFileEntity(fileId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileEntity.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileEntity.getName() + "\"")
                .body(resource);
    }

    @GetMapping("/{fileId}/preview")
    public ResponseEntity<Resource> previewFile(@AuthenticationPrincipal UserPrincipal currentUser,
                                                @PathVariable UUID fileId) {
        Resource resource = fileService.getFileResource(currentUser.getId(), fileId);
        FileItem fileEntity = fileService.getFileEntity(fileId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileEntity.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileEntity.getName() + "\"")
                .body(resource);
    }

    @PatchMapping("/{fileId}/rename")
    public ResponseEntity<FileItemDto> renameFile(@AuthenticationPrincipal UserPrincipal currentUser,
                                                  @PathVariable UUID fileId,
                                                  @RequestBody RenameFileRequest request) {
        return ResponseEntity.ok(fileService.renameFile(currentUser.getId(), fileId, request.getNewName()));
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@AuthenticationPrincipal UserPrincipal currentUser,
                                           @PathVariable UUID fileId) {
        fileService.deleteFile(currentUser.getId(), fileId);
        return ResponseEntity.noContent().build();
    }
}
