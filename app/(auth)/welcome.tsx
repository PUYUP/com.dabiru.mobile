import { useQFAuth } from "@/hooks/use-qf-auth";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { Button } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const Index = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const floatA = useRef(new Animated.Value(0)).current;
    const floatB = useRef(new Animated.Value(0)).current;
    const floatC = useRef(new Animated.Value(0)).current;

    // Login flow
    const { login, isReady } = useQFAuth();
    const continueHandler = () => {
        console.info("Continue with Quran.Foundation");
        login();
    };

    useEffect(() => {
        const loopA = Animated.loop(
            Animated.sequence([
                Animated.timing(floatA, { toValue: 1, duration: 2400, useNativeDriver: true }),
                Animated.timing(floatA, { toValue: 0, duration: 2400, useNativeDriver: true }),
            ])
        );
        const loopB = Animated.loop(
            Animated.sequence([
                Animated.timing(floatB, { toValue: 1, duration: 2800, useNativeDriver: true }),
                Animated.timing(floatB, { toValue: 0, duration: 2800, useNativeDriver: true }),
            ])
        );
        const loopC = Animated.loop(
            Animated.sequence([
                Animated.timing(floatC, { toValue: 1, duration: 2600, useNativeDriver: true }),
                Animated.timing(floatC, { toValue: 0, duration: 2600, useNativeDriver: true }),
            ])
        );

        loopA.start();
        loopB.start();
        loopC.start();

        return () => {
            loopA.stop();
            loopB.stop();
            loopC.stop();
        };
    }, [floatA, floatB, floatC]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={{ display: 'flex', gap: 16, paddingTop: 32 }}>
                <View style={styles.heroWrap}>
                    <View style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Inter-Black', fontWeight: '700', fontSize: 42, marginBottom: 2, textAlign: 'center' }}>Dabiru</Text>
                        <Text style={{ textAlign: 'center', fontSize: 20 }}>رفيق التفسير اليومي</Text>
                    </View>

                    <View
                        style={{
                            marginTop: '30%',
                            marginLeft: '6%',
                            marginRight: '6%',
                        }}
                    >
                        <Animated.View
                            style={[
                                styles.valueChip,
                                styles.chipA,
                                {
                                    transform: [
                                        {
                                            translateY: floatA.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -8],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <CountryFlag isoCode="pk" size={15} />
                            <Text style={{ fontSize: 16, opacity: 0.8 }}>روزانہ تفسیر ساتھی۔</Text>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.valueChip,
                                styles.chipB,
                                {
                                    transform: [
                                        {
                                            translateY: floatB.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 10],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <CountryFlag isoCode="id" size={15} />
                            <Text style={{ fontSize: 16, opacity: 0.8 }}>Pendamping tafsir harian</Text>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.valueChip,
                                styles.chipC,
                                {
                                    transform: [
                                        {
                                            translateY: floatC.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -6],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <CountryFlag isoCode="gb" size={15} />
                            <Text style={{ fontSize: 16, opacity: 0.8 }}>Daily tafsir companion</Text>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.valueChip,
                                styles.chipD,
                                {
                                    transform: [
                                        {
                                            translateY: floatB.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 10],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <CountryFlag isoCode="bd" size={15} />
                            <Text style={{ fontSize: 16, opacity: 0.8 }}>দৈনিক তাফসির সঙ্গী</Text>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.valueChip,
                                styles.chipE,
                                {
                                    transform: [
                                        {
                                            translateY: floatB.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 10],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <CountryFlag isoCode="ru" size={15} />
                            <Text style={{ fontSize: 16, opacity: 0.8 }}>Тафсир каждый день</Text>
                        </Animated.View>
                    </View>
                </View> 
            </View>
            
            {isReady && (
                <View style={{ marginTop: 'auto', paddingBottom: insets.bottom + 16, paddingHorizontal: 40 }}>
                    <Button 
                        onPress={() => continueHandler()}
                        mode="contained">
                        <Text>Continue with Quran.Foundation</Text>
                    </Button>
                </View>
            )}
        </SafeAreaView>
    ); // or other content
}

export default Index;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 16,
        flexGrow: 1,
        justifyContent: 'center',
    },
    heroWrap: {
        position: 'relative',
        minHeight: 220,
        justifyContent: 'center',
    },
    valueChip: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    chipA: {
        left: 8,
        top: 24,
    },
    chipB: {
        right: 6,
        top: 102,
    },
    chipC: {
        left: 110,
        bottom: 34,
    },
    chipD: {
        left: 26,
        top: 170,
    },

    chipE: {
        right: 10,
        top: 255,
    },
});