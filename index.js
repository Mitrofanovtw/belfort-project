const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS Requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Таблица Requests создана или уже существует.');
  
  db.run(`
    CREATE TABLE IF NOT EXISTS ServiceRequests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      serviceType TEXT NOT NULL,
      specificService TEXT NOT NULL,
      comment TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'Новая'
    )
  `);
  console.log('Таблица ServiceRequests создана или уже существует.');
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Belfort API работает!',
    status: 'OK'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'Успех', 
    message: 'Сервер работает корректно',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/service-requests', (req, res) => {
  db.all('SELECT * FROM ServiceRequests', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/service-requests', (req, res) => {
  const { name, email, serviceType, specificService, comment } = req.body;
  
  db.run(
    'INSERT INTO ServiceRequests (name, email, serviceType, specificService, comment) VALUES (?, ?, ?, ?, ?)',
    [name, email, serviceType, specificService, comment],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id: this.lastID,
        message: 'Заявка создана успешно'
      });
    }
  );
});

app.get('/api/requests', (req, res) => {
  db.all('SELECT * FROM Requests', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/requests', (req, res) => {
  const { name, email, message } = req.body;
  
  db.run(
    'INSERT INTO Requests (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id: this.lastID,
        message: 'Запрос отправлен успешно'
      });
    }
  );
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

function getConnection() {
  return db;
}

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = app;