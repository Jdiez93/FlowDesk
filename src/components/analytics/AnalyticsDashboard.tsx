import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts'
import type { Task, Habit, HabitLog, FocusSession } from '../../lib/supabase'

type Props = {
  tasks: Pick<Task, 'id' | 'status' | 'created_at'>[]
  habits: Pick<Habit, 'id' | 'name' | 'color' | 'icon'>[]
  logs: Pick<HabitLog, 'habit_id' | 'logged_date'>[]
  sessions: Pick<FocusSession, 'duration_min' | 'completed' | 'started_at'>[]
}

// Helpers
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function getLast30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })
}

function formatDate(date: string, short = true) {
  return new Date(date).toLocaleDateString('es-ES', short
    ? { day: 'numeric', month: 'short' }
    : { weekday: 'short' }
  )
}

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsDashboard({ tasks, habits, logs, sessions }: Props) {
  const last7  = getLast7Days()
  const last30 = getLast30Days()

  // ── Tasks completadas por día (últimos 7 días) ──
  const tasksByDay = last7.map(date => ({
    date: formatDate(date),
    completadas: tasks.filter(t => t.status === 'done' && t.created_at?.startsWith(date)).length,
    creadas: tasks.filter(t => t.created_at?.startsWith(date)).length,
  }))

  // ── Distribución de tareas por estado ──
  const tasksByStatus = [
    { name: 'Backlog',      value: tasks.filter(t => t.status === 'backlog').length,      color: '#94a3b8' },
    { name: 'En progreso',  value: tasks.filter(t => t.status === 'in_progress').length,  color: '#6366f1' },
    { name: 'Revisión',     value: tasks.filter(t => t.status === 'review').length,       color: '#f59e0b' },
    { name: 'Hecho',        value: tasks.filter(t => t.status === 'done').length,         color: '#10b981' },
  ].filter(s => s.value > 0)

  // ── Focus minutes por día (últimos 7 días) ──
  const focusByDay = last7.map(date => ({
    date: formatDate(date),
    minutos: sessions
      .filter(s => s.completed && s.started_at?.startsWith(date))
      .reduce((acc, s) => acc + s.duration_min, 0),
  }))

  // ── Hábitos completados por día (últimos 30 días) ──
  const habitsByDay = last30.map(date => ({
    date: formatDate(date),
    completados: logs.filter(l => l.logged_date === date).length,
    total: habits.length,
  }))

  // ── Hábito más consistente ──
  const habitConsistency = habits.map(h => ({
    name: `${h.icon} ${h.name}`,
    color: h.color,
    completados: logs.filter(l => l.habit_id === h.id).length,
    pct: last30.length > 0 ? Math.round((logs.filter(l => l.habit_id === h.id).length / last30.length) * 100) : 0,
  })).sort((a, b) => b.pct - a.pct)

  // ── KPIs ──
  const totalFocusMin   = sessions.filter(s => s.completed).reduce((acc, s) => acc + s.duration_min, 0)
  const totalDone       = tasks.filter(t => t.status === 'done').length
  const totalTasks      = tasks.length
  const completionRate  = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0
  const totalHabitLogs  = logs.length
  const avgHabitsPerDay = last30.length > 0 ? (totalHabitLogs / 30).toFixed(1) : '0'
  const bestStreak = (() => {
    if (logs.length === 0) return 0
    const dates = [...new Set(logs.map(l => l.logged_date))].sort()
    let max = 1, cur = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i-1])
      const curr = new Date(dates[i])
      const diff = (curr.getTime() - prev.getTime()) / 86400000
      cur = diff === 1 ? cur + 1 : 1
      max = Math.max(max, cur)
    }
    return max
  })()

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
            {p.name === 'minutos' ? ' min' : ''}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="analytics-wrapper">

      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Analytics</h2>
          <p className="analytics-subtitle">Tu productividad en números — últimos 30 días</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <div className="kpi-body">
            <span className="kpi-value">{completionRate}%</span>
            <span className="kpi-label">Tasa de completitud</span>
            <span className="kpi-sub">{totalDone} de {totalTasks} tareas</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="kpi-body">
            <span className="kpi-value">{totalFocusMin}</span>
            <span className="kpi-label">Minutos en foco</span>
            <span className="kpi-sub">{Math.round(totalFocusMin / 60 * 10) / 10}h totales</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="kpi-body">
            <span className="kpi-value">{avgHabitsPerDay}</span>
            <span className="kpi-label">Hábitos/día promedio</span>
            <span className="kpi-sub">{totalHabitLogs} registros totales</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            <span style={{ fontSize: '1.2rem' }}>🔥</span>
          </div>
          <div className="kpi-body">
            <span className="kpi-value">{bestStreak}</span>
            <span className="kpi-label">Mejor racha</span>
            <span className="kpi-sub">días consecutivos</span>
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="charts-grid-2">

        {/* Tareas por día */}
        <div className="chart-card fd-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Tareas creadas vs completadas</h3>
            <span className="chart-period">Últimos 7 días</span>
          </div>
          {tasks.length === 0 ? (
            <div className="chart-empty">Sin datos todavía</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tasksByDay} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--fd-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--fd-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--fd-text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="creadas"     name="Creadas"     fill="#e0e7ff" radius={[4,4,0,0]} />
                <Bar dataKey="completadas" name="Completadas" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribución por estado */}
        <div className="chart-card fd-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Distribución de tareas</h3>
            <span className="chart-period">Estado actual</span>
          </div>
          {tasksByStatus.length === 0 ? (
            <div className="chart-empty">Sin tareas todavía</div>
          ) : (
            <div className="pie-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {tasksByStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tareas`]} />
                  <Legend
                    formatter={(value) => <span style={{ fontSize: '0.78rem', color: 'var(--fd-text-muted)' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="charts-grid-1">

        {/* Focus por día */}
        <div className="chart-card fd-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Minutos de foco por día</h3>
            <span className="chart-period">Últimos 7 días</span>
          </div>
          {sessions.length === 0 ? (
            <div className="chart-empty">Sin sesiones todavía. ¡Usa el modo Focus!</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={focusByDay}>
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--fd-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--fd-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--fd-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="minutos" name="minutos" stroke="#f59e0b" strokeWidth={2.5} fill="url(#focusGrad)" dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 3 */}
      <div className="charts-grid-2">

        {/* Hábitos últimos 30 días */}
        <div className="chart-card fd-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Hábitos completados por día</h3>
            <span className="chart-period">Últimos 30 días</span>
          </div>
          {logs.length === 0 ? (
            <div className="chart-empty">Sin hábitos registrados todavía</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={habitsByDay.filter((_, i) => i % 3 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--fd-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--fd-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--fd-text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completados" name="Completados" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ranking de hábitos */}
        <div className="chart-card fd-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Consistencia por hábito</h3>
            <span className="chart-period">Últimos 30 días</span>
          </div>
          {habitConsistency.length === 0 ? (
            <div className="chart-empty">Crea hábitos para ver tu consistencia</div>
          ) : (
            <div className="consistency-list">
              {habitConsistency.map((h, i) => (
                <div key={i} className="consistency-row">
                  <span className="consistency-rank">#{i + 1}</span>
                  <span className="consistency-name">{h.name}</span>
                  <div className="consistency-bar-wrap">
                    <div className="consistency-bar-fill" style={{ width: `${h.pct}%`, background: h.color }} />
                  </div>
                  <span className="consistency-pct" style={{ color: h.color }}>{h.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}