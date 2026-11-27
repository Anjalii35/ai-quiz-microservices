import React, { useState } from 'react';
import { Trophy, Target, BarChart3, Trash2, Timer, ListChecks } from 'lucide-react';
import { getHistory, clearHistory, computeStats } from '../services/history';

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
const barColor = (p) => (p >= 80 ? 'bg-green-500' : p >= 60 ? 'bg-yellow-500' : 'bg-red-500');

const History = () => {
  const [history, setHistory] = useState(getHistory());
  const stats = computeStats(history);

  const handleClear = () => {
    if (window.confirm('Delete all quiz history from this browser?')) {
      clearHistory();
      setHistory([]);
    }
  };

  if (!stats) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 text-center">
          <ListChecks className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No history yet</h2>
          <p className="text-gray-600">Finish a quiz and your results and stats will show up here.</p>
        </div>
      </div>
    );
  }

  const cards = [
    { icon: <ListChecks className="w-6 h-6 text-blue-600" />, label: 'Quizzes taken', value: stats.attempts },
    { icon: <Target className="w-6 h-6 text-purple-600" />, label: 'Average score', value: `${stats.avg.toFixed(0)}%` },
    { icon: <Trophy className="w-6 h-6 text-yellow-500" />, label: 'Best score', value: `${stats.best.toFixed(0)}%` },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-600" />,
      label: 'Correct answers',
      value: `${stats.totalCorrect}/${stats.totalQuestions}`,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-center">
            <div className="flex justify-center mb-2">{c.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{c.value}</div>
            <div className="text-sm text-gray-600">{c.label}</div>
          </div>
        ))}
      </div>

      {/* By topic */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Average score by topic</h2>
        <div className="space-y-3">
          {stats.topics.map((t) => (
            <div key={t.topic}>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span className="font-medium">
                  {t.topic} <span className="text-gray-400">({t.attempts} {t.attempts === 1 ? 'quiz' : 'quizzes'})</span>
                </span>
                <span className="font-semibold">{t.avg.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className={`${barColor(t.avg)} h-3 rounded-full`} style={{ width: `${t.avg}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attempts */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent quizzes</h2>
          <button
            onClick={handleClear}
            className="flex items-center text-sm text-red-600 hover:text-red-700 font-semibold"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Clear
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {history.map((h) => {
            const p = h.total ? (h.score / h.total) * 100 : 0;
            return (
              <div key={h.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-800 truncate">{h.topic}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(h.date).toLocaleString()} &middot; {formatTime(h.seconds)}
                    {h.timed && (
                      <span className="inline-flex items-center ml-2 text-primary-700">
                        <Timer className="w-3 h-3 mr-1" />timed
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-gray-900">{h.score}/{h.total}</div>
                  <div className={`text-xs font-semibold ${p >= 80 ? 'text-green-600' : p >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {p.toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default History;
