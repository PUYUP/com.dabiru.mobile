import { bulkUpdateConfig, getLanguages, getTafsirs, getTranslations } from "@/features/config/configThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

type TafsirEntry = {
    author_name: string | null;
    id: number;
    language_name: string;
    name: string;
    slug: string;
    translated_name: object;
};

type TranslationEntry = {
    author_name: string | null;
    id: number;
    language_name: string;
    name: string;
    slug: string | null;
    translated_name: {
        language_name: string;
        name: string;
    };
};

type LanguageEntry = {
    id: number;
    name: string;
    native_name: string;
    iso_code: string;
    direction: string;
};

type FallbackLanguage = LanguageEntry & {
    tafsir: TafsirEntry;
};

type MergedLanguageConfig = {
    language: LanguageEntry;
    tafsir: TafsirEntry | null;
    translation: TranslationEntry | null;
};

const KATHIR_SLUG_PATTERNS = [
    /kath[iī]r/i,
    /katheer/i,
    /kats[iī]r/i,
    /kas[ei]r/i,
    /katir/i,
    /kacir/i,
];

const FALLBACK_LANGUAGES: FallbackLanguage[] = [
    {
        id: 33,
        name: 'indonesian',
        native_name: 'Bahasa Indonesia',
        iso_code: 'id',
        direction: 'ltr',
        tafsir: {
            id: 134,
            author_name: 'Salim Bahreisy dan Said Bahreisy',
            language_name: 'indonesian',
            name: 'Tafsir Ibnu Katsir',
            slug: 'id-tafsir-ibn-kathir',
            translated_name: {},
        },
    },
];

function mergeLanguageConfigs(
    languageList: LanguageEntry[],
    tafsirList: TafsirEntry[],
    translationList: TranslationEntry[]
): MergedLanguageConfig[] {
    const allLanguages = [
        ...languageList,
        ...FALLBACK_LANGUAGES.filter(
            (f) => !languageList.some((l) => l.iso_code === f.iso_code)
        ),
    ];

    return allLanguages.reduce<MergedLanguageConfig[]>((acc, language) => {
        const fallback = FALLBACK_LANGUAGES.find((f) => f.iso_code === language.iso_code);

        const tafsir = tafsirList.find(
            (t) =>
                KATHIR_SLUG_PATTERNS.some((pattern) => pattern.test(t.slug)) &&
                t.language_name.toLowerCase() === language.name.toLowerCase()
        ) ?? fallback?.tafsir ?? null;

        if (!tafsir) return acc;

        const translation = translationList.find(
            (t) => t.language_name.toLowerCase() === language.name.toLowerCase()
        ) ?? null;

        acc.push({ language, tafsir, translation });
        return acc;
    }, []);
}

const LanguageItem = ({
    language,
    isSelected,
    onPress,
}: {
    language: LanguageEntry;
    isSelected: boolean;
    onPress: () => void;
}) => {
    const theme = useTheme();
    const accent = theme.colors.primary;
    const accentBorder = theme.colors.surfaceVariant;
    const accentLight = theme.colors.surfaceVariant;

    return (
        <TouchableOpacity
            style={[
                styles.languageItem,
                isSelected && { backgroundColor: accentLight, borderColor: accentBorder },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.languageName, isSelected && { color: accent, fontWeight: '500' }]}>
                {language.native_name}
            </Text>
            <View style={[styles.radio, isSelected && { borderColor: accent }]}>
                {isSelected && <View style={[styles.radioDot, { backgroundColor: accent }]} />}
            </View>
        </TouchableOpacity>
    );
};

export default function ChooseLanguageScreen() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [selectedConfig, setSelectedConfig] = useState<MergedLanguageConfig | null>(null);
    const [mergedConfigs, setMergedConfigs] = useState<MergedLanguageConfig[]>([]);

    const languages = useAppSelector((state: any) => state.config.languages.data);
    const translations = useAppSelector((state: any) => state.config.translations);
    const tafsirs = useAppSelector((state: any) => state.config.tafsirs);

    useEffect(() => {
        dispatch(getLanguages() as any);
        dispatch(getTranslations() as any);
        dispatch(getTafsirs() as any);
    }, []);

    useEffect(() => {
        if (!languages || !tafsirs.data || !translations.data) return;

        const merged = mergeLanguageConfigs(languages, tafsirs.data, translations.data);
        setMergedConfigs(merged);
    }, [languages, tafsirs.data, translations.data]);

    const chooseHandler = () => {
        if (!selectedConfig) return;

        dispatch(bulkUpdateConfig({
            language: { language: selectedConfig.language.iso_code },
            tafsirs: { selectedTafsirs: [selectedConfig.tafsir?.slug] },
            translations: { selectedTranslations: [selectedConfig.translation?.id] },
        }) as any);

        router.navigate('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select Tafsir Language</Text>
                    <Text style={styles.subtitle}>Choose the language for Quran interpretation</Text>
                </View>

                <FlatList
                    data={mergedConfigs}
                    renderItem={({ item }) => (
                        <LanguageItem
                            language={item.language}
                            isSelected={selectedConfig?.language.iso_code === item.language.iso_code}
                            onPress={() => setSelectedConfig(item)}
                        />
                    )}
                    keyExtractor={(item) => item.language.iso_code}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />

                <Button
                    mode="contained"
                    disabled={!selectedConfig}
                    onPress={chooseHandler}
                    style={styles.continueButton}
                >
                    <Text>Continue</Text>
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 32,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
    },
    list: {
        gap: 12,
        paddingBottom: 16,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: '#f6f6f4',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    languageName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '400',
        color: '#333',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    continueButton: {
        marginTop: 'auto',
        marginBottom: 12,
    },
});