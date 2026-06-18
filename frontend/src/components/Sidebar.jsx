import { useState } from 'react';
import { api } from '../api';
import './Sidebar.css';

export default function Sidebar({ 
  topicsList, setTopicsList, 
  uploads, setUploads, 
  sessionCount, 
  onStartSession, 
  onOpenSettings, 
  onLogout,
  sessionActive 
}) {
  const [topic, setTopic] = useState(topicsList[0] || '');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await api.uploadDocument(file);
      
      if (res.is_new_topic) {
        setTopicsList(prev => [...prev, res.topic]);
      }
      setTopic(res.topic);
      
      if (!res.already_uploaded && !uploads.includes(file.name)) {
        setUploads(prev => [...prev, file.name]);
      }
      
      // Could show a toast here with res.status
      alert(res.status);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>🧠 Learning Companion</h3>
        <span className="caption">Adaptive memory across sessions</span>
      </div>

      <hr className="divider" />

      <div className="sidebar-section">
        <label>Choose a topic</label>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isUploading || sessionActive}>
          {topicsList.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <label>Difficulty</label>
        <div className="radio-group horizontal">
          {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
            <label key={diff} className={`radio-label ${(isUploading || sessionActive) ? 'disabled' : ''}`}>
              <input 
                type="radio" 
                name="difficulty" 
                value={diff}
                checked={difficulty === diff}
                onChange={() => setDifficulty(diff)}
                disabled={isUploading || sessionActive}
              />
              <span>{diff}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <label>Number of questions</label>
        <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} disabled={isUploading || sessionActive}>
          {[3, 5, 10].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      <div className="sidebar-section mt-4">
        <button 
          className="btn btn-primary btn-block" 
          onClick={() => onStartSession(topic, difficulty, numQuestions)}
          disabled={sessionActive || !topic || isUploading}
        >
          🚀 Start Session
        </button>
      </div>

      <hr className="divider" />

      <div className="sidebar-section">
        <label>📄 Upload Material (PDF, TXT, Markdown)</label>
        <div className={`file-upload-wrapper ${(isUploading || sessionActive) ? 'disabled' : ''}`}>
          <input 
            type="file" 
            accept=".pdf,.txt,.md" 
            onChange={handleUpload} 
            disabled={isUploading || sessionActive}
          />
          <div className="file-upload-ui">
            {isUploading ? 'Uploading...' : 'Drag & drop or click to upload'}
          </div>
        </div>
        
        {uploads.length > 0 && (
          <div className="uploads-list">
            <span className="caption">Uploaded:</span>
            <ul>
              {uploads.map(f => <li key={f}>📎 {f}</li>)}
            </ul>
          </div>
        )}
      </div>

      <hr className="divider" />
      
      <div className="sidebar-section">
        <span className="caption block mb-4">Sessions completed: <strong>{sessionCount}</strong></span>
        
        <div className="sidebar-actions">
          <button className="btn btn-secondary btn-sm" onClick={onOpenSettings} disabled={isUploading || sessionActive}>⚙️ Settings</button>
          <button className="btn btn-ghost btn-sm" onClick={onLogout} disabled={isUploading || sessionActive}>🗑️ Logout</button>
        </div>
      </div>
    </aside>
  );
}
