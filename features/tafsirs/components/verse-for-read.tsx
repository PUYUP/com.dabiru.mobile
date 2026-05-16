import { getAllChapters, supabaseGetLatestSession } from "@/features/reading/readingThunk";
import { getUthmaniTajweedWithKey } from "@/features/tafsirs/tafsirsThunk";
import { getLatestSession } from "@/features/user/userThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { formatSeconds } from "@/utils/format-seconds";
import { getNextVerseKey } from "@/utils/generate-next-verse-key";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, useTheme } from "react-native-paper";
import VerseRenderer from "./verse-renderer";

interface Props {
    verseKey?: string;
}

// ─── Loading States ───────────────────────────────────────────────────────────
// Step 1: latestSession (QF)     → fetch verse key
// Step 2: sbLatestSession        → fetch supabase session
// Step 3: uthmaniTajweed         → fetch verse text, then render

type LoadingStep = 'session' | 'sb-session' | 'verse' | 'done';

function LoadingSkeleton({ step }: { step: LoadingStep }) {
    const message: Record<LoadingStep, string> = {
        'session': 'Memuat sesi...',
        'sb-session': 'Memeriksa progres...',
        'verse': 'Memuat ayat...',
        'done': '',
    };

    return (
        <View style={styles.card}>
            <Text style={styles.loadingText}>{message[step]}</Text>
        </View>
    );
}

export default function VerseForRead({ verseKey = '1:1' }: Props) {
    const theme = useTheme();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const uthmaniTajweed = useAppSelector((state: any) => state.tafsirs.uthmaniTajweed);
    const latestSession = useAppSelector((state: any) => state.user.latestSession);
    const sbLatestSession = useAppSelector((state: any) => state.reading.supabaseLatestSession);
    const sbCreateSession = useAppSelector((state: any) => state.reading.supabaseCreateSession);
    const chapters = useAppSelector((state: any) => state.reading.chapters);

    const [usedVerseKey, setUsedVerseKey] = useState<string>(verseKey);
    const [nextSurahName, setNextSurahName] = useState<string | undefined>();
    const [isEnded, setIsEnded] = useState<boolean>(false);
    const [secondsRead, setSecondsRead] = useState<number>(0);

    const surahVerseCounts = useMemo<Record<number, number>>(() => {
        const counts: Record<number, number> = {};
        chapters.data.forEach((item: any) => {
            counts[item.id] = item.verses_count;
        });
        return counts;
    }, [chapters.data]);

    const initialVerse = () => {
        setIsEnded(true);
        setSecondsRead(0);
        dispatch(getUthmaniTajweedWithKey(usedVerseKey) as any);
    }

    // ─── Step 1: Fetch QF latest session ─────────────────────────────────────
    useEffect(() => {
        dispatch(getLatestSession() as any);
        dispatch(getAllChapters() as any);
    }, []);

    // ─── Step 2: Fetch Supabase latest session berdasarkan QF verse key ───────
    useEffect(() => {
        if (latestSession.loading) return;
        if (latestSession.data) {
            const currentVerseKey = latestSession.data
                ? `${latestSession.data.chapterNumber}:${latestSession.data.verseNumber}`
                : usedVerseKey;

            dispatch(supabaseGetLatestSession({ verse_key: currentVerseKey }) as any);
        } else {
            // no qf session
            initialVerse();
        }
    }, [latestSession.loading]);

    // ─── Step 3: Tentukan verse key & fetch verse text ────────────────────────
    useEffect(() => {
        if (sbLatestSession.loading) return;
        if (sbLatestSession.data) {
            const { status, current_chapter_number, current_verse_number } = sbLatestSession.data;
            const currentVerseKey = `${current_chapter_number}:${current_verse_number}`;
            const ended = status === 'ended';

            setIsEnded(ended);
            setSecondsRead(sbLatestSession.data.total_read_seconds ?? 0);

            if (ended) {
                const nextVerseKey = getNextVerseKey(currentVerseKey, surahVerseCounts);
                if (!nextVerseKey) return;

                const nextChapterNumber = Number(nextVerseKey.split(':')[0]);
                const surah = chapters.data.find((item: any) => item.id === nextChapterNumber);

                if (surah) {
                    setNextSurahName(surah.name_complex);
                    setUsedVerseKey(nextVerseKey);
                }

                dispatch(getUthmaniTajweedWithKey(nextVerseKey) as any);
            } else {
                const surah = chapters.data.find(
                    (item: any) => item.id === latestSession.data?.chapterNumber
                );

                if (surah) {
                    setNextSurahName(surah.name_complex);
                    setUsedVerseKey(currentVerseKey);
                }

                dispatch(getUthmaniTajweedWithKey(currentVerseKey) as any);
            }
        } else {
            // no sb session
            if (latestSession.data) {
                const currentVerseKey = `${latestSession.data.chapterNumber}:${latestSession.data.verseNumber}`;
                const nextVerseKey = getNextVerseKey(currentVerseKey, surahVerseCounts);
                if (!nextVerseKey) return;

                const surah = chapters.data.find(
                    (item: any) => item.id === latestSession.data?.chapterNumber
                );

                if (surah) {
                    setNextSurahName(surah.name_complex);
                    setUsedVerseKey(currentVerseKey);
                }

                dispatch(getUthmaniTajweedWithKey(currentVerseKey) as any);
            } else {
                initialVerse();
            }
        }
    }, [sbLatestSession.loading]);

    useEffect(() => {
        if (sbLatestSession.data) {
            const { status, current_chapter_number, current_verse_number } = sbLatestSession.data;
            const ended = status === 'ended';

            setIsEnded(ended);
            setSecondsRead(sbLatestSession.data.total_read_seconds ?? 0);
        }
    }, [sbLatestSession.data]);

    // ─── Step 4: Handle setelah create session (dari tafsir-reader) ───────────
    useEffect(() => {
        if (!sbCreateSession.data || sbCreateSession.data.status !== 'ended') return;

        const { current_chapter_number, current_verse_number } = sbCreateSession.data;
        const currentVerseKey = `${current_chapter_number}:${current_verse_number}`;
        const nextVerseKey = getNextVerseKey(currentVerseKey, surahVerseCounts);
        if (!nextVerseKey) return;

        const nextChapterNumber = Number(nextVerseKey.split(':')[0]);
        const surah = chapters.data.find((item: any) => item.id === nextChapterNumber);

        if (surah) {
            setNextSurahName(surah.name_complex);
            setUsedVerseKey(nextVerseKey);
        }

        dispatch(getUthmaniTajweedWithKey(nextVerseKey) as any);
        setSecondsRead(0);
        setIsEnded(true);
    }, [sbCreateSession.data]);

    // ─── Loading per step ─────────────────────────────────────────────────────
    if (chapters.loading || latestSession.loading) {
        return <LoadingSkeleton step="session" />;
    }
    if (sbLatestSession.loading) {
        return <LoadingSkeleton step="sb-session" />;
    }

    // ✅ Hanya hide jika belum pernah ada data (initial load)
    // Jika sudah ada data sebelumnya, biarkan render dengan data lama
    if (uthmaniTajweed.loading && !uthmaniTajweed.data) {
        return <LoadingSkeleton step="verse" />;
    }
    if (!uthmaniTajweed.data) return null;

    const onRead = () => {
        try {
            router.push({
                pathname: '/tafsir-reader',
                params: {
                    verseKey: usedVerseKey,
                    source: 'verse-for-read',
                },
            });
        } catch (e) {
            console.log('router.push error:', e);
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                        <MaterialIcons name="chrome-reader-mode" style={{ fontSize: 22 }} />

                        <View style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
                            <Text style={styles.label}>{nextSurahName}</Text>
                            <Text style={styles.label}>({usedVerseKey})</Text>
                        </View>
                        
                    </View>

                    {secondsRead > 0 && !isEnded && (
                        <View style={styles.minuteText}>
                            <Text style={{ fontWeight: 700, color: theme.colors.primary, fontSize: 16 }}>
                                {formatSeconds(secondsRead)}
                            </Text>
                            <Text style={{ fontSize: 16, color: '#424242' }}>so far</Text>
                        </View>
                    )}
                </View>
                
                <View>
                    <Button onPress={onRead} mode="contained">
                        <Text style={styles.buttonText}>
                            {!isEnded ? 'Continue' : 'Read Tafsir'}
                        </Text>
                    </Button>
                </View>
            </View>

            <VerseRenderer
                verseText={uthmaniTajweed.data.text_uthmani_tajweed}
                fontSize={22}
                lineHeight={42}
            />
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
        marginBottom: 1,
        justifyContent: 'space-between',
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
    ctaWrapper: {
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    minuteText: {
        color: '#343434',
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
    }
});