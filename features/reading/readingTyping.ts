export type ReadingStatus =  'start' | 'continue' | 'ended';

export interface CreateReadingSessionPayload {
    root_session_id?: string;
    user_id?: string; // uuid4 coming from supabase
    ended_at?: string;
    current_chapter_number: number;
    current_verse_number: number;
    status: ReadingStatus;
    total_read_seconds?: number;
    daily_target_seconds?: number;
    seconds_read?: number;
}

export interface UpdateReadingSessionPayload {
    notes?: string;
}

export interface GetLatestSessionQuery {
    verse_key: string;
}

export interface GetSessionQuery {
    from: number;
    to: number;
    status?: ReadingStatus;
    verseKey?: string;
}