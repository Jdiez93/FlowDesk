import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Habit, HabitLog } from '../../lib/supabase'
import HabitCard from './HabitCard'
import HabitModal from './HabitModal'
import HeatmapCalendar from './HeatmapCalendar'

type Props = {
  habits: Habit[]
  logs: HabitLog[]
  userId: string
}

export default function HabitTracker({ habits: initialHabits, logs: initialLogs, userId }: Props) {
  const [habits, setHabits]   = useState<Habit[]>(initialHabits)
  const [logs, setLogs]       = useState<HabitLog[]>(initialLogs)
  const [showModal, setShowModal]     = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [activeTab, setActiveTab]     = useState<'today' | 'stats'>('today')

  const today = new Date().toISOString().split('T')[0]
  const todayLogs = new Set(logs.filter(l => l.logged_date === today).map(l => l.habit_id))

  const completedToday  = habits.filter(h => h.is_active && todayLogs.has(h.id)).length
  const activeHabits    = habits.filter(h => h.is_active).length
  const completionRate  = activeHabits > 0 ? Math.round((completedToday / activeHabits) * 100) : 0

  async function toggleHabit(habitId: string) {
    if (todayLogs.has(habitId)) {
      // Desmarcar
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('logged_date', today)
        .eq('user_id', userId)

      setLogs(prev => prev.filter(l => !(l.habit_id === habitId && l.logged_date === today)))
    } else {
      // Marcar
      const { data } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: userId, logged_date: today })
        .select()
        .single()

      if (data) setLogs(prev => [...prev, data])
    }
  }

  async function handleSaveHabit(habitData: Partial<Habit>) {
    if (editingHabit) {
      const { data } = await supabase
        .from('habits')
        .update(habitData)
        .eq('id', editingHabit.id)
        .select()
        .single()
      if (data) setHabits(prev => prev.map(h => h.id === data.id ? data : h))
    } else {
      const { data } = await supabase
        .from('habits')
        .insert({ ...habitData, user_id: userId })
        .select()
        .single()
      if (data) setHabits(prev => [...prev, data])
    }
    setShowModal(false)
    setEditingHabit(null)
  }

  async function handleDeleteHabit(habitId: string) {
    await supabase.from('habits').delete().eq('id', habitId)
    setHabits(prev => prev.filter(h => h.id !== habitId))
    setShowModal(false)
    setEditingHabit(null)
  }

  function getStreak(habitId: string): number {
    const habitLogs = logs
      .filter(l => l.habit_id === habitId)
      .map(l => l.logged_date)
      .sort((a, b) => b.localeCompare(a))

    if (habitLogs.length === 0) return 0

    let streak = 0
    const current = new Date()

    for (let i = 0; i < 365; i++) {
      const d = new Date(current)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (habitLogs.includes(dateStr)) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  }

  function getHabitLogs(habitId: string) {
    return logs.filter(l => l.habit_id === habitId)
  }

  return (
    <div className="habits-wrapper">

      {/* Header */}
      <div className="habits-header">
        <div>
          <h2 className="habits-title">Mis hábitos</h2>
          <p className="habits-subtitle">Construye rutinas que transformen tu vida</p>
        </div>
        <button className="fd-btn fd-btn-primary" onClick={() => { setEditingHabit(null); setShowModal(true) }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo hábito
        </button>
      </div>

      {/* Daily progress bar */}
      {activeHabits > 0 && (
        <div className="daily-progress-card">
          <div className="daily-progress-header">
            <div>
              <span className="daily-progress-title">Progreso de hoy</span>
              <span className="daily-progress-sub">{completedToday} de {activeHabits} hábitos completados</span>
            </div>
            <span className="daily-progress-pct" style={{ color: completionRate === 100 ? '#10b981' : 'var(--fd-primary)' }}>
              {completionRate}%
            </span>
          </div>
          <div className="daily-progress-bar">
            <div
              className="daily-progress-fill"
              style={{
                width: `${completionRate}%`,
                background: completionRate === 100
                  ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                  : 'linear-gradient(90deg, #6366f1, #8b5cf6)'
              }}
            />
          </div>
          {completionRate === 100 && (
            <p className="daily-complete-msg">🎉 ¡Has completado todos tus hábitos hoy! Increíble.</p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="habits-tabs">
        <button className={`habits-tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
          📅 Hoy
        </button>
        <button className={`habits-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          📊 Estadísticas
        </button>
      </div>

      {activeTab === 'today' && (
        <>
          {habits.length === 0 ? (
            <div className="habits-empty">
              <div className="habits-empty-icon">✨</div>
              <h3>Crea tu primer hábito</h3>
              <p>Los pequeños cambios diarios generan grandes transformaciones</p>
              <button className="fd-btn fd-btn-primary" onClick={() => setShowModal(true)}>
                Empezar ahora
              </button>
            </div>
          ) : (
            <div className="habits-grid">
              {habits.filter(h => h.is_active).map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={todayLogs.has(habit.id)}
                  streak={getStreak(habit.id)}
                  logs={getHabitLogs(habit.id)}
                  onToggle={() => toggleHabit(habit.id)}
                  onEdit={() => { setEditingHabit(habit); setShowModal(true) }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'stats' && (
        <div className="stats-section">
          {habits.length === 0 ? (
            <div className="habits-empty">
              <div className="habits-empty-icon">📊</div>
              <h3>Sin datos todavía</h3>
              <p>Crea hábitos y empieza a registrarlos para ver tus estadísticas</p>
            </div>
          ) : (
            habits.filter(h => h.is_active).map(habit => (
              <div key={habit.id} className="habit-stats-block fd-card">
                <div className="habit-stats-header">
                  <span className="habit-stats-icon">{habit.icon}</span>
                  <div>
                    <h4 className="habit-stats-name">{habit.name}</h4>
                    <span className="habit-stats-streak">
                      🔥 {getStreak(habit.id)} días de racha
                    </span>
                  </div>
                  <div className="habit-stats-meta">
                    <span className="habit-total-logs">{getHabitLogs(habit.id).length} registros totales</span>
                  </div>
                </div>
                <HeatmapCalendar
                  logs={getHabitLogs(habit.id)}
                  color={habit.color}
                />
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <HabitModal
          habit={editingHabit}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
          onClose={() => { setShowModal(false); setEditingHabit(null) }}
        />
      )}
    </div>
  )
}