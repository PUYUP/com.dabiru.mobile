import VerseForRead from '@/features/tafsirs/components/verse-for-read';
import StrikeCard from '@/features/user/components/strike-card';
import { useAppSelector } from '@/hooks/redux-hooks';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Skeleton from 'react-native-reanimated-skeleton';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMERALD = '#1B6B4A';
const GOLD = '#258c91';

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getGreetingEmoji(hour: number): string {
  if (hour < 12) return '🌤️';
  if (hour < 17) return '☀️';
  return '🌙';
}

// ─── Skeleton ────────────────────────────────────────────────
function ProfileHeaderSkeleton() {
  return (
    <View style={styles.profileHeader}>
      <View style={styles.profileLeft}>
        <Skeleton
          isLoading
          containerStyle={styles.skeletonGreeting}
          layout={[{ key: 'greeting', width: 100, height: 13 }]}
        />
        <Skeleton
          isLoading
          containerStyle={styles.skeletonName}
          layout={[{ key: 'name', width: 200, height: 22 }]}
        />
      </View>

      <Skeleton
        isLoading
        containerStyle={styles.skeletonAvatar}
        layout={[{ key: 'avatar', width: 44, height: 44, borderRadius: 22 }]}
      />
    </View>
  );
}

// ─── Content ─────────────────────────────────────────────────
interface ProfileHeaderContentProps {
  firstName: string;
  lastName: string;
  username: string;
}

function ProfileHeaderContent({ firstName, lastName, username }: ProfileHeaderContentProps) {
  // Computed once per render, not at module load time
  const hour = useMemo(() => new Date().getHours(), []);

  return (
    <View style={styles.profileHeader}>
      <View style={styles.profileLeft}>
        <Text style={styles.greeting}>
          {getGreeting(hour)} {getGreetingEmoji(hour)}
        </Text>
        <Text style={styles.userName}>
          {firstName} {lastName}
        </Text>
      </View>

      <View style={styles.avatarCircle}>
        <Text style={styles.avatarInitial}>
          {username.charAt(0).toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

// ─── Orchestrator ─────────────────────────────────────────────
function ProfileHeader() {
  const { loading, data } = useAppSelector((state: any) => state.auth.user);

  // State 1: initial load (data belum ada sama sekali)
  if (loading && !data) return <ProfileHeaderSkeleton />;

  // State 2: data tidak tersedia & tidak sedang loading (error / unauthenticated)
  if (!data) return null;

  // State 3: data tersedia, sedang di-refresh → tampilkan konten + overlay skeleton tipis
  // (opsional: bisa juga cukup return content saja tanpa skeleton refresh)
  return (
    <>
      {loading && <ProfileHeaderSkeleton />}
      {!loading && (
        <ProfileHeaderContent
          firstName={data.firstName}
          lastName={data.lastName}
          username={data.username}
        />
      )}
    </>
  );
}

// ─── Screen ──────────────────────────────────────────────────
export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <ProfileHeader />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR STREAK</Text>
          <StrikeCard />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTINUE READING</Text>
          <VerseForRead />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F8F6',
  },
  scrollContent: {
    paddingBottom: 32,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    gap: 4,
  },
  greeting: {
    fontSize: 13,
    color: '#8A9B8E',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A2C22',
    letterSpacing: -0.3,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: EMERALD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Skeleton containers — ukuran eksplisit, tanpa flex: 1 agar tidak melar
  skeletonGreeting: {
    width: 100,
    height: 13,
  },
  skeletonName: {
    width: 200,
    height: 22,
    marginTop: 4,
  },
  skeletonAvatar: {
    width: 44,
    height: 44,
  },

  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: GOLD,
    letterSpacing: 1.5,
  },
  divider: {
    marginHorizontal: 20,
    marginTop: 20,
    height: 1,
    backgroundColor: '#E4EBE6',
  },
});