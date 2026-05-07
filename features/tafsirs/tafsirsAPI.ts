import api from "@/services/apiClient";
import { supabase } from "@/services/supabase";
import { CreateGoalPayload, GetVerseQuery, GoalResponse } from "./tafsirsTyping";

// get tafsirs information
export const getTafsirsAPI = async (payload: string) => {
    try {
        const res = await api.get(`/content/api/v4/resources/tafsirs`);
        return res.data;
    } catch (error: any) {
        console.log("Error getting tafsirs:", error.response.data); // Debug log
        throw error;
    }
}

// create a goal
export const createGoalAPI = async (payload: CreateGoalPayload): Promise<GoalResponse> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User is not authenticated");
    }

    // Ensure the user_id is included in the payload
    payload = { ...payload, user_id: session.user.id };
    const { data, error } = await supabase.from('goals').insert(payload).single();

    if (error) {
        console.log("Error creating goal:", error);
        throw error;
    }

    return data;
};

// getting active goal
export const getActiveGoalAPI = async (user_id: string): Promise<GoalResponse | null> => {
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
};

// updating active goal
export const updateActiveGoalAPI = async (goal_id: number, payload: Partial<CreateGoalPayload>): Promise<GoalResponse> => {
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
};

// get Uthmani Tajweed by key
export const getUthmaniTajweedWithKeyAPI = async (verseKey: string) => {
    const query = {
        verse_key: verseKey,
    }

    try {
        const res = await api.get(`/content/api/v4/quran/verses/uthmani_tajweed`, { params: query });
        return res.data;
    } catch (error: any) {
        console.log("Error get Uthmani Tajweed:", error.response.data); // Debug log
        throw error;
    }
}

// get verse by key
export const getVerseByKeyAPI = async (verseKey: string, query: GetVerseQuery) => {
    const q = {
        language: query.language,
        tafsirs: 169, // force to ibnu kathir
        fields: query.fields,
        words: true,
        translations: query.translations,
    }

    try {
        const res = await api.get(`/content/api/v4/verses/by_key/${verseKey}`, { params: q });
        return res.data;
    } catch (error: any) {
        console.log("Error get verse by key:", error.response.data); // Debug log
        throw error;
    }
}