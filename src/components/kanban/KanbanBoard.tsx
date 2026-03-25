import { useState } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { supabase } from '../../lib/supabase'
import KanbanColumn from './KanBanColumn'
import TaskCard from './TaskCard'
import TaskModal from './TaskModal'
import ProjectModal from './ProjectModal'
import type { Task, Project } from '../../lib/supabase'

type Props = {
  projects: Project[]
  tasks: Task[]
  userId: string
}

const COLUMNS = [
  { id: 'backlog',     label: 'Backlog',      color: '#94a3b8' },
  { id: 'in_progress', label: 'En progreso',  color: '#6366f1' },
  { id: 'review',      label: 'Revisión',     color: '#f59e0b' },
  { id: 'done',        label: 'Hecho',        color: '#10b981' },
]

export default function KanbanBoard({ projects: initialProjects, tasks: initialTasks, userId }: Props) {
  const [tasks, setTasks]       = useState<Task[]>(initialTasks)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeTask, setActiveTask]       = useState<Task | null>(null)
  const [selectedTask, setSelectedTask]   = useState<Task | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState<Task['status']>('backlog')
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id || '')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function getColumnTasks(status: string) {
    return tasks
      .filter(t => t.status === status && (!selectedProject || t.project_id === selectedProject))
      .sort((a, b) => a.order_index - b.order_index)
  }

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId   = active.id as string
    const newStatus = over.id as Task['status']

    if (!['backlog', 'in_progress', 'review', 'done'].includes(newStatus)) return

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  }

  function openNewTask(status: Task['status']) {
    setDefaultStatus(status)
    setSelectedTask(null)
    setShowTaskModal(true)
  }

  function openEditTask(task: Task) {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  async function handleSaveTask(taskData: Partial<Task>) {
    if (selectedTask) {
      const { data } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', selectedTask.id)
        .select()
        .single()
      if (data) setTasks(prev => prev.map(t => t.id === data.id ? data : t))
    } else {
      const { data } = await supabase
        .from('tasks')
        .insert({ ...taskData, user_id: userId, project_id: selectedProject || projects[0]?.id })
        .select()
        .single()
      if (data) setTasks(prev => [...prev, data])
    }
    setShowTaskModal(false)
  }

  async function handleDeleteTask(taskId: string) {
    await supabase.from('tasks').delete().eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    setShowTaskModal(false)
  }

  async function handleSaveProject(projectData: Partial<Project>) {
    const { data } = await supabase
      .from('projects')
      .insert({ ...projectData, user_id: userId })
      .select()
      .single()
    if (data) {
      setProjects(prev => [...prev, data])
      setSelectedProject(data.id)
    }
    setShowProjectModal(false)
  }

  async function handleDeleteProject(projectId: string) {
  if (!confirm('¿Eliminar este proyecto? Se eliminarán también todas sus tareas.')) return
  await supabase.from('projects').delete().eq('id', projectId)
  setProjects(prev => prev.filter(p => p.id !== projectId))
  setTasks(prev => prev.filter(t => t.project_id !== projectId))
  if (selectedProject === projectId) {
    setSelectedProject(projects.filter(p => p.id !== projectId)[0]?.id || '')
  }
}

  return (
    <div className="kanban-wrapper">
      {/* Header */}
      <div className="kanban-header">
        <div className="project-selector">
          <div className="project-tabs">
  {projects.map(p => (
    <div key={p.id} className={`project-tab-wrapper ${selectedProject === p.id ? 'active' : ''}`}>
      <button
        className={`project-tab ${selectedProject === p.id ? 'active' : ''}`}
        onClick={() => setSelectedProject(p.id)}
        style={{ '--project-color': p.color } as React.CSSProperties}
      >
        <span>{p.emoji}</span>
        <span>{p.name}</span>
      </button>
      {selectedProject === p.id && (
        <button
          className="project-delete-btn"
          onClick={() => handleDeleteProject(p.id)}
          title="Eliminar proyecto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  ))}
  <button className="project-tab add-project" onClick={() => setShowProjectModal(true)}>
    <span>+</span>
    <span>Nuevo proyecto</span>
  </button>
</div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-projects">
          <div className="empty-icon">📋</div>
          <h3>Crea tu primer proyecto</h3>
          <p>Los proyectos te ayudan a organizar tus tareas</p>
          <button className="fd-btn fd-btn-primary" onClick={() => setShowProjectModal(true)}>
            Crear proyecto
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {COLUMNS.map(col => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                label={col.label}
                color={col.color}
                tasks={getColumnTasks(col.id)}
                onAddTask={() => openNewTask(col.id as Task['status'])}
                onEditTask={openEditTask}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} onEdit={() => {}} isDragging />}
          </DragOverlay>
        </DndContext>
      )}

      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          projects={projects}
          defaultStatus={defaultStatus}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {showProjectModal && (
        <ProjectModal
          onSave={handleSaveProject}
          onClose={() => setShowProjectModal(false)}
        />
      )}
    </div>
  )
}