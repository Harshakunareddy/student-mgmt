import { useState, useEffect } from 'react';
import API from '../../api/axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', departmentId: '', rollNumber: '', sectionId: '' });

  const load = () => {
    const params = roleFilter ? `?role=${roleFilter}` : '';
    API.get(`/admin/users${params}`).then(res => setUsers(res.data));
    API.get('/admin/departments').then(res => setDepartments(res.data));
    API.get('/admin/sections').then(res => setSections(res.data));
  };

  useEffect(() => { load(); }, [roleFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await API.put(`/admin/users/${editing.id}`, form);
    else await API.post('/admin/users', form);
    setShowModal(false);
    setEditing(null);
    setForm({ name: '', email: '', password: '', role: 'student', departmentId: '', rollNumber: '', sectionId: '' });
    load();
  };

  const handleEdit = (user) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, departmentId: user.departmentId || '', rollNumber: '', sectionId: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      await API.delete(`/admin/users/${id}`);
      load();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage faculty and student accounts</p>
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label>Filter by Role</label>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'student', departmentId: '', rollNumber: '', sectionId: '' }); setShowModal(true); }}>
          + Add User
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Users ({users.length})</h2>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id}>
                  <td>{i + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                  <td>{user.Department?.name || '—'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(user)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="empty-state"><span>👥</span><p>No users found</p></div>}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit User' : 'Add User'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Password {editing && '(leave blank to keep)'}</label>
                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}>
                      <option value="">Select</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                {form.role === 'student' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Roll Number</label>
                      <input value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Section</label>
                      <select value={form.sectionId} onChange={e => setForm({ ...form, sectionId: e.target.value })} required>
                        <option value="">Select</option>
                        {sections.map(s => <option key={s.id} value={s.id}>{s.name} - {s.class?.name}</option>)}
                      </select>
                    </div>
                  </div>
                )}
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

export default Users;
