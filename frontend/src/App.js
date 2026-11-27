import React, { useState, useEffect, useCallback } from 'react';
import QuizGenerator from './components/QuizGenerator';
import QuizDisplay from './components/QuizDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import History from './components/History';
import quizApi, { errorMessage } from './services/quizApi';
import './index.css';

function App() {
  const [quiz, setQuiz] = useState(null);          // { id, title, questions }
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState('home'); // 'home' | 'history'

  const loadCategories = useCallback(async () => {
    try {
      const bank = await quizApi.getBank();
      setCategories([...new Set(bank.map((q) => q.category))].sort());
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleStart = async ({ topic, numQuestions, useAi, timed }) => {
    setError('');
    try {
      // Reuse the spelling of an existing category (matching is case-sensitive in the backend)
      const existing = categories.find((c) => c.toLowerCase() === topic.trim().toLowerCase());
      const category = existing || topic.trim();

      if (useAi) {
        setLoadingMessage('Asking the AI to write your questions...');
        await quizApi.generate(category, numQuestions);
        await loadCategories();
      } else if (!existing) {
        throw new Error(`No saved questions for "${topic}" yet. Turn on AI generation.`);
      }

      setLoadingMessage('Building your quiz...');
      const title = `${category} quiz`;
      const id = await quizApi.createQuiz(category, numQuestions, title);
      const questions = await quizApi.getQuestions(id);
      if (questions.length === 0) {
        throw new Error(`No questions available for "${category}".`);
      }
      setQuiz({ id, title, questions, topic: category, timed, timeLimit: questions.length * 30 });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoadingMessage('');
    }
  };

  const handleReset = () => {
    setQuiz(null);
    loadCategories();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <Header view={view} onNavigate={setView} showNav={!quiz && !loadingMessage} />

        {error && !loadingMessage && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            {error}
          </div>
        )}

        {!quiz && !loadingMessage && view === 'home' && (
          <QuizGenerator onStart={handleStart} categories={categories} />
        )}

        {!quiz && !loadingMessage && view === 'history' && <History />}

        {loadingMessage && (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner message={loadingMessage} />
          </div>
        )}

        {quiz && !loadingMessage && <QuizDisplay quiz={quiz} onReset={handleReset} />}
      </div>

      <footer className="text-center mt-12 text-gray-600">
        <p>Built with React, Spring Cloud microservices and Claude</p>
      </footer>
    </div>
  );
}

export default App;
