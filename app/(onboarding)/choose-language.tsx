import { bulkUpdateConfig, getLanguages, getTranslations } from "@/features/config/configThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { Button, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// currently only language have ibnu kathir tafsirs
const LANGUAGES = [
    { 
        flag: 'gb', 
        iso_code: 'en', 
        name: 'English', 
        language_id: 84,
        language_name: 'english',
        tafsir_slug: 'en-tafisr-ibn-kathir',
    },
    { 
        flag: 'id', 
        iso_code: 'id', 
        name: 'Bahasa Indonesia', 
        language_id: 33,
        language_name: 'indonesian',
        tafsir_slug: 'id-tafsir-ibn-kathir' 
    },
];

const LanguageItem = ({
    language,
    isSelected,
    onPress,
}: {
    language: any;
    isSelected: boolean;
    onPress: () => void;
}) => {
    const theme = useTheme();
    const accent = theme.colors.primary;
    const accentBorder = theme.colors.surfaceVariant;
    const accentLight = theme.colors.primaryContainer;

    return (
        <TouchableOpacity
            style={[
                styles.languageItem,
                isSelected && { backgroundColor: accentLight, borderColor: accentBorder },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <CountryFlag isoCode={language.flag} size={22} />
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
    const [selectedLang, setSelectedLang] = useState<string | null>(null);
    const [selectedTafsir, setSelectedTafsir] = useState<string | null>(null);
    const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
    const [languagesList, setLanguagesList] = useState<any[]>([]);

    const languages = useAppSelector((state: any) => state.config.languages.data);
    const translations = useAppSelector((state: any) => state.config.translations.data);

    useEffect(() => {
        if (languages) {
            const used = languages
                .filter((l: any) => 
                    LANGUAGES.some((item: any) => item.iso_code === l.iso_code)
                )
                .map((l: any) => {
                    const found = LANGUAGES.find((obj: any) => obj.iso_code == l.iso_code);
                    return {
                        ...l,
                        flag: found?.flag,
                        tafsir_slug: found?.tafsir_slug,
                        language_id: found?.language_id,
                    }
                });

            setLanguagesList(used);
        }
    }, [languages]);

    const chooseHandler = (lang: string) => {
        dispatch(bulkUpdateConfig({
            language: { language: selectedLang },
            tafsirs: { selectedTafsirs: [selectedTafsir] },
            translations: { selectedTranslations: [selectedTranslation] },
        }) as any);
        
        router.navigate('/(tabs)');
    };

    useEffect(() => {
        dispatch(getLanguages() as any);
        dispatch(getTranslations() as any);
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select Tafsir Language</Text>
                    <Text style={styles.subtitle}>Choose the language for Quran interpretation</Text>
                </View>

                <FlatList
                    data={languagesList}
                    renderItem={({ item }) => (
                        <LanguageItem
                            language={item}
                            isSelected={selectedLang === item.iso_code}
                            onPress={() => {
                                setSelectedLang(item.iso_code);
                                setSelectedTafsir(item.tafsir_slug);
                                setSelectedTranslation(item.language_id);
                            }}
                        />
                    )}
                    keyExtractor={(item) => item.iso_code}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />

                <Button
                    mode="contained"
                    disabled={!selectedLang}
                    onPress={() => { chooseHandler(selectedLang!); }}
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