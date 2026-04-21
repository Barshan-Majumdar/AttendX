import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, UserPlus, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import API_URL from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [imageSrc, setImageSrc] = useState(null);
  const [mode, setMode] = useState('capture');

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const capture = useCallback(() => {
    setImageSrc(webcamRef.current.getScreenshot());
  }, [webcamRef]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8 = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
    return new Blob([u8], { type: mime });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !roll || !imageSrc) {
      setStatus({ type: 'error', message: 'Please fill all fields and provide a face image.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Processing registration…' });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('roll_number', roll);
    formData.append('file', dataURLtoBlob(imageSrc), 'face.jpg');

    try {
      const res = await fetch(`${API_URL}/api/students/register`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: `${name} registered successfully!` });
        setName('');
        setRoll('');
        setImageSrc(null);
      } else {
        setStatus({ type: 'error', message: data.detail || 'Registration failed.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Cannot connect to backend.' });
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: 620, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 className="page-heading">Register Student</h1>
        <p className="page-desc">Enroll a new student by capturing or uploading their face.</p>
      </div>

      {/* Toast */}
      {status.message && (
        <div className={`toast ${
          status.type === 'error' ? 'toast-error' :
          status.type === 'success' ? 'toast-success' : 'toast-info'
        }`}>
          {status.type === 'success' && <CheckCircle size={16} />}
          {status.type === 'error' && <AlertCircle size={16} />}
          {status.type === 'loading' && <Loader size={16} className="spinning" />}
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Info */}
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          <div className="card-body">
            <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)', marginBottom: '0.8rem' }}>
              Step 1 — Student Info
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Roll Number</label>
                <input className="form-input" placeholder="e.g. CS2026-001" value={roll} onChange={e => setRoll(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Face */}
        <div className="card" style={{ marginBottom: '0.75rem' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-muted)' }}>
                Step 2 — Face Capture
              </div>
              <div className="toggle-group">
                <button type="button" className={`toggle-btn ${mode === 'capture' ? 'active' : ''}`} onClick={() => setMode('capture')}>
                  <Camera size={13} /> Camera
                </button>
                <button type="button" className={`toggle-btn ${mode === 'upload' ? 'active' : ''}`} onClick={() => setMode('upload')}>
                  <Upload size={13} /> Upload
                </button>
              </div>
            </div>

            <div className="dropzone">
              {imageSrc ? (
                <div style={{ position: 'relative' }}>
                  <img src={imageSrc} alt="Face" style={{ borderRadius: 'var(--radius-md)', maxHeight: 260 }} />
                  <button
                    type="button"
                    onClick={() => setImageSrc(null)}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(0,0,0,0.55)', color: '#fff',
                      padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem', fontWeight: 500, border: 'none', cursor: 'pointer',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    Retake
                  </button>
                </div>
              ) : mode === 'capture' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', width: '100%' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.95}
                    width="100%"
                    videoConstraints={{ width: 1280, height: 720, facingMode: 'user' }}
                    style={{ borderRadius: 'var(--radius-md)', display: 'block' }}
                  />
                  <button type="button" className="btn btn-primary" onClick={capture}>
                    <Camera size={15} /> Capture
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', padding: '1.5rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={22} color="var(--accent)" />
                  </div>
                  <p style={{ color: 'var(--ink-secondary)', fontSize: '0.8125rem' }}>Select an image file</p>
                  <input type="file" accept="image/jpeg,image/png" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                  <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
                    Browse Files
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem' }} disabled={status.type === 'loading'}>
          {status.type === 'loading' ? (
            <><Loader size={15} className="spinning" /> Processing…</>
          ) : (
            <><UserPlus size={15} /> Register Student</>
          )}
        </button>
      </form>
    </div>
  );
}
