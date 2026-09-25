import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const FacultyDashboard = () => {
  const [stats, setStats] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      API.get('/faculty/dashboard-stats'),
      API.get('/faculty/my-subjects')
    ]).then(([statsRes, subRes]) => {
      setStats(statsRes.data);
      setSubjects(subRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Faculty Dashboard</h1>
        <p>Your teaching overview and quick actions</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">📖</div>
          <div className="stat-value">{stats.totalSubjects || 0}</div>
          <div className="stat-label">Assigned Subjects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-value">{stats.todayMarked || 0}</div>
          <div className="stat-label">Marked Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">👨‍🎓</div>
          <div className="stat-value">{stats.totalStudents || 0}</div>
          <div className="stat-label">Total Students</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => navigate('/faculty/mark-attendance')}>
                <span>✅</span> Mark Attendance
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/faculty/attendance-history')}>
                <span>📅</span> View History
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/faculty/low-attendance')}>
                <span>⚠️</span> Low Attendance
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>My Subjects</h2>
          </div>
          <div className="card-body">
            <div className="subject-stats-list">
              {subjects.map(s => (
                <div key={s.id} className="subject-stat-item">
                  <div>
                    <div className="subject-name">{s.Subject?.name}</div>
                    <div className="subject-code">{s.Subject?.code} • {s.Section?.name}</div>
                  </div>
                  <span className="badge badge-faculty">{s.Section?.class?.name}</span>
                </div>
              ))}
              {subjects.length === 0 && <div className="empty-state"><span>📖</span><p>No subjects assigned</p></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
