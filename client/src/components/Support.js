import React, { useState } from 'react';

function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = 'Имя обязательно';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = 'Введите корректный email';
    if (!formData.message) tempErrors.message = 'Сообщение обязательно';
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
      try {
        console.log('Отправка данных:', formData);
        const response = await fetch('http://localhost:5000/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.text();
        console.log('Ответ сервера:', data);
        if (response.ok) {
          const jsonData = JSON.parse(data);
          setFormData({ name: '', email: '', message: '' });
          setIsSubmitted(true);
          setTimeout(() => setIsSubmitted(false), 3000);
        } else {
          throw new Error(data || 'Ошибка сервера');
        }
      } catch (err) {
        console.error('Ошибка отправки:', err.message);
        alert(`Не удалось отправить заявку: ${err.message}`);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="content-section">
      <h1>Поддержка</h1>
      <p>Свяжитесь с нашей службой поддержки: support@belfort.ru</p>
      
      <form onSubmit={handleSubmit} className="support-form">
        <div className="form-group">
          <label className="form-label">Имя:</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className={`form-control ${errors.name ? 'error' : ''}`}
            placeholder="Введите ваше имя"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className={`form-control ${errors.email ? 'error' : ''}`}
            placeholder="Введите ваш email"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Сообщение:</label>
          <textarea 
            name="message" 
            value={formData.message} 
            onChange={handleChange} 
            className={`form-control ${errors.message ? 'error' : ''}`}
            placeholder="Опишите вашу проблему или вопрос..."
            rows="5"
          />
          {errors.message && <span className="error-text">{errors.message}</span>}
        </div>
        
        <button type="submit" disabled={isSubmitted} className="btn btn-primary">
          {isSubmitted ? '✅ Отправлено' : '📨 Отправить сообщение'}
        </button>
        
        {isSubmitted && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#d1fae5', 
            border: '1px solid #10b981',
            borderRadius: 'var(--radius)',
            color: '#065f46'
          }}>
            ✅ Сообщение успешно отправлено! Мы ответим вам в ближайшее время.
          </div>
        )}
      </form>
    </div>
  );
}

export default Support;