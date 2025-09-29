import React, { useState, useEffect } from 'react';

function ManagerPanel() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [commercialProposals, setCommercialProposals] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [consultationForm, setConsultationForm] = useState({
    requestId: '',
    notes: '',
    followUpDate: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      const token = localStorage.getItem('userToken');
      
      
      const requestsResponse = await fetch('http://localhost:5000/api/service-requests?status=Новая', {
        headers: { 'Authorization': token }
      });
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setServiceRequests(requestsData);
      }

      
      const consultationsResponse = await fetch('http://localhost:5000/api/manager/consultations', {
        headers: { 'Authorization': token }
      });
      
      if (consultationsResponse.ok) {
        const consultationsData = await consultationsResponse.json();
        setConsultations(consultationsData);
      }

    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };

  const handleConsultation = async (requestId) => {
    const request = serviceRequests.find(req => req.id === requestId);
    setSelectedRequest(request);
    setConsultationForm({
      ...consultationForm,
      requestId: requestId
    });
    setActiveTab('consultation');
  };

  const submitConsultation = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/manager/consultations', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...consultationForm,
          requestId: selectedRequest.id,
          clientEmail: selectedRequest.email
        })
      });

      if (response.ok) {
        alert('Консультация запланирована');
        setConsultationForm({
          requestId: '',
          notes: '',
          followUpDate: '',
          priority: 'medium'
        });
        setSelectedRequest(null);
        setActiveTab('dashboard');
        fetchManagerData();
      }
    } catch (err) {
      console.error('Ошибка создания консультации:', err);
    }
  };

  const createCommercialProposal = (requestId) => {
    const request = serviceRequests.find(req => req.id === requestId);
    const proposal = {
      id: Date.now(),
      requestId: requestId,
      clientName: request.name,
      service: request.specificService,
      amount: calculateProposalAmount(request.specificService),
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    setCommercialProposals([...commercialProposals, proposal]);
    setActiveTab('proposals');
  };

  const calculateProposalAmount = (service) => {
    const prices = {
      'Веб-разработка': 50000,
      'Мобильная разработка': 80000,
      'Desktop-приложения': 60000,
      'Аудит IT-инфраструктуры': 30000,
      'Внедрение CRM-систем': 40000
    };
    
    return prices[service] || 25000;
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      'high': { label: 'Высокий', class: 'badge-danger' },
      'medium': { label: 'Средний', class: 'badge-warning' },
      'low': { label: 'Низкий', class: 'badge-success' }
    };
    
    const priorityInfo = priorities[priority] || priorities.medium;
    return <span className={`badge ${priorityInfo.class}`}>{priorityInfo.label}</span>;
  };

  return (
    <div className="content-section fade-in">
      <div className="manager-dashboard">
        <h1>Панель менеджера</h1>
        <p>Управление клиентскими заявками и коммерческими предложениями</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-number">{serviceRequests.length}</div>
          <div className="stat-label">Новых заявок</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{consultations.length}</div>
          <div className="stat-label">Консультаций</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{commercialProposals.length}</div>
          <div className="stat-label">Коммерческих предложений</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {commercialProposals.filter(p => p.status === 'sent').length}
          </div>
          <div className="stat-label">Отправлено предложений</div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Новые заявки
        </button>
        <button 
          className={`tab ${activeTab === 'consultation' ? 'active' : ''}`}
          onClick={() => setActiveTab('consultation')}
        >
          Консультации
        </button>
        <button 
          className={`tab ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          Коммерческие предложения
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="card">
          <div className="content-section">
            <h3>Новые заявки для обработки</h3>
            {serviceRequests.length === 0 ? (
              <p>Нет новых заявок для обработки</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Клиент</th>
                      <th>Услуга</th>
                      <th>Контакты</th>
                      <th>Дата</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.map(request => (
                      <tr key={request.id}>
                        <td>
                          <strong>{request.name}</strong>
                          {request.company && <div><small>{request.company}</small></div>}
                        </td>
                        <td>{request.specificService}</td>
                        <td>
                          <div>{request.email}</div>
                          {request.phone && <div><small>{request.phone}</small></div>}
                        </td>
                        <td>{new Date(request.timestamp).toLocaleDateString('ru-RU')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleConsultation(request.id)}
                            >
                              Консультация
                            </button>
                            <button 
                              className="btn btn-success"
                              onClick={() => createCommercialProposal(request.id)}
                            >
                              КП
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

      {activeTab === 'consultation' && selectedRequest && (
        <div className="card">
          <div className="content-section">
            <h3>Запланировать консультацию</h3>
            <div className="consultation-form">
              <div className="form-group">
                <label className="form-label">Клиент</label>
                <div>
                  <strong>{selectedRequest.name}</strong> ({selectedRequest.email})
                  {selectedRequest.company && <div>Компания: {selectedRequest.company}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Услуга</label>
                <div>{selectedRequest.specificService}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Приоритет</label>
                <select 
                  className="form-control"
                  value={consultationForm.priority}
                  onChange={(e) => setConsultationForm({...consultationForm, priority: e.target.value})}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Дата консультации</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={consultationForm.followUpDate}
                  onChange={(e) => setConsultationForm({...consultationForm, followUpDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Заметки</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={consultationForm.notes}
                  onChange={(e) => setConsultationForm({...consultationForm, notes: e.target.value})}
                  placeholder="Дополнительная информация о клиенте или услуге..."
                />
              </div>

              <button className="btn btn-primary" onClick={submitConsultation}>
                Запланировать консультацию
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'proposals' && (
        <div className="card">
          <div className="content-section">
            <h3>Коммерческие предложения</h3>
            {commercialProposals.length === 0 ? (
              <p>Нет созданных коммерческих предложений</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Клиент</th>
                      <th>Услуга</th>
                      <th>Сумма</th>
                      <th>Статус</th>
                      <th>Дата</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commercialProposals.map(proposal => (
                      <tr key={proposal.id}>
                        <td>{proposal.clientName}</td>
                        <td>{proposal.service}</td>
                        <td>{proposal.amount.toLocaleString('ru-RU')} ₽</td>
                        <td>
                          <span className={`badge ${
                            proposal.status === 'sent' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {proposal.status === 'sent' ? 'Отправлено' : 'Черновик'}
                          </span>
                        </td>
                        <td>{new Date(proposal.createdAt).toLocaleDateString('ru-RU')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary">
                              Редактировать
                            </button>
                            <button className="btn btn-success">
                              Отправить
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
    </div>
  );
}

export default ManagerPanel;