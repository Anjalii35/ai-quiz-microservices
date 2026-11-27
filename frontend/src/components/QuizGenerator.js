import React, { useState } from 'react';
import { Sparkles, BookOpen, Users, Brain, Database, CheckCircle, Timer } from 'lucide-react';

const QuizGenerator = ({ onStart, categories }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [useAi, setUseAi] = useState(true);
  const [timed, setTimed] = useState(false);

  const questionCounts = [3, 5, 10];
  const defaults = ['Java', 'Spring Boot', 'Microservices', 'SQL', 'React', 'Python'];
  const suggestions = [...new Set([...categories, ...defaults])].slice(0, 10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onStart({ topic, numQuestions, useAi, timed });
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-blue-600" />,
      title: 'AI-Written Questions',
      description: 'Claude writes the questions and saves them to your question bank',
    },
    {
      icon: <Database className="w-6 h-6 text-green-600" />,
      title: 'Microservices Backend',
      description: 'Quiz, question and AI services behind an API gateway',
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-purple-600" />,
      title: 'AI Explanations',
      description: 'Get an explanation for every answer you got wrong',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Topic */}
          <div>
            <label className="flex items-center text-lg font-semibold text-gray-800 mb-4">
              <BookOpen className="w-6 h-6 mr-3 text-primary-600" />
              What would you like to be quizzed on?
            </label>
            <input
              type="text"
              list="topic-list"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., Java, Spring Boot, SQL...)"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-primary-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              required
            />
            <datalist id="topic-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">
                {categories.length > 0 ? 'Saved topics and ideas:' : 'Try these topics:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className="px-4 py-2 bg-gray-100 hover:bg-primary-100 text-gray-700 rounded-xl text-sm transition-colors duration-200 border border-gray-200 hover:border-primary-300 hover:text-primary-700"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Number of questions */}
          <div className="border-t border-gray-200 pt-6">
            <label className="flex items-center text-md font-semibold text-gray-700 mb-4">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Number of Questions
            </label>
            <div className="grid grid-cols-3 gap-3">
              {questionCounts.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumQuestions(count)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    numQuestions === count
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold shadow-md transform scale-105'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-white text-gray-700'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>

            <label className="flex items-center mt-6 text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={useAi}
                onChange={(e) => setUseAi(e.target.checked)}
                className="w-5 h-5 mr-3"
              />
              Generate new questions with AI first
              <span className="ml-2 text-sm text-gray-500">(untick to use saved questions only)</span>
            </label>

            <label className="flex items-center mt-4 text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={timed}
                onChange={(e) => setTimed(e.target.checked)}
                className="w-5 h-5 mr-3"
              />
              <Timer className="w-4 h-4 mr-2 text-primary-600" />
              Timed mode
              <span className="ml-2 text-sm text-gray-500">(30 seconds per question, auto-submits at zero)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!topic.trim()}
            className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-primary-600 hover:to-purple-700 focus:ring-4 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg"
          >
            <div className="flex items-center justify-center">
              <Sparkles className="w-6 h-6 mr-3" />
              {useAi ? 'Generate Quiz' : 'Start Quiz'}
            </div>
          </button>
        </form>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
