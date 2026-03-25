import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Tipos de la base de datos
export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  emoji: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  status: 'backlog' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export type TaskChecklist = {
  id: string
  task_id: string
  text: string
  completed: boolean
  order_index: number
  created_at: string
}

export type Habit = {
  id: string
  user_id: string
  name: string
  description: string | null
  frequency: 'daily' | 'weekly'
  color: string
  icon: string
  is_active: boolean
  created_at: string
}

export type HabitLog = {
  id: string
  habit_id: string
  user_id: string
  logged_date: string
  created_at: string
}

export type FocusSession = {
  id: string
  user_id: string
  task_id: string | null
  duration_min: number
  completed: boolean
  started_at: string
}