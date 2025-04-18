import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Hero from './components/Hero';
import Login from './components/Login';
import Signup from './components/Signup';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import TeachersList from './components/TeachersList';

// Role-based protected route component
const ProtectedRoute = ({ element, allowedRole }) => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return <Navigate to="/login" />;
    }

    const user = JSON.parse(userStr);
    
    if (!user || !user.role) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" />;
    }
    
    if (allowedRole && user.role !== allowedRole) {
      return <Navigate to={user.role === 'teacher' ? '/dashboard/teacher' : '/teachers'} />;
    }

    return element;
  } catch (error) {
    console.error('Protected route error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard/teacher" 
          element={<ProtectedRoute element={<TeacherDashboard />} allowedRole="teacher" />} 
        />
        <Route 
          path="/teachers" 
          element={<ProtectedRoute element={<TeachersList />} allowedRole="student" />} 
        />
        <Route 
          path="/dashboard/student" 
          element={<ProtectedRoute element={<StudentDashboard />} allowedRole="student" />} 
        />
        
        {/* Redirect unmatched routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;