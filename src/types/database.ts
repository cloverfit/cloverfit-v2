export interface Participant {
  id: string
  name: string
  pin_code: string
  email?: string
  birth_date?: string
  company_name?: string
  gender?: string
  created_by?: string
  created_at: string
}

export interface Instructor {
  id: string
  name: string
  email: string
  role: 'admin' | 'instructor'
  created_at: string
}

export interface Measurement {
  id: string
  participant_id: string
  instructor_id?: string
  measurement_date: string
  resting_hr: number
  max_hr: number
  recovery_hr: number
  recovery_amount: number
  total_score: number
  fatigue?: number
  concentration?: number
  stress?: number
  sleep_quality?: number
  subjective_score?: number
  notes?: string
  created_at: string
}

export interface Feedback {
  id: string
  measurement_id: string
  auto_score_feedback?: string
  auto_recovery_feedback?: string
  auto_trend_feedback?: string
  instructor_good_points?: string
  instructor_improvements?: string
  next_suggestion?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface MeasurementWithFeedback extends Measurement {
  feedback?: Feedback
  participant?: Participant
}
