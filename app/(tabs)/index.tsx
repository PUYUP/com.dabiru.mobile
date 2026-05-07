import { MUSHAF_ID } from '@/constants/oauth';
import VerseForRead from '@/features/tafsirs/components/verse-for-read';
import StreakCard from '@/features/user/components/streak-card';
import { addActivity } from '@/features/user/userThunks';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { useQFAuth } from '@/hooks/use-qf-auth';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const dispatch = useAppDispatch();

  const { logout } = useQFAuth();

  const updateProgress = () => {
    // dispatch(updateGoal({
    //   data: {
    //     type: 'QURAN_TIME',
    //     amount: 600,
    //     category: 'QURAN',
    //     duration: 1,
    //   },
    //   id: 'czcmxtulsis0t03xy1lr1itg',
    // }) as any);

    dispatch(addActivity({
      seconds: 100,
      mushafId: MUSHAF_ID,
      ranges: ["1:2-1:3"],
      type: 'QURAN',
      date: '2026-05-04',
    }) as any);
  }
  
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.scrollContent}>
          <View style={{ marginBottom: 16, paddingHorizontal: 16 }}>
            <VerseForRead verseKey='2:40' />
          </View>

          <View style={{ marginBottom: 16, paddingHorizontal: 16 }}>
            <StreakCard />
          </View>

          

          <View>
            <Button mode="contained" onPress={logout}>
              Logout
            </Button>

            <Button mode="contained" onPress={updateProgress}>
              Update progress
            </Button>
          </View>
        </View>
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
  profileRow: {
    marginBottom: 16,
  }
});
