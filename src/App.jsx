import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/auth/Login';
import Students from './pages/superadmin/Students';
import Dashboard from './pages/superadmin/Dashboard';
import Staff from './pages/superadmin/Staff';
import Finance from './pages/superadmin/Finance';
import Payments from './pages/superadmin/Payments';
import Expenses from './pages/superadmin/Expenses';
import Attendance from './pages/superadmin/Attendance';
import Courses from './pages/superadmin/Courses';
import Schedule from './pages/superadmin/Schedule';
import StaffDashboard from './pages/staff/Dashboard';
import MarksEntry from './pages/staff/Marks';
import StudentDashboard from './pages/student/Dashboard';
import MySubjects from './pages/staff/Subjects';
import StudentMarks from './pages/student/Marks';
import StudentAttendance from './pages/student/Attendance';
import Profile from './pages/Profile';
import StaffSalary from './pages/staff/Salary';

// Placeholder Dashboards
const DashPlaceholder = ({ role }) => (
  <div className="card">
    <h2 className="text-2xl font-bold mb-4 capitalize">{role} Dashboard</h2>
    <p className="text-gray-600">Welcome to the school management system. Content for {role} role will appear here.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Super Admin Routes */}
          <Route element={<PrivateRoute roles={['superadmin']} />}>
            <Route element={<Layout />}>
              <Route path="/superadmin/dashboard" element={<Dashboard />} />
              <Route path="/superadmin/students" element={<Students />} />
              <Route path="/superadmin/staff" element={<Staff />} />
              <Route path="/superadmin/attendance" element={<Attendance />} />
              <Route path="/superadmin/courses" element={<Courses />} />
              <Route path="/superadmin/schedule" element={<Schedule />} />
              <Route path="/superadmin/payments" element={<Payments />} />
              <Route path="/superadmin/expenses" element={<Expenses />} />
              <Route path="/superadmin/finance" element={<Finance />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<PrivateRoute roles={['admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/staff" element={<Staff />} />
              <Route path="/admin/attendance" element={<Attendance />} />
              <Route path="/admin/courses" element={<Courses />} />
              <Route path="/admin/schedule" element={<Schedule />} />
              <Route path="/admin/profile" element={<Profile />} />
              <Route path="/admin/payments" element={<Payments />} />
            </Route>
          </Route>

          {/* Staff Routes */}
          <Route element={<PrivateRoute roles={['staff']} />}>
            <Route element={<Layout />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/subjects" element={<MySubjects />} />
              <Route path="/staff/attendance" element={<Attendance />} />
              <Route path="/staff/marks" element={<MarksEntry />} />
              <Route path="/staff/schedule" element={<Schedule />} />
              <Route path="/staff/salary" element={<StaffSalary />} />
              <Route path="/staff/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<PrivateRoute roles={['student']} />}>
            <Route element={<Layout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/marks" element={<StudentMarks />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="bottom-right" theme="colored" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
