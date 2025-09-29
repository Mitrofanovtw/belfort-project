import React from 'react';

function Contacts() {
  const branches = [
    {
      city: 'Москва',
      address: 'ул. Тверская, д. 10',
      phone: '+7 (495) 123-45-67',
      email: 'moscow@belfort.ru',
      mapUrl: 'https://yandex.ru/maps/213/moscow/?ll=37.617494%2C55.755814&mode=search&oid=1026828694&ol=biz&z=16'
    },
    {
      city: 'Санкт-Петербург',
      address: 'Невский проспект, д. 25',
      phone: '+7 (812) 234-56-78',
      email: 'spb@belfort.ru',
      mapUrl: 'https://yandex.ru/maps/2/saint-petersburg/?ll=30.315868%2C59.939095&mode=search&oid=1131873735&ol=biz&z=16'
    },
    {
      city: 'Екатеринбург',
      address: 'ул. Ленина, д. 45',
      phone: '+7 (343) 345-67-89',
      email: 'ekaterinburg@belfort.ru',
      mapUrl: 'https://yandex.ru/maps/54/yekaterinburg/?ll=60.597465%2C56.838011&mode=search&oid=1047989168&ol=biz&z=16'
    },
    {
      city: 'Новосибирск',
      address: 'Красный проспект, д. 30',
      phone: '+7 (383) 456-78-90',
      email: 'novosibirsk@belfort.ru',
      mapUrl: 'https://yandex.ru/maps/65/novosibirsk/?ll=82.920430%2C55.030199&mode=search&oid=1037489213&ol=biz&z=16'
    },
    {
      city: 'Казань',
      address: 'ул. Баумана, д. 15',
      phone: '+7 (843) 567-89-01',
      email: 'kazan@belfort.ru',
      mapUrl: 'https://yandex.ru/maps/43/kazan/?ll=49.106414%2C55.796127&mode=search&oid=1029374662&ol=biz&z=16'
    },
    {
      city: 'Ростов-на-Дону',
      address: 'ул. Большая Садовая, д. 88',
      phone: '+7 (863) 678-90-12',
      email: 'rostov@belfort.ru',
      mapUrl: 'https://yandex.ru/maps/39/rostov-on-don/?ll=39.723062%2C47.222531&mode=search&oid=1068653423&ol=biz&z=16'
    },
    {
      city: 'Владивосток',
      address: 'ул. Светланская, д. 55',
      phone: '+7 (423) 789-01-23',
      email: 'vladivostok@belfort.ru',
      mapUrl: 'https://yandex.ru/maps/75/vladivostok/?ll=131.886859%2C43.115536&mode=search&oid=1032903617&ol=biz&z=16'
    },
    {
      city: 'Краснодар',
      address: 'ул. Красная, д. 120',
      phone: '+7 (861) 890-12-34',
      email: 'krasnodar@belfort.ru',
      mapUrl: 'https://yandex.ru/maps/35/krasnodar/?ll=38.974711%2C45.035566&mode=search&oid=1027443658&ol=biz&z=16'
    }
  ];

  return (
    <div className="content-section">
      <h1>Контакты филиалов</h1>
      <p className="contacts-intro">ООО "Белфорт" представлено в 8 городах России. Выберите ближайший филиал для связи:</p>
      
      <div className="branches-grid">
        {branches.map((branch, index) => (
          <div key={index} className="branch-card">
            <div className="branch-header">
              <h3>{branch.city}</h3>
            </div>
            <div className="branch-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>{branch.address}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>{branch.phone}</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>{branch.email}</span>
              </div>
            </div>
            <div className="branch-actions">
              <a 
                href={branch.mapUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="map-link"
              >
                Посмотреть на карте
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="general-contacts">
        <h2>Общие контакты</h2>
        <div className="general-info">
          <p><strong>Единый номер:</strong> 8-800-123-45-67 (бесплатно по России)</p>
          <p><strong>Электронная почта:</strong> info@belfort.ru</p>
          <p><strong>Техническая поддержка:</strong> support@belfort.ru</p>
        </div>
      </div>
    </div>
  );
}

export default Contacts;