import { useState } from 'react';

export default function TaskCard({ task, onToggle, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const handleSave = async () => {
    await onSave(task.id, { title, description });
    setIsEditing(false);
  };

  return (
    <div className={`task-card ${task.completed ? 'done' : ''}`}>
      {isEditing ? (
        <>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </>
      ) : (
        <>
          <h4>{task.title}</h4>
          {task.description && <p>{task.description}</p>}
        </>
      )}

      <small>Prioridade IA: {task.priority}/5</small>
      <div className="task-actions">
        <button onClick={() => onToggle(task)}>{task.completed ? 'Reabrir' : 'Concluir'}</button>
        {isEditing ? (
          <button onClick={handleSave}>Salvar</button>
        ) : (
          <button onClick={() => setIsEditing(true)}>Editar</button>
        )}
        <button className="danger" onClick={() => onDelete(task.id)}>
          Excluir
        </button>
      </div>
    </div>
  );
}
