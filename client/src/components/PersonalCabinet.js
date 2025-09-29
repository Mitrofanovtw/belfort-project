import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function PersonalCabinet({ user, onLogout }) {
  const [userRequests, setUserRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [userInfo, setUserInfo] = useState(user);

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/my-requests', {
        headers: {
          'Authorization': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserRequests(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Новая': 'status-new',
      'В работе': 'status-in-progress',
      'Выполнена': 'status-completed'
    };
    
    return <span className={`status-badge ${statusColors[status] || ''}`}>{status}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="content-section">
      <div className="cabinet-header">
        <h1>Личный кабинет</h1>
        <button onClick={onLogout} className="logout-btn">Выйти</button>
      </div>

      <div className="user-welcome">
        <h2>Добро пожаловать, {userInfo.name}!</h2>
        <p>Здесь вы можете отслеживать статус ваших заявок и управлять контактной информацией</p>
      </div>

      <div className="cabinet-tabs">
        <button 
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Мои заявки
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Профиль
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="requests-tab">
          <h3>История заявок</h3>
          {userRequests.length === 0 ? (
            <div className="no-requests">
              <p>У вас пока нет заявок</p>
              <Link to="/service-request" className="create-request-btn">
                Создать первую заявку
              </Link>
            </div>
          ) : (
            <div className="requests-list">
              {userRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h4>{request.specificService}</h4>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="request-details">
                    <p><strong>Тип услуги:</strong> {request.serviceType}</p>
                    <p><strong>Комментарий:</strong> {request.comment || 'Не указан'}</p>
                    <p><strong>Дата подачи:</strong> {formatDate(request.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="profile-tab">
          <h3>Информация профиля</h3>
          <div className="profile-info">
            <div className="profile-field">
              <label>Имя:</label>
              <span>{userInfo.name}</span>
            </div>
            <div className="profile-field">
              <label>Email:</label>
              <span>{userInfo.email}</span>
            </div>
            <div className="profile-field">
              <label>Телефон:</label>
              <span>{userInfo.phone || 'Не указан'}</span>
            </div>
            <div className="profile-field">
              <label>Компания:</label>
              <span>{userInfo.company || 'Не указана'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonalCabinet;