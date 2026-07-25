package com.nasmanager.controller;

import com.nasmanager.dto.SearchDtos.*;
import com.nasmanager.security.UserPrincipal;
import com.nasmanager.service.SemanticSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SemanticSearchService searchService;

    @GetMapping
    public ResponseEntity<List<SearchResultItem>> search(@AuthenticationPrincipal UserPrincipal currentUser,
                                                         @RequestParam("q") String query,
                                                         @RequestParam(value = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(searchService.search(currentUser.getId(), query, limit));
    }
}
