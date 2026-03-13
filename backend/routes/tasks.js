const express = require('express');
const db = require('../database');
const {
  classifyTask,
  generateDayPlan,
  generateProductivitySuggestions,
} = require('../aiService');

const router = express.Router();

function mapTask(row) {
  return {
    ...row,
    completed: Boolean(row.completed),
  };
}

// Lista todas as tarefas por data de atualização.
router.get('/', (_, res) => {
  db.all('SELECT * FROM tasks ORDER BY updated_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(rows.map(mapTask));
  });
});

// Cria tarefa e usa IA para classificar categoria e prioridade.
router.post('/', async (req, res) => {
  const { title, description = '' } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Título é obrigatório.' });

  try {
    const ai = await classifyTask(`${title}. ${description}`);
    db.run(
      `INSERT INTO tasks (title, description, category, priority, completed, updated_at)
       VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
      [title.trim(), description.trim(), ai.category, ai.priority],
      function onInsert(err) {
        if (err) return res.status(500).json({ error: err.message });

        db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (fetchErr, row) => {
          if (fetchErr) return res.status(500).json({ error: fetchErr.message });
          return res.status(201).json(mapTask(row));
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ error: `Falha na classificação IA: ${error.message}` });
  }
});

// Atualiza dados da tarefa, incluindo movimentação de coluna no Kanban.
router.put('/:id', (req, res) => {
  const { title, description, category, priority, completed } = req.body;
  db.run(
    `UPDATE tasks
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          priority = COALESCE(?, priority),
          completed = COALESCE(?, completed),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [title, description, category, priority, typeof completed === 'boolean' ? Number(completed) : null, req.params.id],
    function onUpdate(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (!this.changes) return res.status(404).json({ error: 'Tarefa não encontrada.' });

      db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (fetchErr, row) => {
        if (fetchErr) return res.status(500).json({ error: fetchErr.message });
        return res.json(mapTask(row));
      });
    }
  );
});

// Remove tarefa permanentemente.
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function onDelete(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (!this.changes) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    return res.status(204).send();
  });
});

// Dashboard com métricas principais de produtividade.
router.get('/dashboard/metrics', (_, res) => {
  db.get(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed
     FROM tasks`,
    [],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      const total = Number(row.total || 0);
      const completed = Number(row.completed || 0);
      const dailyProgress = total ? Math.round((completed / total) * 100) : 0;
      return res.json({ total, completed, dailyProgress });
    }
  );
});

// Gera plano diário com IA usando tarefas em aberto.
router.post('/ai/day-plan', (req, res) => {
  db.all('SELECT * FROM tasks WHERE completed = 0 ORDER BY priority DESC, updated_at DESC', [], async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      const plan = await generateDayPlan(rows.map(mapTask));
      return res.json({ plan });
    } catch (error) {
      return res.status(500).json({ error: `Falha ao gerar plano diário: ${error.message}` });
    }
  });
});

// Gera sugestões de produtividade com IA.
router.get('/ai/suggestions', (_, res) => {
  db.all('SELECT * FROM tasks WHERE completed = 0 ORDER BY priority DESC, updated_at DESC', [], async (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      const suggestions = await generateProductivitySuggestions(rows.map(mapTask));
      return res.json({ suggestions });
    } catch (error) {
      return res.status(500).json({ error: `Falha ao gerar sugestões: ${error.message}` });
    }
  });
});

module.exports = router;
