import { supabase } from "@/services/supabase";
import { CreateGoalPayload, GoalResponse } from "./tafsirsTyping";

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