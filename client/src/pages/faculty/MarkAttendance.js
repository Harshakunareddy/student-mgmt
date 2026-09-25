import { useState, useEffect } from 'react';
import API from '../../api/axios';
import '../../styles/attendance.css';

const MarkAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    API.get('/faculty/my-subjects').then(res => setSubjects(res.data));
  }, []);

  const handleAssignmentChange = async (val) => {
    setSelectedAssignment(val);
    setMessage({ type: '', text: '' });
    if (!val) { setStudents([]); return; }
    const assignment = subjects.find(s => s.id === parseInt(val));
    if (assignment) {
      const res = await API.get(`/faculty/students/${assignment.sectionId}`);
      setStudents(res.data);
      const defaultAttendance = {};
      res.data.forEach(s => { defaultAttendance[s.id] = 'present'; });
      setAttendance(defaultAttendance);
    }
  };

  const setStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s.id] = status; });
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !date) return;
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const assignment = subjects.find(s => s.id === parseInt(selectedAssignment));
    const data = {
      subjectId: assignment.subjectId,
      sectionId: assignment.sectionId,
      date,
      attendance: students.map(s => ({ studentId: s.id, status: attendance[s.id] || 'present' }))
    };

    try {
      const res = await API.post('/faculty/mark-attendance', data);
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to mark attendance' });
    }
    setSubmitting(false);
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendance).filter(s => s === 'late').length;

  return (
    <div>
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <p>Select subject, date, and mark attendance for students</p>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label>Subject & Section</label>
          <select value={selectedAssignment} onChange={e => handleAssignmentChange(e.target.value)}>
            <option value="">Select Subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.Subject?.name} ({s.Subject?.code}) - {s.Section?.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: '0.88rem'
        }}>
          {message.text}
        </div>
      )}

      {students.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Students ({students.length})</h2>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
          <div className="card-body">
            <div className="mark-all-bar">
              <span>Mark All As:</span>
              <div className="status-toggle">
                <button onClick={() => markAll('present')} className="active-present">All Present</button>
                <button onClick={() => markAll('absent')} className="active-absent">All Absent</button>
                <button onClick={() => markAll('late')} className="active-late">All Late</button>
              </div>
            </div>

            <div className="attendance-grid">
              {students.map(s => (
                <div key={s.id} className="attendance-row">
                  <div className="student-info">
                    <div className="student-avatar">{s.User?.name?.charAt(0)}</div>
                    <div>
                      <div className="student-name">{s.User?.name}</div>
                      <div className="student-roll">{s.rollNumber}</div>
                    </div>
                  </div>
                  <div className="status-toggle">
                    <button
                      className={attendance[s.id] === 'present' ? 'active-present' : ''}
                      onClick={() => setStatus(s.id, 'present')}
                    >Present</button>
                    <button
                      className={attendance[s.id] === 'absent' ? 'active-absent' : ''}
                      onClick={() => setStatus(s.id, 'absent')}
                    >Absent</button>
                    <button
                      className={attendance[s.id] === 'late' ? 'active-late' : ''}
                      onClick={() => setStatus(s.id, 'late')}
                    >Late</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="attendance-summary">
              <div className="summary-item">
                <div className="dot green"></div>
                <span>Present: <strong>{presentCount}</strong></span>
              </div>
              <div className="summary-item">
                <div className="dot red"></div>
                <span>Absent: <strong>{absentCount}</strong></span>
              </div>
              <div className="summary-item">
                <div className="dot yellow"></div>
                <span>Late: <strong>{lateCount}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAssignment && students.length === 0 && (
        <div className="card"><div className="card-body"><div className="empty-state"><span>👥</span><p>No students in this section</p></div></div></div>
      )}
    </div>
  );
};

export default MarkAttendance;
