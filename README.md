# EduMerge - Smart Attendance Management System

## Overview
A full-stack attendance management solution for educational institutions with ~5,000 students
and ~200 faculty members across multiple departments, classes, sections, and subjects.

## Tech Stack
- **Frontend**: React.js (JavaScript), React Router, Axios, CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Auth**: JWT-based authentication with role-based access control

## Architecture

### Data Model
- **Users** — Admin, Faculty, Student roles with department linkage
- **Departments** — Institution departments (CSE, ECE, ME, CE, etc.)
- **Classes** — Year/semester-wise classes under departments
- **Sections** — Divisions within classes (Section A, B, etc.)
- **Subjects** — Course subjects mapped to departments
- **Students** — Student profiles linked to users and sections
- **FacultySubjects** — Faculty-Subject-Section assignment mapping
- **Attendance** — Per-student, per-subject, per-date attendance records

### User Roles & Permissions
| Role    | Capabilities                                                            |
|---------|-------------------------------------------------------------------------|
| Admin   | Full CRUD on all entities, view reports, manage faculty-subject mapping  |
| Faculty | Mark attendance, view/correct history, identify low attendance students  |
| Student | View own attendance dashboard, subject-wise breakdown, filter by date    |

### Key Features
1. **Attendance Recording** — Faculty marks attendance per subject/section/date with Present/Absent/Late
2. **Bulk Operations** — Mark all students at once, then adjust individually
3. **Corrections** — Faculty can correct past attendance with remarks
4. **History** — Filterable attendance history by subject, section, date range
5. **Low Attendance Alerts** — Configurable threshold (default 75%) to identify at-risk students
6. **Reports** — Admin can view institution-wide attendance reports with filters
7. **Duplicate Prevention** — Cannot mark attendance twice for same subject/section/date

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MySQL Server running locally

### 1. Create MySQL Database
```sql
CREATE DATABASE edumerge_attendance;
```

### 2. Configure Environment
Edit `server/.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=edumerge_attendance
```

### 3. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 4. Seed Database
```bash
cd server && npm run seed
```

### 5. Run Application
Terminal 1 (Backend):
```bash
cd server && npm run dev
```
Terminal 2 (Frontend):
```bash
cd client && npm start
```

### Demo Credentials
| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Admin   | admin@edumerge.com       | password123 |
| Faculty | faculty1@edumerge.com    | password123 |
| Student | student1@edumerge.com    | password123 |

## Assumptions & Trade-offs
1. Password hashing uses bcrypt with salt rounds of 10
2. JWT tokens expire after 24 hours
3. Sequelize `alter: true` for schema sync in development

## Validation & Edge Cases
- Duplicate attendance prevention (same subject/section/date)
- Faculty authorization check before marking
- Password hashing for all user accounts
- JWT token validation on every protected route
- Role-based route protection on both frontend and backend
- Graceful error handling with user-friendly messages

## Project Structure
```
edumerge/
├── server/
│   ├── config/database.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js, Department.js, Class.js
│   │   ├── Section.js, Subject.js, Student.js
│   │   ├── FacultySubject.js, Attendance.js
│   │   └── index.js (associations)
│   ├── routes/
│   │   ├── auth.js, admin.js
│   │   ├── faculty.js, student.js
│   ├── index.js, seed.js
│   └── .env
└── client/
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.js
        ├── components/
        ├── pages/admin/, faculty/, student/
        └── styles/
```
