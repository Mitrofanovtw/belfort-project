import React, { useState, useEffect } from 'react';

function AdminPanel() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      
      const requestsResponse = await fetch('http://localhost:5000/api/service-requests', {
        headers: { 'Authorization': token }
      });
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        const activeRequests = requestsData.filter(req => req.status !== 'Выполнена');
        const completed = requestsData.filter(req => req.status === 'Выполнена');
        setServiceRequests(activeRequests);
        setCompletedRequests(completed);
      }

      
      const supportResponse = await fetch('http://localhost:5000/api/requests', {
        headers: { 'Authorization': token }
      });
      
      if (supportResponse.ok) {
        const supportData = await supportResponse.json();
        setSupportRequests(supportData);
      }

      
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': token }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': token }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setSystemStats(statsData);
      }

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };


  const calculateStats = () => {
    const totalServiceRequests = serviceRequests.length + completedRequests.length;
    const totalSupportRequests = supportRequests.length;
    const totalAllRequests = totalServiceRequests + totalSupportRequests;
    
    return {
      totalAllRequests,
      totalServiceRequests,
      totalSupportRequests,
      activeServiceRequests: serviceRequests.length,
      completedServiceRequests: completedRequests.length,
      usersCount: users.length
    };
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/api/service-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        alert('Статус обновлён');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
    }
  };

  const deleteRequest = async (id, type = 'service') => {
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      try {
        const token = localStorage.getItem('userToken');
        const endpoint = type === 'service' ? 'service-requests' : 'requests';
        const response = await fetch(`http://localhost:5000/api/${endpoint}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': token }
        });
        
        if (response.ok) {
          alert('Заявка удалена');
          fetchAdminData();
        }
      } catch (err) {
        console.error('Ошибка удаления заявки:', err);
      }
    }
  };

  const generateReport = () => {
    const stats = calculateStats();
    const reportData = {
      ...stats,
      generatedAt: new Date().toLocaleString('ru-RU')
    };

    const reportText = `
ОТЧЕТ СИСТЕМЫ БЕЛФОРТ
Сгенерирован: ${reportData.generatedAt}

СТАТИСТИКА СИСТЕМЫ:
- Всего заявок: ${reportData.totalAllRequests}
- Заявок на услуги: ${reportData.totalServiceRequests}
- Заявок в поддержку: ${reportData.totalSupportRequests}
- Активных заявок: ${reportData.activeServiceRequests}
- Завершенных заявок: ${reportData.completedServiceRequests}
- Зарегистрированных пользователей: ${reportData.usersCount}

СТАТИСТИКА ПО СТАТУСАМ:
- Новые: ${serviceRequests.filter(req => req.status === 'Новая').length}
- В работе: ${serviceRequests.filter(req => req.status === 'В работе').length}
- Выполненные: ${reportData.completedServiceRequests}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `системный_отчет_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Новая': 'badge-primary',
      'В работе': 'badge-warning',
      'Выполнена': 'badge-success'
    };
    
    return <span className={`badge ${statusColors[status] || 'badge-primary'}`}>{status}</span>;
  };

  const stats = calculateStats();

  return (
    <div className="content-section fade-in">
      <div className="admin-dashboard">
        <h1>Панель администратора</h1>
        <p>Управление системой и полный контроль над данными</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalAllRequests}</div>
          <div className="stat-label">Всего заявок</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalServiceRequests}</div>
          <div className="stat-label">Заявок на услуги</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalSupportRequests}</div>
          <div className="stat-label">Заявок поддержки</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.usersCount}</div>
          <div className="stat-label">Пользователей</div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Заявки на услуги
        </button>
        <button 
          className={`tab ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          Заявки поддержки
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
        <button 
          className={`tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          Система
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="card">
          <div className="content-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>Управление заявками на услуги</h3>
              <button className="btn btn-primary" onClick={generateReport}>
                📊 Скачать отчет
              </button>
            </div>

            <h4>Активные заявки ({serviceRequests.length})</h4>
            {serviceRequests.length === 0 ? (
              <p>Нет активных заявок</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Клиент</th>
                      <th>Услуга</th>
                      <th>Статус</th>
                      <th>Дата</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.map(request => (
                      <tr key={request.id}>
                        <td>
                          <strong>{request.name}</strong>
                          <div><small>{request.email}</small></div>
                        </td>
                        <td>{request.specificService}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{new Date(request.timestamp).toLocaleDateString('ru-RU')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <select 
                              className="form-control"
                              style={{ width: '120px' }}
                              onChange={(e) => updateStatus(request.id, e.target.value)}
                              value={request.status}
                            >
                              <option value="Новая">Новая</option>
                              <option value="В работе">В работе</option>
                              <option value="Выполнена">Выполнена</option>
                            </select>
                            <button 
                              className="btn btn-danger"
                              onClick={() => deleteRequest(request.id, 'service')}
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h4 style={{ marginTop: '2rem' }}>Завершенные заявки ({completedRequests.length})</h4>
            {completedRequests.length === 0 ? (
              <p>Нет завершенных заявок</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Клиент</th>
                      <th>Услуга</th>
                      <th>Дата завершения</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedRequests.map(request => (
                      <tr key={request.id}>
                        <td>
                          <strong>{request.name}</strong>
                          <div><small>{request.email}</small></div>
                        </td>
                        <td>{request.specificService}</td>
                        <td>{new Date(request.timestamp).toLocaleDateString('ru-RU')}</td>
                        <td>
                          <button 
                            className="btn btn-danger"
                            onClick={() => deleteRequest(request.id, 'service')}
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="card">
          <div className="content-section">
            <h3>Заявки в поддержку ({supportRequests.length})</h3>
            {supportRequests.length === 0 ? (
              <p>Нет заявок в поддержку</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Клиент</th>
                      <th>Email</th>
                      <th>Сообщение</th>
                      <th>Дата</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportRequests.map(request => (
                      <tr key={request.id}>
                        <td><strong>{request.name}</strong></td>
                        <td>{request.email}</td>
                        <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                          {request.message}
                        </td>
                        <td>{new Date(request.timestamp).toLocaleDateString('ru-RU')}</td>
                        <td>
                          <button 
                            className="btn btn-danger"
                            onClick={() => deleteRequest(request.id, 'support')}
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="content-section">
            <h3>Управление пользователями ({users.length})</h3>
            {users.length === 0 ? (
              <p>Нет зарегистрированных пользователей</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Имя</th>
                      <th>Email</th>
                      <th>Роль</th>
                      <th>Дата регистрации</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${
                            user.role === 'admin' ? 'badge-danger' : 
                            user.role === 'manager' ? 'badge-warning' : 'badge-primary'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString('ru-RU')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary">
                              Редактировать
                            </button>
                            <button className="btn btn-danger">
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="card">
          <div className="content-section">
            <h3>Системные настройки</h3>
            <div className="system-controls">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <h4>Резервное копирование</h4>
                  <button className="btn btn-primary" style={{ width: '100%' }}>
                    Создать резервную копию
                  </button>
                </div>
                
                <div>
                  <h4>Очистка данных</h4>
                  <button className="btn btn-warning" style={{ width: '100%' }}>
                    Очистить старые заявки
                  </button>
                </div>
                
                <div>
                  <h4>Системные логи</h4>
                  <button className="btn btn-secondary" style={{ width: '100%' }}>
                    Просмотреть логи
                  </button>
                </div>
                
                <div>
                  <h4>Настройки уведомлений</h4>
                  <button className="btn btn-primary" style={{ width: '100%' }}>
                    Настроить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;