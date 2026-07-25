package com.nasmanager.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class OllamaEmbeddingService {

    @Value("${nas.ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${nas.ollama.model:nomic-embed-text}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Double> getEmbedding(String text) {
        try {
            String endpoint = ollamaUrl + "/api/embeddings";

            Map<String, Object> request = new HashMap<>();
            request.put("model", modelName);
            request.put("prompt", text);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<?> rawEmbedding = (List<?>) response.getBody().get("embedding");
                if (rawEmbedding != null) {
                    List<Double> embedding = new ArrayList<>();
                    for (Object num : rawEmbedding) {
                        embedding.add(((Number) num).doubleValue());
                    }
                    return embedding;
                }
            }
        } catch (Exception e) {
            log.warn("Ollama service call failed ({}), generating fallback vector.", e.getMessage());
        }

        // Fallback synthetic 768-dimension vector if Ollama container is offline
        List<Double> fallback = new ArrayList<>(Collections.nCopies(768, 0.0));
        if (text != null && !text.isEmpty()) {
            fallback.set(0, (double) Math.abs(text.hashCode() % 100) / 100.0);
        }
        return fallback;
    }

    public String formatVectorForPgVector(List<Double> embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.size(); i++) {
            sb.append(embedding.get(i));
            if (i < embedding.size() - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }
}
