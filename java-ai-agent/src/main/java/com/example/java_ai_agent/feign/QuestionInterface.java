package com.example.java_ai_agent.feign;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient("QUESTION-SERVICE")
public interface QuestionInterface {

    @PostMapping("/question/add")
    String addQuestion(@RequestBody Map<String, Object> question);
    
}
