import { getAllChapters, supabaseGetLatestSession, supabaseGetNextVerse } from "@/features/reading/readingThunk";
import { getVerseByRange } from "@/features/tafsirs/tafsirsThunk";
import { getLatestSession } from "@/features/user/userThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { formatSeconds } from "@/utils/format-seconds";
import { getNextVerseKey } from "@/utils/generate-next-verse-key";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, useTheme } from "react-native-paper";
import QuranText from "./quran-text";

interface Props {
    verseKey?: string;
}

type LoadingStep = 'session' | 'sb-session' | 'verse' | 'done';

function LoadingSkeleton({ step }: { step: LoadingStep }) {
    const message: Record<LoadingStep, string> = {
        session: 'Loading session...',
        'sb-session': 'Checking progress...',
        verse: 'Loading verse...',
        done: '',
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

    const latestSession    = useAppSelector((s: any) => s.user.latestSession);
    const sbLatestSession  = useAppSelector((s: any) => s.reading.supabaseLatestSession);
    const sbCreateSession  = useAppSelector((s: any) => s.reading.supabaseCreateSession);
    const chapters         = useAppSelector((s: any) => s.reading.chapters);
    const nextVerse        = useAppSelector((s: any) => s.reading.supabaseNextVerse);
    const preferences      = useAppSelector((s: any) => s.config.preferences);
    const verses           = useAppSelector((s: any) => s.tafsirs.verses);

    const [nextSurahName, setNextSurahName] = useState<string | undefined>();
    const [isEnded, setIsEnded]             = useState<boolean>(false);
    const [secondsRead, setSecondsRead]     = useState<number>(0);
    const [renderVerse, setRenderVerse]     = useState<string>('');
    const [verseRange, setVerseRange]       = useState<string>('');
    const [loadingStep, setLoadingStep]     = useState<LoadingStep>('session');

    // Dipakai untuk deteksi remount (close & reopen app)
    const initKey = useRef(0);
    const hasInitialized = useRef(false);

    const surahVerseCounts = useMemo<Record<number, number>>(() => {
        const counts: Record<number, number> = {};
        chapters.data.forEach((item: any) => {
            counts[item.id] = item.verses_count;
        });
        return counts;
    }, [chapters.data]);

    // ─── Helper: ambil nama surah dari chapter id ────────────────────────────
    const getSurahName = (chapterId: number): string | undefined =>
        chapters.data.find((item: any) => item.id === chapterId)?.name_simple;

    // ─── Helper: dispatch getNextVerse + update surahName ────────────────────
    const dispatchNextVerse = (chapter: number, verse: number) => {
        setNextSurahName(getSurahName(chapter));
        dispatch(supabaseGetNextVerse({ chapter, verse_start: verse }) as any);
    };

    // ─── Helper: fallback ke verseKey prop (last resort) ────────────────────
    const fallbackToVerseKeyProp = () => {
        setIsEnded(true);
        setSecondsRead(0);
        const [ch, vs] = verseKey.split(':').map(Number);
        dispatchNextVerse(ch, vs);
    };

    // ─── INIT: paksa re-fetch setiap kali komponen mount ────────────────────
    // Dengan increment initKey setiap mount, effect di bawah selalu jalan
    // bahkan jika redux state sudah ada dari sesi sebelumnya.
    useEffect(() => {
        initKey.current += 1;
        hasInitialized.current = false;
        setLoadingStep('session');
        dispatch(getLatestSession() as any);
        dispatch(getAllChapters() as any);
    }, []);

    // ─── Step 1 → 2: QF session selesai ─────────────────────────────────────
    // Gunakan data bukan loading sebagai trigger agar re-mount selalu masuk.
    useEffect(() => {
        // Tunggu chapters juga sudah siap supaya getSurahName bisa jalan
        if (latestSession.loading || chapters.loading) return;

        setLoadingStep('sb-session');

        if (latestSession.data) {
            const { chapterNumber, verseNumber } = latestSession.data;
            dispatch(supabaseGetLatestSession({
                current_chapter_number: chapterNumber,
                from_verse_number: verseNumber,
            }) as any);
        } else {
            // Tidak ada QF session → langsung fallback ke verseKey prop
            fallbackToVerseKeyProp();
        }
    }, [latestSession.loading, chapters.loading, latestSession.data]);

    // ─── Step 2 → 3: SB session selesai ─────────────────────────────────────
    useEffect(() => {
        if (sbLatestSession.loading) return;
        if (hasInitialized.current) return;

        setLoadingStep('verse');

        if (sbLatestSession.data) {
            const { status, current_chapter_number, from_verse_number, to_verse_number, total_read_seconds } = sbLatestSession.data;
            const ended = status === 'ended';

            setIsEnded(ended);
            setSecondsRead(total_read_seconds ?? 0);

            if (ended) {
                // Session sudah selesai → lanjut ke verse berikutnya
                const currentKey = `${current_chapter_number}:${to_verse_number}`;
                const nextKey    = getNextVerseKey(currentKey, surahVerseCounts);
                if (!nextKey) return;

                const [nextCh, nextVs] = nextKey.split(':').map(Number);
                dispatchNextVerse(nextCh, nextVs);
            } else {
                // Session masih berlangsung → lanjutkan verse yang sama
                dispatchNextVerse(current_chapter_number, from_verse_number);
            }
        } else {
            // Tidak ada SB session → fallback ke verseKey prop (last resort)
            fallbackToVerseKeyProp();
        }

        if (sbLatestSession.data) {
            hasInitialized.current = true;
        }
    }, [sbLatestSession.loading, sbLatestSession.data]);

    // ─── Sync isEnded & secondsRead jika sbLatestSession.data berubah ───────
    // (misal: update real-time dari luar komponen)
    useEffect(() => {
        if (!hasInitialized.current) return;
        if (!sbLatestSession.data) return;
        setIsEnded(sbLatestSession.data.status === 'ended');
        setSecondsRead(sbLatestSession.data.total_read_seconds ?? 0);
    }, [sbLatestSession.data]);

    // ─── Step 4: Setelah create session dari tafsir-reader ──────────────────
    useEffect(() => {
        if (!sbCreateSession.data || sbCreateSession.data.status !== 'ended') return;

        const { current_chapter_number, to_verse_number } = sbCreateSession.data;
        const currentKey = `${current_chapter_number}:${to_verse_number}`;
        const nextKey    = getNextVerseKey(currentKey, surahVerseCounts);
        if (!nextKey) return;

        const [nextCh, nextVs] = nextKey.split(':').map(Number);
        dispatchNextVerse(nextCh, nextVs);
        setSecondsRead(0);
        setIsEnded(true);
    }, [sbCreateSession.data]);

    // ─── Fetch verse text setelah nextVerse tersedia ─────────────────────────
    useEffect(() => {
        if (nextVerse.loading || !nextVerse.data) return;

        const { chapter, verse_start, verse_end } = nextVerse.data;
        const from = `${chapter}:${verse_start}`;
        const to   = `${chapter}:${verse_end}`;

        dispatch(getVerseByRange({
            query: {
                language:     preferences.language.language,
                tafsirs:      preferences.tafsirs.selectedTafsirs[0],
                translations: preferences.translations.selectedTranslations[0],
                fields:       'text_uthmani_tajweed,chapter_id,verse_key',
                from,
                to,
            },
        }) as any);

        setVerseRange(verse_start !== verse_end
            ? `${verse_start}-${verse_end}`
            : `${verse_start}`
        );
    }, [nextVerse.data]);

    // ─── Build teks verse untuk render ──────────────────────────────────────
    useEffect(() => {
        if (verses.loading || !verses.data?.length) return;
        setRenderVerse(
            verses.data.map((item: any) => item.text_uthmani_tajweed).join(' ')
        );

        setLoadingStep('done');
    }, [verses.data]);

    // ─── Loading states ──────────────────────────────────────────────────────
    if (chapters.loading || latestSession.loading) return <LoadingSkeleton step="session" />;
    if (sbLatestSession.loading)                   return <LoadingSkeleton step="sb-session" />;
    if (verses.loading || nextVerse.loading)        return <LoadingSkeleton step="verse" />;
    if (!verses.data && !nextVerse.data)            return null;

    const onRead = () => {
        try {
            router.push({
                pathname: '/tafsir-reader',
                params: {
                    chapter: nextVerse.data.chapter,
                    from:    nextVerse.data.verse_start,
                    to:      nextVerse.data.verse_end,
                    source:  'verse-for-read',
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
                            <Text style={{ fontWeight: '700', color: theme.colors.primary, fontSize: 16 }}>
                                {formatSeconds(secondsRead)}
                            </Text>
                            <Text style={{ fontSize: 16, color: '#424242' }}>so far</Text>
                        </View>
                    )}
                </View>

                <Button onPress={onRead} mode="contained">
                    <Text style={styles.buttonText}>
                        {!isEnded ? 'Continue' : 'Read Tafsir'}
                    </Text>
                </Button>
            </View>

            <QuranText 
                verseText={renderVerse}
                fontSize={30}
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
        borderColor: 'rgba(0,0,0,0.08)',
        padding: 16,
        gap: 12,
    },
    loadingText: { color: '#888' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
        justifyContent: 'space-between',
    },
    label: { fontSize: 16, fontWeight: '500', color: '#1A1A2E' },
    buttonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
    minuteText: {
        color: '#343434',
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
    },
});