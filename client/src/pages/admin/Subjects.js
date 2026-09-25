import { useState, useEffect } from 'react';
import API from '../../api/axios';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', credits: 3, departmentId: '' });

  const load = () => {
    API.get('/admin/subjects').then(res => setSubjects(res.data));
    API.get('/admin/departments').then(res => setDepartments(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await API.put(`/admin/subjects/${editing.id}`, form);
    else await API.post('/admin/subjects', form);
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', code: '', credits: 3, departmentId: '' });
    load();
  };

  const handleEdit = (sub) => {
    setEditing(sub);
    setForm({ name: sub.name, code: sub.code, credits: sub.credits, departmentId: sub.departmentId });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this subject?')) {
      await API.delete(`/admin/subjects/${id}`);
      load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Subjects</h1>
        <p>Manage subjects across departments</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>All Subjects ({subjects.length})</h2>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', code: '', credits: 3, departmentId: '' }); setShowModal(true); }}>
            + Add Subject
          </button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Name</th>
                <th>Credits</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, i) => (
                <tr key={sub.id}>
                  <td>{i + 1}</td>
                  <td><span className="badge badge-faculty">{sub.code}</span></td>
                  <td>{sub.name}</td>
                  <td>{sub.credits}</td>
                  <td>{sub.Department?.name}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(sub)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(sub.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {subjects.length === 0 && <div className="empty-state"><span>📖</span><p>No subjects yet</p></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Subject' : 'Add Subject'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Subject Name</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Code</label>
                    <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Credits</label>
                    <input type="number" min="1" max="6" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} required>
                      <option value="">Select</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
