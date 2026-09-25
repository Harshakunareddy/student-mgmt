import { useState, useEffect } from 'react';
import API from '../../api/axios';

const AttendanceHistory = () => {
  const [subjects, setSubjects] = useState([]);
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ subjectId: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    API.get('/faculty/my-subjects').then(res => setSubjects(res.data));
  }, []);

  const search = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.subjectId) {
      const assignment = subjects.find(s => s.id === parseInt(filters.subjectId));
      if (assignment) {
        params.append('subjectId', assignment.subjectId);
        params.append('sectionId', assignment.sectionId);
      }
    }
    if (filters.date) params.append('date', filters.date);
    const res = await API.get(`/faculty/attendance-history?${params}`);
    setRecords(res.data);
    setLoading(false);
  };

  const handleCorrect = async (id) => {
    await API.put(`/faculty/correct-attendance/${id}`, { status: editStatus });
    setEditingId(null);
    search();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Attendance History</h1>
        <p>View and correct past attendance records</p>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label>Subject & Section</label>
          <select value={filters.subjectId} onChange={e => setFilters({ ...filters, subjectId: e.target.value })}>
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.Subject?.name} - {s.Section?.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} />
        </div>
        <button className="btn btn-primary" onClick={search}>Search</button>
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
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.Student?.User?.name}</td>
                    <td>{r.Subject?.name}</td>
                    <td>{r.Section?.name}</td>
                    <td>
                      {editingId === r.id ? (
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                        </select>
                      ) : (
                        <span className={`badge badge-${r.status}`}>{r.status}</span>
                      )}
                    </td>
                    <td>{r.remarks || '—'}</td>
                    <td>
                      <div className="table-actions">
                        {editingId === r.id ? (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleCorrect(r.id)}>Save</button>
                            <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                          </>
                        ) : (
                          <button className="btn btn-sm btn-secondary" onClick={() => { setEditingId(r.id); setEditStatus(r.status); }}>Correct</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && records.length === 0 && <div className="empty-state"><span>📅</span><p>Search for attendance records</p></div>}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
