import { getAllChapters, supabaseGetLatestSession, supabaseGetNextVerse } from "@/features/reading/readingThunk";
import { getVerseByRange } from "@/features/tafsirs/tafsirsThunk";
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
        'session': 'Loading session...',
        'sb-session': 'Progress checking...',
        'verse': 'Loading verse...',
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

    const latestSession = useAppSelector((state: any) => state.user.latestSession);
    const sbLatestSession = useAppSelector((state: any) => state.reading.supabaseLatestSession);
    const sbCreateSession = useAppSelector((state: any) => state.reading.supabaseCreateSession);
    const chapters = useAppSelector((state: any) => state.reading.chapters);
    const nextVerse = useAppSelector((state: any) => state.reading.supabaseNextVerse);
    const preferences = useAppSelector((state: any) => state.config.preferences);
    const verses = useAppSelector((state: any) => state.tafsirs.verses);

    const [nextSurahName, setNextSurahName] = useState<string | undefined>();
    const [isEnded, setIsEnded] = useState<boolean>(false);
    const [secondsRead, setSecondsRead] = useState<number>(0);
    const [renderVerse, setRenderVerse] = useState<string>('');
    const [verseRange, setVerseRange] = useState<string>('');

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

        const chapterNumber = Number(verseKey.split(':')[0]);
        const verseNumber = Number(verseKey.split(':')[1]);

        dispatch(supabaseGetNextVerse({
            chapter: chapterNumber,
            verse_start: verseNumber,
        }) as any);

        const surah = chapters.data.find((item: any) => item.id === chapterNumber);
        if (surah) {
            setNextSurahName(surah.name_simple);
        }
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
            let chapter: number = Number(verseKey.split(':')[0]);
            let verse: number = Number(verseKey.split(':')[1]);

            if (latestSession.data) {
                chapter = latestSession.data.chapterNumber;
                verse = latestSession.data.verseNumber;
            }

            dispatch(supabaseGetLatestSession({ 
                current_chapter_number: chapter,
                from_verse_number: verse,
            }) as any);
        } else {
            // no qf session
            initialVerse();
        }
    }, [latestSession.loading]);

    // ─── Step 3: Tentukan verse key & fetch verse text ────────────────────────
    useEffect(() => {
        if (sbLatestSession.loading) return;
        if (sbLatestSession.data) {
            const { status, current_chapter_number, from_verse_number } = sbLatestSession.data;
            const currentVerseKey = `${current_chapter_number}:${from_verse_number}`;
            const ended = status === 'ended';

            setIsEnded(ended);
            setSecondsRead(sbLatestSession.data.total_read_seconds ?? 0);

            if (ended) {
                const nextVerseKey = getNextVerseKey(currentVerseKey, surahVerseCounts);
                if (!nextVerseKey) return;

                const nextChapterNumber = Number(nextVerseKey.split(':')[0]);
                const nextVerseNumber = Number(nextVerseKey.split(':')[1]);
                const surah = chapters.data.find((item: any) => item.id === nextChapterNumber);

                if (surah) {
                    setNextSurahName(surah.name_simple);
                }

                dispatch(supabaseGetNextVerse({
                    chapter: nextChapterNumber,
                    verse_start: nextVerseNumber,
                }) as any);
            } else {
                const surah = chapters.data.find(
                    (item: any) => item.id === latestSession.data?.chapterNumber
                );

                if (surah) {
                    setNextSurahName(surah.name_simple);
                }

                dispatch(supabaseGetNextVerse({
                    chapter: current_chapter_number,
                    verse_start: from_verse_number,
                }) as any);
            }
        } else {
            // no sb session
            initialVerse();
        }
    }, [sbLatestSession.loading]);

    useEffect(() => {
        if (sbLatestSession.data) {
            const { status } = sbLatestSession.data;
            const ended = status === 'ended';

            setIsEnded(ended);
            setSecondsRead(sbLatestSession.data.total_read_seconds ?? 0);
        }
    }, [sbLatestSession.data]);

    // ─── Step 4: Handle setelah create session (dari tafsir-reader) ───────────
    useEffect(() => {
        if (!sbCreateSession.data || sbCreateSession.data.status !== 'ended') return;

        const { current_chapter_number, to_verse_number } = sbCreateSession.data;
        const currentVerseKey = `${current_chapter_number}:${to_verse_number}`;
        const nextVerseKey = getNextVerseKey(currentVerseKey, surahVerseCounts);
        if (!nextVerseKey) return;

        const nextChapterNumber = Number(nextVerseKey.split(':')[0]);
        const nextVerseNumber = Number(nextVerseKey.split(':')[1]);
        const surah = chapters.data.find((item: any) => item.id === nextChapterNumber);

        if (surah) {
            setNextSurahName(surah.name_simple);
        }
        
        dispatch(supabaseGetNextVerse({
            chapter: nextChapterNumber,
            verse_start: nextVerseNumber,
        }) as any);

        setSecondsRead(0);
        setIsEnded(true);
    }, [sbCreateSession.data]);

    // getting next verses
    useEffect(() => {
        if (nextVerse.loading) return;
        if (!nextVerse.data) return;

        const chapter = nextVerse.data.chapter;
        const start: number = nextVerse.data.verse_start;
        const end: number = nextVerse.data.verse_end;

        // ensure start/end are typed as numbers to avoid comparing incompatible literal types
        // const start: number = 4;
        // const end: number = 6;

        const from: string = chapter + ':' + start;
        const to: string = chapter + ':' + end;

        dispatch(getVerseByRange({
            query: {
                language: preferences.language.language,
                tafsirs: preferences.tafsirs.selectedTafsirs[0],
                translations: preferences.translations.selectedTranslations[0],
                fields: 'text_uthmani_tajweed,chapter_id,verse_key',
                from: from,
                to: to,
            },
        }) as any);

        if (start != end) {
            setVerseRange(start + '-' + end);
        } else {
            setVerseRange(start.toString());
        }
    }, [nextVerse]);

    // build verse for render
    useEffect(() => {
        if (verses.loading) return;
        if (!verses.data || verses.data.length <= 0) return;

        const textUthmani = verses.data.map((item: any) => item.text_uthmani_tajweed);
        setRenderVerse(textUthmani.join(' '));
    }, [verses]);

    // ─── Loading per step ─────────────────────────────────────────────────────
    if (chapters.loading || latestSession.loading) {
        return <LoadingSkeleton step="session" />;
    }
    if (sbLatestSession.loading) {
        return <LoadingSkeleton step="sb-session" />;
    }

    // ✅ Hanya hide jika belum pernah ada data (initial load)
    // Jika sudah ada data sebelumnya, biarkan render dengan data lama
    if (verses.loading || nextVerse.loading) {
        return <LoadingSkeleton step="verse" />;
    }
    if (!verses.data && !nextVerse.data) return null;

    const onRead = () => {
        try {
            router.push({
                pathname: '/tafsir-reader',
                params: {
                    chapter: nextVerse.data.chapter,
                    from: nextVerse.data.verse_start,
                    to: nextVerse.data.verse_end,
                    // from: 4,
                    // to: 6,
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
                            <Text style={styles.label}>({verseRange})</Text>
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
                verseText={renderVerse}
                fontSize={24}
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
        fontSize: 16,
        fontWeight: '500',
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