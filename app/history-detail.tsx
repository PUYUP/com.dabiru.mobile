import { supabaseGetChildSessions, supabaseGetSession, supabaseUpdateReadingSession } from "@/features/reading/readingThunk";
import { GetSessionQuery } from "@/features/reading/readingTyping";
import { resetSummary } from "@/features/tafsirs/tafsirsSlice";
import { getVerseByKey, summarizing } from "@/features/tafsirs/tafsirsThunk";
import { TafsirSummarizerPayload } from "@/features/tafsirs/tafsirsTyping";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { formatSeconds } from "@/utils/format-seconds";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#258c91";
const PRIMARY_LIGHT = "#e8f5f5";
const PRIMARY_DARK = "#0f6e56";
const SCREEN_WIDTH = Dimensions.get("window").width;

function formatRelative(dateStr: string) {
    return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        includeSeconds: true,
        locale: {
            ...enUS,
            formatDistance: (token, count, options) => {
                const result = enUS.formatDistance(token, count, options);
                return result.replace(/^about /, "");
            },
        },
    });
}

function LoadingScreen() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY} />
        </View>
    );
}

function EmptyScreen() {
    return (
        <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>No data found.</Text>
        </View>
    );
}

export default function HistoryDetailScreen() {
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const { id, verseKey } = useLocalSearchParams();
    const verseKeys = (verseKey as string).split(':');
    const chapterNumber = verseKeys?.length > 1 ? verseKeys[0] : null;
    const verseNumber = verseKeys?.length > 1 ? verseKeys[1] : null;

    const summary = useAppSelector((state: any) => state.tafsirs.summary);
    const session = useAppSelector((state: any) => state.reading.supabaseSession);
    const childSessions = useAppSelector((state: any) => state.reading.supabaseChildSessions);
    const chapters = useAppSelector((state: any) => state.reading.chapters);
    const verse = useAppSelector((state: any) => state.tafsirs.verse);
    const config = useAppSelector((state: any) => state.config);
    const preferences = config.preferences;
    const [tafsirPoints, setTafsirPoints] = useState<any[]>([]);

    const query: GetSessionQuery = {
        from: 0,
        to: 1,
        status: "ended",
        verseKey: verseKey as string,
    };

    const childQuery: GetSessionQuery = {
        from: 1,
        to: 50,
        verseKey: verseKey as string,
    };

    // initial loader
    useEffect(() => {
        dispatch(resetSummary());
        dispatch(supabaseGetSession(query) as any);
        dispatch(supabaseGetChildSessions(childQuery) as any);
    }, []);

    // verse and session load listener
    useEffect(() => {
        if (verse.loading) return;
        if (!chapterNumber || !verseNumber) return;

        if (verse.data) {
            if (session.data) {
                if (!session.data.notes) {
                    // generating summary / notes
                    const tafsirText = verse.data.tafsirs
                        ? verse.data.tafsirs.map((item: any) => item.text).join(' ')
                        : null;
                    
                    const surah = chapters.data.find(
                        (c: any) => c.id == chapterNumber
                    );

                    const payload: TafsirSummarizerPayload = {
                        tafsir_text: tafsirText,
                        verse_number: parseInt(verseNumber as string),
                        chapter_number: parseInt(chapterNumber as string),
                        surah_name: surah.name_simple,
                        language: preferences.language.language,
                    }

                    dispatch(summarizing(payload) as any);
                } else {
                    const notes = JSON.parse(session.data.notes);
                    setTafsirPoints(notes.result.tafsir_points);
                }
            }
        } else {
            dispatch(getVerseByKey({
                verseKey: verseKey as string,
                query: {
                    language: preferences.language.language,
                    tafsirs: preferences.tafsirs.selectedTafsirs[0],
                    translations: preferences.translations.selectedTranslations[0],
                    fields: 'text_uthmani_tajweed,chapter_id,verse_key',
                },
            }) as any);
        }
    }, [verse, session]);

    // summary and session listener
    useEffect(() => {
        if (summary.loading) return;
        if (!summary.data) return;
        if (session.data && session.data.notes) return;

        dispatch(supabaseUpdateReadingSession({
            data: { notes: JSON.stringify(summary.data)},
            id: id as string,
        }) as any);

        setTafsirPoints(summary.data.result.tafsir_points);
    }, [summary, session]);

    if (session.loading || childSessions.loading) {
        return <LoadingScreen />;
    }

    if (!session.data) {
        return <EmptyScreen />;
    }

    const surah = chapters.data.find(
        (c: any) => c.id == session.data.current_chapter_number
    );

    const validChildren: any[] = (childSessions.data ?? []).filter(
        (item: any) => item.total_read_seconds > 0
    );

    const totalSeconds: number = session.data.total_read_seconds ?? 0;
    const sessionCount: number = validChildren.length;
    const avgSeconds: number =
        sessionCount > 0 ? Math.round(totalSeconds / sessionCount) : 0;
    const longestSeconds: number =
        sessionCount > 0
            ? Math.max(...validChildren.map((s: any) => s.total_read_seconds))
            : 0;

    const chartLabels = validChildren.map((_: any, i: number) => `${i + 1}`);
    const chartData = validChildren.map((s: any) => parseFloat((s.total_read_seconds / 60).toFixed(1)));

    return (
        <SafeAreaView style={styles.safe} edges={["bottom"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Hero ── */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>{surah?.name_simple ?? "—"}</Text>
                    <View style={styles.heroSubRow}>
                        <View style={styles.verseBadge}>
                            <Text style={styles.verseBadgeText}>Verse {session.data.current_verse_number}</Text>
                        </View>
                        <Text style={styles.heroSub}>Session completed</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statVal}>{formatSeconds(totalSeconds)}</Text>
                            <Text style={styles.statLabel}>Total time</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statVal}>{sessionCount}×</Text>
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statVal}>{formatSeconds(avgSeconds)}</Text>
                            <Text style={styles.statLabel}>Average</Text>
                        </View>
                    </View>

                    {/* ── Stat row 2 ── */}
                    <View style={[styles.statsRow, { marginTop: 10 }]}>
                        <View style={styles.statCard}>
                            <Text style={styles.statVal}>{formatSeconds(longestSeconds)}</Text>
                            <Text style={styles.statLabel}>Longest session</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statVal}>
                                {sessionCount > 0
                                    ? formatSeconds(
                                        Math.min(...validChildren.map((s: any) => s.total_read_seconds))
                                    )
                                    : "—"}
                            </Text>
                            <Text style={styles.statLabel}>Shortest session</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* ── Grafik ── */}
                    {validChildren.length > 0 && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderIcon}>
                                    <Text style={styles.cardHeaderEmoji}>📊</Text>
                                </View>
                                <Text style={styles.cardTitle}>Duration per session</Text>
                            </View>
                            <View style={styles.chartWrap}>
                                <BarChart
                                    data={{
                                        labels: chartLabels,
                                        datasets: [{ data: chartData }],
                                    }}
                                    width={SCREEN_WIDTH - 24 * 2 - 16 * 2}
                                    height={180}
                                    yAxisLabel=""
                                    yAxisSuffix="m"
                                    chartConfig={{
                                        backgroundColor: "#fff",
                                        backgroundGradientFrom: "#fff",
                                        backgroundGradientTo: "#fff",
                                        decimalPlaces: 1,
                                        color: () => PRIMARY,
                                        labelColor: () => "#888",
                                        barPercentage: 0.6,
                                        propsForBackgroundLines: {
                                            stroke: "#f0f0f0",
                                        },
                                    }}
                                    style={{ borderRadius: 8 }}
                                    showValuesOnTopOfBars
                                    fromZero
                                    withInnerLines
                                />
                            </View>
                        </View>
                    )}

                    {/* ── Ringkasan ── */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderIcon}>
                                <Text style={styles.cardHeaderEmoji}>📋</Text>
                            </View>
                            <Text style={styles.cardTitle}>Summary</Text>
                        </View>

                        {(!summary.loading && summary.data || session.data.notes) && (
                            <View style={styles.summaryList}>
                                {tafsirPoints.map((item: any) => {
                                    return (
                                        <BulletItem
                                            key={item}
                                            text={item}
                                            bold={''}
                                            suffix={''}
                                        />
                                    )
                                })}
                            </View> 
                        )}
                        
                        {summary.loading && (
                            <View style={{ padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                                <ActivityIndicator size="large" color={PRIMARY} />
                                <Text style={{ color: '#828282' }}>Summarizing... Please wait</Text>
                            </View>
                        )}
                    </View>

                    {/* ── Detail sesi ── */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderIcon}>
                                <Text style={styles.cardHeaderEmoji}>🕐</Text>
                            </View>
                            <Text style={styles.cardTitle}>Session details</Text>
                        </View>
                        <View>
                            {validChildren.map((item: any, index: number) => {
                                const pct =
                                    longestSeconds > 0
                                        ? item.total_read_seconds / longestSeconds
                                        : 0;
                                return (
                                    <View
                                        key={item.id}
                                        style={[
                                            styles.sessionRow,
                                            index < validChildren.length - 1 && styles.sessionRowBorder,
                                        ]}
                                    >
                                        <View style={styles.sessionNum}>
                                            <Text style={styles.sessionNumText}>{index + 1}</Text>
                                        </View>
                                        <View style={styles.sessionInfo}>
                                            <Text style={styles.sessionDuration}>
                                                {formatSeconds(item.total_read_seconds)}
                                            </Text>
                                            <Text style={styles.sessionTime}>
                                                {formatRelative(item.created_at)}
                                            </Text>
                                        </View>
                                        <View style={styles.barWrap}>
                                            <View style={styles.barBg}>
                                                <View
                                                    style={[
                                                        styles.barFill,
                                                        { width: `${Math.round(pct * 100)}%` as any },
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function BulletItem({
    text,
    bold,
    suffix,
}: {
    text: string;
    bold: string;
    suffix?: string;
}) {
    return (
        <View style={styles.bulletItem}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>
                {text}
                <Text style={styles.bulletBold}>{bold}</Text>
                {suffix}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f0f4f4",
    },
    scroll: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f4f4",
    },
    emptyText: {
        fontSize: 14,
        color: "#888",
    },

    // Hero
    hero: {
        backgroundColor: PRIMARY,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 2,
    },
    heroSubRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    verseBadge: {
        backgroundColor: "rgba(255,255,255,0.25)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.4)",
    },
    verseBadgeText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#fff",
    },
    heroSub: {
        fontSize: 14,
        color: "rgba(255,255,255,0.65)",
    },
    statsRow: {
        flexDirection: "row",
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 10,
        padding: 16,
    },
    statVal: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
    },
    statLabel: {
        fontSize: 12,
        color: "rgba(255,255,255,0.65)",
        marginTop: 2,
    },

    // Content
    content: {
        marginTop: -16,
        marginHorizontal: 20,
    },

    // Card
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 0.5,
        borderColor: "rgba(0,0,0,0.08)",
        marginBottom: 12,
        overflow: "hidden",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(0,0,0,0.06)",
    },
    cardHeaderIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: PRIMARY_LIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    cardHeaderEmoji: {
        fontSize: 14,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "500",
        color: "#333",
    },

    // Summary
    summaryList: {
        padding: 16,
        gap: 10,
    },
    bulletItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: PRIMARY,
        marginTop: 5,
        flexShrink: 0,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        color: "#555",
        lineHeight: 20,
    },
    bulletBold: {
        fontWeight: "600",
        color: "#333",
    },

    // Chart
    chartWrap: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },

    // Session rows
    sessionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    sessionRowBorder: {
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    sessionNum: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: PRIMARY_LIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    sessionNumText: {
        fontSize: 12,
        fontWeight: "500",
        color: PRIMARY_DARK,
    },
    sessionInfo: {
        flex: 1,
    },
    sessionDuration: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    sessionTime: {
        fontSize: 11,
        color: "#999",
        marginTop: 1,
    },
    barWrap: {
        width: 60,
    },
    barBg: {
        height: 4,
        backgroundColor: PRIMARY_LIGHT,
        borderRadius: 2,
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        backgroundColor: PRIMARY,
        borderRadius: 2,
    },
});