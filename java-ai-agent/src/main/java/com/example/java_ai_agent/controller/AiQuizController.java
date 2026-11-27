package com.example.java_ai_agent.controller;

import com.example.java_ai_agent.service.AiQuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AiQuizController {

    @Autowired
    private AiQuizService aiQuizService;

    // POST /ai/generate   {"category":"Java","count":5}
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generate(@RequestBody Map<String, Object> req) {
        String category = (String) req.get("category");
        int count = (int) req.getOrDefault("count", 5);

        return aiQuizService.generateQuestions(category, count);
    }

    // POST /ai/explain   {"question":"...","yourAnswer":"...","correctAnswer":"..."}
    @PostMapping("/explain")
    public ResponseEntity<Map<String, String>> explain(@RequestBody Map<String, String> req) {
        return aiQuizService.explainAnswer(req.get("question"), req.get("yourAnswer"), req.get("correctAnswer"));
    }

}
