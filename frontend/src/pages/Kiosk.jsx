import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { ScanFace, CheckCircle, XCircle } from 'lucide-react';

export default function Kiosk() {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle, scanning, success, error
  const [message, setMessage] = useState('Position your face in the frame');
  const [studentName, setStudentName] = useState(null);
  
  const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }

  const captureAndRecognize = useCallback(async () => {
    if (status === 'success' || status === 'scanning') return;
    
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setStatus('scanning');
    setMessage('Scanning face...');

    try {
      const formData = new FormData();
      const imageBlob = dataURLtoBlob(imageSrc);
      formData.append('file', imageBlob, 'frame.jpg');

      const res = await fetch('http://localhost:8000/api/attendance/mark', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        
        if (data.marked_students && data.marked_students.length > 0) {
          const names = data.marked_students.map(s => s.student_name).join(', ');
          setStudentName(names);
        } else {
          setStudentName(null);
        }
        
        setMessage(data.message);
        
        // Reset after 3 seconds
        setTimeout(() => {
          setStatus('idle');
          setStudentName(null);
          setMessage('Position your face in the frame');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.detail || 'Face not recognized');
        
        // Retry quickly if no face found, or wait longer if recognized but error
        setTimeout(() => {
          setStatus('idle');
          setMessage('Position your face in the frame');
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Connection error to backend');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('Position your face in the frame');
      }, 3000);
    }
  }, [status, webcamRef]);

  // Set up periodic scanning
  useEffect(() => {
    if (status === 'idle') {
      const interval = setInterval(() => {
        captureAndRecognize();
      }, 1500); // Attempt scan every 1.5 seconds when idle
      
      return () => clearInterval(interval);
    }
  }, [status, captureAndRecognize]);

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title">Live Attendance Kiosk</h1>
        <p className="page-subtitle">Walk up to the camera to automatically mark your attendance.</p>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '720px' }}>
          
          <div style={{ 
            borderRadius: '24px', 
            overflow: 'hidden', 
            border: `4px solid ${
              status === 'success' ? 'var(--accent-secondary)' : 
              status === 'error' ? 'var(--accent-error)' : 
              status === 'scanning' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'
            }`,
            boxShadow: `0 0 40px ${
              status === 'success' ? 'rgba(16, 185, 129, 0.4)' : 
              status === 'error' ? 'rgba(239, 68, 68, 0.4)' : 
              status === 'scanning' ? 'rgba(59, 130, 246, 0.4)' : 'transparent'
            }`,
            transition: 'all 0.3s ease',
            position: 'relative'
          }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.95}
              width="100%"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: "user"
              }}
              style={{ display: 'block' }}
            />
            
            {/* Scanning Overlay Animation */}
            {status === 'scanning' && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '4px',
                background: 'var(--accent-primary)',
                boxShadow: '0 0 10px var(--accent-primary)',
                animation: 'scan-line 2s infinite linear'
              }} />
            )}
            
            {/* Status Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)',
              padding: '1rem 2rem',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {status === 'idle' && <ScanFace size={24} color="var(--text-secondary)" />}
              {status === 'scanning' && <ScanFace size={24} color="var(--accent-primary)" className="spinning" />}
              {status === 'success' && <CheckCircle size={24} color="var(--accent-secondary)" />}
              {status === 'error' && <XCircle size={24} color="var(--accent-error)" />}
              
              <div>
                <div style={{ 
                  fontWeight: '600', 
                  color: status === 'success' ? 'var(--accent-secondary)' : 
                         status === 'error' ? 'var(--accent-error)' : 'white' 
                }}>
                  {message}
                </div>
                {studentName && <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Welcome, {studentName}</div>}
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan-line {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .spinning {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
