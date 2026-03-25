import { useState } from 'react'
import type { Project } from '../../lib/supabase'

const COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6']
const EMOJIS = ['📋','🚀','💡','🎯','🔥','⚡','🌟','🛠️','📱','🎨','📊','🏆']

type Props = {
  onSave: (data: Partial<Project>) => void
  onClose: () => void
}

export default function ProjectModal({ onSave, onClose }: Props) {
  const [name, setName]   = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [emoji, setEmoji] = useState(EMOJIS[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name, color, emoji })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3>Nuevo proyecto</h3>
          <button className="modal-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="fd-label">Nombre del proyecto *</label>
            <input className="fd-input" value={name} onChange={e => setName(e.target.value)} placeholder="Mi proyecto" required autoFocus />
          </div>

          <div className="form-group">
            <label className="fd-label">Emoji</label>
            <div className="emoji-grid">
              {EMOJIS.map(e => (
                <button key={e} type="button" className={`emoji-btn ${emoji === e ? 'active' : ''}`} onClick={() => setEmoji(e)}>{e}</button>
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
            <div className="modal-footer-right">
              <button type="button" className="fd-btn fd-btn-ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="fd-btn fd-btn-primary">Crear proyecto</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}