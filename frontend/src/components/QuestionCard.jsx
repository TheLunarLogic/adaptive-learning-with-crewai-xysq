export default function QuestionCard({ index, total, question, options, selectedOption, onSelectOption }) {
  return (
    <div className="question-card animate-fade-in-up">
      <div className="question-num">Question {index + 1} of {total}</div>
      <p className="question-text">{question}</p>
      
      <div className="options-group">
        {options.map((opt, i) => (
          <label 
            key={i} 
            className={`option-label ${selectedOption === opt ? 'selected' : ''}`}
          >
            <input 
              type="radio" 
              name={`question_${index}`} 
              value={opt} 
              checked={selectedOption === opt}
              onChange={() => onSelectOption(opt)}
            />
            <span className="option-text">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
