import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ currentUser, userRole, onLogout }) => {
  const location = useLocation();

  const getRoleBadge = () => {
    const roleColors = {
      'admin': 'badge-danger',
      'manager': 'badge-warning',
      'user': 'badge-primary'
    };
    
    const roleLabels = {
      'admin': 'Администратор',
      'manager': 'Менеджер',
      'user': 'Клиент'
    };

    return (
      <span className={`badge ${roleColors[userRole] || 'badge-primary'}`}>
        {roleLabels[userRole] || 'Пользователь'}
      </span>
    );
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🚀</span>
          Белфорт
        </Link>

        <nav className="nav-menu">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Главная
          </Link>
          <Link 
            to="/services" 
            className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
          >
            Услуги
          </Link>
          <Link 
            to="/contacts" 
            className={`nav-link ${location.pathname === '/contacts' ? 'active' : ''}`}
          >
            Контакты
          </Link>
          <Link 
            to="/support" 
            className={`nav-link ${location.pathname === '/support' ? 'active' : ''}`}
          >
            Поддержка
          </Link>

          {userRole === 'admin' && (
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Админ-панель
            </Link>
          )}

          {userRole === 'manager' && (
            <Link 
              to="/manager" 
              className={`nav-link ${location.pathname === '/manager' ? 'active' : ''}`}
            >
              Панель менеджера
            </Link>
          )}
        </nav>

        <div className="user-menu">
          {currentUser ? (
            <>
              <div className="user-info">
                <span>{currentUser.name}</span>
                {getRoleBadge()}
              </div>
              <Link to="/cabinet" className="btn btn-secondary">
                Кабинет
              </Link>
              <button onClick={onLogout} className="logout-btn">
                Выйти
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-primary">
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;