import { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCw, Users } from 'lucide-react';

export default function Dashboard() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('attendance'); // 'attendance' or 'students'

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/attendance/today');
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Manage students and view attendance records.</p>
        </div>
        <button className="secondary-button" onClick={() => { fetchAttendance(); fetchStudents(); }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button 
          className={tab === 'attendance' ? 'primary-button' : 'secondary-button'} 
          onClick={() => setTab('attendance')}
          style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
        >
          <Clock size={16} style={{ marginRight: '0.5rem' }} />
          Today's Attendance ({attendance.length})
        </button>
        <button 
          className={tab === 'students' ? 'primary-button' : 'secondary-button'} 
          onClick={() => setTab('students')}
          style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
        >
          <Users size={16} style={{ marginRight: '0.5rem' }} />
          Registered Students ({students.length})
        </button>
      </div>

      {/* Attendance Tab */}
      {tab === 'attendance' && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data...</div>
          ) : attendance.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance marked today.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {record.student_photo ? (
                          <img 
                            src={record.student_photo} 
                            alt={record.student_name} 
                            style={{ 
                              width: '40px', height: '40px', 
                              borderRadius: '50%', objectFit: 'cover',
                              border: '2px solid var(--border-color)' 
                            }} 
                          />
                        ) : (
                          <div style={{ 
                            width: '40px', height: '40px', borderRadius: '50%', 
                            background: 'var(--accent-primary)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.875rem', fontWeight: '600', color: '#fff'
                          }}>
                            {record.student_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{record.student_name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} color="var(--text-secondary)" />
                        {record.date}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} color="var(--text-secondary)" />
                        {record.time}
                      </div>
                    </td>
                    <td>
                      <span className="status-badge">Present</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Students Tab */}
      {tab === 'students' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {students.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No students registered yet.
            </div>
          ) : (
            students.map((student, index) => (
              <div key={index} className="glass-panel animate-fade-in" style={{ 
                padding: '1.5rem', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                animationDelay: `${index * 0.05}s`
              }}>
                {student.photo_url ? (
                  <img 
                    src={student.photo_url} 
                    alt={student.name} 
                    style={{ 
                      width: '80px', height: '80px', 
                      borderRadius: '50%', objectFit: 'cover',
                      border: '3px solid var(--accent-primary)',
                      boxShadow: '0 0 15px var(--accent-glow)'
                    }} 
                  />
                ) : (
                  <div style={{ 
                    width: '80px', height: '80px', borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--accent-primary), #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', fontWeight: '700', color: '#fff',
                    boxShadow: '0 0 15px var(--accent-glow)'
                  }}>
                    {student.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{student.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                    {student.roll_number}
                  </div>
                </div>
                {student.registered_at && (
                  <div style={{ 
                    fontSize: '0.75rem', color: 'var(--text-secondary)', 
                    padding: '0.25rem 0.75rem', borderRadius: '999px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)'
                  }}>
                    Registered {new Date(student.registered_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
