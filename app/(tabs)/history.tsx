import { supabaseGetSessions } from '@/features/reading/readingThunk';
import { GetSessionQuery } from '@/features/reading/readingTyping';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { formatSeconds } from '@/utils/format-seconds';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

function Loading() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
    </View>
  )
}

export default function TabTwoScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sessions = useAppSelector((state: any) => state.reading.supabaseSessions);
  const chapters = useAppSelector((state: any) => state.reading.chapters);

  const query: GetSessionQuery = {
    from: 0,
    to: 25,
    status: 'ended',
  }

  useEffect(() => {
    dispatch(supabaseGetSessions(query) as any);
  }, []);

  if (sessions.loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView nestedScrollEnabled={true} style={styles.scrollContent}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flex: 1 }}>
            <Loading />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView nestedScrollEnabled={true} style={styles.scrollContent}>
        <List.Section>
          {sessions.data.map((item: any) => {
            const surah = chapters.data.find((c: any) => c.id == item.current_chapter_number);

            return (
              <List.Item 
                key={item.id} 
                title={surah.name_simple + ' (' + item.verse_key + ')'}
                description={formatSeconds(item.total_read_seconds)}
                right={() => <List.Icon icon="keyboard-arrow-right" />} 
                titleStyle={{ fontWeight: 600, marginBottom: 2 }}
                onPress={() => router.push({
                  pathname: '/history-detail',
                  params: {
                    id: item.id,
                    verseKey: item.verse_key,
                  }
                })}
              />
            );
          })}
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flex: 1,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
