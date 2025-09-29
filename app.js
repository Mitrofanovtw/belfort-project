const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('belfort.db', (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('Подключено к базе данных SQLite');
    initializeDatabase();
  }
});

function initializeDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS UserSessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      token TEXT UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS ServiceRequests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      serviceType TEXT NOT NULL,
      specificService TEXT NOT NULL,
      comment TEXT,
      status TEXT DEFAULT 'Новая',
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS Requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  let currentIndex = 0;
  
  function createNextTable() {
    if (currentIndex >= tables.length) {
      createTestUsers();
      return;
    }
    
    db.run(tables[currentIndex], function(err) {
      if (err) {
        console.error(`Ошибка создания таблицы ${currentIndex + 1}:`, err.message);
      } else {
        console.log(`Таблица ${currentIndex + 1} создана или уже существует`);
      }
      currentIndex++;
      createNextTable();
    });
  }
  
  createNextTable();
}

function createTestUsers() {
  const testUsers = [
    {
      email: 'admin@belfort.ru',
      password: 'admin123',
      name: 'Администратор',
      role: 'admin'
    },
    {
      email: 'manager@belfort.ru',
      password: 'manager123',
      name: 'Менеджер',
      role: 'manager'
    }
  ];

  testUsers.forEach(user => {
    const hashedPassword = Buffer.from(user.password).toString('base64');
    
    db.run(
      `INSERT OR IGNORE INTO Users (email, password, name, role) VALUES (?, ?, ?, ?)`,
      [user.email, hashedPassword, user.name, user.role],
      function(err) {
        if (err) {
          console.error('Ошибка создания тестового пользователя:', err.message);
        } else if (this.changes > 0) {
          console.log(`Создан тестовый пользователь: ${user.email}`);
        }
      }
    );
  });
}

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  
  db.get(
    `SELECT u.* FROM UserSessions us 
     JOIN Users u ON us.user_id = u.id 
     WHERE us.token = ? AND us.created_at > datetime('now', '-7 days')`,
    [token],
    (err, user) => {
      if (err) {
        console.error('Ошибка проверки токена:', err.message);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Недействительная сессия' });
      }
      req.user = user;
      next();
    }
  );
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
  };
};

app.get('/api/service-requests', (req, res) => {
  const status = req.query.status;
  let query = 'SELECT * FROM ServiceRequests';
  let params = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Ошибка получения заявок:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/api/service-requests/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM ServiceRequests WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Ошибка получения заявки:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    res.json(row);
  });
});

app.post('/api/service-requests', (req, res) => {
  const { name, email, serviceType, specificService, comment } = req.body;
  db.run(
    'INSERT INTO ServiceRequests (name, email, serviceType, specificService, comment) VALUES (?, ?, ?, ?, ?)',
    [name, email, serviceType, specificService, comment],
    function (err) {
      if (err) {
        console.error('Ошибка добавления заявки:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id: this.lastID, 
        name, 
        email, 
        serviceType, 
        specificService, 
        comment,
        status: 'Новая',
        timestamp: new Date().toLocaleString()
      });
    }
  );
});

app.put('/api/service-requests/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  
  db.run(
    'UPDATE ServiceRequests SET status = ? WHERE id = ?',
    [status, id],
    function (err) {
      if (err) {
        console.error('Ошибка обновления статуса:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Заявка не найдена' });
      }
      res.json({ message: 'Статус обновлен', id, status });
    }
  );
});

app.delete('/api/service-requests/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM ServiceRequests WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Ошибка удаления:', err.message);
      return res.status(500).json({ error: 'Ошибка при удалении заявки' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    res.json({ message: 'Заявка успешно удалена', id });
  });
});

app.get('/api/service-requests/report', (req, res) => {
  db.all(
    'SELECT serviceType, COUNT(*) as count FROM ServiceRequests GROUP BY serviceType',
    [],
    (err, rows) => {
      if (err) {
        console.error('Ошибка получения отчета:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.get('/api/requests', (req, res) => {
  db.all('SELECT * FROM Requests', [], (err, rows) => {
    if (err) {
      console.error('Ошибка получения запросов:', err.message);
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
    function (err) {
      if (err) {
        console.error('Ошибка добавления запроса:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        id: this.lastID, 
        name, 
        email, 
        message,
        timestamp: new Date().toLocaleString()
      });
    }
  );
});

app.post('/api/register', (req, res) => {
  const { email, password, name, phone, company, role = 'user' } = req.body;
  
  db.get('SELECT id FROM Users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (row) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = Buffer.from(password).toString('base64');
    
    db.run(
      'INSERT INTO Users (email, password, name, phone, company, role) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, phone, company, role],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Ошибка регистрации' });
        }
        
        const token = crypto.randomBytes(32).toString('hex');
        db.run(
          'INSERT INTO UserSessions (user_id, token) VALUES (?, ?)',
          [this.lastID, token],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Ошибка создания сессии' });
            }
            res.json({ 
              message: 'Регистрация успешна',
              token,
              user: { id: this.lastID, email, name, phone, company, role }
            });
          }
        );
      }
    );
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = Buffer.from(password).toString('base64');
  
  db.get(
    'SELECT * FROM Users WHERE email = ? AND password = ?',
    [email, hashedPassword],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }
      
      const token = crypto.randomBytes(32).toString('hex');
      db.run(
        'INSERT INTO UserSessions (user_id, token) VALUES (?, ?)',
        [user.id, token],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Ошибка создания сессии' });
          }
          res.json({ 
            message: 'Вход успешен',
            token,
            user: { 
              id: user.id, 
              email: user.email, 
              name: user.name, 
              phone: user.phone, 
              company: user.company,
              role: user.role
            }
          });
        }
      );
    }
  );
});

app.get('/api/my-requests', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM ServiceRequests WHERE email = ? ORDER BY timestamp DESC',
    [req.user.email],
    (err, requests) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка получения заявок' });
      }
      res.json(requests);
    }
  );
});

app.post('/api/logout', authenticateToken, (req, res) => {
  const token = req.headers.authorization;
  
  if (token) {
    db.run('DELETE FROM UserSessions WHERE token = ?', [token]);
  }
  
  res.json({ message: 'Выход выполнен' });
});

app.get('/api/admin/stats', authenticateToken, requireRole('admin'), (req, res) => {
  db.all(`
    SELECT 
      (SELECT COUNT(*) FROM ServiceRequests) as totalRequests,
      (SELECT COUNT(*) FROM ServiceRequests WHERE status != 'Выполнена') as activeRequests,
      (SELECT COUNT(*) FROM ServiceRequests WHERE status = 'Выполнена') as completedRequests,
      (SELECT COUNT(*) FROM Users) as usersCount
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения статистики' });
    }
    res.json(rows[0] || {});
  });
});

app.get('/api/admin/users', authenticateToken, requireRole('admin'), (req, res) => {
  db.all('SELECT id, name, email, role, phone, company, created_at FROM Users', [], (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
    res.json(users);
  });
});

app.get('/api/manager/consultations', authenticateToken, requireRole('manager'), (req, res) => {
  res.json([]);
});

app.post('/api/manager/consultations', authenticateToken, requireRole('manager'), (req, res) => {
  res.json({ message: 'Консультация запланирована' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});