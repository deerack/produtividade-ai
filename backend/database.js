const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Cria e reaproveita uma conexão local com SQLite.
const db = new sqlite3.Database(path.join(__dirname, 'tasks.db'));

// Inicializa a tabela de tarefas caso ainda não exista.
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT NOT NULL DEFAULT 'Semana',
      priority INTEGER NOT NULL DEFAULT 3,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
