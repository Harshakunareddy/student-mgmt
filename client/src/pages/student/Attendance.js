import { useState, useEffect } from 'react';
import API from '../../api/axios';

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subjectId: '', startDate: '', endDate: '' });
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    API.get('/student/dashboard').then(res => setDashboard(res.data));
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    const res = await API.get(`/student/attendance?${params}`);
    setRecords(res.data);
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Attendance</h1>
        <p>Detailed attendance records</p>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label>Subject</label>
          <select value={filters.subjectId} onChange={e => setFilters({ ...filters, subjectId: e.target.value })}>
            <option value="">All Subjects</option>
            {dashboard?.subjectStats?.map(s => (
              <option key={s.subject.id} value={s.subject.id}>{s.subject.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
        </div>
        <button className="btn btn-primary" onClick={loadRecords}>Search</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Records ({records.length})</h2>
        </div>
        <div className="card-body">
          {loading ? <div className="loading">Loading</div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.Subject?.name} ({r.Subject?.code})</td>
                    <td>{r.Section?.name}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td>{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && records.length === 0 && <div className="empty-state"><span>📅</span><p>No records found</p></div>}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
