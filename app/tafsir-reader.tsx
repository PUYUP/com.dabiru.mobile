import { MUSHAF_ID } from "@/constants/oauth";
import ReadingTimer from "@/features/reading/components/reading-timer";
import { resetCreateSession } from "@/features/reading/readingSlice";
import { supabaseCreateReadingSession } from "@/features/reading/readingThunk";
import TextRenderer from "@/features/tafsirs/components/text-renderer";
import VerseRenderer from "@/features/tafsirs/components/verse-renderer";
import { getVerseByKey } from "@/features/tafsirs/tafsirsThunk";
import { addActivity, createReadingSession, getLatestSession } from "@/features/user/userThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { format } from "date-fns/format";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

function LoadingSkeleton() {
    return (
        <View style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading...</Text>
        </View>
    );
}

function VerseUndefined() {
    return (
        <View style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <Text>Verse undefined!</Text>
        </View>
    );
}

export default function TafsirReader() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const { verseKey, source } = useLocalSearchParams();

    const verseKeys = (verseKey as string).split(':');
    const chapterNumber = verseKeys?.length > 1 ? verseKeys[0] : null;
    const verseNumber = verseKeys?.length > 1 ? verseKeys[1] : null;

    const verse = useAppSelector((state: any) => state.tafsirs.verse);
    const config = useAppSelector((state: any) => state.config);
    const preferences = config.preferences;
    const sbLatestSession = useAppSelector((state: any) => state.reading.supabaseLatestSession);
    const sbCreateSession = useAppSelector((state: any) => state.reading.supabaseCreateSession);
    const qfLatestSession = useAppSelector((state: any) => state.user.latestSession);
    const goal = useAppSelector((state: any) => state.user.goal);
    const dailyTargetSeconds = goal.data?.dailyTargetSeconds ?? 0;

    useEffect(() => {
        if (!chapterNumber || !verseNumber) return;

        // not coming from verse for read component
        // indicate this component is standalone
        if (source !== 'verse-for-read') {
            dispatch(getLatestSession() as any);
        }

        dispatch(getVerseByKey({
            verseKey: verseKey as string,
            query: {
                language: preferences.language.language,
                tafsirs: preferences.tafsirs.selectedTafsirs[0],
                translations: preferences.translations.selectedTranslations[0],
                fields: 'text_uthmani_tajweed,chapter_id,verse_key',
            },
        }) as any);
    }, []);

    useEffect(() => {
        if (qfLatestSession.loading || sbLatestSession.loading) return;
        if (!chapterNumber || !verseNumber) return;
       
        if (qfLatestSession.data?.chapterNumber != chapterNumber || qfLatestSession.data?.verseNumber != verseNumber) {
            // create new qf session
            dispatch(createReadingSession({
                chapterNumber: parseInt(chapterNumber),
                verseNumber: parseInt(verseNumber),
            }) as any);

            // create sb session
            dispatch(supabaseCreateReadingSession({ 
                data: {
                    current_chapter_number: parseInt(chapterNumber),
                    current_verse_number: parseInt(verseNumber),
                    status: 'active',
                    seconds_read: 0,
                    daily_target_seconds: dailyTargetSeconds,
                } 
            }) as any);
        }
    }, [qfLatestSession.loading, sbLatestSession.loading]);

    useEffect(() => {
        if (sbCreateSession.data && sbCreateSession.data.status == 'ended') {
            dispatch(resetCreateSession());
            router.back();
        }
    }, [sbCreateSession.data]);

    // Hanya tampil loading saat initial load
    if (sbLatestSession.loading || qfLatestSession.loading || verse.loading) {
        return <LoadingSkeleton />;
    }

    if (!verse.data) {
        return <VerseUndefined />;
    }

    const tafsirText = verse.data.tafsirs
        ? verse.data.tafsirs.map((item: any) => item.text).join(' ')
        : null;

    const translationText = verse.data.translations
        ? verse.data.translations.map((item: any) => item.text).join(' ')
        : null;

    const onPauseHandler = (seconds: number) => {
        if (!chapterNumber || !verseNumber) return;
        if (seconds <= 0) return;

        dispatch(supabaseCreateReadingSession({ 
            data: {
                current_chapter_number: parseInt(chapterNumber),
                current_verse_number: parseInt(verseNumber),
                status: 'paused',
                seconds_read: seconds,
                daily_target_seconds: dailyTargetSeconds,
            }
        }) as any);

        dispatch(
            addActivity({
                seconds,
                mushafId: MUSHAF_ID,
                ranges: [`${verseKey}-${verseKey}`],
                type: 'QURAN' as any,
                date: format(new Date(), 'yyyy-MM-dd'),
            }) as any
        );
    };

    const onResumeHandler = () => {
        if (!chapterNumber || !verseNumber) return;

        dispatch(supabaseCreateReadingSession({ 
            data: {
                current_chapter_number: parseInt(chapterNumber),
                current_verse_number: parseInt(verseNumber),
                status: 'active',
                seconds_read: sbLatestSession.data?.seconds_read ?? 0,
                daily_target_seconds: dailyTargetSeconds,
            }
        }) as any);
    };

    const onFinishHandler = (seconds: number) => {
        if (!chapterNumber || !verseNumber) return;
        if (seconds <= 0) return;

        dispatch(supabaseCreateReadingSession({ 
            data: {
                current_chapter_number: parseInt(chapterNumber),
                current_verse_number: parseInt(verseNumber),
                status: 'ended',
                seconds_read: seconds,
                total_read_seconds: seconds,
                ended_at: new Date().toISOString(),
                daily_target_seconds: dailyTargetSeconds,
            }, 
            purpose: 'finish' 
        }) as any);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={[styles.scrollContent, { paddingBottom: insets.bottom }]}>
                <View style={styles.inner}>
                    <View style={{ marginBottom: 24 }}>
                        <VerseRenderer verseText={verse.data.text_uthmani_tajweed} />
                    </View>

                    {translationText && (
                        <View style={styles.blockquote}>
                            <View style={styles.blockquoteBar} />
                            <View style={styles.blockquoteContent}>
                                <Text style={styles.blockquoteLabel}>Translation</Text>
                                <TextRenderer htmlText={translationText} italic />
                            </View>
                        </View>
                    )}

                    <TextRenderer htmlText={tafsirText} />
                </View>
            </ScrollView>

            <View>
                <ReadingTimer
                    onPause={onPauseHandler}
                    onResume={onResumeHandler}
                    onFinish={onFinishHandler}
                    autoStart={true}
                    verseData={verse.data}
                    startFromSeconds={sbLatestSession.data?.seconds_read ?? 0}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    inner: {
        flex: 1,
        paddingBottom: 32,
    },
    scrollContent: {
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    blockquote: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    blockquoteBar: {
        width: 3,
        borderRadius: 99,
        backgroundColor: '#C8A97E',
    },
    blockquoteContent: {
        flex: 1,
        gap: 4,
    },
    blockquoteLabel: {
        fontSize: 12,
        color: '#C8A97E',
        fontWeight: '500',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
});