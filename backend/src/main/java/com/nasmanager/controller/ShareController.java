package com.nasmanager.controller;

import com.nasmanager.dto.ShareDtos.*;
import com.nasmanager.security.UserPrincipal;
import com.nasmanager.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @PostMapping
    public ResponseEntity<ShareResponseDto> createShare(@AuthenticationPrincipal UserPrincipal currentUser,
                                                        @RequestBody ShareRequest request) {
        return ResponseEntity.ok(shareService.createShare(currentUser.getId(), request));
    }

    @GetMapping("/shared-with-me")
    public ResponseEntity<List<ShareResponseDto>> getSharedWithMe(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(shareService.getSharedWithMe(currentUser.getId()));
    }

    @GetMapping("/public/{token}")
    public ResponseEntity<ShareResponseDto> getPublicShare(@PathVariable String token) {
        return ResponseEntity.ok(shareService.getByPublicToken(token));
    }
}
