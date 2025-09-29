import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import Services from './components/Services';
import Contacts from './components/Contacts';
import Support from './components/Support';
import AdminPanel from './components/AdminPanel';
import ManagerPanel from './components/ManagerPanel';
import PersonalCabinet from './components/PersonalCabinet';
import Auth from './components/Auth';
import ServiceRequest from './components/ServiceRequest';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    const role = localStorage.getItem('userRole');
    
    if (token && userData && role) {
      setCurrentUser(JSON.parse(userData));
      setUserRole(role);
    }
  }, []);

  const handleLogin = (user, role) => {
    setCurrentUser(user);
    setUserRole(role);
    localStorage.setItem('userToken', user.token);
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    setUserRole(null);
    
    fetch('http://localhost:5000/api/logout', {
      method: 'POST',
      headers: {
        'Authorization': localStorage.getItem('userToken') || ''
      }
    });
  };

  return (
    <Router>
      <div className="app-container">
        <Header 
          currentUser={currentUser} 
          userRole={userRole} 
          onLogout={handleLogout} 
        />
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/support" element={<Support />} />
            <Route path="/service-request" element={<ServiceRequest />} />
            <Route 
              path="/admin" 
              element={
                userRole === 'admin' ? (
                  <AdminPanel />
                ) : (
                  <Auth onLogin={handleLogin} requiredRole="admin" />
                )
              } 
            />
            <Route 
              path="/manager" 
              element={
                userRole === 'manager' ? (
                  <ManagerPanel />
                ) : (
                  <Auth onLogin={handleLogin} requiredRole="manager" />
                )
              } 
            />
            <Route 
              path="/cabinet" 
              element={
                currentUser ? (
                  <PersonalCabinet user={currentUser} onLogout={handleLogout} />
                ) : (
                  <Auth onLogin={handleLogin} />
                )
              } 
            />
            <Route 
              path="/auth" 
              element={<Auth onLogin={handleLogin} />} 
            />
          </Routes>
        </div>

        <footer className="app-footer">
          <div className="footer-content">
            <p>&copy; 2025 ООО "Белфорт". Все права защищены.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;