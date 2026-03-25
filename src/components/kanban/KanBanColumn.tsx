import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import type { Task } from '../../lib/supabase'

type Props = {
  id: string
  label: string
  color: string
  tasks: Task[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
}

export default function KanbanColumn({ id, label, color, tasks, onAddTask, onEditTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className={`kanban-column ${isOver ? 'drop-over' : ''}`}>
      <div className="column-header">
        <div className="column-title-row">
          <span className="column-dot" style={{ background: color }}></span>
          <span className="column-title">{label}</span>
          <span className="column-count">{tasks.length}</span>
        </div>
        <button className="column-add-btn" onClick={onAddTask} title="Añadir tarea">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      <div className="column-body" ref={setNodeRef}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="column-empty" onClick={onAddTask}>
            <span>+ Añadir tarea</span>
          </div>
        )}
      </div>
    </div>
  )
}