import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import TaskForm from './components/TaskForm';
import {
  createTask,
  deleteTask,
  fetchMetrics,
  fetchTasks,
  getDayPlan,
  getSuggestions,
  updateTask,
} from './services/api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, completed: 0, dailyProgress: 0 });
  const [dayPlan, setDayPlan] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const loadData = async () => {
    const [tasksData, metricsData] = await Promise.all([fetchTasks(), fetchMetrics()]);
    setTasks(tasksData);
    setMetrics(metricsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (payload) => {
    await createTask(payload);
    await loadData();
  };

  const handleMove = async (id, category) => {
    await updateTask(id, { category });
    await loadData();
  };

  const handleToggle = async (task) => {
    await updateTask(task.id, { completed: !task.completed });
    await loadData();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    await loadData();
  };

  const handleSave = async (id, payload) => {
    await updateTask(id, payload);
    await loadData();
  };

  const handleGeneratePlan = async () => {
    setLoadingAI(true);
    try {
      const response = await getDayPlan();
      setDayPlan(response.plan || []);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSuggestions = async () => {
    setLoadingAI(true);
    try {
      const response = await getSuggestions();
      setSuggestions(response.suggestions || []);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <main className="app-shell">
      <header>
        <h1>Produtividade AI</h1>
        <p>Gestão de tarefas com priorização inteligente e plano diário automatizado.</p>
      </header>

      <Dashboard metrics={metrics} />
      <TaskForm onSubmit={handleCreate} />

      <section className="ai-actions">
        <button disabled={loadingAI} onClick={handleGeneratePlan}>
          Gerar plano do dia
        </button>
        <button disabled={loadingAI} onClick={handleSuggestions}>
          Sugestões de produtividade
        </button>
      </section>

      <section className="ai-panels">
        <article>
          <h3>Plano diário</h3>
          <ol>
            {dayPlan.map((step) => (
              <li key={step}>{step.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        </article>
        <article>
          <h3>Sugestões</h3>
          <ul>
            {suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <KanbanBoard
        tasks={tasks}
        onMove={handleMove}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onSave={handleSave}
      />
    </main>
  );
}
