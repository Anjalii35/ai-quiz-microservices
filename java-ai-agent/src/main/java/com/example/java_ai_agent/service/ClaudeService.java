package com.example.java_ai_agent.service;

import com.example.java_ai_agent.config.AnthropicConfig;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class ClaudeService {

    private final RestClient restClient;
    private final AnthropicConfig config;

    public ClaudeService(RestClient restClient, AnthropicConfig config){
        this.restClient = restClient;
        this.config = config;
    }

    public String askClaude(String question, String systemPrompt){

        Map<String, Object> requestBody = Map.of(
                "model", config.getModel(),
                "max_tokens", config.getMaxTokens(),
                "system", systemPrompt,
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", question
                        )
                )
        );

        JsonNode response = restClient.post()
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

        if(response == null || !response.has("content")
                || !response.get("content").isArray()){
            throw new IllegalStateException("Claude returned an unexpected response.");
        }

        StringBuilder answer = new StringBuilder();
        for(JsonNode block: response.get("content")){
            if("text".equals(block.path("type").asText())){
                answer.append(block.path("text").asText());
            }
        }

        if(answer.isEmpty()){
            throw new IllegalStateException(
                    "Claude returned no text content."
            );
        }

        return answer.toString();
    }
}
