import TextRenderer from "@/features/tafsirs/components/text-renderer";
import VerseRenderer from "@/features/tafsirs/components/verse-renderer";
import { getVerseByKey } from "@/features/tafsirs/tafsirsThunk";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function TafsirReader() {
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const { verseKey } = useLocalSearchParams();
    const verse = useAppSelector((state: any) => state.tafsirs.verse);
    const config = useAppSelector((state: any) => state.config);
    const preferences = config.preferences;

    useEffect(() => {
        dispatch(getVerseByKey({
            verseKey: verseKey as string,
            query: {
                language: preferences.language.language,
                tafsirs: preferences.tafsirs.selectedTafsirs[0],
                translations: preferences.translations.selectedTranslations[0],
                fields: 'text_uthmani_tajweed',
            },
        }) as any);
    }, []);

    if (verse.loading || !verse.data) return null;

    const tafsirText = verse.data.tafsirs ? verse.data.tafsirs.map((item: any) => item.text).join(' ') : null;
    const translationText = verse.data.translations ? verse.data.translations && verse.data.translations.map((item: any) => item.text).join(' ') : null;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={[styles.scrollContent, { paddingBottom: insets.bottom }]}>
                <View style={styles.inner}>
                    <View style={{ marginBottom: 24 }}>
                        <VerseRenderer verseText={verse.data.text_uthmani_tajweed} />
                    </View>

                    {/* Translation blockquote */}
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