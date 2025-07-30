// Minimal test page - completely isolated
export default function MinimalPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green' }}>✅ Minimal Test Page Working!</h1>
      <p>If you can see this, basic Next.js is working.</p>
      <p>Now we can test imports one by one.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <strong>Status:</strong> Basic Next.js ✅
      </div>
    </div>
  );
}