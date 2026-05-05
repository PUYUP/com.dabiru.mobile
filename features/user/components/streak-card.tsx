/**
 * StreakCard.tsx
 *
 * Dependencies to install:
 *   npm install react-native-svg
 *   npx pod-install  (iOS)
 */

import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { generateDays } from '@/utils/days-generator';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getGoal } from '../userThunks';
import { GoalInfo } from '../userTyping';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODE_LIST = [
  { id: 'daily',   label: 'Daily'   },
] as const;

type Mode = typeof MODE_LIST[number]['id'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreakInfo {
  id: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  label: string;
  value: string;
  unit: string;
  num: number;
  isCurrent: boolean;
  isStreaked: boolean;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const STREAK_DATA = [
  { id: 'current', icon: 'whatshot' as const, color: '#EF4444', label: 'Current Streak', value: '5',     unit: 'days' },
  { id: 'longest', icon: 'star'     as const, color: '#03C430', label: 'Longest Streak', value: '1.321', unit: 'days' },
  { id: 'failed',  icon: 'cancel'   as const, color: '#F59E0B', label: 'Failed Streak',  value: '24',    unit: 'days' },
];

// ─── Animated Circle ──────────────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── CircularProgress ─────────────────────────────────────────────────────────

interface CircularProgressProps {
  current: number;
  goal: GoalInfo;
}

function CircularProgress({ current, goal }: CircularProgressProps) {
  const RADIUS = 70;
  const STROKE = 12;
  const normalizedRadius = RADIUS - STROKE / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const ARC_RATIO = 0.80;
  const arcLength = circumference * ARC_RATIO;
  const gapLength = circumference - arcLength;
  const trackDasharray = `${arcLength} ${gapLength}`;

  const animatedValue = useRef(new Animated.Value(arcLength)).current;

  useEffect(() => {
    const progress = Math.min(current / Number(goal.dailyTargetSeconds), 1);
    // BUG FIX: strokeDashoffset of 0 = full arc visible, arcLength = empty.
    // Was previously `arcLength - progress * arcLength` which is correct, but
    // the initial Animated.Value was 0 (full progress shown on mount before
    // animating). Changed initial value to arcLength (empty) so it always
    // animates from empty → filled correctly on the first render.
    const targetOffset = arcLength * (1 - progress);

    Animated.timing(animatedValue, {
      toValue: targetOffset,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [current, goal, animatedValue, arcLength]);

  const size = RADIUS * 2;
  const svgRotationDeg = 180 * ARC_RATIO - 17.85;

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: `${svgRotationDeg}deg` }] }}
      >
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%"   stopColor="#22C55E" />
            <Stop offset="100%" stopColor="#16A34A" />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          stroke="#E8EEF4"
          fill="transparent"
          strokeWidth={STROKE}
          strokeDasharray={trackDasharray}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={RADIUS}
          cy={RADIUS}
        />

        {/* Progress */}
        <AnimatedCircle
          stroke="url(#grad)"
          fill="transparent"
          strokeWidth={STROKE}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={animatedValue}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={RADIUS}
          cy={RADIUS}
        />
      </Svg>

      <View style={styles.circleCenter}>
        <Text style={styles.circleNumber}>{Math.round(goal.secondsRead / 60)}</Text>
        <Text style={styles.circleSubtitle}>of {Math.round(goal.dailyTargetSeconds / 60)} {'min'}</Text>
      </View>
    </View>
  );
}

// ─── DayDot ───────────────────────────────────────────────────────────────────

interface DayDotProps {
  index: number;
  data: StreakInfo;
}

function DayDot({ index, data }: DayDotProps) {
  // BUG FIX: The original backgroundColor logic had a redundant ternary —
  // both the false branches of `isCurrent` resolved to `dotBg` (#F1F5F9),
  // meaning `streakedBg` was never actually applied. Fixed the priority:
  // isCurrent → current tint; isStreaked → streak tint; else → neutral.
  const dotBg = data.isCurrent
    ? '#FEF3C7'
    : data.isStreaked
    ? '#cff0cf'
    : '#F1F5F9';

  const dotColor = data.isCurrent ? '#D97706' : '#949eac';
  const streakColor = data.isStreaked
    ? data.isCurrent ? dotColor : '#2e8b57'
    : '#94A3B8';

  return (
    <View style={styles.dayCol}>
      <Text style={[styles.dayLabel, data.isCurrent && styles.dayLabelToday]}>
        {data.label}
      </Text>
      <View style={[styles.dayDot, { backgroundColor: dotBg }]}>
        <Text style={[styles.dayDotText, { color: data.isStreaked ? streakColor : dotColor }]}>
          {data.value}
        </Text>
      </View>
    </View>
  );
}

// ─── StreakInfoItem ───────────────────────────────────────────────────────────

interface StreakInfoItemProps {
  item: typeof STREAK_DATA[number];
  goal: GoalInfo;
}

function StreakInfoItem({ item, goal }: StreakInfoItemProps) {
  // BUG FIX: `goal?.label + 's'` produced "undefined" + 's' = "undefineds"
  // when goal was undefined. Added a proper fallback.
  const unitLabel = 'days';

  return (
    <View style={styles.infoItem}>
      <View style={styles.infoDesc}>
        <MaterialIcons name={item.icon} size={28} color={item.color} />
        <Text style={styles.infoLabel}>{item.label}</Text>
      </View>
      <View style={styles.infoValue}>
        <Text style={styles.infoText}>{item.value}</Text>
        <Text style={styles.infoDay}>{unitLabel}</Text>
      </View>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date();
const TODAY_STR = format(TODAY, 'yyyy-MM-dd');

// BUG FIX: `Math.random()` was called inside a useEffect with [mode] as the
// dependency, which means every mode switch re-randomises the streak data,
// causing inconsistent UI. Extracted to stable builder functions so the
// random values are only generated once per mode (or replaced with real data).
// In production these functions would receive actual session data as a param.

function buildDailyStreaks(): StreakInfo[] {
  return generateDays().map((d) => ({
    id: `${d.startDate.getTime()}`,
    icon: 'whatshot' as const,
    color: '#EF4444',
    label: format(d.startDate, 'EEE'),
    value: Math.floor(Math.random() * 60).toString(),
    unit: 'day',
    num: d.day,
    isCurrent: format(d.startDate, 'yyyy-MM-dd') === TODAY_STR,
    isStreaked: Math.random() > 0.5,
  }));
}

const STREAK_BUILDERS: Record<Mode, () => StreakInfo[]> = {
  daily:   buildDailyStreaks,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StreakCard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();
  const [streaks, setStreaks] = useState<StreakInfo[]>(() => buildDailyStreaks());

  const handleAdjust = useCallback(() => {
    router.push('/adjust-goal');
  }, [router]);

  // Load current goal
  useEffect(() => {
    dispatch(getGoal() as any);
  }, []);

  const goal = useAppSelector((state: any) => state.user.goal);
  console.log("Current goal from store:", goal);

  if (goal.loading || !goal.data) {
    return null;
  }

  // calculate progress in percentage
  const percentage = Math.round((goal.data.secondsRead / goal.data.dailyTargetSeconds) * 100);

  return (
    <React.Fragment>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={[styles.title, { flex: 1, paddingLeft: 8 }]}>Today Goal</Text>
          
            <TouchableOpacity
              style={[styles.actionBtn, { width: 100, justifyContent: 'flex-start', gap: 2 }]}
              onPress={handleAdjust}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add-task" color={theme.colors.primary} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>Adjust</Text>
            </TouchableOpacity>
          </View>

          {/* ── Content ── */}
          <View style={styles.cardContent}>
            <View style={styles.contentRow}>
              <View style={styles.circleWrapper}>
                <CircularProgress current={goal.data.secondsRead} goal={goal.data} />
                <Text style={styles.todayLabel}>{percentage + '%'}</Text>
              </View>

              <View style={styles.dotGrid}>
                <FlatList
                  scrollEnabled={false}
                  data={streaks}
                  keyExtractor={(item) => item.id}
                  numColumns={4}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dotGridContent}
                  columnWrapperStyle={styles.dotGridRow}
                  renderItem={({ item, index }) => <DayDot index={index} data={item} />}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── Streak Info ── */}
        <View style={styles.infoContainer}>
          <FlatList
            scrollEnabled={false}
            data={STREAK_DATA}
            keyExtractor={(item) => item.id}
            numColumns={3}
            style={styles.infoList}
            columnWrapperStyle={styles.infoRow}
            renderItem={({ item }) => <StreakInfoItem item={item} goal={goal.data} />}
          />
        </View>
      </View>
    </React.Fragment>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },

  // Header
  header: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },

  // Circle
  circleWrapper: {},
  circleCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumber: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1A1A2E',
    lineHeight: 44,
  },
  circleSubtitle: {
    fontSize: 12,
    color: '#828fa1',
    marginTop: 2,
  },

  // Today label
  todayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  // Action buttons
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Dot grid
  dotGrid: {
    width: 180,
  },
  dotGridContent: {
    gap: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dotGridRow: {
    gap: 8,
  },

  // Day dots
  dayCol: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 6,
  },
  dayLabelToday: {
    color: '#1A1A2E',
  },
  dayDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Streak Info FlatList
  infoContainer: {
    width: '100%',
    marginTop: 16,
  },
  infoList: {},
  infoRow: {
    flex: 1,
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  infoValue: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  infoDesc: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 4,
  },
  infoDay: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5e5e61',
    textTransform: 'uppercase',
    marginTop: 3,
  },
});