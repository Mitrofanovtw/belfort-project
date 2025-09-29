const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./belfort.db');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  console.log('Доступные таблицы:');
  tables.forEach(table => {
    console.log('-', table.name);
    
    db.all(`SELECT * FROM ${table.name}`, (err, rows) => {
      console.log(`\n=== ${table.name} (${rows.length} записей) ===`);
      console.table(rows);
    });
  });
  
  setTimeout(() => db.close(), 1000);
});