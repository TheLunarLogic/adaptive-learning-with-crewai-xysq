import { useState } from 'react';
import MemoryCard from './MemoryCard';
import QuestionCard from './QuestionCard';
import './QuizPhase.css';

export default function QuizPhase({ 
  topic, 
  difficulty, 
  lesson, 
  questions, 
  memoryContext,
  documentContext, 
  isFailed, 
  onRegenerate, 
  onSubmit 
}) {
  const [answers, setAnswers] = useState({});
  const [showLesson, setShowLesson] = useState(false);

  if (isFailed) {
    return (
      <div className="quiz-phase animate-fade-in">
        <div className="alert alert-warning">
          ⚠️ Quiz generation produced an unexpected format. Press Regenerate to try again.
        </div>
        <button className="btn btn-primary mt-4" onClick={onRegenerate}>🔄 Regenerate Quiz</button>
      </div>
    );
  }

  const handleSelectOption = (index, opt) => {
    setAnswers(prev => ({ ...prev, [index]: opt }));
  };

  const handleSubmit = () => {
    // Only allow submit if all questions are answered
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    onSubmit(answers);
  };

  return (
    <div className="quiz-phase animate-fade-in">
      <MemoryCard 
        context={memoryContext} 
        isNew={!memoryContext || memoryContext.includes("No prior")} 
      />

      <div className="expander mb-4">
        <button 
          className="expander-header" 
          onClick={() => setShowLesson(!showLesson)}
        >
          <span>Review the Lesson</span>
          <span>{showLesson ? '▲' : '▼'}</span>
        </button>
        {showLesson && (
          <div className="expander-content markdown-content">
            <p style={{ whiteSpace: 'pre-wrap' }}>{lesson || "_No lesson available._"}</p>
          </div>
        )}
      </div>

      <div className="quiz-header">
        <h3>🧪 Adaptive Quiz — {difficulty}</h3>
        <span className="caption">{topic} · {questions.length} questions</span>
      </div>

      <div className="questions-container">
        {questions.map((q, i) => (
          <QuestionCard 
            key={i}
            index={i}
            total={questions.length}
            question={q.question}
            options={q.options}
            selectedOption={answers[i]}
            onSelectOption={(opt) => handleSelectOption(i, opt)}
          />
        ))}
      </div>

      <div className="mt-4">
        <button 
          className="btn btn-primary btn-block" 
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
        >
          📝 Submit Answers
        </button>
      </div>
    </div>
  );
}
