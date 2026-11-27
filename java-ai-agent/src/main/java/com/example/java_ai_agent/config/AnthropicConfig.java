package com.example.java_ai_agent.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AnthropicConfig {

    @Value("${anthropic.api.key}")
    private String apiKey;

    @Value("${anthropic.api.url}")
    private String apiUrl;

    @Value("${anthropic.model}")
    private String model;

    @Value("${anthropic.max.tokens}")
    private int maxTokens;

    @Bean
    public RestClient restClient(){

        return RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization","Bearer " + apiKey)
//                .defaultHeader("anthropic-version", "2023-06-01")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String getModel(){
        return model;
    }

    public int getMaxTokens(){
        return maxTokens;
    }
}
