import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [imageSrc, setImageSrc] = useState(null);
  const [mode, setMode] = useState('capture'); // 'capture' or 'upload'
  
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
  }, [webcamRef]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !roll || !imageSrc) {
      setStatus({ type: 'error', message: 'Please fill all fields and provide an image.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Registering student...' });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('roll_number', roll);
    
    // Convert base64 to file
    const imageBlob = dataURLtoBlob(imageSrc);
    formData.append('file', imageBlob, 'face.jpg');

    try {
      const res = await fetch('http://localhost:8000/api/students/register', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Student registered successfully!' });
        setName('');
        setRoll('');
        setImageSrc(null);
      } else {
        setStatus({ type: 'error', message: data.detail || 'Failed to register student.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Connection error. Is the backend running?' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Register Student</h1>
        <p className="page-subtitle">Add a new student profile and face encoding to the system.</p>
      </div>

      {status.message && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          color: status.type === 'error' ? 'var(--accent-error)' : status.type === 'success' ? 'var(--accent-secondary)' : 'var(--accent-primary)',
          border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
        }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <label className="label">Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Roll Number</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. CS2026-001"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label className="label" style={{ margin: 0 }}>Face Image</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className={`secondary-button ${mode === 'capture' ? 'active' : ''}`} onClick={() => setMode('capture')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <Camera size={14} style={{ marginRight: '0.5rem', display: 'inline' }} />
                Camera
              </button>
              <button type="button" className={`secondary-button ${mode === 'upload' ? 'active' : ''}`} onClick={() => setMode('upload')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                <Upload size={14} style={{ marginRight: '0.5rem', display: 'inline' }} />
                Upload
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '300px', justifyContent: 'center', border: '1px dashed var(--border-color)' }}>
            {imageSrc ? (
              <div style={{ position: 'relative' }}>
                <img src={imageSrc} alt="Captured face" style={{ borderRadius: '8px', maxHeight: '300px' }} />
                <button type="button" onClick={() => setImageSrc(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                  Retake
                </button>
              </div>
            ) : mode === 'capture' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.95}
                  width={480}
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                  }}
                  style={{ borderRadius: '8px' }}
                />
                <button type="button" className="primary-button" onClick={capture}>Capture Photo</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Upload size={48} color="var(--text-secondary)" />
                <p style={{ color: 'var(--text-secondary)' }}>Click to upload an image</p>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button type="button" className="secondary-button" onClick={() => fileInputRef.current.click()}>Select File</button>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="primary-button" style={{ width: '100%' }} disabled={status.type === 'loading'}>
          {status.type === 'loading' ? 'Processing...' : (
            <>
              <UserPlus size={18} />
              Register Student
            </>
          )}
        </button>
      </form>
    </div>
  );
}
