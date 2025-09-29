import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

function AllServices() {
  const servicesListRef = useRef(null);

  const scrollToServices = () => {
    servicesListRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="content-section">
      <h1>Все услуги</h1>
      <p>Здесь будет список всех доступных услуг компании "Белфорт".</p>
      <Link to="/service-request" className="service-button">
        Оформить заявку
      </Link>
      <div ref={servicesListRef} className="services-list">
        <h2>Список услуг (заготовка)</h2>
        <p>Скоро здесь появятся подробные описания наших услуг!</p>
        <div className="service-item">
          <h3>Услуга 1</h3>
          <p>Краткое описание услуги 1 (будет детализировано).</p>
        </div>
        <div className="service-item">
          <h3>Услуга 2</h3>
          <p>Краткое описание услуги 2 (будет детализировано).</p>
        </div>
        <div className="service-item">
          <h3>Услуга 3</h3>
          <p>Краткое описание услуги 3 (будет детализировано).</p>
        </div>
      </div>
    </div>
  );
}

export default AllServices;