import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { ScanFace, CheckCircle, XCircle, Loader } from 'lucide-react';
import API_URL from '../api';

export default function Kiosk() {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Waiting for a face…');
  const [studentName, setStudentName] = useState(null);

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8 = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
    return new Blob([u8], { type: mime });
  };

  const captureAndRecognize = useCallback(async () => {
    if (status === 'success' || status === 'scanning') return;

    const src = webcamRef.current?.getScreenshot();
    if (!src) return;

    setStatus('scanning');
    setMessage('Scanning…');

    try {
      const fd = new FormData();
      fd.append('file', dataURLtoBlob(src), 'frame.jpg');

      const res = await fetch(`${API_URL}/api/attendance/mark`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        if (data.marked_students?.length > 0) {
          setStudentName(data.marked_students.map(s => s.student_name).join(', '));
        } else {
          setStudentName(null);
        }
        setMessage(data.message);
        setTimeout(() => { setStatus('idle'); setStudentName(null); setMessage('Waiting for a face…'); }, 3500);
      } else {
        setStatus('error');
        setMessage(data.detail || 'Not recognized');
        setTimeout(() => { setStatus('idle'); setMessage('Waiting for a face…'); }, 2000);
      }
    } catch {
      setStatus('error');
      setMessage('Connection error');
      setTimeout(() => { setStatus('idle'); setMessage('Waiting for a face…'); }, 3000);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'idle') {
      const id = setInterval(captureAndRecognize, 1500);
      return () => clearInterval(id);
    }
  }, [status, captureAndRecognize]);

  // Dynamic styles
  const borderMap = {
    idle: 'var(--border)',
    scanning: 'var(--accent)',
    success: 'var(--positive)',
    error: 'var(--negative)',
  };

  const stripBg = {
    idle: 'var(--surface-2)',
    scanning: 'var(--accent-subtle)',
    success: 'var(--positive-subtle)',
    error: 'var(--negative-subtle)',
  };

  const stripColor = {
    idle: 'var(--ink-secondary)',
    scanning: 'var(--accent)',
    success: 'var(--positive)',
    error: 'var(--negative)',
  };

  const stripBorder = {
    idle: 'var(--border)',
    scanning: '#c7d2fe',
    success: '#a7f3d0',
    error: '#fecaca',
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h1 className="page-heading">Live Kiosk</h1>
        <p className="page-desc">Face the camera to mark attendance automatically.</p>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ width: '100%', maxWidth: 580 }}>

          {/* Camera */}
          <div className="camera-frame" style={{ borderColor: borderMap[status] }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.95}
              width="100%"
              videoConstraints={{ width: 1280, height: 720, facingMode: 'user' }}
              style={{ display: 'block' }}
            />
            {status === 'scanning' && <div className="scan-bar" />}
          </div>

          {/* Status Strip */}
          <div
            className="status-strip"
            style={{
              background: stripBg[status],
              color: stripColor[status],
              border: `1px solid ${stripBorder[status]}`,
            }}
          >
            {status === 'idle' && <ScanFace size={18} />}
            {status === 'scanning' && <Loader size={18} className="spinning" />}
            {status === 'success' && <CheckCircle size={18} />}
            {status === 'error' && <XCircle size={18} />}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{message}</div>
              {studentName && (
                <div style={{ fontSize: '0.75rem', marginTop: 2, opacity: 0.8 }}>
                  Welcome, {studentName}
                </div>
              )}
            </div>

            {status === 'idle' && (
              <span className="pulsing" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--positive)', flexShrink: 0 }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
