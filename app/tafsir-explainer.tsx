import { useAppSelector } from '@/hooks/redux-hooks';
import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_500Medium_Italic,
  EBGaramond_600SemiBold,
  EBGaramond_600SemiBold_Italic,
  EBGaramond_700Bold,
  EBGaramond_700Bold_Italic,
  EBGaramond_800ExtraBold,
  EBGaramond_800ExtraBold_Italic,
  useFonts,
} from '@expo-google-fonts/eb-garamond';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TafsirExplainerScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const explainer = useAppSelector((state: any) => state.tafsirs.explainer);
  const notes = useAppSelector((state: any) => state.tafsirs.notes);

  const [fontsLoaded] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium,
    EBGaramond_500Medium_Italic,
    EBGaramond_600SemiBold,
    EBGaramond_600SemiBold_Italic,
    EBGaramond_700Bold,
    EBGaramond_700Bold_Italic,
    EBGaramond_800ExtraBold,
    EBGaramond_800ExtraBold_Italic,
  });

  if (explainer.loading || notes.loading || !fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={[styles.scrollContent, { paddingBottom: insets.bottom }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {notes.data.map((item: any) => {
          const body = JSON.parse(item.body);

          return (
            <View key={item.id} style={styles.card}>
              <View style={{ marginBottom: 18 }}>
                <Text style={[styles.label, { color: theme.colors.primary }]}>Question:</Text>
                <Text style={styles.value}>{body.question}</Text>
              </View>

              <View>
                <Text style={[styles.label, { color: theme.colors.primary }]}>Answer:</Text>
                <Text style={styles.value}>{body.answer}</Text>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F1E7',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    marginBottom: 32,
    backgroundColor: '#ECE7DC',
    padding: 16,
    borderRadius: 16,
  },
  label: {
    fontWeight: 600,
    fontSize: 14,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 1,
  },
  value: {
    fontSize: 20,
    fontFamily: 'EBGaramond_500Medium',
  }
});
