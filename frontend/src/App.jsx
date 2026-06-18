import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SetupPage from './components/SetupPage';
import SelectPhase from './components/SelectPhase';
import LearningPhase from './components/LearningPhase';
import QuizPhase from './components/QuizPhase';
import ResultsPhase from './components/ResultsPhase';
import { api } from './api';
import './App.css';

function App() {
  const [credentials, setCredentials] = useState(null);
  const [showSettings, setShowSettings] = useState(true);
  const [phase, setPhase] = useState('select'); // select, learning, quiz, quiz_failed, evaluating, results
  
  // Session State
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState(5);
  const [memoryContext, setMemoryContext] = useState('');
  const [documentContext, setDocumentContext] = useState('');
  const [lesson, setLesson] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [evaluation, setEvaluation] = useState('');
  const [report, setReport] = useState('');

  // App State
  const [topicsList, setTopicsList] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [sessionCount, setSessionCount] = useState(0);

  // Initialize
  useEffect(() => {
    // Use sessionStorage so credentials are cleared when the browser tab closes.
    // This prevents the next user on a shared machine from being auto-logged in.

    // One-time migration: purge any credentials left in localStorage by older versions.
    if (localStorage.getItem('credentials')) {
      localStorage.removeItem('credentials');
    }

    const creds = sessionStorage.getItem('credentials');
    if (creds) {
      const parsed = JSON.parse(creds);
      api.validateCredentials(parsed).then(res => {
        if (res.valid) {
          setCredentials(parsed);
          setShowSettings(false);
        } else {
          sessionStorage.removeItem('credentials');
        }
      }).catch(err => {
        console.error(err);
        sessionStorage.removeItem('credentials');
      });
    }

    api.getTopics().then(res => setTopicsList(res.topics)).catch(console.error);
    api.getReportCount().then(res => setSessionCount(res.count)).catch(console.error);
  }, []);

  const handleStartSession = async (selectedTopic, selectedDifficulty, selectedNumQuestions) => {
    if (!credentials) {
      setShowSettings(true);
      return;
    }
    setTopic(selectedTopic);
    setDifficulty(selectedDifficulty);
    setNumQuestions(selectedNumQuestions);
    setPhase('learning');
    setMemoryContext('');
    setDocumentContext('');
    setLesson('');
    setQuestions([]);
    setAnswers({});
  };

  const handleSettingsSave = (creds) => {
    sessionStorage.setItem('credentials', JSON.stringify(creds));
    setCredentials(creds);
    setShowSettings(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('credentials');
    setCredentials(null);
    setShowSettings(true);
    setPhase('select');
  };

  const renderPhase = () => {
    if (showSettings) {
      return <SetupPage onSave={handleSettingsSave} onBack={credentials ? () => setShowSettings(false) : null} />;
    }

    switch (phase) {
      case 'select':
        return <SelectPhase topics={topicsList} />;
      case 'learning':
        return (
          <LearningPhase 
            topic={topic}
            difficulty={difficulty}
            numQuestions={numQuestions}
            onQuizReady={(lessonData, quizQuestions, memCtx, docCtx) => {
              setLesson(lessonData);
              setQuestions(quizQuestions);
              setMemoryContext(memCtx);
              setDocumentContext(docCtx);
              setPhase(quizQuestions.length > 0 ? 'quiz' : 'quiz_failed');
            }}
            onRetry={() => setPhase('select')}
          />
        );
      case 'quiz':
      case 'quiz_failed':
        return (
          <QuizPhase 
            topic={topic}
            difficulty={difficulty}
            lesson={lesson}
            questions={questions}
            memoryContext={memoryContext}
            documentContext={documentContext}
            isFailed={phase === 'quiz_failed'}
            onRegenerate={() => setPhase('learning')}
            onSubmit={(userAnswers) => {
              setAnswers(userAnswers);
              setPhase('evaluating');
            }}
          />
        );
      case 'evaluating':
        return (
          <ResultsPhase 
            topic={topic}
            difficulty={difficulty}
            numQuestions={numQuestions}
            questions={questions}
            answers={answers}
            memoryContext={memoryContext}
            isEvaluating={true}
            onEvaluationComplete={(evalData) => {
              setScore(evalData.score);
              setTotal(evalData.total);
              setEvaluation(evalData.evaluation);
              setReport(evalData.report);
              setPhase('results');
              api.getReportCount().then(res => setSessionCount(res.count)).catch(console.error);
            }}
          />
        );
      case 'results':
        return (
          <ResultsPhase 
            topic={topic}
            difficulty={difficulty}
            questions={questions}
            answers={answers}
            score={score}
            total={total}
            evaluation={evaluation}
            report={report}
            isEvaluating={false}
            sessionCount={sessionCount}
            onNewSession={() => setPhase('select')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {!showSettings && (
        <Sidebar 
          topicsList={topicsList}
          setTopicsList={setTopicsList}
          uploads={uploads}
          setUploads={setUploads}
          sessionCount={sessionCount}
          onStartSession={handleStartSession}
          onOpenSettings={() => setShowSettings(true)}
          onLogout={handleLogout}
          sessionActive={phase !== 'select' && phase !== 'results'}
        />
      )}
      <main className="main-content">
        <Header />
        <div className="phase-container animate-fade-in">
          {renderPhase()}
        </div>
      </main>
    </div>
  );
}

export default App;
