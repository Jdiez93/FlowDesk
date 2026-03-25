import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../lib/supabase'

type Props = {
  task: Task
  onEdit: (task: Task) => void
  isDragging?: boolean
}

const PRIORITY_CONFIG = {
  low:    { label: 'Baja',     color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  medium: { label: 'Media',    color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  high:   { label: 'Alta',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  urgent: { label: 'Urgente',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
}

export default function TaskCard({ task, onEdit, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  const priority = PRIORITY_CONFIG[task.priority]
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? 'is-dragging' : ''}`}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(task)}
    >
      <div className="task-card-header">
        <span
          className="task-priority-badge"
          style={{ color: priority.color, background: priority.bg }}
        >
          {priority.label}
        </span>
        {isOverdue && (
          <span className="task-overdue">⚠ Vencida</span>
        )}
      </div>

      <p className="task-title">{task.title}</p>

      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        {task.due_date && (
          <span className={`task-date ${isOverdue ? 'overdue' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {new Date(task.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  )
}