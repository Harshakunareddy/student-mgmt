import { useState, useEffect } from 'react';
import API from '../../api/axios';

const FacultySubjects = () => {
  const [assignments, setAssignments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ facultyId: '', subjectId: '', sectionId: '' });

  const load = () => {
    API.get('/admin/faculty-subjects').then(res => setAssignments(res.data));
    API.get('/admin/users?role=faculty').then(res => setFaculty(res.data));
    API.get('/admin/subjects').then(res => setSubjects(res.data));
    API.get('/admin/sections').then(res => setSections(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post('/admin/faculty-subjects', form);
    setShowModal(false);
    setForm({ facultyId: '', subjectId: '', sectionId: '' });
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this assignment?')) {
      await API.delete(`/admin/faculty-subjects/${id}`);
      load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Faculty Assignments</h1>
        <p>Assign subjects and sections to faculty members</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Assignments ({assignments.length})</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Assign</button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Faculty</th>
                <th>Subject</th>
                <th>Section</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, i) => (
                <tr key={a.id}>
                  <td>{i + 1}</td>
                  <td>{a.Faculty?.name}</td>
                  <td>{a.Subject?.name} ({a.Subject?.code})</td>
                  <td>{a.Section?.name}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assignments.length === 0 && <div className="empty-state"><span>🔗</span><p>No assignments yet</p></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Faculty</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Faculty Member</label>
                  <select value={form.facultyId} onChange={e => setForm({ ...form, facultyId: e.target.value })} required>
                    <option value="">Select Faculty</option>
                    {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <select value={form.sectionId} onChange={e => setForm({ ...form, sectionId: e.target.value })} required>
                    <option value="">Select Section</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name} - {s.class?.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultySubjects;
