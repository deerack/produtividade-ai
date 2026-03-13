import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const columns = ['Hoje', 'Semana', 'Estratégico'];

export default function KanbanBoard({ tasks, onMove, onToggle, onDelete, onSave }) {
  const grouped = columns.reduce((acc, col) => ({ ...acc, [col]: [] }), {});
  tasks.forEach((task) => grouped[task.category]?.push(task));

  // Atualiza a categoria no backend quando o usuário arrasta entre colunas.
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    await onMove(Number(draggableId), destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <section className="kanban-grid">
        {columns.map((column) => (
          <Droppable droppableId={column} key={column}>
            {(provided, snapshot) => (
              <article
                className={`kanban-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h3>{column}</h3>
                {grouped[column].map((task, index) => (
                  <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                    {(dragProvided) => (
                      <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                        <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} onSave={onSave} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </article>
            )}
          </Droppable>
        ))}
      </section>
    </DragDropContext>
  );
}
