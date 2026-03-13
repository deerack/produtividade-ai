export default function Dashboard({ metrics }) {
  return (
    <section className="dashboard">
      <div className="metric-card">
        <span>Total de tarefas</span>
        <strong>{metrics.total}</strong>
      </div>
      <div className="metric-card">
        <span>Tarefas concluídas</span>
        <strong>{metrics.completed}</strong>
      </div>
      <div className="metric-card">
        <span>Progresso diário</span>
        <strong>{metrics.dailyProgress}%</strong>
      </div>
    </section>
  );
}
