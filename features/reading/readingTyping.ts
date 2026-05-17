export type ReadingStatus =  'start' | 'continue' | 'ended';

export interface CreateReadingSessionPayload {
    root_session_id?: string;
    user_id?: string; // uuid4 coming from supabase
    ended_at?: string;
    current_chapter_number: number;
    from_verse_number: number;
    to_verse_number: number;
    status: ReadingStatus;
    total_read_seconds?: number;
    daily_target_seconds?: number;
    seconds_read?: number;
}

export interface UpdateReadingSessionPayload {
    notes?: string;
}

export interface GetLatestSessionQuery {
    current_chapter_number: number;
    from_verse_number: number;
    to_verse_number?: number;
}

export interface GetSessionQuery {
    from: number;
    to: number;
    status?: ReadingStatus;
    chapter?: number;
    from_verse_number?: number;
    to_verse_number?: number;
}

export interface GetTafsirQuery {
    from?: number;
    to?: number;
    chapter?: number;
    verse_start?: number;
}