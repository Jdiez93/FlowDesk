import { useState } from 'react'
import type { Habit } from '../../lib/supabase'

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#06b6d4','#3b82f6']
const ICONS  = ['⚡','🏃','📚','💪','🧘','🥗','💧','😴','🎯','✍️','🎨','🧠','🌿','🏋️','🚴','🎵']

type Props = {
  habit: Habit | null
  onSave: (data: Partial<Habit>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function HabitModal({ habit, onSave, onDelete, onClose }: Props) {
  const [name, setName]             = useState(habit?.name || '')
  const [description, setDescription] = useState(habit?.description || '')
  const [frequency, setFrequency]   = useState<Habit['frequency']>(habit?.frequency || 'daily')
  const [color, setColor]           = useState(habit?.color || COLORS[0])
  const [icon, setIcon]             = useState(habit?.icon || ICONS[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name, description, frequency, color, icon, is_active: true })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3>{habit ? 'Editar hábito' : 'Nuevo hábito'}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Preview */}
          <div className="habit-preview" style={{ borderColor: color, background: `${color}10` }}>
            <span className="preview-icon">{icon}</span>
            <span className="preview-name" style={{ color }}>{name || 'Nombre del hábito'}</span>
          </div>

          <div className="form-group">
            <label className="fd-label">Nombre *</label>
            <input className="fd-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Meditar 10 minutos" required autoFocus />
          </div>

          <div className="form-group">
            <label className="fd-label">Descripción</label>
            <input className="fd-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Opcional..." />
          </div>

          <div className="form-group">
            <label className="fd-label">Frecuencia</label>
            <div className="frequency-btns">
              <button type="button" className={`freq-btn ${frequency === 'daily' ? 'active' : ''}`} style={{ '--freq-color': color } as React.CSSProperties} onClick={() => setFrequency('daily')}>
                📅 Diario
              </button>
              <button type="button" className={`freq-btn ${frequency === 'weekly' ? 'active' : ''}`} style={{ '--freq-color': color } as React.CSSProperties} onClick={() => setFrequency('weekly')}>
                📆 Semanal
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="fd-label">Icono</label>
            <div className="emoji-grid">
              {ICONS.map(ic => (
                <button key={ic} type="button" className={`emoji-btn ${icon === ic ? 'active' : ''}`} onClick={() => setIcon(ic)}
                  style={icon === ic ? { borderColor: color, background: `${color}15` } : {}}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="fd-label">Color</label>
            <div className="color-grid">
              {COLORS.map(c => (
                <button key={c} type="button" className={`color-btn ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
          </div>

          <div className="modal-footer">
            {habit && (
              <button type="button" className="fd-btn btn-danger" onClick={() => onDelete(habit.id)}>
                Eliminar
              </button>
            )}
            <div className="modal-footer-right">
              <button type="button" className="fd-btn fd-btn-ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="fd-btn fd-btn-primary" style={{ background: color }}>
                {habit ? 'Guardar cambios' : 'Crear hábito'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}