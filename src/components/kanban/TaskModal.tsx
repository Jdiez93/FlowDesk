import { useState } from 'react'
import type { Task, Project } from '../../lib/supabase'

type Props = {
  task: Task | null
  projects: Project[]
  defaultStatus: Task['status']
  onSave: (data: Partial<Task>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function TaskModal({ task, projects, defaultStatus, onSave, onDelete, onClose }: Props) {
  const [title, setTitle]             = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [status, setStatus]           = useState<Task['status']>(task?.status || defaultStatus)
  const [priority, setPriority]       = useState<Task['priority']>(task?.priority || 'medium')
  const [dueDate, setDueDate]         = useState(task?.due_date || '')
  const [projectId, setProjectId]     = useState(task?.project_id || projects[0]?.id || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title, description, status, priority, due_date: dueDate || null, project_id: projectId })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Editar tarea' : 'Nueva tarea'}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="fd-label">Título *</label>
            <input className="fd-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="¿Qué hay que hacer?" required autoFocus />
          </div>

          <div className="form-group">
            <label className="fd-label">Descripción</label>
            <textarea className="fd-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles opcionales..." rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="fd-label">Estado</label>
              <select className="fd-input" value={status} onChange={e => setStatus(e.target.value as Task['status'])}>
                <option value="backlog">Backlog</option>
                <option value="in_progress">En progreso</option>
                <option value="review">Revisión</option>
                <option value="done">Hecho</option>
              </select>
            </div>

            <div className="form-group">
              <label className="fd-label">Prioridad</label>
              <select className="fd-input" value={priority} onChange={e => setPriority(e.target.value as Task['priority'])}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="fd-label">Fecha límite</label>
              <input className="fd-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="fd-label">Proyecto</label>
              <select className="fd-input" value={projectId} onChange={e => setProjectId(e.target.value)}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            {task && (
              <button type="button" className="fd-btn btn-danger" onClick={() => onDelete(task.id)}>
                Eliminar
              </button>
            )}
            <div className="modal-footer-right">
              <button type="button" className="fd-btn fd-btn-ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="fd-btn fd-btn-primary">
                {task ? 'Guardar cambios' : 'Crear tarea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}