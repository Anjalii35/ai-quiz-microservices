import axios from 'axios';

// Everything goes through your API gateway (port 8765), which routes by Eureka service name.
// In development, package.json "proxy" forwards these paths to http://localhost:8765.
// If you rename a service, change its prefix here.
const QUIZ = '/quiz-service';
const QUESTION = '/question-service';
const AI = '/java-ai-agent';

// AI models tend to put the right answer first, so shuffle the options.
// Safe because the backend compares the option TEXT, not the letter.
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// backend question {id, questionTitle, option1..4}  ->  UI question {id, question, options:{A..D}}
const toUiQuestion = (q) => {
  const texts = shuffle([q.option1, q.option2, q.option3, q.option4]);
  return {
    id: q.id,
    question: q.questionTitle,
    options: { A: texts[0], B: texts[1], C: texts[2], D: texts[3] },
  };
};

const quizApi = {
  // All saved questions. Used for the topic list and to look up correct answers for the review.
  async getBank() {
    const { data } = await axios.get(`${QUESTION}/question/allQuestions`);
    return data;
  },

  // POST /ai/generate  -> Claude writes questions, the agent saves them in question-service
  async generate(category, count) {
    const { data } = await axios.post(`${AI}/ai/generate`, { category, count }, { timeout: 180000 });
    return data; // { requested, saved }
  },

  // POST /quiz/create -> returns the new quiz id
  async createQuiz(categoryName, numQuestions, title) {
    const { data } = await axios.post(`${QUIZ}/quiz/create`, { categoryName, numQuestions, title });
    const id = Number(data);
    if (!Number.isInteger(id)) {
      throw new Error('quiz-service must return the new quiz id from /quiz/create (see the small backend edit).');
    }
    return id;
  },

  // GET /quiz/get/{id}
  async getQuestions(quizId) {
    const { data } = await axios.get(`${QUIZ}/quiz/get/${quizId}`);
    return data.map(toUiQuestion);
  },

  // POST /quiz/submit/{id}  body: [{id, response}] where response is the option TEXT. Returns the score.
  async submit(quizId, questions, answers) {
    const body = questions
      .filter((q) => answers[q.id])
      .map((q) => ({ id: q.id, response: q.options[answers[q.id]] }));
    const { data } = await axios.post(`${QUIZ}/quiz/submit/${quizId}`, body);
    return Number(data);
  },

  // POST /ai/explain
  async explain(question, yourAnswer, correctAnswer) {
    const { data } = await axios.post(`${AI}/ai/explain`, { question, yourAnswer, correctAnswer }, { timeout: 120000 });
    return data.explanation;
  },
};

export function errorMessage(e) {
  if (e.response) {
    const d = e.response.data;
    if (d && typeof d.error === 'string' && d.error !== 'Internal Server Error') return d.error;
    return `The server returned an error (${e.response.status}). Check that all services are running in Eureka.`;
  }
  return e.message || 'Could not reach the backend. Is the gateway running on port 8765?';
}

export default quizApi;
