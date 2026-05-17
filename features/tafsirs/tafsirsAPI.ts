import api from "@/services/apiClient";
import { supabase } from "@/services/supabase";
import { withRetry } from "@/utils/retry-helper";
import { CreateGoalPayload, GetRangeQuery, GetVerseQuery, GoalResponse, TafsirSummarizerPayload } from "./tafsirsTyping";

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
        console.log("Error getting tafsirs:", error.response?.data);
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
            console.log("Error creating goal:", error);
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
            console.log("Error fetching active goal:", error);
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
            console.log("Error updating active goal:", error);
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
        console.log("Error get Uthmani Tajweed:", error.response?.data);
        throw error;
    }
}

// get verse by key
export const getVerseByKeyAPI = async (verseKey: string, query: GetVerseQuery) => {
    const q = {
        language: query.language,
        tafsirs: query.tafsirs ? query.tafsirs : '169',
        tafsir_fields: 'chapter_id,verse_key',
        fields: query.fields,
        words: true,
        word_fields: 'code_v2',
        translations: query.translations,
    }

    try {
        const res = await api.get(`/content/api/v4/verses/by_key/${verseKey}`, { params: q });
        return res.data;
    } catch (error: any) {
        console.log("Error get verse by key:", error.response?.data);
        throw error;
    }
}

// get verse with range
export const getVerseByRangeAPI = async (query: GetRangeQuery) => {
    const q = {
        language: query.language,
        tafsirs: query.tafsirs ? query.tafsirs : '169',
        tafsir_fields: 'chapter_id,verse_key',
        fields: query.fields,
        words: true,
        word_fields: 'code_v2',
        translations: query.translations,
        from: query.from,
        to: query.to,
    }

    try {
        const res = await api.get(`/content/api/v4/verses/by_range`, { params: q });
        return res.data;
    } catch (error: any) {
        console.log("Error get verse by range:", error.response?.data);
        throw error;
    }
}

// summarizing with AI
export const supabaseSummarizeTafsirAPI = async (
    payload: TafsirSummarizerPayload
) => {
    return withRetry(async () => {
        const { data, error } = await supabase.functions.invoke(
            'gpt-verse-summarizer',
            {
                body: {
                    surah_name: payload.surah_name,
                    chapter_number: payload.chapter_number,
                    verse_number: payload.verse_number,
                    tafsir_text: payload.tafsir_text,
                    language: payload.language,
                },
            }
        );

        if (error) {
            console.log(
                'Supabase summarize tafsir error:',
                error
            );

            throw error;
        }

        return data;
    });
};