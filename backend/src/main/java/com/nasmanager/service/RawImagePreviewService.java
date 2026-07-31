package com.nasmanager.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifThumbnailDirectory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.Locale;

@Service
@Slf4j
public class RawImagePreviewService {

    private static final List<String> RAW_EXTENSIONS = List.of(
            ".cr2", ".cr3", ".arw", ".nef", ".nrw", ".dng", ".raf",
            ".orf", ".rw2", ".pef", ".srw", ".erf", ".mrw"
    );

    public boolean isRawImage(String filename, String mimeType) {
        if (filename != null) {
            String lowerName = filename.toLowerCase(Locale.ROOT);
            for (String ext : RAW_EXTENSIONS) {
                if (lowerName.endsWith(ext)) {
                    return true;
                }
            }
        }
        if (mimeType != null) {
            String lowerMime = mimeType.toLowerCase(Locale.ROOT);
            if (lowerMime.contains("raw") || lowerMime.contains("cr2") || lowerMime.contains("arw") 
                    || lowerMime.contains("nef") || lowerMime.contains("dng")) {
                return true;
            }
        }
        return false;
    }

    public byte[] extractPreviewJpeg(Path filePath) {
        if (!Files.exists(filePath)) {
            log.warn("RAW file does not exist at path: {}", filePath);
            return null;
        }

        try {
            // Step 1: Scan for embedded JPEG stream (finding largest valid preview)
            byte[] scannedJpeg = findLargestEmbeddedJpeg(filePath);
            if (scannedJpeg != null && scannedJpeg.length > 0) {
                log.info("Successfully extracted embedded JPEG preview ({} bytes) from RAW file: {}", 
                        scannedJpeg.length, filePath.getFileName());
                return scannedJpeg;
            }

            // Step 2: Fallback to metadata-extractor ExifThumbnailDirectory
            try (InputStream is = Files.newInputStream(filePath)) {
                Metadata metadata = ImageMetadataReader.readMetadata(is);
                ExifThumbnailDirectory thumbnailDir = metadata.getFirstDirectoryOfType(ExifThumbnailDirectory.class);
                if (thumbnailDir != null && thumbnailDir.containsTag(ExifThumbnailDirectory.TAG_THUMBNAIL_OFFSET)) {
                    byte[] data = thumbnailDir.getByteArray(ExifThumbnailDirectory.TAG_THUMBNAIL_OFFSET);
                    if (data != null && data.length > 0) {
                        log.info("Extracted EXIF thumbnail JPEG ({} bytes) from RAW file: {}", 
                                data.length, filePath.getFileName());
                        return data;
                    }
                }
            } catch (Exception ex) {
                log.debug("Metadata-extractor thumbnail extraction failed for {}: {}", filePath.getFileName(), ex.getMessage());
            }

        } catch (Exception e) {
            log.error("Failed to extract preview from RAW image file: {}", filePath, e);
        }

        return null;
    }

    private byte[] findLargestEmbeddedJpeg(Path filePath) {
        try (FileChannel channel = FileChannel.open(filePath, StandardOpenOption.READ)) {
            long fileSize = channel.size();
            // Skip scanning files larger than 200MB to safeguard memory usage
            if (fileSize == 0 || fileSize > 200_000_000L) {
                return null;
            }

            ByteBuffer buffer = channel.map(FileChannel.MapMode.READ_ONLY, 0, fileSize);
            int len = buffer.remaining();

            byte[] largestJpeg = null;
            long maxArea = -1;
            int maxByteLen = 0;

            for (int i = 0; i < len - 4; i++) {
                // Check JPEG SOI marker: 0xFF 0xD8 0xFF
                if ((buffer.get(i) & 0xFF) == 0xFF &&
                    (buffer.get(i + 1) & 0xFF) == 0xD8 &&
                    (buffer.get(i + 2) & 0xFF) == 0xFF) {

                    int thirdMarker = buffer.get(i + 3) & 0xFF;
                    // Check if third byte is a standard JPEG marker (e.g. APP0..APP15, DQT, SOF0, SOF2)
                    if ((thirdMarker >= 0xE0 && thirdMarker <= 0xEF) || thirdMarker == 0xDB || thirdMarker == 0xC0 || thirdMarker == 0xC2) {
                        int soi = i;
                        int maxSearch = Math.min(len - 1, soi + 30_000_000); // Search up to 30MB max JPEG size
                        int eoi = -1;

                        for (int j = soi + 2; j < maxSearch; j++) {
                            if ((buffer.get(j) & 0xFF) == 0xFF && (buffer.get(j + 1) & 0xFF) == 0xD9) {
                                eoi = j + 1; // inclusive end index of EOI byte
                            }
                        }

                        if (eoi > soi + 200) { // Minimum JPEG size 200 bytes
                            int jpegLen = eoi - soi + 1;
                            byte[] candidateBytes = new byte[jpegLen];
                            buffer.position(soi);
                            buffer.get(candidateBytes);

                            // Validate JPEG candidate with ImageIO
                            try (ByteArrayInputStream bais = new ByteArrayInputStream(candidateBytes)) {
                                BufferedImage img = ImageIO.read(bais);
                                if (img != null && img.getWidth() > 0 && img.getHeight() > 0) {
                                    long area = (long) img.getWidth() * img.getHeight();
                                    if (area > maxArea || (area == maxArea && jpegLen > maxByteLen)) {
                                        maxArea = area;
                                        maxByteLen = jpegLen;
                                        largestJpeg = candidateBytes;
                                    }
                                }
                            } catch (Exception ignored) {
                                // Invalid JPEG candidate slice, continue scanning
                            }
                        }
                    }
                }
            }

            return largestJpeg;
        } catch (Exception e) {
            log.debug("Error during scanning embedded JPEG for file {}: {}", filePath.getFileName(), e.getMessage());
            return null;
        }
    }
}
