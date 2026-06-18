export default function MemoryCard({ context, isNew }) {
  if (isNew) {
    return (
      <div className="alert alert-info">
        <div>
          <strong>🆕 First Session</strong>
          <p>No prior learning history found for this topic. Let's establish a baseline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alert" style={{ background: 'var(--bg-glass)', border: '1px solid var(--accent-teal)', borderLeft: '4px solid var(--accent-teal)' }}>
      <div>
        <strong style={{ color: 'var(--accent-teal-light)', textTransform: 'uppercase', fontSize: 'var(--font-xs)', letterSpacing: '0.05em' }}>🧠 Prior Learning Recalled</strong>
        <div style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{context}</div>
      </div>
    </div>
  );
}
