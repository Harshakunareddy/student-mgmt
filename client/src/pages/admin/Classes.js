import { useState, useEffect } from 'react';
import API from '../../api/axios';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', departmentId: '', year: 1, semester: 1 });

  const load = () => {
    API.get('/admin/classes').then(res => setClasses(res.data));
    API.get('/admin/departments').then(res => setDepartments(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await API.put(`/admin/classes/${editing.id}`, form);
    else await API.post('/admin/classes', form);
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', departmentId: '', year: 1, semester: 1 });
    load();
  };

  const handleEdit = (cls) => {
    setEditing(cls);
    setForm({ name: cls.name, departmentId: cls.departmentId, year: cls.year, semester: cls.semester });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this class?')) {
      await API.delete(`/admin/classes/${id}`);
      load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Classes</h1>
        <p>Manage classes across departments</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>All Classes ({classes.length})</h2>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', departmentId: '', year: 1, semester: 1 }); setShowModal(true); }}>
            + Add Class
          </button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls, i) => (
                <tr key={cls.id}>
                  <td>{i + 1}</td>
                  <td>{cls.name}</td>
                  <td>{cls.Department?.name}</td>
                  <td>{cls.year}</td>
                  <td>{cls.semester}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(cls)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cls.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {classes.length === 0 && <div className="empty-state"><span>📚</span><p>No classes yet</p></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Class' : 'Add Class'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Class Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} required>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Year</label>
                    <input type="number" min="1" max="4" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <input type="number" min="1" max="8" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} required />
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

export default Classes;
