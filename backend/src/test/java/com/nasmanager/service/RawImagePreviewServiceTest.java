package com.nasmanager.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class RawImagePreviewServiceTest {

    private RawImagePreviewService service;

    @BeforeEach
    void setUp() {
        service = new RawImagePreviewService();
    }

    @Test
    void testIsRawImage() {
        assertTrue(service.isRawImage("sample.CR2", "application/octet-stream"));
        assertTrue(service.isRawImage("sample.cr2", "image/x-canon-cr2"));
        assertTrue(service.isRawImage("photo.ARW", "image/x-sony-arw"));
        assertTrue(service.isRawImage("photo.arw", "application/octet-stream"));
        assertTrue(service.isRawImage("image.NEF", "image/x-nikon-nef"));
        assertTrue(service.isRawImage("image.DNG", "image/x-adobe-dng"));

        assertFalse(service.isRawImage("picture.jpg", "image/jpeg"));
        assertFalse(service.isRawImage("document.pdf", "application/pdf"));
    }

    @Test
    void testExtractPreviewJpegFromEmbeddedRawFile(@TempDir Path tempDir) throws Exception {
        // Create a synthetic test image
        BufferedImage img = new BufferedImage(300, 200, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.BLUE);
        g.fillRect(0, 0, 300, 200);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, "jpg", baos);
        byte[] jpegBytes = baos.toByteArray();

        // Construct a dummy RAW container with header + padding + embedded JPEG bytes
        Path fakeRawPath = tempDir.resolve("test_camera_photo.CR2");
        try (FileOutputStream fos = new FileOutputStream(fakeRawPath.toFile())) {
            // TIFF / CR2 style dummy header padding
            byte[] headerPadding = new byte[1024];
            headerPadding[0] = 0x49; // II
            headerPadding[1] = 0x49;
            headerPadding[2] = 0x2A;
            headerPadding[3] = 0x00;
            fos.write(headerPadding);

            // Embedded preview JPEG stream
            fos.write(jpegBytes);

            // Trailing raw sensor dummy bytes
            byte[] rawSensorPadding = new byte[4096];
            fos.write(rawSensorPadding);
        }

        byte[] extractedJpeg = service.extractPreviewJpeg(fakeRawPath);
        assertNotNull(extractedJpeg, "Extracted JPEG byte array should not be null");
        assertTrue(extractedJpeg.length > 0, "Extracted JPEG length should be greater than 0");

        // Verify extracted byte stream is a valid readable JPEG image
        BufferedImage extractedImg = ImageIO.read(new java.io.ByteArrayInputStream(extractedJpeg));
        assertNotNull(extractedImg, "Extracted image should be readable by ImageIO");
        assertEquals(300, extractedImg.getWidth());
        assertEquals(200, extractedImg.getHeight());
    }
}
