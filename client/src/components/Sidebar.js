import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/departments', icon: '🏛️', label: 'Departments' },
    { to: '/admin/classes', icon: '📚', label: 'Classes' },
    { to: '/admin/sections', icon: '📋', label: 'Sections' },
    { to: '/admin/subjects', icon: '📖', label: 'Subjects' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/faculty-subjects', icon: '🔗', label: 'Assignments' },
    { to: '/admin/reports', icon: '📈', label: 'Reports' }
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/faculty/mark-attendance', icon: '✅', label: 'Mark Attendance' },
    { to: '/faculty/attendance-history', icon: '📅', label: 'History' },
    { to: '/faculty/low-attendance', icon: '⚠️', label: 'Low Attendance' }
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/student/attendance', icon: '📅', label: 'My Attendance' }
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'faculty' ? facultyLinks : studentLinks;
  const sectionTitle = user?.role === 'admin' ? 'Administration' : user?.role === 'faculty' ? 'Faculty Panel' : 'Student Panel';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">🎓</div>
          <div>
            <h2>EduMerge</h2>
            <span>Attendance System</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">{sectionTitle}</div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
