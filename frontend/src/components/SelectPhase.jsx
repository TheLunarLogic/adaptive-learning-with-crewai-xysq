import './SelectPhase.css';

export default function SelectPhase({ topics }) {
  const customTopics = topics.filter(t => ![
    "Recursion", "Sorting Algorithms", "Binary Trees",
    "Graph Traversal", "Dynamic Programming"
  ].includes(t));

  return (
    <div className="select-phase animate-fade-in-up">
      <div className="select-content">
        <h2>Ready to learn.</h2>
        <p className="caption">Select a topic from the sidebar, adjust your difficulty, and begin your session.</p>
        
        {customTopics.length > 0 && (
          <div className="custom-topics mt-4 stagger">
            <strong>Your uploaded knowledge:</strong>
            <div className="badges-container mt-2">
              {customTopics.map(t => (
                <span key={t} className="topic-badge animate-scale-in">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
