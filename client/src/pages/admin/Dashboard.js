import { useState, useEffect } from 'react';
import API from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats').then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading</div>;

  const todayRate = stats.todayAttendance > 0
    ? Math.round((stats.todayPresent / stats.todayAttendance) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of institution attendance management</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👨‍🎓</div>
          <div className="stat-value">{stats.totalStudents || 0}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👨‍🏫</div>
          <div className="stat-value">{stats.totalFaculty || 0}</div>
          <div className="stat-label">Total Faculty</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🏛️</div>
          <div className="stat-value">{stats.totalDepartments || 0}</div>
          <div className="stat-label">Departments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📖</div>
          <div className="stat-value">{stats.totalSubjects || 0}</div>
          <div className="stat-label">Subjects</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan">📋</div>
          <div className="stat-value">{stats.todayAttendance || 0}</div>
          <div className="stat-label">Today's Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rose">✅</div>
          <div className="stat-value">{todayRate}%</div>
          <div className="stat-label">Today's Present Rate</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
