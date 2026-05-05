import { createGoal, getGoal } from '@/features/user/userThunks';
import { useAppDispatch } from '@/hooks/redux-hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button, IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Theme ───────────────────────────────────────────────────────────────────
const C = {
    // ── Primary (Teal #258c91) ──────────────────────────
    teal:      '#258c91',
    tealLight: '#E6F4F5',
    tealDark:  '#1A666A',

    // ── Neutrals ────────────────────────────────────────
    bg:        '#F4F7F7',
    white:     '#FFFFFF',
    text:      '#162526',
    muted:     '#6A8E90',
    border:    '#dcdcdc',

    // ── Semantic ─────────────────────────────────────────
    success:   '#2EAB6E',

    // ── Goal Card Backgrounds ────────────────────────────
    daily:     '#FFF8EC',
    weekly:    '#E9F5F5',
    monthly:   '#EEF0FA',
    yearly:    '#F0FAF5',
};

// ─── Config ───────────────────────────────────────────────────────────────────
const GOALS_CONFIG = [
    {
        id: 'daily',
        period: 'Daily',
        unit: 'minutes',
        unitLabel: 'min / day',
        icon: '☀️',
        iconBg: C.daily,
        min: 5, max: 480, step: 5, defaultVal: 30,
        hint: (v: number) => `${Math.round(v / 5)} ayah per day`,
    },
    {
        id: 'weekly',
        period: 'Weekly',
        unit: 'ayah',
        unitLabel: 'ayah / week',
        icon: '📅',
        iconBg: C.weekly,
        min: 1, max: 40, step: 1, defaultVal: 5,
        hint: (v: number) => `${Math.round((v * 60) / 20)} ayah per week`,
    },
    {
        id: 'monthly',
        period: 'Monthly',
        unit: 'surah',
        unitLabel: 'surah / month',
        icon: '🗓️',
        iconBg: C.monthly,
        min: 1, max: 20, step: 1, defaultVal: 2,
        hint: (v: number) => `${v} surah x 12 months = ${v * 12} surah / month`,
    },
    {
        id: 'yearly',
        period: 'Yearly',
        unit: 'khatam',
        unitLabel: 'khatam / year',
        icon: '🏆',
        iconBg: C.yearly,
        min: 1, max: 200, step: 1, defaultVal: 24,
        hint: (v: number) => `Average ${(v / 12).toFixed(1)} khatam per year`,
    },
];

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface GoalConfig {
    year: number;
    values: GoalValue[];
}

interface GoalValue {
    id: string;
    value: number;
    unit: string;
}

// ─── GoalCard ─────────────────────────────────────────────────────────────────
function GoalCard({
    config,
    value,
    onChange,
}: {
    config: typeof GOALS_CONFIG[0];
    value: number;
    onChange: (v: number) => void;
}) {
    const [open, setOpen] = useState(true);
    const [inputText, setInputText] = useState(String(value));
    const anim = useRef(new Animated.Value(1)).current;
    const theme = useTheme();

    const decrement = () => {
        const next = Math.max(config.min, value - config.step);
        onChange(next);
        setInputText(String(next));
    };

    const increment = () => {
        const next = Math.min(config.max, value + config.step);
        onChange(next);
        setInputText(String(next));
    };

    const handleInputChange = (text: string) => {
        setInputText(text);
        const v = parseInt(text, 10);
        if (!isNaN(v)) onChange(Math.min(config.max, Math.max(config.min, v)));
    };

    const handleInputBlur = () => {
        setInputText(String(value));
    };

    const pressIn = () => Animated.spring(anim, { toValue: 0.97, useNativeDriver: true }).start();
    const pressOut = () => Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();

    return (
        <Animated.View style={[s.card, { transform: [{ scale: anim }] }]}>
            {/* Card Header */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setOpen(p => !p)}
                onPressIn={pressIn}
                onPressOut={pressOut}
                style={s.cardHeader}
            >
                <View style={[s.iconWrap, { backgroundColor: config.iconBg }]}>
                    <Text style={s.iconEmoji}>{config.icon}</Text>
                </View>

                <View style={s.headerInfo}>
                    <Text style={s.periodText}>{config.period}</Text>
                </View>

                <View style={s.unitTag}>
                    <Text style={s.unitTagText}>{inputText} {config.unitLabel}</Text>
                </View>
            </TouchableOpacity>

            {/* Card Body */}
            {open && (
                <View style={s.cardBody}>
                    <View style={s.inputRow}>
                        <TouchableOpacity style={s.stepperBtn} onPress={decrement} activeOpacity={0.7}>
                            <MaterialIcons name="remove" size={22} color={theme.colors.primary} />
                        </TouchableOpacity>

                        <TextInput
                            style={s.goalInput}
                            value={inputText}
                            onChangeText={handleInputChange}
                            onBlur={handleInputBlur}
                            keyboardType="number-pad"
                            textAlign="center"
                            maxLength={4}
                        />

                        <TouchableOpacity style={s.stepperBtn} onPress={increment} activeOpacity={0.7}>
                            <MaterialIcons name="add" size={22} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </Animated.View>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AdjustGoalScreen() {
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets();
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);

    const [goals, setGoals] = useState<Record<string, number>>(
        GOALS_CONFIG.reduce((acc, g) => ({ ...acc, [g.id]: g.defaultVal }), {})
    );

    const { handleSubmit, setValue } = useForm<GoalConfig>({
        defaultValues: {
            year: currentYear,
            values: [
                { id: 'daily',   value: 30,  unit: 'minute' },
                { id: 'weekly',  value: 5,   unit: 'hour'   },
                { id: 'monthly', value: 100, unit: 'ayah'   },
                { id: 'yearly',  value: 1,   unit: 'khatam' },
            ],
        },
    });

    const handleChange = (id: string, val: number) => {
        setGoals(prev => ({ ...prev, [id]: val }));
        setValue(`values.${GOALS_CONFIG.findIndex(g => g.id === id)}.value`, val, { shouldDirty: true });
    };

    const handleSave = handleSubmit(() => {
        // Alert.alert('Save Goals', 'It may take up to 72 hours for this to take effect.', [
        //     { text: 'Cancel',  onPress: () => console.log('Cancel Pressed'), style: 'cancel'  },
        //     { text: 'Confirm', onPress: () => console.log('Confirm pressed'), style: 'default' },
        // ]);

        dispatch(createGoal({
            "type": "QURAN_TIME",
            "amount": 600,
            "duration": 1,
            "category": "QURAN"
        }) as any);

        dispatch(getGoal() as any);
    });

    useEffect(() => {
        setValue('year', year);
    }, [year]);

    return (
        <SafeAreaView style={s.safe} edges={['bottom']}>
            <KeyboardAwareScrollView
                ScrollViewComponent={ScrollView}
                bottomOffset={insets.bottom}
                showsVerticalScrollIndicator={true}
            >
                {/* ── Year Selector ── */}
                <View style={s.yearSection}>
                    <View style={s.yearRow}>
                        <IconButton
                            icon="chevron-left"
                            onPress={() => setYear(y => y - 1)}
                            disabled={year <= currentYear}
                            mode="outlined"
                        />
                        <View style={s.yearDisplayWrap}>
                            <Text style={s.yearDisplay}>{year}</Text>
                        </View>
                        <IconButton
                            icon="chevron-right"
                            onPress={() => setYear(y => y + 1)}
                            mode="outlined"
                        />
                    </View>

                    <Button icon="save" mode="contained" onPress={() => handleSave()}>
                        Save
                    </Button>
                </View>

                {/* ── Goal Cards ── */}
                <View style={s.goalsList}>
                    {GOALS_CONFIG.map(cfg => (
                        <GoalCard
                            key={cfg.id}
                            config={cfg}
                            value={goals[cfg.id]}
                            onChange={v => handleChange(cfg.id, v)}
                        />
                    ))}
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: C.bg,
    },

    // Year
    yearSection: {
        paddingHorizontal: 16,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 32,
    },
    yearRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    yearDisplayWrap: {
        flex: 1,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    yearDisplay: {
        fontSize: 22,
        fontWeight: '700',
        color: C.text,
    },

    // Goals list
    goalsList: {
        paddingHorizontal: 16,
        paddingTop: 12,
        flexDirection: 'column',
    },

    // Card
    card: {
        backgroundColor: C.white,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: 14,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconEmoji: {
        fontSize: 20,
    },
    headerInfo: {
        flex: 1,
    },
    periodText: {
        fontSize: 16,
        fontWeight: '600',
        color: C.text,
        letterSpacing: -0.1,
    },
    unitTag: {
        backgroundColor: C.tealLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
    },
    unitTagText: {
        fontSize: 14,
        fontWeight: '500',
        color: C.tealDark,
    },
    hintText: {
        fontSize: 12,
        color: C.muted,
        textAlign: 'right',
        maxWidth: 120,
        lineHeight: 15,
    },

    // Card body
    cardBody: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stepperBtn: {
        width: 42,
        height: 42,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.bg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalInput: {
        flex: 1,
        height: 42,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 12,
        fontSize: 14,
        fontWeight: '700',
        color: C.text,
        backgroundColor: C.bg,
        textAlign: 'center',
        paddingVertical: 0,
    },
});