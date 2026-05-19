export type GoalType = 'QURAN_TIME';
export type GoalCategory = 'COURSE' | 'QURAN';

export type GoalPayload = {
    type: GoalType;
    amount: string | number;
    duration?: number; // in days
    category: GoalCategory;
}

export type GenerateGoalPayload = {
    type: GoalType;
    amount: string | number;
    duration?: number; // in days
}

export interface GoalInfo {
    id: string;
    date: string; // atau Date kalau mau diparse
    progress: number;
    type: "QURAN"; // bisa juga dibuat union kalau ada tipe lain
    ranges: string[];
    pagesRead: number;
    secondsRead: number;
    versesRead: number;
    manuallyAddedSeconds: number;
    dailyTargetPages: number;
    dailyTargetSeconds: number;
    dailyTargetRanges: string[];
    remainingDailyTargetRanges: string[];
    mushafId: number;
    hasGoal: boolean;
    goalId: string;
}

export interface ActivityPayload {
    seconds: number;
    ranges: string[]; // ayah range -> 1:5-1:10
    mushafId: number;
    type: GoalCategory;
    date?: string;
}

export interface ActivityDaysQuery {
    from: string;
    to: string;
    type: GoalCategory;
    first?: number;
    last?: number;
}

export interface LongestStrike {
    strike_start: string;
    strike_end: string;
    strike_days: number;
    total_strikes: number;
}

export interface FailedStrikeDay {
  failed_date:  string;       // 'YYYY-MM-DD'
  failure_type: 'below_target' | 'no_activity';
  seconds_read: number;
  daily_target: number | null;
}

export interface FailedStrikeDaysParams {
  p_user_id: string;
  p_limit?:  number;
  p_offset?: number;
}

export interface FailedStrikeDaysResult {
  total_failed_days: number;
  limit:             number;
  offset:            number;
  results:           FailedStrikeDay[];
}

export interface StatsResult {
    total_read_seconds: number;
    total_unique_verses: number;
    total_unique_sessions: number;
}