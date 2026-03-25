import type { Habit, HabitLog } from '../../lib/supabase'

type Props = {
  habit: Habit
  isCompleted: boolean
  streak: number
  logs: HabitLog[]
  onToggle: () => void
  onEdit: () => void
}

export default function HabitCard({ habit, isCompleted, streak, logs, onToggle, onEdit }: Props) {
  // Últimos 7 días
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const logDates = new Set(logs.map(l => l.logged_date))

  return (
    <div className={`habit-card fd-card ${isCompleted ? 'habit-card-done' : ''}`} style={{ '--habit-color': habit.color } as React.CSSProperties}>
      <div className="habit-card-top">
        <div className="habit-card-info">
          <span className="habit-card-icon">{habit.icon}</span>
          <div>
            <h4 className="habit-card-name">{habit.name}</h4>
            {habit.description && <p className="habit-card-desc">{habit.description}</p>}
          </div>
        </div>
        <button className="habit-edit-btn" onClick={onEdit} title="Editar">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>

      {/* Weekly mini heatmap */}
      <div className="habit-week">
        {last7.map((date, i) => {
          const done = logDates.has(date)
          const isToday = i === 6
          return (
            <div key={date} className="habit-week-day">
              <span className="habit-week-label">
                {['L','M','X','J','V','S','D'][(new Date(date).getDay() + 6) % 7]}
              </span>
              <div
                className={`habit-week-dot ${done ? 'filled' : ''} ${isToday ? 'today' : ''}`}
                style={done ? { background: habit.color } : {}}
              />
            </div>
          )
        })}
      </div>

      <div className="habit-card-footer">
        <div className="habit-streak">
          <span className="streak-fire">🔥</span>
          <span className="streak-count">{streak}</span>
          <span className="streak-label">días</span>
        </div>

        <button
          className={`habit-check-btn ${isCompleted ? 'checked' : ''}`}
          style={isCompleted ? { background: habit.color, borderColor: habit.color } : {}}
          onClick={onToggle}
        >
          {isCompleted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Hecho
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              Marcar
            </>
          )}
        </button>
      </div>
    </div>
  )
}