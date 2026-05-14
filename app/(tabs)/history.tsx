import { ScrollView, StyleSheet, View } from 'react-native';

import { useQFAuth } from '@/hooks/use-qf-auth';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  const { login, isReady } = useQFAuth();
  const { logout } = useQFAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.scrollContent}>
          <Button mode="contained" onPress={logout}>
            Logout
          </Button>
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
});
