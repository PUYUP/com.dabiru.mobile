import { getUserProfile } from '@/features/auth/authThunks';
import { updateGoal } from '@/features/user/userThunks';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { useQFAuth } from '@/hooks/use-qf-auth';
import { useEffect, useState } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Image, Keyboard, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Button, HelperText, Snackbar, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  const dispatch = useAppDispatch();
  const { logout } = useQFAuth();
  const user = useAppSelector((state: any) => state.auth.user);
  const config = useAppSelector((state: any) => state.config.preferences);
  const goal = useAppSelector((state: any) => state.user.goal);
  const updatingGoal = useAppSelector((state: any) => state.user.updatingGoal);

  const [visible, setVisible] = useState<boolean>(false);
  const onDismissSnackBar = () => setVisible(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      dailyTargetMinutes: '15',
    },
  });

  const onSubmit = (data: { dailyTargetMinutes: string }) => {
    Keyboard.dismiss();

    const { dailyTargetMinutes } = data;

    if (dailyTargetMinutes && dailyTargetMinutes !== '') {
      const dailyTargetSeconds = parseInt(dailyTargetMinutes, 10) * 60;

      if (goal.data) {
        dispatch(updateGoal({
          data: {
            type: 'QURAN_TIME',
            amount: dailyTargetSeconds,
            category: 'QURAN',
          },
          id: goal.data.goalId,
        }) as any);
      }
    }
  };

  useEffect(() => {
    if (user.loading) return;
    if (user.data) return;

    dispatch(getUserProfile() as any);
  }, [user]);

  useEffect(() => {
    if (goal.loading) return;
    if (!goal.data) return;

    setValue('dailyTargetMinutes', (goal.data.dailyTargetSeconds / 60).toString());
  }, [goal]);

  useEffect(() => {
    if (updatingGoal.loading) {
      setVisible(true);
    } else {
      setVisible(false)
    }
  }, [updatingGoal]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled" // tap tombol Save tidak dismiss keyboard dulu
          contentContainerStyle={styles.scrollContent}
        >
          {user.loading 
            ? (
              <View style={{ marginBottom: 38 }}>
                <Text>Loading profile...</Text>
              </View>
            )
            : user.data ? (
                <View style={styles.profileWrapper}>
                  <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Image src={user.data.avatarUrls.large} style={styles.avatar} />
                    <View>
                      <Text style={styles.name}>{user.data.firstName} {user.data.lastName}</Text>
                      <Text style={styles.userName}>@{user.data.username}</Text>
                    </View>
                  </View>

                  <Button mode="contained" onPress={logout}>
                    Logout
                  </Button>
                </View>
              )
            : (
              <View style={{ marginBottom: 38 }}>
                <Text>Profile not found.</Text>
              </View>
            )
          }

          {!goal.loading && (
            <View>
              <Controller
                control={control}
                rules={{
                  required: 'Wajib diisi',
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Hanya boleh angka',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Daily target in minutes"
                      onBlur={onBlur}
                      onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))} // strip non-angka
                      value={value}
                      mode="outlined"
                      style={{ fontSize: 18 }}
                      keyboardType="numeric" // keypad angka
                      error={!!errors.dailyTargetMinutes}
                    />
                    {errors.dailyTargetMinutes && (
                      <HelperText type="error">
                        {errors.dailyTargetMinutes.message}
                      </HelperText>
                    )}
                  </>
                )}
                name="dailyTargetMinutes"
              />

              <Button mode="contained" onPress={handleSubmit(onSubmit)} style={{ marginTop: 42 }}>
                Save Settings
              </Button>
            </View>
          )}

          <Snackbar
            visible={visible}
            onDismiss={onDismissSnackBar}
            duration={15000}
            style={{ width: '100%' }}
            action={{
              label: 'OK',
              onPress: () => {
                // Do something
              },
            }}>
            Successfully saved!
          </Snackbar>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  profileWrapper: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: 32,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 60,
  },
  name: {
    fontSize: 18,
  },
  userName: {
    fontSize: 15,
  },
});