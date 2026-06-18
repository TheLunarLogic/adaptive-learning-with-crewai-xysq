// In production (Vercel), set VITE_API_URL=https://your-app.up.railway.app/api
// In local dev, leave it unset — Vite proxy will forward /api to localhost:8000
const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getCredentials() {
  const creds = sessionStorage.getItem('credentials');
  if (!creds) {
    throw new Error('No credentials found. Please configure your API keys in Settings.');
  }
  return JSON.parse(creds);
}

async function fetchApi(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getTopics: () => fetchApi('/topics'),
  
  validateCredentials: (credentials) => 
    fetchApi('/credentials/validate', {
      method: 'POST',
      body: JSON.stringify({ credentials })
    }),

  getMemoryContext: (topic) => 
    fetchApi('/memory/context', {
      method: 'POST',
      body: JSON.stringify({ credentials: getCredentials(), topic })
    }),

  getDocumentContext: (topic) => 
    fetchApi('/memory/document-context', {
      method: 'POST',
      body: JSON.stringify({ credentials: getCredentials(), topic })
    }),

  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('credentials_json', JSON.stringify(getCredentials()));

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  learnSession: (topic, difficulty, numQuestions, memoryContext, documentContext) =>
    fetchApi('/session/learn', {
      method: 'POST',
      body: JSON.stringify({
        credentials: getCredentials(),
        topic,
        difficulty,
        num_questions: numQuestions,
        memory_context: memoryContext,
        document_context: documentContext
      })
    }),

  evaluateSession: (topic, difficulty, numQuestions, memoryContext, questions, answers) =>
    fetchApi('/session/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        credentials: getCredentials(),
        topic,
        difficulty,
        num_questions: numQuestions,
        memory_context: memoryContext,
        questions,
        answers
      })
    }),

  getReportCount: () => fetchApi('/reports/count'),
};
