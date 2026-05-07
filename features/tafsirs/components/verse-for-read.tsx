import { getUthmaniTajweedWithKey } from "@/features/tafsirs/tafsirsThunk";
import { createReadingSession } from "@/features/user/userThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import VerseRenderer from "./verse-renderer";

interface Props {
    verseKey: string;
}

function LoadingSkeleton() {
    return (
        <View style={styles.card}>
            <Text style={styles.loadingText}>Memuat...</Text>
        </View>
    );
}

export default function VerseForRead({ verseKey }: Props) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const uthmaniTajweed = useAppSelector((state: any) => state.tafsirs.uthmaniTajweed);

    useEffect(() => {
        if (verseKey) {
            dispatch(getUthmaniTajweedWithKey(verseKey) as any);
        }
    }, [verseKey]);

    if (!verseKey) return null;
    if (uthmaniTajweed.loading) return <LoadingSkeleton />;
    if (!uthmaniTajweed.data) return null;

    const verseKeys = verseKey.split(':');

    const onRead = () => {
        router.push({
            pathname: '/tafsir-reader',
            params: {
                verseKey: verseKey,
            }
        });

        // create session
        dispatch(createReadingSession({
            chapterNumber: parseInt(verseKeys[0]),
            verseNumber: parseInt(verseKeys[1]),
        }) as any);
    }

    return (
        <View style={styles.card}>
            {/* Label */}
            <View style={styles.header}>
                <MaterialIcons name="chrome-reader-mode" style={{ fontSize: 22 }} />
                <Text style={styles.label}>Next Ayah</Text>
            </View>

            <VerseRenderer verseText={uthmaniTajweed.data} fontSize={22} lineHeight={42} />

            {/* CTA */}
            <Button onPress={onRead} mode="contained" style={{ marginTop: 10 }}>
                <Text style={styles.buttonText}>Read Tafsir {verseKey}</Text>
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: '#e0e0e0',
        padding: 16,
        gap: 12,
    },
    loadingText: {
        color: '#888',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A2E',
    },
    verseKey: {
        fontSize: 13,
        color: '#888',
    },
    button: {
        backgroundColor: '#111',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});