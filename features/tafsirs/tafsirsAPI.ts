import api from "@/services/apiClient";
import { supabase } from "@/services/supabase";
import { CreateGoalPayload, GetVerseQuery, GoalResponse } from "./tafsirsTyping";

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("User is not authenticated");
    return session.user.id;
};

// ─── Tafsirs API ──────────────────────────────────────────────────────────────

// get tafsirs information
export const getTafsirsAPI = async (payload: string) => {
    try {
        const res = await api.get(`/content/api/v4/resources/tafsirs`);
        return res.data;
    } catch (error: any) {
        console.error("Error getting tafsirs:", error.response?.data);
        throw error;
    }
}

// create a goal
export const createGoalAPI = async (payload: CreateGoalPayload): Promise<GoalResponse> => {
    const userId = await getAuthenticatedUserId();

    return withRetry(async () => {
        const { data, error } = await supabase
            .from('goals')
            .insert({ ...payload, user_id: userId })
            .single();

        if (error) {
            console.error("Error creating goal:", error);
            throw error;
        }

        return data;
    });
};

// getting active goal
export const getActiveGoalAPI = async (user_id: string): Promise<GoalResponse | null> => {
    return withRetry(async () => {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user_id)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error("Error fetching active goal:", error);
            throw error;
        }

        return data;
    });
};

// updating active goal
export const updateActiveGoalAPI = async (
    goal_id: number,
    payload: Partial<CreateGoalPayload>,
): Promise<GoalResponse> => {
    return withRetry(async () => {
        const { data, error } = await supabase
            .from('goals')
            .update(payload)
            .eq('id', goal_id)
            .single();

        if (error) {
            console.error("Error updating active goal:", error);
            throw error;
        }

        return data;
    });
};

// ─── Quran Content API ────────────────────────────────────────────────────────

// get Uthmani Tajweed by key
export const getUthmaniTajweedWithKeyAPI = async (verseKey: string) => {
    try {
        const res = await api.get(`/content/api/v4/quran/verses/uthmani_tajweed`, {
            params: { verse_key: verseKey },
        });
        return res.data;
    } catch (error: any) {
        console.error("Error get Uthmani Tajweed:", error.response?.data);
        throw error;
    }
}

// get verse by key
export const getVerseByKeyAPI = async (verseKey: string, query: GetVerseQuery) => {
    const q = {
        language: query.language,
        tafsirs: 169,
        tafsir_fields: 'chapter_id,verse_key',
        fields: query.fields,
        words: false,
        translations: query.translations,
    }

    try {
        const res = await api.get(`/content/api/v4/verses/by_key/${verseKey}`, { params: q });
        return res.data;
    } catch (error: any) {
        console.error("Error get verse by key:", error.response?.data);
        throw error;
    }
}

// get verse by id
export const getVerseByIdAPI = async (verseId: string, query: GetVerseQuery) => {
    const q = {
        language: query.language,
        tafsirs: 169,
        tafsir_fields: 'chapter_id,verse_key',
        fields: query.fields,
        words: false,
        translations: query.translations,
    }

    try {
        const res = await api.get(`/content/api/v4/verses/by_id/${verseId}`, { params: q });
        return res.data;
    } catch (error: any) {
        console.error("Error get verse by id:", error.response?.data);
        throw error;
    }
}