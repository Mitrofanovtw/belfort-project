import React, { useState, useEffect } from 'react';

function ServiceRequest() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serviceType: '',
    specificService: '',
    comment: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const serviceOptions = {
    'Разработка ПО': [
      'Веб-разработка',
      'Мобильная разработка',
      'Разработка desktop-приложений',
    ],
    'Цифровая трансформация': [
      'Аудит IT-инфраструктуры',
      'Внедрение CRM-систем',
      'Консультации по облачным технологиям',
    ],
  };

  useEffect(() => {
    
    const selectedService = localStorage.getItem('selectedService');
    if (selectedService) {
      const service = JSON.parse(selectedService);
      setFormData(prev => ({
        ...prev,
        serviceType: service.category,
        specificService: service.name
      }));
      
      localStorage.removeItem('selectedService');
    }
  }, []);

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = 'Имя обязательно';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = 'Введите корректный email';
    if (!formData.serviceType) tempErrors.serviceType = 'Выберите тип услуги';
    if (!formData.specificService) tempErrors.specificService = 'Выберите конкретную услугу';
    if (!formData.comment) tempErrors.comment = 'Комментарий обязателен';
    return tempErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'serviceType') {
      setFormData({ ...formData, [name]: value, specificService: '' });
    }
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch('http://localhost:5000/api/service-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
          setFormData({ name: '', email: '', serviceType: '', specificService: '', comment: '' });
          setIsSubmitted(true);
          setTimeout(() => setIsSubmitted(false), 3000);
        } else {
          throw new Error(data.error || 'Ошибка сервера');
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
      <h1>Оформить заявку на услугу</h1>
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
          <label className="form-label">Тип услуги:</label>
          <select 
            name="serviceType" 
            value={formData.serviceType} 
            onChange={handleChange} 
            className={`form-control ${errors.serviceType ? 'error' : ''}`}
          >
            <option value="">Выберите тип услуги</option>
            <option value="Разработка ПО">Разработка программного обеспечения</option>
            <option value="Цифровая трансформация">Консультации по цифровой трансформации</option>
          </select>
          {errors.serviceType && <span className="error-text">{errors.serviceType}</span>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Конкретная услуга:</label>
          <select 
            name="specificService" 
            value={formData.specificService} 
            onChange={handleChange} 
            className={`form-control ${errors.specificService ? 'error' : ''}`}
            disabled={!formData.serviceType}
          >
            <option value="">Выберите услугу</option>
            {formData.serviceType && serviceOptions[formData.serviceType].map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
          {errors.specificService && <span className="error-text">{errors.specificService}</span>}
        </div>
        
        <div className="form-group">
          <label className="form-label">Комментарий к заявке:</label>
          <textarea 
            name="comment" 
            value={formData.comment} 
            onChange={handleChange} 
            className={`form-control ${errors.comment ? 'error' : ''}`}
            placeholder="Опишите ваши пожелания или задачу подробнее..."
            rows="4"
          />
          {errors.comment && <span className="error-text">{errors.comment}</span>}
        </div>
        
        <button type="submit" disabled={isSubmitted} className="btn btn-primary">
          {isSubmitted ? '✅ Отправлено' : '📨 Отправить заявку'}
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
            ✅ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.
          </div>
        )}
      </form>
    </div>
  );
}

export default ServiceRequest;