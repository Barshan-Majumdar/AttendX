import { useState, useEffect } from 'react';
import { Calendar, Clock, RefreshCw, Users, Trash2, UserCheck, UserX } from 'lucide-react';
import API_URL from '../api';

export default function Dashboard() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('attendance');

  // Helper function to format date to DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // Return original if invalid date
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/attendance/today`);
      if (res.ok) setAttendance(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/students`);
      if (res.ok) setStudents(await res.json());
    } catch (e) { console.error(e); }
  };

  const deleteStudent = async (id, name) => {
    if (!confirm(`Remove "${name}"? This deletes all their records.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) { fetchStudents(); fetchAttendance(); }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAttendance(); fetchStudents(); }, []);

  const absent = Math.max(0, students.length - attendance.length);

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-heading">Dashboard</h1>
          <p className="page-desc">Overview of today's attendance activity.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => { fetchAttendance(); fetchStudents(); }}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid stagger">
        <div className="stat-card animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-label">Total Students</div>
              <div className="stat-value">{students.length}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="var(--accent)" />
            </div>
          </div>
        </div>
        <div className="stat-card animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-label">Present Today</div>
              <div className="stat-value" style={{ color: 'var(--positive)' }}>{attendance.length}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--positive-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={18} color="var(--positive)" />
            </div>
          </div>
        </div>
        <div className="stat-card animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-label">Absent</div>
              <div className="stat-value" style={{ color: absent > 0 ? 'var(--negative)' : 'var(--ink-muted)' }}>{absent}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: absent > 0 ? 'var(--negative-subtle)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserX size={18} color={absent > 0 ? 'var(--negative)' : 'var(--ink-muted)'} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div className="toggle-group">
          <button className={`toggle-btn ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>
            <Clock size={14} />
            Attendance ({attendance.length})
          </button>
          <button className={`toggle-btn ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>
            <Users size={14} />
            Students ({students.length})
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      {tab === 'attendance' && (
        <div className="table-wrap animate-in">
          {loading ? (
            <div className="empty-state">Loading…</div>
          ) : attendance.length === 0 ? (
            <div className="empty-state">No attendance records yet today.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}></th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((r, i) => (
                  <tr key={i}>
                    <td>
                      {r.student_photo
                        ? <img src={r.student_photo} alt="" className="avatar" />
                        : <div className="avatar-placeholder">{r.student_name?.charAt(0)}</div>
                      }
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.student_name}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--ink-secondary)' }}>
                        <Calendar size={12} /> {formatDate(r.date)}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--ink-secondary)' }}>
                        <Clock size={12} /> {r.time}
                      </span>
                    </td>
                    <td><span className="badge badge-positive">Present</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Students Table */}
      {tab === 'students' && (
        <div className="table-wrap animate-in">
          {students.length === 0 ? (
            <div className="empty-state">No students registered yet.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}></th>
                  <th>Name</th>
                  <th>Roll Number</th>
                  <th>Registered</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i}>
                    <td>
                      {s.photo_url
                        ? <img src={s.photo_url} alt="" className="avatar" />
                        : <div className="avatar-placeholder">{s.name?.charAt(0)}</div>
                      }
                    </td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td><span className="code-chip">{s.roll_number}</span></td>
                    <td style={{ color: 'var(--ink-secondary)', fontSize: '0.8125rem' }}>
                      {formatDate(s.registered_at)}
                    </td>
                    <td>
                      <button className="btn-danger-ghost" onClick={() => deleteStudent(s._id, s.name)} title="Remove student">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}