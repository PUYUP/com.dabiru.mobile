import { updateConfig } from "@/features/config/configThunks";
import { useAppDispatch } from "@/hooks/redux-hooks";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Colors } from "react-native-ui-lib";

const LANGUAGES = [
    { code: 'gb', lang: 'en', name: 'English' },
    { code: 'id', lang: 'id', name: 'Indonesian' },
    { code: 'ru', lang: 'ru', name: 'русский' },
    { code: 'sa', lang: 'ar', name: 'العربية' },
    { code: 'pk', lang: 'ur', name: 'اردو' },
    { code: 'bd', lang: 'bn', name: 'বাংলা' },
];

const LanguageItem = ({
    language,
    isSelected,
    onPress,
}: {
    language: typeof LANGUAGES[0];
    isSelected: boolean;
    onPress: () => void;
}) => {
    // Read RNUI colors at render time, not at module load time
    const accent = Colors.$textPrimary;
    const accentBorder = Colors.$backgroundPrimaryHeavy;
    const accentLight = Colors.accentPrimary;

    return (
        <TouchableOpacity
            style={[
                styles.languageItem,
                isSelected && { backgroundColor: accentLight, borderColor: accentBorder },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <CountryFlag isoCode={language.code} size={22} />
            <Text style={[styles.languageName, isSelected && { color: accent, fontWeight: '500' }]}>
                {language.name}
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

    const chooseHandler = (lang: string) => {
        dispatch({ type: 'auth/setLanguageSelected', payload: lang });
        dispatch(updateConfig({ group: 'language', key: 'language', value: lang }) as any);
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
                    data={LANGUAGES}
                    renderItem={({ item }) => (
                        <LanguageItem
                            language={item}
                            isSelected={selectedLang === item.lang}
                            onPress={() => setSelectedLang(item.lang)}
                        />
                    )}
                    keyExtractor={(item) => item.lang}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />

                <Button
                    label="Continue"
                    disabled={!selectedLang}
                    onPress={() => { chooseHandler(selectedLang!); }}
                    style={styles.continueButton}
                />
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