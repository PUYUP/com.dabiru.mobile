export type GoalType = 'QURAN_TIME';
export type GoalCategory = 'COURSE' | 'QURAN';

export type GoalPayload = {
    type: GoalType;
    amount: string | number;
    duration: number; // in days
    category: GoalCategory;
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