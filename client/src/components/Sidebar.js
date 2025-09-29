import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar, isAuthenticated }) => {
  const location = useLocation();

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={toggleSidebar}>
        ×
      </button>
      <nav className="sidebar-nav">
        <Link
          to="/"
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          onClick={toggleSidebar}
        >
          Главная
        </Link>
        <Link
          to="/services"
          className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
          onClick={toggleSidebar}
        >
          Услуги
        </Link>
        <Link
          to="/contacts"
          className={`nav-link ${location.pathname === '/contacts' ? 'active' : ''}`}
          onClick={toggleSidebar}
        >
          Контакты
        </Link>
        {isAuthenticated ? (
          <Link
            to="/cabinet"
            className={`nav-link ${location.pathname === '/cabinet' ? 'active' : ''}`}
            onClick={toggleSidebar}
          >
            Личный кабинет
          </Link>
        ) : (
          <Link
            to="/auth"
            className={`nav-link ${location.pathname === '/auth' ? 'active' : ''}`}
            onClick={toggleSidebar}
          >
            Войти
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;