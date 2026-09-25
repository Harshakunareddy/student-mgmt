import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Departments from './pages/admin/Departments';
import Classes from './pages/admin/Classes';
import Sections from './pages/admin/Sections';
import Subjects from './pages/admin/Subjects';
import Users from './pages/admin/Users';
import FacultySubjects from './pages/admin/FacultySubjects';
import Reports from './pages/admin/Reports';
import FacultyDashboard from './pages/faculty/Dashboard';
import MarkAttendance from './pages/faculty/MarkAttendance';
import AttendanceHistory from './pages/faculty/AttendanceHistory';
import LowAttendance from './pages/faculty/LowAttendance';
import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';
import './styles/global.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/forms.css';
import './styles/tables.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="departments" element={<Departments />} />
            <Route path="classes" element={<Classes />} />
            <Route path="sections" element={<Sections />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="users" element={<Users />} />
            <Route path="faculty-subjects" element={<FacultySubjects />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="/faculty" element={<ProtectedRoute roles={['faculty']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="mark-attendance" element={<MarkAttendance />} />
            <Route path="attendance-history" element={<AttendanceHistory />} />
            <Route path="low-attendance" element={<LowAttendance />} />
          </Route>

          <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
