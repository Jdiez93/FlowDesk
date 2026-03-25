import type { HabitLog } from '../../lib/supabase'

type Props = {
  logs: HabitLog[]
  color: string
}

export default function HeatmapCalendar({ logs, color }: Props) {
  const logDates = new Set(logs.map(l => l.logged_date))

  // Generar 90 días hacia atrás en semanas
  const today = new Date()
  const days: { date: string; month: string }[] = []

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().split('T')[0],
      month: d.toLocaleDateString('es-ES', { month: 'short' }),
    })
  }

  // Agrupar en semanas
  const weeks: typeof days[] = []
  let currentWeek: typeof days = []

  // Padding inicial para alinear con el día de la semana
  const firstDayOfWeek = (new Date(days[0].date).getDay() + 6) % 7
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: '', month: '' })
  }

  days.forEach(day => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })
  if (currentWeek.length > 0) weeks.push(currentWeek)

  // Meses únicos para el header
  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = ''
  weeks.forEach((week, wi) => {
    const month = week.find(d => d.date)?.month || ''
    if (month && month !== lastMonth) {
      monthLabels.push({ label: month, col: wi })
      lastMonth = month
    }
  })

  const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  return (
    <div className="heatmap-container">
      <div className="heatmap-scroll">
        {/* Month labels */}
        <div className="heatmap-months" style={{ gridTemplateColumns: `20px repeat(${weeks.length}, 14px)` }}>
          <div />
          {weeks.map((_, wi) => {
            const label = monthLabels.find(m => m.col === wi)
            return <div key={wi} className="heatmap-month-label">{label?.label || ''}</div>
          })}
        </div>

        {/* Grid */}
        <div className="heatmap-grid">
          {/* Day labels */}
          <div className="heatmap-days">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="heatmap-day-label">{i % 2 === 0 ? d : ''}</div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="heatmap-week">
              {Array.from({ length: 7 }, (_, di) => {
                const day = week[di]
                if (!day?.date) return <div key={di} className="heatmap-cell empty" />
                const done = logDates.has(day.date)
                const isToday = day.date === today.toISOString().split('T')[0]
                return (
                  <div
                    key={di}
                    className={`heatmap-cell ${done ? 'filled' : ''} ${isToday ? 'today' : ''}`}
                    style={done ? { background: color, opacity: 0.85 } : {}}
                    title={`${day.date}${done ? ' ✓' : ''}`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span>Menos</span>
          {[0.15, 0.35, 0.6, 0.85].map((op, i) => (
            <div key={i} className="heatmap-cell" style={{ background: color, opacity: op }} />
          ))}
          <span>Más</span>
        </div>
      </div>
    </div>
  )
}