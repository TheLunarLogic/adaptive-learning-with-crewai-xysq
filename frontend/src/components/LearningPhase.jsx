import { useState, useEffect } from 'react';
import { api } from '../api';
import './LearningPhase.css';

export default function LearningPhase({ topic, difficulty, numQuestions, onQuizReady, onRetry }) {
  const [status, setStatus] = useState('Recalling your learning history…');
  const [error, setError] = useState('');

  useEffect(() => {
    let memCtx = '';
    let docCtx = '';
    
    const runLearning = async () => {
      try {
        // 1. Get memory context
        setStatus('Recalling your learning history…');
        const memRes = await api.getMemoryContext(topic);
        memCtx = memRes.context;
        
        // 2. Get document context
        setStatus('Checking for uploaded documents…');
        const docRes = await api.getDocumentContext(topic);
        docCtx = docRes.document_context;
        
        // 3. Generate lesson and quiz
        setStatus(`Building ${difficulty.toLowerCase()} lesson on ${topic} (${numQuestions} questions)…`);
        const learnRes = await api.learnSession(topic, difficulty, numQuestions, memCtx, docCtx);
        
        onQuizReady(learnRes.lesson, learnRes.questions, memCtx, docCtx);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred during learning phase.');
        setStatus('');
      }
    };
    
    runLearning();
  }, [topic, difficulty, numQuestions, onQuizReady]);

  if (error) {
    return (
      <div className="learning-phase animate-fade-in">
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
        <button className="btn btn-primary mt-4" onClick={onRetry}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="learning-phase animate-fade-in">
      <div className="loading-container">
        <div className="spinner"></div>
        <h3>{status}</h3>
      </div>
      
      <div className="skeleton-container mt-4">
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line" style={{width: '80%'}}></div>
      </div>
    </div>
  );
}
