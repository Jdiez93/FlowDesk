import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import type { Task, FocusSession } from '../../lib/supabase'

type Props = {
  tasks: Pick<Task, 'id' | 'title' | 'status'>[]
  sessions: FocusSession[]
  userId: string
}

type Mode = 'focus' | 'short_break' | 'long_break'

const MODES = {
  focus:       { label: 'Focus',        minutes: 25, color: '#6366f1' },
  short_break: { label: 'Descanso',     minutes: 5,  color: '#10b981' },
  long_break:  { label: 'Descanso largo', minutes: 15, color: '#06b6d4' },
}

export default function FocusTimer({ tasks, sessions: initialSessions, userId }: Props) {
  const [mode, setMode]               = useState<Mode>('focus')
  const [customMinutes, setCustomMinutes] = useState(25)
  const [timeLeft, setTimeLeft]       = useState(25 * 60)
  const [isRunning, setIsRunning]     = useState(false)
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [sessions, setSessions]       = useState<FocusSession[]>(initialSessions)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionStartRef = useRef<string | null>(null)
  const totalSeconds = (mode === 'focus' ? customMinutes : MODES[mode].minutes) * 60

  useEffect(() => {
    setTimeLeft((mode === 'focus' ? customMinutes : MODES[mode].minutes) * 60)
    setIsRunning(false)
  }, [mode, customMinutes])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current!)
    }
    return () => clearInterval(intervalRef.current!)
  }, [isRunning])

  async function handleStart() {
    if (mode === 'focus') {
      sessionStartRef.current = new Date().toISOString()
    }
    setIsRunning(true)
  }

  async function handleComplete() {
    setIsRunning(false)
    if (mode === 'focus') {
      setCompletedPomodoros(p => p + 1)
      const { data } = await supabase.from('focus_sessions').insert({
        user_id: userId,
        task_id: selectedTask || null,
        duration_min: customMinutes,
        completed: true,
        started_at: sessionStartRef.current,
      }).select().single()
      if (data) setSessions(prev => [data, ...prev])
      // Auto switch to break
      setMode(completedPomodoros > 0 && (completedPomodoros + 1) % 4 === 0 ? 'long_break' : 'short_break')
    } else {
      setMode('focus')
    }
  }

  async function handleStop() {
    setIsRunning(false)
    if (mode === 'focus' && sessionStartRef.current) {
      const elapsed = Math.round((totalSeconds - timeLeft) / 60)
      if (elapsed >= 1) {
        const { data } = await supabase.from('focus_sessions').insert({
          user_id: userId,
          task_id: selectedTask || null,
          duration_min: elapsed,
          completed: false,
          started_at: sessionStartRef.current,
        }).select().single()
        if (data) setSessions(prev => [data, ...prev])
      }
    }
    setTimeLeft((mode === 'focus' ? customMinutes : MODES[mode].minutes) * 60)
  }

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100
  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference - (progress / 100) * circumference
  const currentColor = MODES[mode].color
  const totalFocusMin = sessions.filter(s => s.completed).reduce((acc, s) => acc + s.duration_min, 0)

  return (
    <div className="focus-wrapper">
      <div className="focus-main">

        {/* Mode tabs */}
        <div className="mode-tabs">
          {(Object.entries(MODES) as [Mode, typeof MODES[Mode]][]).map(([key, val]) => (
            <button
              key={key}
              className={`mode-tab ${mode === key ? 'active' : ''}`}
              style={{ '--mode-color': val.color } as React.CSSProperties}
              onClick={() => { if (!isRunning) setMode(key) }}
              disabled={isRunning}
            >
              {val.label}
            </button>
          ))}
        </div>

        {/* Timer circle */}
        <div className="timer-container">
          <svg className="timer-svg" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r="120" fill="none" stroke="var(--fd-border)" strokeWidth="8" />
            <circle
              cx="140" cy="140" r="120"
              fill="none"
              stroke={currentColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 140 140)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="timer-display">
            <div className="timer-time" style={{ color: currentColor }}>
              {minutes}:{seconds}
            </div>
            <div className="timer-mode-label">{MODES[mode].label}</div>
            {completedPomodoros > 0 && (
              <div className="pomodoro-dots">
                {Array.from({ length: Math.min(completedPomodoros, 4) }).map((_, i) => (
                  <span key={i} className="pomodoro-dot" style={{ background: currentColor }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          {!isRunning ? (
            <button className="control-btn play-btn" style={{ background: currentColor }} onClick={handleStart}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
          ) : (
            <>
              <button className="control-btn pause-btn" onClick={() => setIsRunning(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              </button>
              <button className="control-btn play-btn" style={{ background: currentColor }} onClick={() => setIsRunning(true)} disabled={isRunning}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>
              <button className="control-btn stop-btn" onClick={handleStop}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              </button>
            </>
          )}
        </div>

        {/* Task selector */}
        <div className="task-selector">
          <label className="fd-label">Tarea activa</label>
          <select className="fd-input" value={selectedTask} onChange={e => setSelectedTask(e.target.value)}>
            <option value="">Sin tarea seleccionada</option>
            {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>

        {/* Settings */}
        <button className="settings-toggle" onClick={() => setShowSettings(!showSettings)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          Personalizar duración
        </button>

        {showSettings && (
          <div className="settings-panel">
            <label className="fd-label">Duración focus: {customMinutes} min</label>
            <input
              type="range" min="5" max="90" step="5"
              value={customMinutes}
              onChange={e => setCustomMinutes(Number(e.target.value))}
              disabled={isRunning}
              className="range-input"
              style={{ '--range-color': currentColor } as React.CSSProperties}
            />
            <div className="range-labels">
              <span>5 min</span>
              <span>90 min</span>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar stats */}
      <div className="focus-sidebar">
        <div className="fd-card focus-stats-card">
          <h3 className="card-title">Resumen</h3>
          <div className="focus-stats">
            <div className="focus-stat">
              <span className="focus-stat-value">{completedPomodoros}</span>
              <span className="focus-stat-label">Pomodoros hoy</span>
            </div>
            <div className="focus-stat">
              <span className="focus-stat-value">{totalFocusMin}</span>
              <span className="focus-stat-label">Minutos totales</span>
            </div>
            <div className="focus-stat">
              <span className="focus-stat-value">{sessions.filter(s => s.completed).length}</span>
              <span className="focus-stat-label">Sesiones totales</span>
            </div>
          </div>
        </div>

        <div className="fd-card focus-history-card">
          <h3 className="card-title">Historial reciente</h3>
          {sessions.length === 0 ? (
            <p className="empty-history">No hay sesiones aún. ¡Empieza tu primera!</p>
          ) : (
            <div className="history-list">
              {sessions.slice(0, 8).map(s => (
                <div key={s.id} className="history-item">
                  <div className={`history-dot ${s.completed ? 'completed' : 'partial'}`} />
                  <div className="history-info">
                    <span className="history-duration">{s.duration_min} min</span>
                    <span className="history-date">
                      {new Date(s.started_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`history-badge ${s.completed ? 'badge-done' : 'badge-partial'}`}>
                    {s.completed ? 'Completada' : 'Parcial'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}