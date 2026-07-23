/** Row shapes as they exist in the Supabase `public` schema. */

export type ThemeRow = 'system' | 'light' | 'dark';
export type CategoryTypeRow = 'Progression' | 'Essentiel' | 'Perte de temps';

export type ProfileRow = {
  id: string;
  username: string | null;
  created_at: string;
  updated_at: string;
};

export type SettingsRow = {
  id: string;
  user_id: string;
  theme: ThemeRow;
  day_start: string; // "HH:MM:SS"
  day_end: string;
  notifications_enabled: boolean;
  score_enabled: boolean;
};

export type CategoryRow = {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string;
  type: CategoryTypeRow;
  goal_minutes: number;
  position: number;
  is_hidden: boolean;
  is_default: boolean;
};

export type DayRow = {
  id: string;
  user_id: string;
  day_date: string; // "YYYY-MM-DD"
  score: number;
  total_minutes: number;
  note: string | null;
};

export type ActivityRow = {
  id: string;
  day_id: string;
  category_id: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
};

export type DayWithActivitiesRow = DayRow & { activities: ActivityRow[] };
