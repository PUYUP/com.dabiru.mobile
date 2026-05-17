export type Goal = {
    year: number;
}

export type CreateGoalPayload = {
    user_id?: string;
} & Goal;

export type GoalResponse = {
    id: number;
    created_at: string;
    updated_at: string;
} & CreateGoalPayload;

export interface GetVerseQuery {
    language?: string;
    translations?: string;
    tafsirs?: string;
    fields?: string;
}

export interface GetRangeQuery extends GetVerseQuery {
    from: string;
    to: string;
}

export interface TafsirSummarizerPayload {
    surah_name: string;
    chapter_number: number;
    verse_number: number;
    tafsir_text: string;
    language: string;
}