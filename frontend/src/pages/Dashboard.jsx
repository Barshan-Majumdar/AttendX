import { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Assuming backend runs on localhost:8000
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

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Today's Attendance</h1>
          <p className="page-subtitle">Real-time view of student check-ins.</p>
        </div>
        <button className="secondary-button" onClick={fetchAttendance} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading data...</div>
        ) : attendance.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance marked today.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={index}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {record.student_id.slice(-6).toUpperCase()}
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
    </div>
  );
}
