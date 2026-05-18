import api from "@/services/apiClient";
import { supabase } from "@/services/supabase";
import { CreateReadingSessionPayload, GetLatestSessionQuery, GetSessionQuery, GetTafsirQuery, UpdateReadingSessionPayload } from "./readingTyping";

// ─── Retry Helper ────────────────────────────────────────────────────────────

const withRetry = async <T>(
    fn: () => Promise<T>,
    retries: number = 1,
    delayMs: number = 300,
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return withRetry(fn, retries - 1, delayMs);
    }
};

// ─── Auth Helper ─────────────────────────────────────────────────────────────

const getAuthenticatedUserId = async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User is not authenticated");
    return user.id;
};

// ─── Reading Session APIs ─────────────────────────────────────────────────────

// log reading session
export const supabaseCreateReadingSessionAPI = async (
    payload: CreateReadingSessionPayload,
) => {
    const userId = await getAuthenticatedUserId();

    return withRetry(async () => {
        const { data, error } = await supabase
            .from("reading_sessions")
            .insert({ ...payload, user_id: userId })
            .select("*")
            .single();

        if (error) {
            console.log("Supabase create reading session error:", error);
            throw error;
        }

        return data;
    });
};

// update session
export const supabaseUpdateReadingSessionAPI = async (
    payload: UpdateReadingSessionPayload,
    id: string,
) => {
    return withRetry(async () => {
        const { data, error } = await supabase
            .from("reading_sessions")
            .update(payload)
            .eq('id', id)
            .select("*")
            .single();

        if (error) {
            console.log("Supabase update reading session error:", error);
            throw error;
        }

        return data;
    });
};

// get latest session
export const supabaseGetLatestSessionAPI = async (
    query: GetLatestSessionQuery,
) => {
    const userId = await getAuthenticatedUserId();

    return withRetry(async () => {
        let qs = supabase
            .from("reading_sessions")
            .select("*")
            .eq("user_id", userId);
        
        if (query.current_chapter_number) {
            qs = qs.eq('current_chapter_number', query.current_chapter_number);
        }

        if (query.from_verse_number) {
            qs = qs.eq('from_verse_number', query.from_verse_number);
        }

        if (query.to_verse_number) {
            qs = qs.eq('to_verse_number', query.to_verse_number);
        }

        const { data, error } = await qs
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            console.log("Supabase getting reading session error:", error);
            throw error;
        }

        return data[0];
    });
};

// get latest ended session
export const supabaseGetLatestEndedSessionAPI = async (
    query: GetLatestSessionQuery,
) => {
    const userId = await getAuthenticatedUserId();

    return withRetry(async () => {
        let qs = supabase
            .from("reading_sessions")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "ended");

         if (query.current_chapter_number) {
            qs = qs.eq('current_chapter_number', query.current_chapter_number);
        }

        if (query.from_verse_number) {
            qs = qs.eq('from_verse_number', query.from_verse_number);
        }

        if (query.to_verse_number) {
            qs = qs.eq('to_verse_number', query.to_verse_number);
        }

        const { data, error } = await qs
            .order("created_at", { ascending: false })
            .limit(1);
    
        if (error) {
            console.log("Supabase getting latest ended session error:", error);
            throw error;
        }

        return data[0];
    });
};

// get supabase sessions
export const supabaseGetSessionAPI = async (query: GetSessionQuery) => {
    const userId = await getAuthenticatedUserId();

    return withRetry(async () => {
        let querySet = supabase
            .from("reading_sessions")
            .select(`*`)
            .eq("user_id", userId);
        
        if (query.status) {
            querySet = querySet.eq('status', query.status);
        }

        if (query.chapter) {
            querySet = querySet.eq('current_chapter_number', query.chapter);
        }

        if (query.from_verse_number) {
            querySet = querySet.eq('from_verse_number', query.from_verse_number);
        }

        if (query.to_verse_number) {
            querySet = querySet.eq('to_verse_number', query.to_verse_number);
        }
        
        querySet = querySet
            .order("created_at", { ascending: false })
            .range(query.from, query.to);

        const { data, error } = await querySet;

        if (error) {
            console.log("Supabase getting sessions error:", error);
            throw error;
        }

        return data;
    });
};

// ─── Chapter APIs ─────────────────────────────────────────────────────────────

// get qf all chapters
export const getAllChaptersAPI = async () => {
    try {
        const res = await api.get(`/content/api/v4/chapters`);
        return res.data;
    } catch (error: any) {
        console.log("Error get chapters:", error.response?.data);
        throw error;
    }
};

// get sb tafsirs
export const supabaseGetTafsirsAPI = async (query: GetTafsirQuery) => {
    const { from, to, ...rest } = query;

    return withRetry(async () => {
        let querySet = supabase
            .from("tafsir_entries")
            .select(`*`)
            .match(rest);

        const { data, error } = await querySet;

        if (error) {
            console.log("Supabase getting tafsirs error:", error);
            throw error;
        }

        return data[0];
    });
};