import { supabaseGetSession } from "@/features/reading/readingThunk";
import { GetSessionQuery } from "@/features/reading/readingTyping";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    View,
} from "react-native";

export default function HistoryDetailScreen() {
    const dispatch = useAppDispatch();
    const { id, verseKey } = useLocalSearchParams();

    const session = useAppSelector(
        (state: any) => state.reading.supabaseSession
    );

    const query: GetSessionQuery = {
        from: 0,
        to: 1,
        status: "ended",
        verseKey: verseKey as string,
    };

    useEffect(() => {
        dispatch(supabaseGetSession(query) as any);
    }, []);

    if (session.loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});