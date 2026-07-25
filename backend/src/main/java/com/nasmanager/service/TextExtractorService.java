package com.nasmanager.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
@Slf4j
public class TextExtractorService {

    private final Tika tika = new Tika();

    public String extractText(File file) {
        try {
            tika.setMaxStringLength(10 * 1024 * 1024); // 10MB text extraction cap per file
            return tika.parseToString(file);
        } catch (IOException | org.apache.tika.exception.TikaException e) {
            log.error("Failed to extract text from file: {}", file.getName(), e);
            return "";
        }
    }
}
