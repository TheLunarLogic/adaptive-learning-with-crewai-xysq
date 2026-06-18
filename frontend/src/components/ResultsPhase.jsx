import { useEffect } from 'react';
import { api } from '../api';
import ScoreDisplay from './ScoreDisplay';
import './ResultsPhase.css';

export default function ResultsPhase({ 
  topic, difficulty, numQuestions, questions, answers, memoryContext,
  isEvaluating, onEvaluationComplete,
  score, total, evaluation, report, sessionCount, onNewSession
}) {

  useEffect(() => {
    if (isEvaluating) {
      api.evaluateSession(topic, difficulty, numQuestions, memoryContext, questions, answers)
        .then(res => onEvaluationComplete(res))
        .catch(err => {
          console.error(err);
          // Handle error, maybe fallback to raw score
          onEvaluationComplete({
            score: 0, total: questions.length, evaluation: 'Error during evaluation.', report: 'Error'
          });
        });
    }
  }, [isEvaluating, topic, difficulty, numQuestions, memoryContext, questions, answers, onEvaluationComplete]);

  if (isEvaluating) {
    return (
      <div className="results-phase animate-fade-in text-center">
        <div className="loading-container">
          <div className="spinner"></div>
          <h3>📊 Evaluating answers and generating progress report…</h3>
        </div>
      </div>
    );
  }

  const pct = score / Math.max(total, 1);
  let feedbackMsg = '';
  if (pct >= 0.8) feedbackMsg = "🎉 Excellent — strong understanding demonstrated.";
  else if (pct >= 0.5) feedbackMsg = "📈 Solid progress. A few areas need review.";
  else feedbackMsg = "💪 Keep going — focus on the gaps highlighted below.";

  return (
    <div className="results-phase animate-fade-in">
      <div className="results-header">
        <ScoreDisplay score={score} total={total} difficulty={difficulty} />
        <div className="results-info">
          <h3>📊 {topic}</h3>
          <p className={pct >= 0.8 ? 'text-success' : pct >= 0.5 ? 'text-warning' : 'text-error'}>
            {feedbackMsg}
          </p>
          <span className="caption">Session {sessionCount} · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <hr className="divider" />

      <h3>📝 Review</h3>
      <div className="review-container">
        {questions.map((q, i) => {
          const chosen = answers[i] || answers[String(i)] || "No answer";
          const isCorrect = chosen.startsWith(q.correct_answer);
          
          return (
            <div key={i} className={`review-card ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-num">Question {i + 1}</div>
              <div className="question-text">{q.question}</div>
              
              <div className={`indicator ${isCorrect ? 'text-success' : 'text-error'}`}>
                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </div>
              
              <div className="review-answers">
                <div>
                  <span className="label">Your answer: </span>
                  <span className="value">{chosen}</span>
                </div>
                <div>
                  <span className="label">Correct: </span>
                  <span className="value">{q.correct_answer}</span>
                </div>
              </div>
              
              {q.explanation && (
                <div className="explanation">
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <hr className="divider" />

      <div className="results-footer">
        <div className="report-section">
          <h3>📋 Progress Report</h3>
          <div className="markdown-content">
            <p style={{ whiteSpace: 'pre-wrap' }}>{report || "_No report generated._"}</p>
          </div>
        </div>
        
        <div className="memory-section">
          <h3>🧠 Memory Updated</h3>
          <div className="update-card">
            <strong>✓ Stored to persistent memory</strong>
            <div><b>Topic:</b> {topic}</div>
            <div><b>Difficulty:</b> {difficulty}</div>
            <div><b>Score:</b> {score}/{total}</div>
            <p className="mt-2">Your next session on this topic will adapt based on today's results.</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button className="btn btn-primary btn-block" onClick={onNewSession}>🔄 Start New Session</button>
      </div>
    </div>
  );
}
