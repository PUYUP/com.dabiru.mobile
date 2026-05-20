import { MUSHAF_ID } from "@/constants/oauth";
import { theme } from "@/constants/theme";
import ReadingTimer from "@/features/reading/components/reading-timer";
import { resetCreateSession } from "@/features/reading/readingSlice";
import { supabaseCreateReadingSession, supabaseGetSessions } from "@/features/reading/readingThunk";
import { GetSessionQuery } from "@/features/reading/readingTyping";
import QuranText from "@/features/tafsirs/components/quran-text";
import TextRenderer, { TextRendererHandle } from "@/features/tafsirs/components/text-renderer";
import { resetAddNotes, resetExplainer, resetVerse } from "@/features/tafsirs/tafsirsSlice";
import { addNotes, explaining, getVerseByRange } from "@/features/tafsirs/tafsirsThunk";
import { TafsirSummarizerPayload } from "@/features/tafsirs/tafsirsTyping";
import { addActivity, createReadingSession, getGoal, getLatestSession } from "@/features/user/userThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { format } from "date-fns/format";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { ActivityIndicator, Button, IconButton } from "react-native-paper";
import RenderHtml from 'react-native-render-html';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#5E5545";
const PRIMARY_LIGHT = "#ECE7DC";

const FONT_SIZE_MIN = 18;
const FONT_SIZE_MAX = 32;
const FONT_SIZE_DEFAULT = 20;
const FONT_SIZE_STEP = 2;

function LoadingSkeleton() {
    return (
        <View style={styles.centered}>
            <ActivityIndicator animating={true} color={PRIMARY} size="large" />
            <Text style={styles.loadingText}>Loading verse...</Text>
        </View>
    );
}

function ProcessingOverlay() {
    return (
        <View style={styles.overlay}>
            <View style={styles.overlayCard}>
                <ActivityIndicator animating={true} color={PRIMARY} size="large" />
                <Text style={styles.overlayTitle}>Processing</Text>
                <Text style={styles.overlaySubtitle}>Please wait a moment</Text>
            </View>
        </View>
    );
}

function VerseUndefined() {
    return (
        <View style={styles.centered}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Verse not found</Text>
            <Text style={styles.emptySubtitle}>This verse could not be loaded.</Text>
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
        gap: 6,
    },
    button: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: PRIMARY_LIGHT,
    },
    buttonDisabled: {
        opacity: 0.35,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: '600',
        color: PRIMARY,
    },
    buttonTextDisabled: {
        color: PRIMARY,
    },
});

export default function TafsirReader() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const { width } = useWindowDimensions();
    const { source, chapter, from, to } = useLocalSearchParams();

    const [fontSize, setFontSize] = useState(FONT_SIZE_DEFAULT);
    const [isTafsirReady, setIsTafsirReady] = useState(false);

    const increaseFont = () => setFontSize((prev) => Math.min(prev + FONT_SIZE_STEP, FONT_SIZE_MAX));
    const decreaseFont = () => setFontSize((prev) => Math.max(prev - FONT_SIZE_STEP, FONT_SIZE_MIN));

    const notesAdded = useAppSelector((state: any) => state.tafsirs.addNotes);
    const explainer = useAppSelector((state: any) => state.tafsirs.explainer);
    const verses = useAppSelector((state: any) => state.tafsirs.verses);
    const config = useAppSelector((state: any) => state.config);
    const preferences = config.preferences;
    const sbLatestSession = useAppSelector((state: any) => state.reading.supabaseLatestSession);
    const sbCreateSession = useAppSelector((state: any) => state.reading.supabaseCreateSession);
    const qfLatestSession = useAppSelector((state: any) => state.user.latestSession);
    const chapters = useAppSelector((state: any) => state.reading.chapters);
    const goal = useAppSelector((state: any) => state.user.goal);
    const dailyTargetSeconds = goal.data?.dailyTargetSeconds ?? 0;
    const [renderVerse, setRenderVerse] = useState<string>('');
    const [selectedText, setSelectedText] = useState<string | null>('');
   
    const scrollRef = useRef({ x: 0, y: 0 });
    const sessionCreated = useRef(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const textRendererRef = useRef<TextRendererHandle>(null);

    useFocusEffect(
        useCallback(() => {
            // Jalan setiap kali halaman focused (termasuk saat back)
            dispatch(resetAddNotes());
            dispatch(resetExplainer());
        }, [])
    );

    useEffect(() => {
        setIsTafsirReady(false);
    }, [chapter, from, to]);

    useEffect(() => {
        if (!chapter || !from || !to) return;

        // reset verse
        dispatch(resetVerse());

        if (source !== 'verse-for-read') {
            dispatch(getLatestSession() as any);
        }

        dispatch(getVerseByRange({
            query: {
                language: preferences.language.language,
                tafsirs: preferences.tafsirs.selectedTafsirs.join(','),
                translations: preferences.translations.selectedTranslations[0],
                fields: 'text_uthmani_tajweed,chapter_id,verse_key',
                from: chapter + ':' + from,
                to: chapter + ':' + to,
            },
        }) as any);
    }, [chapter, from, to]);

    useEffect(() => {
        if (qfLatestSession.loading || sbLatestSession.loading) return;
        if (!chapter || !from || !to) return;
        if (sessionCreated.current) return;

        // console.log('qfLatestSession.data?.chapterNumber', qfLatestSession.data?.chapterNumber);
        // console.log('qfLatestSession.data?.verseNumber', qfLatestSession.data?.verseNumber);

        // console.log('chapter', chapter)
        // console.log('tooo', to);
        // console.log('froomm', from)

        // console.log('qfLatestSession.data?.chapterNumber != chapter', qfLatestSession.data?.chapterNumber != chapter)
        // console.log('qfLatestSession.data?.verseNumber != from', qfLatestSession.data?.verseNumber != from)
        
        if (qfLatestSession.data?.chapterNumber != chapter || qfLatestSession.data?.verseNumber != from) {
            sessionCreated.current = true;

            dispatch(createReadingSession({
                chapterNumber: Number(chapter),
                verseNumber: Number(from),
            }) as any);

            dispatch(supabaseCreateReadingSession({
                data: {
                    current_chapter_number: Number(chapter),
                    from_verse_number: Number(from),
                    to_verse_number: Number(to),
                    status: 'start',
                    seconds_read: 0,
                    daily_target_seconds: dailyTargetSeconds,
                    scroll_y: Math.round(scrollRef.current.y),
                    scroll_x: Math.round(scrollRef.current.x),
                }
            }) as any);
        }
    }, [qfLatestSession.loading, qfLatestSession.data, sbLatestSession.loading]);

    useEffect(() => {
        if (sbCreateSession.data) {
            if (sbCreateSession.data.status == 'ended') {
                const query: GetSessionQuery = {
                    from: 0,
                    to: 50,
                    status: 'ended',
                };

                dispatch(resetCreateSession());
                dispatch(supabaseGetSessions(query) as any);

                router.replace({
                    pathname: '/history-detail',
                    params: {
                        id: sbCreateSession.data.id,
                        from: from,
                        to: to,
                        chapter: chapter,
                    },
                });
            }

            dispatch(getGoal() as any);
        }
    }, [sbCreateSession.data]);

    // Auto scroll setelah sbLatestSession loaded
    // useEffect(() => {
    //     if (sbLatestSession.loading || verses.loading) return;
    //     if (!sbLatestSession.data?.scroll_y) return;

    //     // Slight delay agar konten sudah render dulu
    //     setTimeout(() => {
    //         scrollViewRef.current?.scrollTo({
    //             y: sbLatestSession.data.scroll_y,
    //             animated: false,
    //         });
    //     }, 500);
    // }, [sbLatestSession.loading, verses.loading]);

    // set render verse
    useEffect(() => {
        if (verses.loading) return;
        if (!verses.data || verses.data.length <= 0) return;

        const textUthmani = verses.data.map((item: any) => item.text_uthmani_tajweed);
        setRenderVerse(textUthmani.join(' '));
    }, [verses]);

    // explainer
    useEffect(() => {
        if (explainer.loading) return;
        if (!explainer.data) return;

        const firstVerse = verses.data[0];
        const lastVerse = verses.data[verses.data.length - 1];
        const verseRanges = firstVerse.verse_key + '-' + lastVerse.verse_key;

        // save as notes
        const payload = {
            body: JSON.stringify({
                question: selectedText,
                answer: explainer.data.result.explanation,
            }),
            ranges: [verseRanges],
        }

        dispatch(resetAddNotes());
        dispatch(addNotes(payload) as any);
    }, [explainer.data]);

    useEffect(() => {
        if (notesAdded.loading) return;
        if (!notesAdded.data) return;

        // to explainer page
        router.push({
            pathname: '/tafsir-explainer',
            params: { verseRanges: notesAdded.data.ranges }
        });
    }, [notesAdded.data]);

    if (sbLatestSession.loading || qfLatestSession.loading || verses.loading) {
        return <LoadingSkeleton />;
    }

    if (!verses.data || verses.data.length <= 0) {
        return <VerseUndefined />;
    }

    const seen = new Set<string>();
    const tafsirText = verses.data && verses.data.length > 0
    ? verses.data.map((v: any) =>
        v.tafsirs
            ?.filter((item: any) => {
                const fingerprint = item.text?.slice(0, 100) ?? '';
                if (seen.has(fingerprint)) return false;
                seen.add(fingerprint);
                return true;
            })
            .map((item: any) => item.text)
            .join(' ')
        ).join(' ')
    : null;

    const translationText = verses.data && verses.data.length > 0
        ? verses.data.map((v: any) => v.translations?.map((item: any) => item.text).join(' ')).join(' ')
        : null;
    
    const onPauseHandler = (seconds: number) => {
        if (!chapter || !from || !to) return;
        if (seconds <= 0) return;

        const status = sbLatestSession.data?.status;
        const prevSecondsRead = status == 'ended' ? 0 : (sbLatestSession.data?.total_read_seconds ?? 0);
        const rootSessionId = status == 'ended' ? null : (sbLatestSession.data?.root_session_id || sbLatestSession.data?.id);

        dispatch(supabaseCreateReadingSession({
            data: {
                current_chapter_number: Number(chapter),
                from_verse_number: Number(from),
                to_verse_number: Number(to),
                status: rootSessionId ? 'continue' : 'start',
                seconds_read: seconds - prevSecondsRead,
                total_read_seconds: seconds,
                daily_target_seconds: dailyTargetSeconds,
                root_session_id: rootSessionId,
                scroll_y: Math.round(scrollRef.current.y),
                scroll_x: Math.round(scrollRef.current.x),
            }
        }) as any);

        dispatch(
            addActivity({
                seconds: seconds - prevSecondsRead,
                mushafId: MUSHAF_ID,
                ranges: [`${chapter}:${from}-${chapter}:${to}`],
                type: 'QURAN' as any,
                date: format(new Date(), 'yyyy-MM-dd'),
            }) as any
        );
    };

    const onResumeHandler = () => {
        if (!chapter || !from || !to) return;
    };

    const onFinishHandler = (seconds: number) => {
        if (!chapter || !from || !to) return;
        if (seconds <= 0) return;

        const prevSecondsRead = sbLatestSession.data?.total_read_seconds ?? 0;
        const rootSessionId = sbLatestSession.data?.root_session_id || sbLatestSession.data?.id;

        dispatch(supabaseCreateReadingSession({
            data: {
                current_chapter_number: Number(chapter),
                from_verse_number: Number(from),
                to_verse_number: Number(to),
                status: 'ended',
                seconds_read: seconds - prevSecondsRead,
                total_read_seconds: seconds,
                ended_at: new Date().toISOString(),
                daily_target_seconds: dailyTargetSeconds,
                root_session_id: rootSessionId,
                scroll_y: Math.round(scrollRef.current.y),
                scroll_x: Math.round(scrollRef.current.x),
            },
            purpose: 'finish'
        }) as any);
    };

    const surah = chapters.data.find(
        (c: any) => c.id == qfLatestSession.data?.chapterNumber
    );

    const handleScroll = (event: any) => {
        const { x, y } = event.nativeEvent.contentOffset;
        scrollRef.current = { x, y };
    };

    const onTextSelectedHandler = (value: string | null) => {
        setSelectedText(value);
    }

    const handleClear = () => {
        textRendererRef.current?.clearSelection(); // clear di WebView
        setSelectedText(null);                     // reset state parent
    };

    const explainHandler = () => {
        if (!selectedText) return;

        dispatch(resetExplainer());

        const payload: TafsirSummarizerPayload = {
            tafsir_text: selectedText,
            verse_number: Number(from),
            chapter_number: Number(chapter),
            surah_name: surah?.name_simple,
            language: preferences.language.language,
        }

        dispatch(explaining(payload) as any);
    }

    const onContentReadyHandler = () => {
        setIsTafsirReady(true);
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({
                y: sbLatestSession.data.scroll_y,
                animated: true,
            });
        }, 150);
    }

    return (
        <>
            {sbCreateSession.loading && <ProcessingOverlay />}

            <Stack.Screen
                options={{
                    headerStyle: {
                        backgroundColor: '#F6F1E7',
                    },
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
                <ScrollView
                    ref={scrollViewRef}
                    style={[styles.scrollContent, { paddingBottom: insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    scrollEventThrottle={16}
                >
                    <View style={styles.inner}>
                        {/* Verse key badge */}
                        <View style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
                            <View style={styles.verseBadge}>
                                <Text style={styles.verseBadgeText}>{surah?.name_simple}</Text>
                            </View>

                            <View style={styles.verseBadge}>
                                <Text style={styles.verseBadgeText}>{from != to ? from + '-' + to : from}</Text>
                            </View>
                        </View>

                        {/* Arabic text */}
                        <View style={styles.verseWrap}>
                            <QuranText 
                                verseText={renderVerse}
                                fontSize={30}
                                lineHeight={42} 
                            />
                        </View>

                        {/* Translation */}
                        {translationText && (
                            <View style={styles.blockquote}>
                                <View style={styles.blockquoteContent}>
                                    <Text style={styles.blockquoteLabel}>Translation</Text>
                                    <RenderHtml
                                        contentWidth={width - 32}
                                        source={{ html: translationText }}
                                        baseStyle={{
                                            fontSize: fontSize * 0.85,
                                            lineHeight: fontSize * 1.25,
                                        }}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Tafsir */}
                        {tafsirText && (
                            <View style={styles.tafsirBody}>
                                {!isTafsirReady && (
                                    <View style={styles.tafsirLoading}>
                                        <ActivityIndicator animating={true} color={PRIMARY} size="small" />
                                        <Text style={styles.tafsirLoadingText}>Loading tafsir...</Text>
                                    </View>
                                )}

                                <View style={{ opacity: isTafsirReady ? 1 : 0 }}>
                                    <TextRenderer
                                        ref={textRendererRef}
                                        htmlText={tafsirText}
                                        fontSize={fontSize}
                                        onTextSelected={onTextSelectedHandler}
                                        onContentReady={onContentReadyHandler}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <View style={styles.timerWrap}>
                    {selectedText && (
                        <View style={{ 
                            backgroundColor: PRIMARY_LIGHT, 
                            display: 'flex', 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <Button
                                    onPress={explainHandler}
                                    contentStyle={{ flexDirection: 'row', alignItems: 'center' }}
                                    icon={() => <MaterialIcons color={theme.colors.primary} name="assistant" size={20} />}
                                    disabled={explainer.loading}
                                >
                                    {explainer.loading ? 'Processing...' : 'Explain with AI' }
                                </Button>

                                {explainer.loading && (
                                    <ActivityIndicator size={16} />
                                )}
                            </View>

                            <IconButton icon={'close'} onPress={() => {
                                setSelectedText(null);
                                handleClear();
                            }} />
                        </View>
                    )}

                    <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                        <ReadingTimer
                            onPause={onPauseHandler}
                            onResume={onResumeHandler}
                            onFinish={onFinishHandler}
                            autoStart={true}
                            startFromSeconds={sbLatestSession.data?.status === 'ended' ? 0 : (sbLatestSession.data?.total_read_seconds ?? 0)}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F1E7',
    },
    scrollContent: {
        flex: 1,
    },
    inner: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },

    // Loading / empty states
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fafaf8',
    },
    loadingText: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    emptyIcon: {
        fontSize: 40,
        marginBottom: 4,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#888',
    },

    // Processing overlay
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(250,250,248,0.9)',
        zIndex: 99,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.08)',
        paddingHorizontal: 40,
        paddingVertical: 28,
        alignItems: 'center',
        gap: 10,
    },
    overlayTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginTop: 4,
    },
    overlaySubtitle: {
        fontSize: 13,
        color: '#888',
    },

    // Verse badge
    verseBadge: {
        alignSelf: 'flex-start',
        backgroundColor: PRIMARY_LIGHT,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginBottom: 20,
    },
    verseBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: PRIMARY,
        letterSpacing: 0.3,
    },

    // Arabic verse
    verseWrap: {
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        padding: 16,
        paddingVertical: 10,
        paddingTop: 16,
        marginBottom: 24,
    },

    // Translation blockquote
    blockquote: {
        flexDirection: 'row',
        marginBottom: 28,
        gap: 12,
    },
    blockquoteContent: {
        flex: 1,
        gap: 6,
    },
    blockquoteLabel: {
        fontSize: 11,
        color: '#C8A97E',
        fontWeight: '600',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },

    // Tafsir section
    tafsirHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    tafsirDivider: {
        flex: 1,
        height: 0.5,
        backgroundColor: 'rgba(0,0,0,0.12)',
    },
    tafsirLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: PRIMARY,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    tafsirBody: {
        gap: 8,
    },
    tafsirLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 20,
    },
    tafsirLoadingText: {
        fontSize: 13,
        color: '#888',
    },

    // Timer
    timerWrap: {
        borderTopWidth: 1,
        borderTopColor: '#ECE7DC',
    },
});