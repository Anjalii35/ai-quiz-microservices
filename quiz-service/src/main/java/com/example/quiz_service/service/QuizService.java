package com.example.quiz_service.service;

import com.example.quiz_service.feign.QuizInterface;
import com.example.quiz_service.model.QuestionWrapper;
import com.example.quiz_service.model.Quiz;
import com.example.quiz_service.model.Response;
import com.example.quiz_service.repo.QuizRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuizService {

    @Autowired
    private QuizRepo quizRepo;
    @Autowired
    private QuizInterface quizInterface;

    public ResponseEntity<String> createQuiz(String category, int noOfQues, String title) {

        List<Integer> questions = quizInterface.getQuestionsForQuiz(category, noOfQues).getBody();
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setQuestionsIds(questions);
        quizRepo.save(quiz);

        return new ResponseEntity<>("Quiz Successfully Created !!", HttpStatus.CREATED);
    }

    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(int id){
        Quiz quiz = quizRepo.findById(id).orElseThrow(() -> new RuntimeException("Quiz Not Found !!"));

        List<Integer> questionsIds = quiz.getQuestionsIds();
        List<QuestionWrapper> questionsForUser = quizInterface.getQuesFromId(questionsIds).getBody();

        return new ResponseEntity<>(questionsForUser, HttpStatus.OK);
    }

    public ResponseEntity<Integer> calculateResult(Integer id, List<Response> responses){

        Integer score = quizInterface.getScore(responses).getBody();

        return new ResponseEntity<>(score, HttpStatus.OK);
    }
}
