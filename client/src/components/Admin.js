import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin({ isAuthenticated, onLogin, onLogout }) {
  const [password, setPassword] = useState('');
  const [submittedMessages, setSubmittedMessages] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [report, setReport] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRequests() {
      try {
        console.log('Загрузка данных...');
        const response = await fetch('http://localhost:5000/api/requests');
        if (response.ok) {
          const data = await response.json();
          setSubmittedMessages(data);
        }
        
        const serviceResponse = await fetch('http://localhost:5000/api/service-requests');
        if (serviceResponse.ok) {
          const serviceData = await serviceResponse.json();
          
          const activeRequests = serviceData.filter(req => req.status !== 'Выполнена');
          const completed = serviceData.filter(req => req.status === 'Выполнена');
          setServiceRequests(activeRequests);
          setCompletedRequests(completed);
          console.log('Активные заявки:', activeRequests);
          console.log('Завершенные заявки:', completed);
        }

        
        generateReport();
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    }
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated]);

  const generateReport = () => {
    const serviceTypeStats = {};
    const statusStats = {
      'Новая': 0,
      'В работе': 0,
      'Выполнена': 0
    };

    serviceRequests.forEach(req => {

      if (serviceTypeStats[req.serviceType]) {
        serviceTypeStats[req.serviceType]++;
      } else {
        serviceTypeStats[req.serviceType] = 1;
      }


      statusStats[req.status]++;
    });

    completedRequests.forEach(req => {
      statusStats['Выполнена']++;
      if (serviceTypeStats[req.serviceType]) {
        serviceTypeStats[req.serviceType]++;
      } else {
        serviceTypeStats[req.serviceType] = 1;
      }
    });

    const reportData = {
      serviceTypeStats,
      statusStats,
      totalRequests: serviceRequests.length + completedRequests.length,
      activeRequests: serviceRequests.length,
      completedRequests: completedRequests.length,
      generatedAt: new Date().toLocaleString()
    };

    setReport(reportData);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (onLogin && typeof onLogin === 'function') {
      onLogin(password);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isAuthenticated) {
      handleLogin(e);
    }
  };

  const handleRequestClick = (id) => {
    navigate(`/request/${id}`);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/service-requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        alert('Статус обновлён');
        
        const serviceResponse = await fetch('http://localhost:5000/api/service-requests');
        if (serviceResponse.ok) {
          const serviceData = await serviceResponse.json();
          const activeRequests = serviceData.filter(req => req.status !== 'Выполнена');
          const completed = serviceData.filter(req => req.status === 'Выполнена');
          setServiceRequests(activeRequests);
          setCompletedRequests(completed);
          generateReport();
        }
      }
    } catch (err) {
      console.error('Ошибка обновления статуса:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту заявку?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/service-requests/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (response.ok) {
          setServiceRequests(serviceRequests.filter((req) => req.id !== id));
          setCompletedRequests(completedRequests.filter((req) => req.id !== id));
          generateReport();
          alert(data.message || 'Заявка удалена');
        } else {
          alert(data.error || 'Ошибка удаления');
        }
      } catch (err) {
        console.error('Ошибка удаления заявки:', err);
        alert('Произошла ошибка при удалении');
      }
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const reportText = `
ОТЧЕТ ПО СЕРВИСНЫМ ЗАЯВКАМ
Сгенерирован: ${report.generatedAt}

ОБЩАЯ СТАТИСТИКА:
- Всего заявок: ${report.totalRequests}
- Активных заявок: ${report.activeRequests}
- Завершенных заявок: ${report.completedRequests}

СТАТИСТИКА ПО СТАТУСАМ:
- Новые: ${report.statusStats['Новая']}
- В работе: ${report.statusStats['В работе']}
- Выполненные: ${report.statusStats['Выполнена']}

СТАТИСТИКА ПО ТИПАМ УСЛУГ:
${Object.entries(report.serviceTypeStats).map(([type, count]) => `- ${type}: ${count} заявок`).join('\n')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `отчет_заявки_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="content-section">
        <h1>Вход в админ-панель</h1>
        <form onSubmit={handleLogin} className="support-form">
          <div className="form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button type="submit">Войти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="content-section admin-panel">
      <h1>Админ-панель</h1>
      
      {/* Единый отчет с кнопкой скачивания */}
      <div className="report-section">
        <h2>Сводный отчет</h2>
        {report ? (
          <div className="report-content">
            <div className="report-stats">
              <h3>Общая статистика:</h3>
              <p><strong>Всего заявок:</strong> {report.totalRequests}</p>
              <p><strong>Активных заявок:</strong> {report.activeRequests}</p>
              <p><strong>Завершенных заявок:</strong> {report.completedRequests}</p>
              
              <h3>Статистика по статусам:</h3>
              <p><strong>Новые:</strong> {report.statusStats['Новая']}</p>
              <p><strong>В работе:</strong> {report.statusStats['В работе']}</p>
              <p><strong>Выполненные:</strong> {report.statusStats['Выполнена']}</p>
              
              <h3>Статистика по типам услуг:</h3>
              {Object.entries(report.serviceTypeStats).map(([type, count]) => (
                <p key={type}><strong>{type}:</strong> {count} заявок</p>
              ))}
            </div>
            <button onClick={downloadReport} className="download-button">
              Скачать отчет
            </button>
          </div>
        ) : (
          <p>Нет данных для отчета</p>
        )}
      </div>

      <div className="admin-split">
        <div className="admin-section">
          <h2>Запросы техподдержки</h2>
          {!submittedMessages.length && <p>Нет новых запросов.</p>}
          {submittedMessages.length > 0 && (
            <ul className="request-list">
              {submittedMessages.map((req) => (
                <li key={req.id} className="request-item">
                  <div className="request-details">
                    <strong>{req.name}</strong> ({req.email})
                  </div>
                  <div className="request-content">{req.message}</div>
                  <div className="request-meta">
                    <small>Отправлено: {req.timestamp}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-section">
          <h2>Активные заявки на услуги</h2>
          {!serviceRequests.length && <p>Нет активных заявок.</p>}
          {serviceRequests.length > 0 && (
            <ul className="request-list">
              {serviceRequests.map((req) => (
                <li key={req.id} className="request-item">
                  <div className="request-details">
                    <strong>{req.name}</strong> ({req.email})
                  </div>
                  <div className="request-content">
                    <strong>Услуга:</strong> {req.specificService}
                  </div>
                  <div className="request-content">
                    <strong>Комментарий:</strong> {req.comment || 'Нет комментария'}
                  </div>
                  <div className="request-meta">
                    <small>Статус: {req.status}</small>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="status-select"
                    >
                      <option value="">Изменить статус</option>
                      <option value="В работе">В работу</option>
                      <option value="Выполнена">Завершить</option>
                    </select>
                    <button 
                      onClick={() => updateStatus(req.id, selectedStatus)} 
                      className="update-button"
                      disabled={!selectedStatus}
                    >
                      Обновить
                    </button>
                  </div>
                  <div className="request-action">
                    <button onClick={() => handleRequestClick(req.id)} className="details-button">
                      Подробнее
                    </button>
                    <button onClick={() => handleDelete(req.id)} className="delete-button">
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Список завершенных заявок */}
      <div className="admin-section completed-section">
        <h2>Завершенные заявки</h2>
        {!completedRequests.length && <p>Нет завершенных заявок.</p>}
        {completedRequests.length > 0 && (
          <ul className="request-list">
            {completedRequests.map((req) => (
              <li key={req.id} className="request-item completed">
                <div className="request-details">
                  <strong>{req.name}</strong> ({req.email})
                </div>
                <div className="request-content">
                  <strong>Услуга:</strong> {req.specificService}
                </div>
                <div className="request-content">
                  <strong>Комментарий:</strong> {req.comment || 'Нет комментария'}
                </div>
                <div className="request-meta">
                  <small>Статус: {req.status}</small>
                </div>
                <div className="request-action">
                  <button onClick={() => handleRequestClick(req.id)} className="details-button">
                    Подробнее
                  </button>
                  <button onClick={() => handleDelete(req.id)} className="delete-button">
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={onLogout} className="logout-button">
        Выйти
      </button>
    </div>
  );
}

export default Admin;