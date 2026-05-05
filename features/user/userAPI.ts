import { MUSHAF_ID } from "@/constants/oauth";
import api from "@/services/apiClient";
import { ActivityPayload, GoalInfo, GoalPayload } from "./userTyping";

// create goal
export const createGoalAPI = async (payload: GoalPayload): Promise<GoalPayload> => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
        const res = await api.post(
            `/auth/v1/goals?mushafId=${MUSHAF_ID}`,
            payload,
            {
                headers: {
                    "x-timezone": timeZone
                }
            }
        );
        return res.data;
    } catch (error: any) {
        console.log("Error creating goal:", error.response.data); // Debug log
        throw error;
    }
};

// update goal
export const updateGoalAPI = async (data: GoalPayload, goalId: string): Promise<GoalPayload> => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
        const res = await api.put(
            `/auth/v1/goals/${goalId}?mushafId=${MUSHAF_ID}`,
            data,
            {
                headers: {
                    "x-timezone": timeZone
                }
            }
        );
        return res.data;
    } catch (error: any) {
        console.log("Error updating goal:", error.response.data); // Debug log
        throw error;
    }
};

// get goal
export const getGoalAPI = async (): Promise<GoalInfo> => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    try {
        const res = await api.get(`/auth/v1/goals/get-todays-plan?type=QURAN_TIME&mushafId=${MUSHAF_ID}`, {
            headers: {
                "x-timezone": timeZone
            }
        });
        return res.data.data;
    } catch (error: any) {
        console.log("Error fetching active goal:", error.response.data); // Debug log
        throw error;
    }
};

// add activity
export const addActivityAPI = async (payload: ActivityPayload): Promise<any> => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    try {
        const res = await api.post(`/auth/v1/activity-days`, payload, {
            headers: {
                "x-timezone": timeZone
            }
        });
        return res.data;
    } catch (error: any) {
        console.log("Error add activity:", error.response.data); // Debug log
        throw error;
    }
};