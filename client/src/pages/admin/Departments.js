import { useState, useEffect } from 'react';
import API from '../../api/axios';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '' });

  const load = () => API.get('/admin/departments').then(res => setDepartments(res.data));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await API.put(`/admin/departments/${editing.id}`, form);
    else await API.post('/admin/departments', form);
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', code: '' });
    load();
  };

  const handleEdit = (dept) => {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this department?')) {
      await API.delete(`/admin/departments/${id}`);
      load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Departments</h1>
        <p>Manage institution departments</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>All Departments ({departments.length})</h2>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', code: '' }); setShowModal(true); }}>
            + Add Department
          </button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, i) => (
                <tr key={dept.id}>
                  <td>{i + 1}</td>
                  <td>{dept.name}</td>
                  <td><span className="badge badge-faculty">{dept.code}</span></td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(dept)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(dept.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {departments.length === 0 && <div className="empty-state"><span>🏛️</span><p>No departments yet</p></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Department' : 'Add Department'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Department Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Code</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
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

export default Departments;
