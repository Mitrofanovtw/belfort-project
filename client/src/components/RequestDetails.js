import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function RequestDetails() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRequest() {
      try {
        const response = await fetch(`http://localhost:5000/api/service-requests/${id}`);
        console.log(`Запрос на /api/service-requests/${id}, статус: ${response.status}`);
        if (response.ok) {
          const data = await response.json();
          setRequest(data);
        } else {
          console.error('Ошибка ответа сервера:', response.statusText);
        }
      } catch (err) {
        console.error('Ошибка загрузки деталей заявки:', err);
      }
    }
    fetchRequest();
  }, [id]);

  if (!request) {
    return <div>Загрузка... или заявка не найдена (ID: {id})</div>;
  }

  return (
    <div className="content-section">
      <h1>Детали заявки #{request.id}</h1>
      <ul>
        <li><strong>Имя:</strong> {request.name || 'Не указано'}</li>
        <li><strong>Email:</strong> {request.email || 'Не указано'}</li>
        <li><strong>Тип услуги:</strong> {request.serviceType || 'Не указано'}</li>
        <li><strong>Услуга:</strong> {request.specificService || 'Не указано'}</li>
        <li><strong>Комментарий:</strong> {request.comment || 'Не указано'}</li>
        <li><strong>Статус:</strong> {request.status || 'Не указано'}</li>
        <li><strong>Отправлено:</strong> {request.timestamp || 'Не указано'}</li>
      </ul>
      <button onClick={() => navigate('/admin')}>Назад</button>
    </div>
  );
}

export default RequestDetails;