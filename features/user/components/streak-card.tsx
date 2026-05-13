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
import { endOfWeek, format, getUnixTime, startOfWeek } from 'date-fns';
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
import Skeleton from "react-native-reanimated-skeleton";
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getActivityDays, getGoal } from '../userThunks';
import { ActivityDaysQuery, GoalInfo } from '../userTyping';

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
  isPastDay: boolean;
  date: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const STREAK_DATA = [
  { id: 'current', icon: 'whatshot' as const, color: '#EF4444', label: 'Streak', value: '5',     unit: 'days' },
  { id: 'longest', icon: 'star'     as const, color: '#03C430', label: 'Longest', value: '1.321', unit: 'days' },
  { id: 'failed',  icon: 'cancel'   as const, color: '#F59E0B', label: 'Days failed',  value: '24',    unit: 'days' },
];

// ─── Animated Circle ──────────────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── CircularProgress ─────────────────────────────────────────────────────────

interface CircularProgressProps {
  current: number;
  goal: GoalInfo;
}

function CircularProgress({ current, goal }: CircularProgressProps) {
  const theme = useTheme();

  const RADIUS = 86;
  const STROKE = 16;
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
            <Stop offset="0%"   stopColor={`${theme.colors.primaryContainer}`} />
            <Stop offset="100%" stopColor={`${theme.colors.primary}`} />
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
        <Text style={styles.circleNumber}>{Math.round((goal.secondsRead + (goal.manuallyAddedSeconds ? goal.manuallyAddedSeconds : 0)) / 60)}</Text>
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
  let dotBg = data.isCurrent
    ? '#FEF3C7'
    : data.isStreaked
    ? '#cff0cf'
    : !data.isStreaked ? data.isPastDay ? 'rgb(248, 215, 212)' : '#F1F5F9'
    : '#F1F5F9';

  const dotColor = data.isCurrent 
    ? '#D97706' 
    : !data.isStreaked ? 
      data.isPastDay ? '#c10' : '#949eac'
      : '#949eac';

  const streakColor = data.isStreaked
    ? data.isCurrent ? dotColor : '#2e8b57'
    : data.isPastDay ? '#c10' : '#94A3B8';
  
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

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <View style={{ flex: 1 }}>
      {/* Skeleton 1: Progress bar */}
      <Skeleton
        containerStyle={{ width: '100%' }}
        isLoading={true}
        layout={[
          {
            key: 'progress',
            width: '100%',
            height: 200,
            marginBottom: 12,
            borderRadius: 16,
          },
        ]}
      />

      {/* Skeleton 2: Strike row — pakai View flex row sebagai wrapper */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {['current', 'longest', 'fail'].map((key) => (
          <View key={key} style={{ flex: 1 }}>
            <Skeleton
              containerStyle={{ flex: 1 }}
              isLoading={true}
              layout={[
                {
                  key,
                  width: '100%',
                  height: 100,
                  borderRadius: 16,
                },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date();
const TODAY_STR = format(TODAY, 'yyyy-MM-dd');
const TODAY_TIMESTAMP = getUnixTime(TODAY_STR);

// BUG FIX: `Math.random()` was called inside a useEffect with [mode] as the
// dependency, which means every mode switch re-randomises the streak data,
// causing inconsistent UI. Extracted to stable builder functions so the
// random values are only generated once per mode (or replaced with real data).
// In production these functions would receive actual session data as a param.

function buildDailyStreaks(): StreakInfo[] {
  return generateDays().map((d) => {
    const day = format(d.startDate, 'yyyy-MM-dd');
    const dayTs = getUnixTime(day);

    return {
      id: `${d.startDate.getTime()}`,
      icon: 'whatshot' as const,
      color: '#EF4444',
      label: format(d.startDate, 'EEE'),
      value: Math.floor(Math.random() * 60).toString(),
      unit: 'day',
      num: d.day,
      date: day,
      isCurrent: day === TODAY_STR,
      isStreaked: Math.random() > 0.5,
      isPastDay: dayTs < TODAY_TIMESTAMP,
    }
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StreakCard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();
  const [streaks, setStreaks] = useState<StreakInfo[]>(() => buildDailyStreaks());

  const now = new Date();
  const startDate = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const endDate = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const handleAdjust = useCallback(() => {
    router.push('/adjust-goal-modal');
  }, [router]);

  // Load current goal
  useEffect(() => {
    const query: ActivityDaysQuery = {
      from: startDate,
      to: endDate,
      type: 'QURAN',
      first: 7,
    }

    dispatch(getActivityDays({...query}) as any);
    dispatch(getGoal() as any);
  }, []);

  const goal = useAppSelector((state: any) => state.user.goal);
  const activityDays = useAppSelector((state: any) => state.user.activityDays);

  useEffect(() => {
    if (!activityDays.loading && activityDays.data) {
      // set streaks
      const streaksFromActivities = buildDailyStreaks().map((s: StreakInfo) => {
        const activity = activityDays.data.find((item: any) => {
          return item.date == s.date;
        });

        const manuallyAddedSeconds = activity && activity.manuallyAddedSeconds ? activity.manuallyAddedSeconds : 0;
        const value = activity && (activity.secondsRead || manuallyAddedSeconds)? 
          Math.round(((activity.secondsRead + manuallyAddedSeconds) / 60)).toString()
          : '0';

        return {
          ...s,
          value: value,
          isStreaked: activity ? ((activity.secondsRead + manuallyAddedSeconds) >= activity.dailyTargetSeconds) : false,
        };
      });

      setStreaks(streaksFromActivities);
    }
  }, [activityDays]);

  if (goal.loading || !goal.data) {
    return <LoadingSkeleton />;
  }

  // calculate progress in percentage
  const totalSeconds = (goal.data.secondsRead ?? 0) + (goal.data.manuallyAddedSeconds ?? 0);
  const percentage = goal.data.dailyTargetSeconds 
    ? Math.round((totalSeconds / goal.data.dailyTargetSeconds) * 100)
    : 0;
  
  return (
    <React.Fragment>
      <View style={styles.container}>
        <View style={styles.card}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <MaterialIcons name="checklist" style={{ fontSize: 22 }} />
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
              <View style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 32, flexDirection: 'row' }}>
                <View>
                  <View style={styles.circleWrapper}>
                    <CircularProgress current={(goal.data.secondsRead + goal.data.manuallyAddedSeconds)} goal={goal.data} />
                    <Text style={styles.todayLabel}>{percentage + '%'}</Text>
                  </View>
                </View>

                <View style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, paddingTop: 6, gap: 10 }}>
                  {STREAK_DATA.map((item: any) => {
                    return (
                      <View key={item.id} style={styles.streakItem}>
                        <MaterialIcons name={item.icon} size={24} color={item.color} />

                        <View>
                          <Text style={styles.streakLabel}>{item.label}</Text>
                          <Text style={styles.streakValue}>{item.value}</Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              </View>

              {!activityDays.loading && (
                <View style={styles.dotGrid}>
                  <FlatList
                    scrollEnabled={false}
                    data={streaks}
                    keyExtractor={(item) => item.id}
                    numColumns={7}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dotGridContent}
                    columnWrapperStyle={styles.dotGridRow}
                    renderItem={({ item, index }) => <DayDot index={index} data={item} />}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── Streak Info ── */}
        {/*
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
        */}
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
    paddingTop: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'column',
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
    paddingHorizontal: 16,
    paddingTop: 16,
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
    width: 'auto',
    height: 64,
    marginTop: 16,
  },
  dotGridContent: {
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: 38,
    height: 38,
    borderRadius: 20,
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

  // streak
  streakItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 14,
  },
  streakLabel: {
    fontSize: 12,
    color: '#828fa1',
  },
  streakValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: 700,
    color: '#1A1A2E',
  }
});