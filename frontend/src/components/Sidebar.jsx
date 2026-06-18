import { useState, useRef } from 'react';
import { api } from '../api';
import './Sidebar.css';

const STEPS = [
  { id: 1, label: 'Choose Topic',          helper: 'Pick what you want to learn today.' },
  { id: 2, label: 'Choose Difficulty',     helper: 'Set how challenging you want it to be.' },
  { id: 3, label: 'Quiz Size',             helper: 'How many questions per session?' },
  { id: 4, label: 'Upload Knowledge',      helper: 'Optional — personalise with your own documents.' },
  { id: 5, label: 'Start Learning',        helper: "You're all set. Let's go!" },
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export default function Sidebar({
  topicsList, setTopicsList,
  uploads, setUploads,
  sessionCount,
  onStartSession,
  onOpenSettings,
  onLogout,
  sessionActive,
}) {
  const [topic,        setTopic]        = useState(topicsList[0] || '');
  const [difficulty,   setDifficulty]   = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isUploading,  setIsUploading]  = useState(false);
  const [activeStep,   setActiveStep]   = useState(1);
  const fileInputRef = useRef(null);

  // ── derived completion state ────────────────────────────────────────
  const stepDone = {
    1: !!topic,
    2: !!difficulty,
    3: !!numQuestions,
    4: true, // optional — always "done"
    5: false,
  };

  const getStepState = (id) => {
    if (id === activeStep) return 'active';
    if (stepDone[id] && id < activeStep) return 'done';
    if (id < activeStep) return 'done';
    return 'pending';
  };

  const handleStepClick = (id) => {
    if (sessionActive) return;
    setActiveStep(id);
  };

  // ── file upload ─────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await api.uploadDocument(file);
      if (res.is_new_topic) setTopicsList(prev => [...prev, res.topic]);
      setTopic(res.topic);
      if (!res.already_uploaded && !uploads.includes(file.name)) {
        setUploads(prev => [...prev, file.name]);
      }
      alert(res.status);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleStart = () => {
    if (!topic || sessionActive || isUploading) return;
    onStartSession(topic, difficulty, numQuestions);
  };

  // ── render helpers ──────────────────────────────────────────────────
  const StepIndicator = ({ id }) => {
    const state = getStepState(id);
    return (
      <div className={`step-indicator step-indicator--${state}`}>
        {state === 'done'
          ? <svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          : <span>{id}</span>
        }
      </div>
    );
  };

  const StepConnector = ({ id }) => (
    <div className={`step-connector ${id < activeStep ? 'step-connector--done' : ''}`} />
  );

  return (
    <aside className="sidebar">

      {/* ── Brand ── */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🧠</div>
        <div>
          <h3 className="sidebar-brand-title">Learning Companion</h3>
          <span className="sidebar-brand-sub">Adaptive memory across sessions</span>
        </div>
      </div>

      {/* ── Progress hint ── */}
      <div className="stepper-progress">
        <div className="stepper-progress-bar">
          <div
            className="stepper-progress-fill"
            style={{ width: `${Math.min(((activeStep - 1) / 4) * 100, 100)}%` }}
          />
        </div>
        <span className="stepper-progress-label">Step {activeStep} of 5</span>
      </div>

      {/* ── Steps ── */}
      <nav className="stepper" aria-label="Setup steps">

        {/* ── Step 1: Topic ── */}
        <div className="step-item">
          <div className="step-row" onClick={() => handleStepClick(1)} role="button" tabIndex={0}
               onKeyDown={e => e.key === 'Enter' && handleStepClick(1)}>
            <StepIndicator id={1} />
            <div className="step-meta">
              <span className="step-label">Choose Topic</span>
              <span className="step-helper">Pick what you want to learn today.</span>
            </div>
          </div>
          {activeStep === 1 && (
            <div className="step-body animate-fade-in">
              <select
                value={topic}
                onChange={e => { setTopic(e.target.value); setActiveStep(2); }}
                disabled={isUploading || sessionActive}
                id="topic-select"
              >
                {topicsList.length === 0
                  ? <option value="">— no topics yet —</option>
                  : topicsList.map(t => <option key={t} value={t}>{t}</option>)
                }
              </select>
              {topic && (
                <button className="step-next-btn" onClick={() => setActiveStep(2)}>
                  Continue →
                </button>
              )}
            </div>
          )}
        </div>

        <StepConnector id={1} />

        {/* ── Step 2: Difficulty ── */}
        <div className="step-item">
          <div className="step-row" onClick={() => handleStepClick(2)} role="button" tabIndex={0}
               onKeyDown={e => e.key === 'Enter' && handleStepClick(2)}>
            <StepIndicator id={2} />
            <div className="step-meta">
              <span className="step-label">Choose Difficulty</span>
              <span className="step-helper">Set how challenging you want it to be.</span>
            </div>
          </div>
          {activeStep === 2 && (
            <div className="step-body animate-fade-in">
              <div className="difficulty-group">
                {DIFFICULTIES.map(diff => (
                  <label
                    key={diff}
                    className={`difficulty-option ${difficulty === diff ? 'difficulty-option--selected' : ''} ${sessionActive ? 'difficulty-option--disabled' : ''}`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={diff}
                      checked={difficulty === diff}
                      onChange={() => { setDifficulty(diff); }}
                      disabled={sessionActive}
                    />
                    <div className="difficulty-dot" />
                    <div className="difficulty-info">
                      <span className="difficulty-name">{diff}</span>
                      <span className="difficulty-desc">
                        {diff === 'Beginner' && 'Foundational concepts'}
                        {diff === 'Intermediate' && 'Applied understanding'}
                        {diff === 'Advanced' && 'Expert-level depth'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              <button className="step-next-btn" onClick={() => setActiveStep(3)}>
                Continue →
              </button>
            </div>
          )}
        </div>

        <StepConnector id={2} />

        {/* ── Step 3: Quiz Size ── */}
        <div className="step-item">
          <div className="step-row" onClick={() => handleStepClick(3)} role="button" tabIndex={0}
               onKeyDown={e => e.key === 'Enter' && handleStepClick(3)}>
            <StepIndicator id={3} />
            <div className="step-meta">
              <span className="step-label">Quiz Size</span>
              <span className="step-helper">How many questions per session?</span>
            </div>
          </div>
          {activeStep === 3 && (
            <div className="step-body animate-fade-in">
              <div className="quiz-size-group">
                {[3, 5, 10].map(n => (
                  <button
                    key={n}
                    className={`quiz-size-btn ${numQuestions === n ? 'quiz-size-btn--selected' : ''}`}
                    onClick={() => { setNumQuestions(n); }}
                    disabled={sessionActive}
                    type="button"
                  >
                    <span className="quiz-size-num">{n}</span>
                    <span className="quiz-size-label">Q</span>
                  </button>
                ))}
              </div>
              <button className="step-next-btn" onClick={() => setActiveStep(4)}>
                Continue →
              </button>
            </div>
          )}
        </div>

        <StepConnector id={3} />

        {/* ── Step 4: Upload ── */}
        <div className="step-item">
          <div className="step-row" onClick={() => handleStepClick(4)} role="button" tabIndex={0}
               onKeyDown={e => e.key === 'Enter' && handleStepClick(4)}>
            <StepIndicator id={4} />
            <div className="step-meta">
              <div className="step-label-row">
                <span className="step-label">Upload Knowledge</span>
                <span className="step-optional-badge">Optional</span>
              </div>
              <span className="step-helper">Personalise with your own documents.</span>
            </div>
          </div>
          {activeStep === 4 && (
            <div className="step-body animate-fade-in">
              <div
                className={`upload-zone ${isUploading ? 'upload-zone--uploading' : ''} ${sessionActive ? 'upload-zone--disabled' : ''}`}
                onClick={() => !isUploading && !sessionActive && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleUpload}
                  disabled={isUploading || sessionActive}
                  style={{ display: 'none' }}
                />
                <div className="upload-zone-icon">{isUploading ? '⏳' : '📄'}</div>
                <div className="upload-zone-text">
                  {isUploading ? 'Uploading…' : 'Click or drop file here'}
                </div>
                <div className="upload-zone-hint">PDF, TXT, Markdown</div>
              </div>

              {uploads.length > 0 && (
                <ul className="uploads-list">
                  {uploads.map(f => (
                    <li key={f} className="uploads-item">
                      <span className="uploads-check">✓</span>
                      <span className="uploads-name">{f.replace(/\.[^.]+$/, '')}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button className="step-next-btn" onClick={() => setActiveStep(5)}>
                {uploads.length > 0 ? 'Continue →' : 'Skip →'}
              </button>
            </div>
          )}
        </div>

        <StepConnector id={4} />

        {/* ── Step 5: Start ── */}
        <div className="step-item step-item--launch">
          <div className="step-row" onClick={() => handleStepClick(5)} role="button" tabIndex={0}
               onKeyDown={e => e.key === 'Enter' && handleStepClick(5)}>
            <StepIndicator id={5} />
            <div className="step-meta">
              <span className="step-label">Start Learning</span>
              <span className="step-helper">You're all set. Let's go!</span>
            </div>
          </div>
          {activeStep === 5 && (
            <div className="step-body animate-fade-in">
              <div className="launch-summary">
                <div className="launch-summary-row">
                  <span className="launch-key">Topic</span>
                  <span className="launch-val">{topic || '—'}</span>
                </div>
                <div className="launch-summary-row">
                  <span className="launch-key">Difficulty</span>
                  <span className="launch-val">{difficulty}</span>
                </div>
                <div className="launch-summary-row">
                  <span className="launch-key">Questions</span>
                  <span className="launch-val">{numQuestions}</span>
                </div>
                {uploads.length > 0 && (
                  <div className="launch-summary-row">
                    <span className="launch-key">Docs</span>
                    <span className="launch-val">{uploads.length} file{uploads.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              <button
                className="btn btn-primary btn-block launch-btn"
                onClick={handleStart}
                disabled={sessionActive || !topic || isUploading}
              >
                🚀 Start Session
              </button>
            </div>
          )}
        </div>

      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-stat">
          <span className="sidebar-footer-stat-num">{sessionCount}</span>
          <span className="sidebar-footer-stat-label">sessions completed</span>
        </div>
        <div className="sidebar-footer-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onOpenSettings}
            disabled={isUploading || sessionActive}
          >
            ⚙️ Settings
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onLogout}
            disabled={isUploading || sessionActive}
          >
            🗑️ Logout
          </button>
        </div>
      </div>

    </aside>
  );
}
