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
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const FONT_SIZE_MIN = 15;
const FONT_SIZE_MAX = 32;
const FONT_SIZE_DEFAULT = 17;
const FONT_SIZE_STEP = 2;

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

function FontSizeControl({ fontSize, onIncrease, onDecrease }: {
    fontSize: number;
    onIncrease: () => void;
    onDecrease: () => void;
}) {
    return (
        <View style={fontStyles.container}>
            <TouchableOpacity
                onPress={onDecrease}
                disabled={fontSize <= FONT_SIZE_MIN}
                style={[fontStyles.button, fontSize <= FONT_SIZE_MIN && fontStyles.buttonDisabled]}
            >
                <Text style={[fontStyles.buttonText, fontSize <= FONT_SIZE_MIN && fontStyles.buttonTextDisabled]}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onIncrease}
                disabled={fontSize >= FONT_SIZE_MAX}
                style={[fontStyles.button, fontSize >= FONT_SIZE_MAX && fontStyles.buttonDisabled]}
            >
                <Text style={[fontStyles.buttonText, fontSize >= FONT_SIZE_MAX && fontStyles.buttonTextDisabled]}>A+</Text>
            </TouchableOpacity>
        </View>
    );
}

const fontStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginRight: 0,
    },
    button: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
    },
    buttonDisabled: {
        backgroundColor: '#f0f0f0',
        opacity: 0.4,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    buttonTextDisabled: {
        color: '#999',
    },
});

export default function TafsirReader() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const { verseKey, source } = useLocalSearchParams();

    const [fontSize, setFontSize] = useState(FONT_SIZE_DEFAULT);

    const increaseFont = () => setFontSize((prev) => Math.min(prev + FONT_SIZE_STEP, FONT_SIZE_MAX));
    const decreaseFont = () => setFontSize((prev) => Math.max(prev - FONT_SIZE_STEP, FONT_SIZE_MIN));

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
            dispatch(createReadingSession({
                chapterNumber: parseInt(chapterNumber),
                verseNumber: parseInt(verseNumber),
            }) as any);

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

        const prevSecondsRead = sbLatestSession.data?.total_read_seconds ?? 0;

        dispatch(supabaseCreateReadingSession({
            data: {
                current_chapter_number: parseInt(chapterNumber),
                current_verse_number: parseInt(verseNumber),
                status: 'active',
                seconds_read: seconds - prevSecondsRead,
                total_read_seconds: seconds,
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
    };

    const onFinishHandler = (seconds: number) => {
        if (!chapterNumber || !verseNumber) return;
        if (seconds <= 0) return;

        const prevSecondsRead = sbLatestSession.data?.total_read_seconds ?? 0;

        dispatch(supabaseCreateReadingSession({
            data: {
                current_chapter_number: parseInt(chapterNumber),
                current_verse_number: parseInt(verseNumber),
                status: 'ended',
                seconds_read: seconds - prevSecondsRead,
                total_read_seconds: seconds,
                ended_at: new Date().toISOString(),
                daily_target_seconds: dailyTargetSeconds,
            },
            purpose: 'finish'
        }) as any);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <FontSizeControl
                            fontSize={fontSize}
                            onIncrease={increaseFont}
                            onDecrease={decreaseFont}
                        />
                    ),
                }}
            />
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
                                    <TextRenderer htmlText={translationText} italic fontSize={fontSize} />
                                </View>
                            </View>
                        )}

                        <TextRenderer htmlText={tafsirText} fontSize={fontSize} />
                    </View>
                </ScrollView>

                <View>
                    <ReadingTimer
                        onPause={onPauseHandler}
                        onResume={onResumeHandler}
                        onFinish={onFinishHandler}
                        autoStart={true}
                        verseData={verse.data}
                        startFromSeconds={sbLatestSession.data?.status === 'ended' ? 0 : (sbLatestSession.data?.total_read_seconds ?? 0)}
                    />
                </View>
            </SafeAreaView>
        </>
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
        backgroundColor: '#f5f5f5',
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