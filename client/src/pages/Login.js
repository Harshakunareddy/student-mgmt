import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'faculty') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@edumerge.com', password: 'password123' },
      faculty: { email: 'faculty1@edumerge.com', password: 'password123' },
      student: { email: 'student1@edumerge.com', password: 'password123' }
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🎓</div>
          <h1>EduMerge</h1>
          <p>Smart Attendance Management</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{color: 'white'}}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label style={{color: 'white'}}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-demo">
          <p>Quick Demo Access</p>
          <div className="demo-credentials">
            <button className="demo-btn" onClick={() => fillDemo('admin')}>
              <span>Admin</span> — admin@edumerge.com
            </button>
            <button className="demo-btn" onClick={() => fillDemo('faculty')}>
              <span>Faculty</span> — faculty1@edumerge.com
            </button>
            <button className="demo-btn" onClick={() => fillDemo('student')}>
              <span>Student</span> — student1@edumerge.com
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
