import { useState, useEffect } from 'react';
import API from '../../api/axios';
import '../../styles/attendance.css';

const LowAttendance = () => {
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [threshold, setThreshold] = useState(75);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/faculty/my-subjects').then(res => setSubjects(res.data));
  }, []);

  const search = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('threshold', threshold);
    if (subjectFilter) {
      const assignment = subjects.find(s => s.id === parseInt(subjectFilter));
      if (assignment) {
        params.append('subjectId', assignment.subjectId);
        params.append('sectionId', assignment.sectionId);
      }
    }
    const res = await API.get(`/faculty/low-attendance?${params}`);
    setResults(res.data);
    setLoading(false);
  };

  useEffect(() => { search(); }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Low Attendance Report</h1>
        <p>Identify students below attendance threshold</p>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label>Subject & Section</label>
          <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.Subject?.name} - {s.Section?.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Threshold (%)</label>
          <input type="number" min="0" max="100" value={threshold} onChange={e => setThreshold(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={search}>Search</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Students Below {threshold}% ({results.length})</h2>
        </div>
        <div className="card-body">
          {loading ? <div className="loading">Loading</div> : (
            <>
              {results.map((r, i) => (
                <div key={i} className="low-attendance-card">
                  <div className="student-details">
                    <h4>{r.student.name}</h4>
                    <p>{r.student.rollNumber} • {r.student.email}</p>
                    <p>{r.subject.name} ({r.subject.code}) • {r.section.name}</p>
                  </div>
                  <div className="attendance-stats">
                    <div className="percentage">{r.percentage}%</div>
                    <div className="classes-info">{r.attended}/{r.totalClasses} classes</div>
                  </div>
                </div>
              ))}
              {results.length === 0 && <div className="empty-state"><span>✅</span><p>No students below threshold</p></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LowAttendance;
