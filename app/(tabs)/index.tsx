import VerseForRead from '@/features/tafsirs/components/verse-for-read';
import StrikeCard from '@/features/user/components/strike-card';
import { useAppSelector } from '@/hooks/redux-hooks';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Skeleton from "react-native-reanimated-skeleton";
import { SafeAreaView } from 'react-native-safe-area-context';

// Replace with your actual user data source
const GREETING_HOUR = new Date().getHours();

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

function ProfileHeader() {
  const user = useAppSelector((state: any) => state.auth.user);
  if (!user.data) return;

  return (
    <View style={styles.profileHeader}>
      <View style={styles.profileLeft}>
        <Text style={styles.greeting}>
          {getGreeting(GREETING_HOUR)} {getGreetingEmoji(GREETING_HOUR)}
        </Text>

        {user.loading 
          ? (
            <Skeleton
              containerStyle={{ flex: 1, width: 300, marginTop: 4 }}
              isLoading={true}
              layout={[
                { key: "name", width: 220, height: 16 },
              ]}
            />
          ) : (
            <Text style={styles.userName}>{user.data.firstName} {user.data.lastName}</Text>
          )
        }
      </View>
      
      {user.loading 
        ? (
          <Skeleton
            containerStyle={{ flex: 1, width: 40, height: 40 }}
            isLoading={true}
            layout={[
              { key: "avatar", width: 40, height: 40, borderRadius: 40 },
            ]}
          />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user.data.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )
      }
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.section}>
          <ProfileHeader />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Strike Card */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR STREAK</Text>
          <StrikeCard />
        </View>

        {/* Verse for Read */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONTINUE READING</Text>
          <VerseForRead />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const EMERALD = '#1B6B4A';
const GOLD = '#258c91';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F8F6',
  },
  scrollContent: {
    paddingBottom: 32,
  },

  /* Profile Header */
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    gap: 2,
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

  /* Layout */
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