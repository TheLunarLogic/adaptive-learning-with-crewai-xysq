import { useState } from 'react';
import './SetupPage.css';

export default function SetupPage({ onSave, onBack }) {
  const [tab, setTab] = useState('manual'); // 'manual' | 'upload'
  const [provider, setProvider] = useState('AWS Bedrock');
  const [error, setError] = useState('');

  // Manual inputs
  const [xysqKey, setXysqKey] = useState('');
  const [awsAccess, setAwsAccess] = useState('');
  const [awsSecret, setAwsSecret] = useState('');
  const [awsRegion, setAwsRegion] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [model, setModel] = useState('bedrock/us.amazon.nova-lite-v1:0');

  // Upload state
  const [uploadedCreds, setUploadedCreds] = useState(null);

  const handleProviderChange = (p) => {
    setProvider(p);
    if (p === 'AWS Bedrock') setModel('bedrock/us.amazon.nova-lite-v1:0');
    if (p === 'Google Gemini') setModel('gemini/gemini-1.5-pro');
    if (p === 'OpenAI') setModel('gpt-4o');
    setError('');
  };

  const handleManualSave = (e) => {
    e.preventDefault();
    let creds = { XYSQ_API_KEY: xysqKey, MODEL: model, PROVIDER: provider };
    
    if (provider === 'AWS Bedrock') {
      if (!xysqKey || !awsAccess || !awsSecret || !awsRegion || !model) {
        setError('Please fill in all AWS fields and XYSQ key.'); return;
      }
      creds = { ...creds, AWS_ACCESS_KEY_ID: awsAccess, AWS_SECRET_ACCESS_KEY: awsSecret, AWS_DEFAULT_REGION: awsRegion };
    } else if (provider === 'Google Gemini') {
      if (!xysqKey || !geminiKey || !model) {
        setError('Please fill in GEMINI_API_KEY, XYSQ key, and MODEL.'); return;
      }
      creds = { ...creds, API_KEY: geminiKey };
    } else if (provider === 'OpenAI') {
      if (!xysqKey || !openaiKey || !model) {
        setError('Please fill in OPENAI_API_KEY, XYSQ key, and MODEL.'); return;
      }
      creds = { ...creds, API_KEY: openaiKey };
    }

    onSave(creds);
  };

  const parseEnv = (content) => {
    const dict = {};
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        // Split on the FIRST `=` only — values can contain `=` (e.g. base64 keys)
        const idx = trimmed.indexOf('=');
        const k = trimmed.slice(0, idx).trim();
        // Strip optional surrounding quotes from the value
        const raw = trimmed.slice(idx + 1).trim();
        const v = raw.replace(/^["']|["']$/g, '');
        if (k) dict[k] = v;
      }
    });
    return dict;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      const parsed = parseEnv(content);
      
      let detectedProv = 'AWS Bedrock';
      if (parsed.GEMINI_API_KEY || parsed.GOOGLE_API_KEY) detectedProv = 'Google Gemini';
      else if (parsed.OPENAI_API_KEY) detectedProv = 'OpenAI';
      
      setUploadedCreds(parsed);
      handleProviderChange(detectedProv);
      
      setXysqKey(parsed.XYSQ_API_KEY || '');
      setAwsAccess(parsed.AWS_ACCESS_KEY_ID || '');
      setAwsSecret(parsed.AWS_SECRET_ACCESS_KEY || '');
      setAwsRegion(parsed.AWS_DEFAULT_REGION || '');
      setGeminiKey(parsed.GEMINI_API_KEY || parsed.GOOGLE_API_KEY || '');
      setOpenaiKey(parsed.OPENAI_API_KEY || '');
      setModel(parsed.MODEL || (detectedProv === 'AWS Bedrock' ? 'bedrock/us.amazon.nova-lite-v1:0' : (detectedProv === 'Google Gemini' ? 'gemini/gemini-1.5-pro' : 'gpt-4o')));
      setError('');
    };
    reader.readAsText(file);
  };

  return (
    <div className="setup-page">
      <div className="app-header setup-header">
        <h1>⚙️ Configuration Setup</h1>
        <p>Please configure your credentials to use the Adaptive Learning Companion.</p>
      </div>

      {onBack && (
        <button className="btn btn-ghost mb-4" onClick={onBack}>← Back to Application</button>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'manual' ? 'active' : ''}`} onClick={() => {setTab('manual'); setError('');}}>✍️ Manual Entry</button>
        <button className={`tab ${tab === 'upload' ? 'active' : ''}`} onClick={() => {setTab('upload'); setError('');}}>📄 Upload .env File</button>
      </div>

      <div className="setup-card">
        {tab === 'upload' && !uploadedCreds && (
          <div className="file-upload-ui large" onClick={() => document.getElementById('env-upload').click()}>
            <input id="env-upload" type="file" accept=".env,.txt" style={{display:'none'}} onChange={handleFileUpload} />
            Click to select or drop your .env file here
          </div>
        )}

        {(tab === 'manual' || uploadedCreds) && (
          <form onSubmit={handleManualSave}>
            {uploadedCreds && (
              <div className="alert alert-success" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <span>File parsed successfully. Review and save below.</span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{marginLeft:'1rem', padding:'0.25rem 0.75rem', fontSize:'0.85rem'}}
                  onClick={() => { setUploadedCreds(null); setTab('upload'); setError(''); }}
                >
                  ✕ Clear / Re-upload
                </button>
              </div>
            )}
            
            <div className="form-group mb-4">
              <label>Select AI Provider</label>
              <div className="radio-group horizontal">
                {['AWS Bedrock', 'Google Gemini', 'OpenAI'].map(p => (
                  <label key={p} className="radio-label">
                    <input type="radio" checked={provider === p} onChange={() => handleProviderChange(p)} />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>XYSQ_API_KEY</label>
              <input type="password" value={xysqKey} onChange={e => setXysqKey(e.target.value)} />
            </div>

            {provider === 'AWS Bedrock' && (
              <>
                <div className="form-group">
                  <label>AWS_ACCESS_KEY_ID</label>
                  <input type="text" value={awsAccess} onChange={e => setAwsAccess(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>AWS_SECRET_ACCESS_KEY</label>
                  <input type="password" value={awsSecret} onChange={e => setAwsSecret(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>AWS_DEFAULT_REGION</label>
                  <input type="text" value={awsRegion} onChange={e => setAwsRegion(e.target.value)} />
                </div>
              </>
            )}

            {provider === 'Google Gemini' && (
              <div className="form-group">
                <label>GEMINI_API_KEY / GOOGLE_API_KEY</label>
                <input type="password" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
              </div>
            )}

            {provider === 'OpenAI' && (
              <div className="form-group">
                <label>OPENAI_API_KEY</label>
                <input type="password" value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} />
              </div>
            )}

            <div className="form-group">
              <label>MODEL</label>
              <input type="text" value={model} onChange={e => setModel(e.target.value)} />
            </div>

            {error && <div className="alert alert-error mt-4">{error}</div>}

            <div className="mt-4">
              <button type="submit" className="btn btn-primary">{uploadedCreds ? 'Save Uploaded Credentials' : 'Save Credentials'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
