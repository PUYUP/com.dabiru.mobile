import { supabaseGetSessions } from '@/features/reading/readingThunk';
import { GetSessionQuery } from '@/features/reading/readingTyping';
import ReadingStats from '@/features/user/components/reading-stats';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { formatSeconds } from '@/utils/format-seconds';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#258c91';
const PRIMARY_LIGHT = '#e8f5f5';

function Loading() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={PRIMARY} />
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.emptyIconWrap}>
        <Text style={styles.emptyIconText}>📖</Text>
      </View>
      <Text style={styles.emptyTitle}>No history yet</Text>
      <Text style={styles.emptySubtitle}>
        Completed reading sessions will appear here
      </Text>
    </View>
  );
}

export default function TabTwoScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sessions = useAppSelector((state: any) => state.reading.supabaseSessions);
  const chapters = useAppSelector((state: any) => state.reading.chapters);
  const goal = useAppSelector((state: any) => state.user.goal);

  const query: GetSessionQuery = {
    from: 0,
    to: 50,
    status: 'ended',
  };

  useEffect(() => {
    dispatch(supabaseGetSessions(query) as any);
  }, []);

  if (sessions.loading || goal.loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (!sessions.data || sessions.data.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        nestedScrollEnabled={true}
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {goal.data && (
          <ReadingStats activity={goal.data} />
        )}

        <View style={styles.listWrap}>
          {sessions.data.map((item: any, index: number) => {
            const surah = chapters.data.find(
              (c: any) => c.id == item.current_chapter_number
            );

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.sessionCard,
                  index < sessions.data.length - 1 && styles.sessionCardBorder,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/history-detail',
                    params: {
                      id: item.id,
                      chapter: item.current_chapter_number,
                      from: item.from_verse_number,
                      to: item.to_verse_number,
                    },
                  })
                }
              >
                {/* Info */}
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle} numberOfLines={1}>
                    {surah?.name_simple ?? '—'}
                  </Text>
                  <Text style={styles.sessionSub}>
                    Verse {item.current_chapter_number} · {item.from_verse_number != item.to_verse_number ? item.from_verse_number + (item.to_verse_number ? '-' + item.to_verse_number : '') : item.to_verse_number}
                  </Text>
                </View>

                {/* Duration + chevron */}
                <View style={styles.sessionRight}>
                  <Text style={styles.sessionDuration}>
                    {formatSeconds(item.total_read_seconds)}
                  </Text>
                  <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.sessionSub}>{format(item.created_at, 'eeee, dd LLL yyyy', { locale: enUS })}</Text>
                    <MaterialIcons name="keyboard-arrow-right" style={styles.chevron} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f0f4f4',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },

  // Header
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },

  // List
  scrollContent: {
    flex: 1,
  },
  listWrap: {
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },

  // Session card
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  sessionCardBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },

  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  sessionSub: {
    fontSize: 12,
    color: '#888',
  },

  sessionRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  sessionDuration: {
    fontSize: 13,
    fontWeight: '500',
    color: PRIMARY,
  },
  chevron: {
    fontSize: 18,
    color: '#ccc',
  },
});