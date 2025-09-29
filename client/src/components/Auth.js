import React, { useState } from 'react';

function Auth({ onLogin, requiredRole }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    role: requiredRole || 'user'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let tempErrors = {};
    
    if (!isLogin && !formData.name) {
      tempErrors.name = 'Имя обязательно';
    }
    
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Введите корректный email';
    }
    
    if (!formData.password || formData.password.length < 6) {
      tempErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    return tempErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      
      try {
        const endpoint = isLogin ? '/api/login' : '/api/register';
        const response = await fetch(`http://localhost:5000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          const userRole = data.user.role || 'user';
          
          
          if (requiredRole && userRole !== requiredRole) {
            setErrors({ submit: `Недостаточно прав. Требуется роль: ${requiredRole}` });
            return;
          }
          
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userData', JSON.stringify(data.user));
          localStorage.setItem('userRole', userRole);
          onLogin(data.user, userRole);
        } else {
          setErrors({ submit: data.error });
        }
      } catch (err) {
        setErrors({ submit: 'Ошибка соединения' });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      company: '',
      role: requiredRole || 'user'
    });
  };

  const getAuthTitle = () => {
    if (requiredRole === 'admin') return 'Вход для администратора';
    if (requiredRole === 'manager') return 'Вход для менеджера';
    return isLogin ? 'Вход в личный кабинет' : 'Регистрация';
  };

  return (
    <div className="content-section fade-in">
      <h1>{getAuthTitle()}</h1>
      
      {requiredRole && (
        <div style={{ 
          background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)', 
          padding: '1rem', 
          borderRadius: 'var(--radius)', 
          marginBottom: '1.5rem',
          border: '1px solid #ffd43b'
        }}>
          <strong>Доступ ограничен:</strong> Требуется роль <span className="badge badge-warning">{requiredRole}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <div className="form-group">
            <label className="form-label">Имя:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-control ${errors.name ? 'error' : ''}`}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${errors.password ? 'error' : ''}`}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Телефон (необязательно):</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Компания (необязательно):</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </>
          )}
          
          {errors.submit && <div className="error-text submit-error">{errors.submit}</div>}
          
          <button type="submit" disabled={isLoading} className="btn btn-primary auth-submit-btn">
            {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>
        
        {!requiredRole && (
          <div className="auth-switch">
            <p>
              {isLogin ? 'Ещё нет аккаунта?' : 'Уже есть аккаунт?'}
              <button type="button" onClick={switchMode} className="switch-btn">
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </p>
          </div>
        )}
      </div>
    );
  }
  
  export default Auth;