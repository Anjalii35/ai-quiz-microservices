// Quiz history is kept in the browser (localStorage), so no backend change is needed.
const KEY = 'aiQuizHistory';

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function addResult({ topic, score, total, seconds, timed }) {
  try {
    const history = getHistory();
    history.unshift({
      id: Date.now(),
      topic,
      score,
      total,
      seconds,
      timed: !!timed,
      date: new Date().toISOString(),
    });
    localStorage.setItem(KEY, JSON.stringify(history.slice(0, 200)));
  } catch {
    // storage unavailable (private mode etc.) - history is just not saved
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function computeStats(history) {
  if (history.length === 0) return null;
  const pct = (h) => (h.total ? (h.score / h.total) * 100 : 0);
  const avg = history.reduce((sum, h) => sum + pct(h), 0) / history.length;
  const best = Math.max(...history.map(pct));
  const totalQuestions = history.reduce((sum, h) => sum + h.total, 0);
  const totalCorrect = history.reduce((sum, h) => sum + h.score, 0);

  const byTopic = {};
  history.forEach((h) => {
    byTopic[h.topic] = byTopic[h.topic] || { topic: h.topic, attempts: 0, pctSum: 0 };
    byTopic[h.topic].attempts += 1;
    byTopic[h.topic].pctSum += pct(h);
  });
  const topics = Object.values(byTopic)
    .map((t) => ({ topic: t.topic, attempts: t.attempts, avg: t.pctSum / t.attempts }))
    .sort((a, b) => b.avg - a.avg);

  return { attempts: history.length, avg, best, totalQuestions, totalCorrect, topics };
}
