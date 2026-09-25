import { useState, useEffect } from 'react';
import API from '../../api/axios';
import '../../styles/dashboard.css';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/student/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading</div>;
  if (!data) return <div className="empty-state"><span>❌</span><p>Could not load dashboard</p></div>;

  const getLevel = (pct) => pct >= 75 ? 'high' : pct >= 50 ? 'medium' : 'low';

  return (
    <div>
      <div className="page-header">
        <h1>Student Dashboard</h1>
        <p>{data.student.name} • {data.student.rollNumber} • {data.student.section} • {data.student.className} • {data.student.department}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📊</div>
          <div className="stat-value">{data.overallPercentage}%</div>
          <div className="stat-label">Overall Attendance</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📖</div>
          <div className="stat-value">{data.subjectStats.length}</div>
          <div className="stat-label">Total Subjects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">✅</div>
          <div className="stat-value">{data.subjectStats.reduce((sum, s) => sum + s.attended, 0)}</div>
          <div className="stat-label">Classes Attended</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📅</div>
          <div className="stat-value">{data.subjectStats.reduce((sum, s) => sum + s.totalClasses, 0)}</div>
          <div className="stat-label">Total Classes</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Subject-wise Attendance</h2>
        </div>
        <div className="card-body">
          <div className="subject-stats-list">
            {data.subjectStats.map((s, i) => (
              <div key={i} className="subject-stat-item">
                <div style={{ flex: 1 }}>
                  <div className="subject-name">{s.subject.name}</div>
                  <div className="subject-code">{s.subject.code} • {s.attended}/{s.totalClasses} classes</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="progress-bar-container">
                    <div className={`progress-bar ${getLevel(s.percentage)}`} style={{ width: `${s.percentage}%` }}></div>
                  </div>
                  <span className={`percentage-badge ${getLevel(s.percentage)}`}>{s.percentage}%</span>
                </div>
              </div>
            ))}
            {data.subjectStats.length === 0 && <div className="empty-state"><span>📖</span><p>No attendance data available</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
