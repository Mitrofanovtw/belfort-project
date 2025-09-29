import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Services() {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const navigate = useNavigate();
  
  const serviceCategories = [
    'Все',
    'Разработка ПО',
    'Цифровая трансформация', 
    'Техническая поддержка',
    'Консалтинг'
  ];

  const services = [
    {
      id: 1,
      name: 'Веб-разработка',
      category: 'Разработка ПО',
      icon: '🌐',
      description: 'Создание современных веб-приложений и сайтов любой сложности с использованием передовых технологий',
      price: 'от 50 000 ₽',
      duration: '2-8 недель'
    },
    {
      id: 2,
      name: 'Мобильная разработка',
      category: 'Разработка ПО',
      icon: '📱',
      description: 'Разработка нативных и кроссплатформенных мобильных приложений для iOS и Android',
      price: 'от 80 000 ₽',
      duration: '4-12 недель'
    },
    {
      id: 3,
      name: 'Desktop-приложения',
      category: 'Разработка ПО',
      icon: '💻',
      description: 'Создание desktop-приложений для Windows, macOS и Linux с современным интерфейсом',
      price: 'от 60 000 ₽',
      duration: '3-10 недель'
    },
    {
      id: 4,
      name: 'Аудит IT-инфраструктуры',
      category: 'Цифровая трансформация',
      icon: '🔍',
      description: 'Комплексный анализ IT-инфраструктуры компании и рекомендации по оптимизации',
      price: 'от 30 000 ₽',
      duration: '1-2 недели'
    },
    {
      id: 5,
      name: 'Внедрение CRM-систем',
      category: 'Цифровая трансформация',
      icon: '📊',
      description: 'Подбор, настройка и внедрение CRM-систем для автоматизации бизнес-процессов',
      price: 'от 40 000 ₽',
      duration: '2-6 недель'
    },
    {
      id: 6,
      name: 'Облачные технологии',
      category: 'Цифровая трансформация',
      icon: '☁️',
      description: 'Консультации по миграции в облако и настройке облачной инфраструктуры',
      price: 'от 25 000 ₽',
      duration: '1-4 недели'
    },
    {
      id: 7,
      name: 'Техническая поддержка 24/7',
      category: 'Техническая поддержка',
      icon: '🛠️',
      description: 'Круглосуточная техническая поддержка и оперативное решение возникающих проблем',
      price: 'от 15 000 ₽/мес',
      duration: 'постоянно'
    },
    {
      id: 8,
      name: 'Обслуживание серверов',
      category: 'Техническая поддержка',
      icon: '🖥️',
      description: 'Мониторинг, обслуживание и оптимизация серверного оборудования и ПО',
      price: 'от 20 000 ₽/мес',
      duration: 'постоянно'
    },
    {
      id: 9,
      name: 'ИТ-консалтинг',
      category: 'Консалтинг',
      icon: '🎯',
      description: 'Стратегическое планирование IT-развития компании и подбор технологических решений',
      price: 'от 35 000 ₽',
      duration: 'индивидуально'
    },
    {
      id: 10,
      name: 'Бизнес-анализ',
      category: 'Консалтинг',
      icon: '📈',
      description: 'Анализ бизнес-процессов и разработка рекомендаций по их автоматизации',
      price: 'от 45 000 ₽',
      duration: '2-4 недели'
    }
  ];

  const filteredServices = selectedCategory === 'Все' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const handleServiceRequest = (service) => {
    
    localStorage.setItem('selectedService', JSON.stringify({
      name: service.name,
      category: service.category
    }));
    
    navigate('/service-request');
  };

  return (
    <div className="content-section">
      <h1>Услуги компании "Белфорт"</h1>
      <p className="services-intro">Мы предлагаем комплексные IT-решения для бизнеса любого масштаба</p>
      
      {/* Фильтр по категориям */}
      <div className="services-filter">
        <h3>Категории услуг:</h3>
        <div className="filter-buttons">
          {serviceCategories.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Счетчик услуг */}
      <div className="services-counter">
        <p>Найдено услуг: <strong>{filteredServices.length}</strong></p>
      </div>

      {/* Сетка услуг */}
      <div className="services-grid">
        {filteredServices.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-header">
              <span className="service-icon">{service.icon}</span>
              <h3>{service.name}</h3>
            </div>
            <div className="service-category">
              <span className="category-badge">{service.category}</span>
            </div>
            <div className="service-description">
              <p>{service.description}</p>
            </div>
            <div className="service-details">
              <div className="service-price">
                <strong>Стоимость:</strong> {service.price}
              </div>
              <div className="service-duration">
                <strong>Сроки:</strong> {service.duration}
              </div>
            </div>
            <div className="service-actions">
              <button 
                className="btn btn-primary service-request-btn"
                onClick={() => handleServiceRequest(service)}
              >
                📝 Оформить заявку
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Если нет услуг в выбранной категории */}
      {filteredServices.length === 0 && (
        <div className="no-services">
          <p>В выбранной категории пока нет услуг</p>
          <button 
            className="btn btn-primary reset-filter-btn"
            onClick={() => setSelectedCategory('Все')}
          >
            Показать все услуги
          </button>
        </div>
      )}
    </div>
  );
}

export default Services;