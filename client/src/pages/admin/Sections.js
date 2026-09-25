import { useState, useEffect } from 'react';
import API from '../../api/axios';

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', classId: '' });

  const load = () => {
    API.get('/admin/sections').then(res => setSections(res.data));
    API.get('/admin/classes').then(res => setClasses(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await API.put(`/admin/sections/${editing.id}`, form);
    else await API.post('/admin/sections', form);
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', classId: '' });
    load();
  };

  const handleEdit = (sec) => {
    setEditing(sec);
    setForm({ name: sec.name, classId: sec.classId });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this section?')) {
      await API.delete(`/admin/sections/${id}`);
      load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Sections</h1>
        <p>Manage sections within classes</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>All Sections ({sections.length})</h2>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', classId: '' }); setShowModal(true); }}>
            + Add Section
          </button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Class</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec, i) => (
                <tr key={sec.id}>
                  <td>{i + 1}</td>
                  <td>{sec.name}</td>
                  <td>{sec.class?.name}</td>
                  <td>{sec.class?.Department?.name}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(sec)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(sec.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sections.length === 0 && <div className="empty-state"><span>📋</span><p>No sections yet</p></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Section' : 'Add Section'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Section Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Class</label>
                  <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} required>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.Department?.name})</option>)}
                  </select>
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

export default Sections;
