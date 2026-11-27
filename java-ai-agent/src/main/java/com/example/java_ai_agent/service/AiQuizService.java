package com.example.java_ai_agent.service;

import com.example.java_ai_agent.feign.QuestionInterface;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiQuizService {

    @Autowired
    private ClaudeService claudeService;
    @Autowired
    private QuestionInterface questionInterface;
    @Autowired
    private ObjectMapper objectMapper;

    public ResponseEntity<Map<String, Object>> generateQuestions(String category, int count) {
        if (category == null || category.isBlank()) {
            return new ResponseEntity<>(Map.of("error", "category is required"), HttpStatus.BAD_REQUEST);
        }

        String system = """
        Generate multiple-choice questions.
        Return ONLY a valid JSON array.
        Each question must contain:
        questionTitle, option1, option2, option3, option4, rightAnswer.
        rightAnswer must match one of the options.
        """;
        String reply = claudeService.askClaude("Write " + count + " questions about " + category, system);

        JsonNode questions;
        try {
            // Claude may add ```json fences, so keep only the [ ... ] part
            String json = reply.substring(reply.indexOf('['), reply.lastIndexOf(']') + 1);
            questions = objectMapper.readTree(json);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", "Claude did not return valid JSON"), HttpStatus.BAD_GATEWAY);
        }

        int saved = 0;
        for (JsonNode q : questions) {
            String right = q.path("rightAnswer").asText();
            boolean valid = right.equals(q.path("option1").asText()) || right.equals(q.path("option2").asText())
                    || right.equals(q.path("option3").asText()) || right.equals(q.path("option4").asText());
            if (!valid) continue;   // skip a question whose answer is not one of the options

            Map<String, Object> question = new HashMap<>();
            question.put("category", category);
            question.put("questionTitle", q.path("questionTitle").asText());
            question.put("option1", q.path("option1").asText());
            question.put("option2", q.path("option2").asText());
            question.put("option3", q.path("option3").asText());
            question.put("option4", q.path("option4").asText());
            question.put("rightAnswer", right);
            question.put("difficultylevel", "medium");
            questionInterface.addQuestion(question);
            saved++;
        }
        return new ResponseEntity<>(Map.of("requested", count, "saved", saved), HttpStatus.CREATED);
    }

    public ResponseEntity<Map<String, String>> explainAnswer(String question, String yourAnswer, String correctAnswer) {
        if (question == null || correctAnswer == null) {
            return new ResponseEntity<>(Map.of("error", "question and correctAnswer are required"), HttpStatus.BAD_REQUEST);
        }

        String system = "You are a short, simple tutor. Explain in 2-3 sentences why the correct answer is right.";
        String prompt = "Question: " + question
                + "\nStudent answer: " + yourAnswer
                + "\nCorrect answer: " + correctAnswer;
        String explanation = claudeService.askClaude(prompt, system);
        return new ResponseEntity<>(Map.of("explanation", explanation), HttpStatus.OK);
    }

}
