import { useEffect, useState } from 'react';
import './ScoreDisplay.css';

export default function ScoreDisplay({ score, total, difficulty }) {
  const [displayScore, setDisplayScore] = useState(0);
  const pct = score / Math.max(total, 1);

  // Animate score counting up
  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1 second
    const stepTime = Math.abs(Math.floor(duration / (score || 1)));
    
    if (score === 0) return;
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= score) clearInterval(timer);
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="score-container">
      <div className="score-display animate-scale-in">
        <svg className="score-ring" viewBox="0 0 120 120">
          <circle 
            className="score-ring-bg" 
            cx="60" cy="60" r="54" 
            strokeWidth="12" 
          />
          <circle 
            className="score-ring-fill" 
            cx="60" cy="60" r="54" 
            strokeWidth="12" 
            strokeDasharray="339.292" 
            strokeDashoffset={339.292 * (1 - pct)}
          />
        </svg>
        <div className="score-text">
          <span className="score-value">{displayScore}</span>
          <span className="score-total">/{total}</span>
        </div>
      </div>
      <div className="score-label">
        {difficulty} · {total} questions
      </div>
    </div>
  );
}
