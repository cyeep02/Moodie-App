/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'student' | 'guardian' | 'teacher';

export interface User {
  user_id: string;
  full_name: string;
  student_email: string;
  password?: string;
  role: Role;
  parent_name: string;
  parent_email: string;
  class_name: string;
  age: number;
  created_at: string;
  last_login?: string;
  status: 'active' | 'inactive';
}

export type MoodLabel = 'Very Happy' | 'Happy' | 'Calm' | 'Worried' | 'Sad' | 'Very Sad';

export interface MoodLog {
  log_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  mood_emoji: string;
  mood_label: MoodLabel;
  mood_score: number;
  note: string;
  risk_flag: boolean;
  created_at: string;
}

export interface ActivityLog {
  activity_id: string;
  user_id: string;
  result_name: string;
  duration: number;
  date: string;
  time: string;
  created_at: string;
}

export interface Alert {
  alert_id: string;
  user_id: string;
  date: string;
  time: string;
  trigger_reason: string;
  recent_mood_summary: string;
  parent_notified: boolean;
  notification_status: string;
  created_at: string;
}

export const MOOD_CONFIG: Record<MoodLabel, { emoji: string; score: number; color: string }> = {
  'Very Happy': { emoji: '🤩', score: 6, color: '#FFD700' },
  'Happy': { emoji: '😊', score: 5, color: '#90EE90' },
  'Calm': { emoji: '😌', score: 4, color: '#ADD8E6' },
  'Worried': { emoji: '😟', score: 3, color: '#FFB6C1' },
  'Sad': { emoji: '😢', score: 2, color: '#B0C4DE' },
  'Very Sad': { emoji: '😭', score: 1, color: '#D3D3D3' },
};
