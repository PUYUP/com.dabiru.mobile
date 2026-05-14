import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppSelector } from '@/hooks/redux-hooks';
import { useQFAuth } from '@/hooks/use-qf-auth';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  const { logout } = useQFAuth();
  const user = useAppSelector((state: any) => state.auth.user);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.scrollContent}>
          {user && (
            <View style={styles.profileWrapper}>
              <Image src={user.avatarUrls.large} style={styles.avatar} />
              <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.userName}>@{user.username}</Text>
              <Button mode="contained" onPress={logout} style={{ marginTop: 20 }}>
                Logout
              </Button>
            </View>
          )}
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
    paddingHorizontal: 16,
  },
  profileWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
  },
  avatar: {
    width: 100,
    height: 100,
  },
  name: {
    marginTop: 10,
    fontSize: 20,
  },
  userName: {
    fontSize: 15,
  }
});
