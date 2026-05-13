export type ReadingStatus = 'active' | 'paused' | 'ended';

export interface CreateReadingSessionPayload {
    user_id?: string; // uuid4 coming from supabase
    ended_at?: string;
    current_chapter_number: number;
    current_verse_number: number;
    status: ReadingStatus;
    paused_at?: string;
    total_paused_seconds?: number;
    total_read_seconds?: number;
    daily_target_seconds?: number;
    seconds_read?: number;
    start_from_seconds?: number;
}

export interface GetLatestSessionQuery {
    verse_key: string;
}