import { updateGoal } from "@/features/user/userThunks";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { IconButton, useTheme } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdjustGoalModal() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const theme = useTheme();
    const [minutes, setMinutes] = useState("");
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const insets = useSafeAreaInsets();
    const currentGoal = useAppSelector((state: any) => state.user.goal.data);

    const handleSave = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
            }),
        ]).start();
        Keyboard.dismiss();

        if (currentGoal) {
            dispatch(updateGoal({
                data: {
                    type: 'QURAN_TIME',
                    amount: parseInt(minutes) * 60, // back to seconds
                    category: 'QURAN',
                    duration: 1,
                },
                id: currentGoal.goalId,
            }) as any);

            // hide page
            router.back();
        }
    };

    const isValid = minutes.length > 0 && parseInt(minutes) > 0;

    useEffect(() => {
        if (currentGoal) {
            const dailyTargetSeconds = currentGoal.dailyTargetSeconds;
            const targetInMinutes = dailyTargetSeconds / 60;
            setMinutes(targetInMinutes.toString());
        }
    }, [currentGoal]);

    return (
        <SafeAreaView style={[styles.container, { paddingBottom: 16 }]} edges={["top"]}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior="padding"
                    keyboardVerticalOffset={insets.top + 16}
                    style={styles.container}
                >
                    <View style={styles.inner}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Adjust Goal</Text>
                            <IconButton
                                icon="close"
                                size={20}
                                onPress={() => router.back()}
                            />
                        </View>

                        <View style={styles.inputSection}>
                            <TextInput
                                style={styles.input}
                                value={minutes}
                                onChangeText={(val) => setMinutes(val.replace(/[^0-9]/g, ""))}
                                keyboardType="number-pad"
                                placeholder="30"
                                placeholderTextColor="#D1D5DB"
                                maxLength={3}
                                autoFocus
                                selectionColor="#111827"
                                textAlign="center"
                            />
                            <Text style={styles.unit}>minutes / day</Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                { backgroundColor: isValid ? theme.colors.primary : "#F3F4F6" },
                            ]}
                            onPress={handleSave}
                            disabled={!isValid}
                            activeOpacity={0.85}
                        >
                            <Text style={[styles.saveButtonText, !isValid && styles.saveButtonTextDisabled]}>
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    inner: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 10,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "800",
    },
    inputSection: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        fontSize: 96,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: -4,
        width: "100%",
        padding: 0,
        includeFontPadding: false,
        textAlignVertical: "center",
        textAlign: "center",
    },
    unit: {
        fontSize: 18,
        fontWeight: "500",
        color: "#9CA3AF",
        marginTop: 4,
        letterSpacing: 0.2,
    },
    saveButton: {
        borderRadius: 40,
        paddingVertical: 18,
        alignItems: "center",
    },
    saveButtonText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.3,
    },
    saveButtonTextDisabled: {
        color: "#9CA3AF",
    },
});