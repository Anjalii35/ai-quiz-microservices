import React, { useState, useRef } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Award, 
  Home,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Sparkles,
  Timer
} from 'lucide-react';
import quizApi, { errorMessage } from '../services/quizApi';
import { addResult } from '../services/history';

const QuizDisplay = ({ quiz, onReset }) => {
  const questions = quiz.questions;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizStarted, setQuizStarted] = useState(new Date());
  const [timedOut, setTimedOut] = useState(false);
  const autoSubmitted = useRef(false);
  const submitRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [correctKeys, setCorrectKeys] = useState({});   // questionId -> 'A'..'D' (from the question bank)
  const [explanations, setExplanations] = useState({}); // questionId -> AI text
  const [explaining, setExplaining] = useState({});     // questionId -> true while loading

  // Timer effect
  React.useEffect(() => {
    if (!showResults) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((new Date() - quizStarted) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showResults, quizStarted]);

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Sends the answers to quiz-service, which returns the score.
  const calculateScore = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const backendScore = await quizApi.submit(quiz.id, questions, selectedAnswers);

      // quiz-service only returns a number, so look up the right answers to show the review
      const bank = await quizApi.getBank();
      const keys = {};
      questions.forEach((q) => {
        const saved = bank.find((b) => b.id === q.id);
        keys[q.id] = saved
          ? Object.keys(q.options).find((k) => q.options[k] === saved.rightAnswer)
          : undefined;
      });
      setCorrectKeys(keys);
      addResult({
        topic: quiz.topic,
        score: backendScore,
        total: questions.length,
        seconds: Math.floor((new Date() - quizStarted) / 1000),
        timed: quiz.timed,
      });
      setScore(backendScore);
      setShowResults(true);
    } catch (e) {
      setSubmitError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const explainWithAi = async (question) => {
    const yourKey = selectedAnswers[question.id];
    setExplaining((prev) => ({ ...prev, [question.id]: true }));
    try {
      const text = await quizApi.explain(
        question.question,
        yourKey ? question.options[yourKey] : '',
        question.options[correctKeys[question.id]]
      );
      setExplanations((prev) => ({ ...prev, [question.id]: text }));
    } catch (e) {
      setExplanations((prev) => ({ ...prev, [question.id]: errorMessage(e) }));
    } finally {
      setExplaining((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timed mode: count down and auto-submit at zero. A ref always points to the latest submit function.
  submitRef.current = calculateScore;
  const remaining = quiz.timed ? Math.max(0, quiz.timeLimit - timeSpent) : null;
  React.useEffect(() => {
    if (quiz.timed && remaining === 0 && !showResults && !autoSubmitted.current) {
      autoSubmitted.current = true;
      setTimedOut(true);
      submitRef.current();
    }
  }, [quiz.timed, remaining, showResults]);

  // Always start at the top of the page when the screen changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [showResults]);

  const resetQuiz = () => {
    autoSubmitted.current = false;
    setTimedOut(false);
    setQuizStarted(new Date());
    setSelectedAnswers({});
    setShowResults(false);
    setCurrentQuestion(0);
    setScore(0);
    setTimeSpent(0);
    setSubmitError('');
    setExplanations({});
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (percentage) => {
    if (percentage >= 80) return '🎉';
    if (percentage >= 60) return '👍';
    return '💪';
  };

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    const perfectScore = score === questions.length;

    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center">
            {/* Score Header */}
            <div className="flex justify-center mb-6">
              <div className={`relative ${perfectScore ? 'animate-bounce' : ''}`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  percentage >= 80 ? 'bg-green-100' : 
                  percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Award className={`w-12 h-12 ${
                    percentage >= 80 ? 'text-green-600' : 
                    percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                {perfectScore && (
                  <Star className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" fill="currentColor" />
                )}
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Quiz Completed!
            </h2>
            
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {score}/{questions.length}
            </div>
            
            <div className={`text-2xl font-semibold mb-2 ${getScoreColor(percentage)}`}>
              {getScoreEmoji(percentage)} {percentage.toFixed(1)}%
            </div>

            {timedOut && (
              <p className="text-red-600 font-semibold mb-3">Time's up! Unanswered questions count as wrong.</p>
            )}

            <div className="flex justify-center items-center space-x-6 text-gray-600 mb-8">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Time: {formatTime(timeSpent)}
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Correct: {score}
              </div>
              <div className="flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-red-500" />
                Incorrect: {questions.length - score}
              </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-4 mb-8 text-left">
              {questions.map((question, index) => {
                const isCorrect = selectedAnswers[question.id] === correctKeys[question.id];
                return (
                  <div 
                    key={question.id} 
                    className={`p-5 rounded-2xl border-2 transition-all duration-200 ${
                      isCorrect 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 text-lg flex-1">
                        {index + 1}. {question.question}
                      </h3>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-3" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 ml-3" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(question.options).map(([key, value]) => {
                        const isSelected = selectedAnswers[question.id] === key;
                        const isCorrectAnswer = key === correctKeys[question.id];
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                              isCorrectAnswer
                                ? 'border-green-500 bg-green-100 text-green-800 font-semibold'
                                : isSelected
                                ? 'border-red-500 bg-red-100 text-red-800'
                                : 'border-gray-200 bg-white text-gray-700'
                            }`}
                          >
                            <span className="font-medium">{key}.</span> {value}
                            {isCorrectAnswer && isSelected && (
                              <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />
                            )}
                            {!isCorrectAnswer && isSelected && (
                              <XCircle className="w-4 h-4 text-red-600 inline ml-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!isCorrect && (
                      <div className="mt-4 text-left">
                        {!explanations[question.id] && (
                          <button
                            onClick={() => explainWithAi(question)}
                            disabled={explaining[question.id]}
                            className="flex items-center px-4 py-2 bg-white border-2 border-primary-300 text-primary-700 rounded-xl hover:bg-primary-50 disabled:opacity-50 transition-all duration-200 text-sm font-semibold"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {explaining[question.id] ? 'Thinking...' : 'Explain with AI'}
                          </button>
                        )}
                        {explanations[question.id] && (
                          <div className="p-4 bg-white rounded-xl border border-blue-200 text-gray-700 text-sm">
                            <span className="font-semibold text-blue-700">AI explanation: </span>
                            {explanations[question.id]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-200 font-semibold"
              >
                <RotateCcw className="w-5 h-5 mr-3" />
                Try Again
              </button>
              <button
                onClick={onReset}
                className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-2xl hover:from-primary-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg"
              >
                <Home className="w-5 h-5 mr-3" />
                New Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100">
        {/* Quiz Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
            <p className="text-gray-600">Test your knowledge</p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {quiz.timed ? (
              <div className={`flex items-center font-bold text-base ${remaining <= 10 ? 'text-red-600 animate-pulse' : 'text-primary-700'}`}>
                <Timer className="w-5 h-5 mr-1" />
                {formatTime(remaining)} left
              </div>
            ) : (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(timeSpent)}
              </div>
            )}
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              {Object.keys(selectedAnswers).length} / {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span className="font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="font-semibold">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-5 leading-relaxed">
            {question.question}
          </h3>
          
          <div className="space-y-3">
            {Object.entries(question.options).map(([key, value]) => (
              <button
                key={key}
                onClick={() => handleAnswerSelect(question.id, key)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  selectedAnswers[question.id] === key
                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center mr-4 font-semibold ${
                    selectedAnswers[question.id] === key
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-gray-300 bg-white text-gray-600'
                  }`}>
                    {key}
                  </div>
                  <div className="text-base md:text-lg font-medium flex-1">{value}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={calculateScore}
              disabled={!selectedAnswers[question.id] || submitting}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
            >
              {submitting ? 'Scoring...' : 'Finish Quiz'}
              <Award className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={!selectedAnswers[question.id]}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl hover:from-primary-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
            >
              Next Question
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDisplay;