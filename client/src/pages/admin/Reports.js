import { useState, useEffect } from 'react';
import API from '../../api/axios';

const Reports = () => {
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [filters, setFilters] = useState({ subjectId: '', sectionId: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/admin/subjects').then(res => setSubjects(res.data));
    API.get('/admin/sections').then(res => setSections(res.data));
  }, []);

  const search = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.sectionId) params.append('sectionId', filters.sectionId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    const res = await API.get(`/admin/attendance-report?${params}`);
    setRecords(res.data);
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Attendance Reports</h1>
        <p>View and analyze attendance data across the institution</p>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label>Subject</label>
          <select value={filters.subjectId} onChange={e => setFilters({ ...filters, subjectId: e.target.value })}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Section</label>
          <select value={filters.sectionId} onChange={e => setFilters({ ...filters, sectionId: e.target.value })}>
            <option value="">All Sections</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name} - {s.class?.name}</option>)}
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
        <button className="btn btn-primary" onClick={search}>Search</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Results ({records.length})</h2>
        </div>
        <div className="card-body">
          {loading ? <div className="loading">Loading</div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
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
                    <td>{r.Student?.User?.name}</td>
                    <td>{r.Subject?.name}</td>
                    <td>{r.Section?.name}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td>{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && records.length === 0 && <div className="empty-state"><span>📈</span><p>Use filters above to search attendance records</p></div>}
        </div>
      </div>
    </div>
  );
};

export default Reports;
