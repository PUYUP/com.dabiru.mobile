/**
 * StrikeCard.tsx
 *
 * Dependencies to install:
 *   npm install react-native-svg
 *   npx pod-install  (iOS)
 */

import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { generateDays } from '@/utils/days-generator';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { endOfWeek, format, getUnixTime, startOfWeek } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Skeleton from "react-native-reanimated-skeleton";
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getActivityDays, getFailedStrike, getGoal, getLongestStrike } from '../userThunks';
import { ActivityDaysQuery, GoalInfo } from '../userTyping';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StrikeInfo {
  id: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  label: string;
  value: string;
  unit: string;
  num: number;
  isCurrent: boolean;
  isStrikeed: boolean;
  isPastDay: boolean;
  date: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const STREAK_DATA = [
  { id: 'current', icon: 'whatshot' as const, color: '#EF4444', label: 'Strike',     value: '0', unit: 'days' },
  { id: 'longest', icon: 'star'     as const, color: '#03C430', label: 'Longest',    value: '0', unit: 'days' },
  { id: 'failed',  icon: 'cancel'   as const, color: '#F59E0B', label: 'Days failed', value: '0', unit: 'days' },
];

// ─── Animated Circle ──────────────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── CircularProgress ─────────────────────────────────────────────────────────

interface CircularProgressProps {
  current: number;
  target: number;
  goal: GoalInfo;
}

function CircularProgress({ current, target, goal }: CircularProgressProps) {
  const theme  = useTheme();
  const RADIUS = 78;
  const STROKE = 12;
  const normalizedRadius = RADIUS - STROKE / 2;
  const circumference = 2 * Math.PI * normalizedRadius;

  const ARC_RATIO = 0.80;
  const arcLength = circumference * ARC_RATIO;
  const gapLength = circumference - arcLength;
  const trackDasharray = `${arcLength} ${gapLength}`;

  // BUG FIX: initial value set to arcLength (empty arc) so it always animates
  // from empty → filled on first render, instead of jumping from full → filled.
  const animatedValue = useRef(new Animated.Value(arcLength)).current;

  useEffect(() => {
    // BUG FIX: guard against target = 0 or NaN to prevent division by zero /
    // NaN progress, which previously left the arc stuck at its initial state.
    if (!target || target === 0) return;

    const progress = Math.min(current / target, 1);
    const targetOffset = arcLength * (1 - progress);

    Animated.timing(animatedValue, {
      toValue: targetOffset,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [current, target, goal, animatedValue, arcLength]);

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
        <Text style={styles.circleNumber}>{Math.round(current / 60)}</Text>
        <Text style={styles.circleSubtitle}>of {Math.round(target / 60)} {'min'}</Text>
      </View>
    </View>
  );
}

// ─── DayDot ───────────────────────────────────────────────────────────────────

interface DayDotProps {
  index: number;
  data: StrikeInfo;
}

function DayDot({ index, data }: DayDotProps) {
  // BUG FIX: The original backgroundColor logic had a redundant ternary —
  // both the false branches of `isCurrent` resolved to `dotBg` (#F1F5F9),
  // meaning `strikeedBg` was never actually applied. Fixed the priority:
  // isCurrent → current tint; isStrikeed → strike tint; else → neutral.
  let dotBg = data.isCurrent
    ? '#FEF3C7'
    : data.isStrikeed
    ? '#cff0cf'
    : data.isPastDay
    ? 'rgb(248, 215, 212)'
    : '#F1F5F9';

  const dotColor = data.isCurrent
    ? '#D97706'
    : !data.isStrikeed
    ? data.isPastDay ? '#c10' : '#949eac'
    : '#949eac';

  const strikeColor = data.isStrikeed
    ? data.isCurrent ? dotColor : '#2e8b57'
    : data.isPastDay ? '#c10' : '#94A3B8';

  return (
    <View style={styles.dayCol}>
      <Text style={[styles.dayLabel, data.isCurrent && styles.dayLabelToday]}>
        {data.label}
      </Text>
      <View style={[styles.dayDot, { backgroundColor: dotBg }]}>
        <Text style={[styles.dayDotText, { color: data.isStrikeed ? strikeColor : dotColor }]}>
          {data.value}
        </Text>
      </View>
    </View>
  );
}

// ─── StrikeInfoItem ───────────────────────────────────────────────────────────

interface StrikeInfoItemProps {
  item: typeof STREAK_DATA[number];
  goal: GoalInfo;
}

function StrikeInfoItem({ item, goal }: StrikeInfoItemProps) {
  // BUG FIX: `goal?.label + 's'` produced "undefineds" when goal was not ready.
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

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <View style={{ flex: 1 }}>
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

const TODAY     = new Date();
const TODAY_STR = format(TODAY, 'yyyy-MM-dd');

// BUG FIX: was `getUnixTime(TODAY_STR)` — date-fns getUnixTime expects a Date
// object, not a string. Passing a string returned NaN / 0, breaking the
// isPastDay comparison for every day dot.
const TODAY_TIMESTAMP = getUnixTime(TODAY);

function buildDailyStrikes(): StrikeInfo[] {
  return generateDays().map((d) => {
    const day   = format(d.startDate, 'yyyy-MM-dd');
    const dayTs = getUnixTime(d.startDate); // ✅ pass Date, not string

    return {
      id:         `${d.startDate.getTime()}`,
      icon:       'whatshot' as const,
      color:      '#EF4444',
      label:      format(d.startDate, 'EEE'),
      value:      Math.floor(Math.random() * 60).toString(),
      unit:       'day',
      num:        d.day,
      date:       day,
      isCurrent:  day === TODAY_STR,
      isStrikeed: Math.random() > 0.5,
      isPastDay:  dayTs < TODAY_TIMESTAMP,
    };
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StrikeCard() {
  const dispatch = useAppDispatch();
  const [strikes,     setStrikes]     = useState<StrikeInfo[]>(() => buildDailyStrikes());
  const [strikesData, setStrikesData] = useState<any[]>(STREAK_DATA);

  const longestStrike = useAppSelector((state: any) => state.user.longestStrike);
  const failedStrike  = useAppSelector((state: any) => state.user.failedStrike);

  const now       = new Date();
  const todayDate = format(now, 'yyyy-MM-dd');
  const startDate = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const endDate   = format(endOfWeek(now,   { weekStartsOn: 1 }), 'yyyy-MM-dd');

  // progress
  const [currentSeconds, setCurrentSeconds] = useState<number>(0);
  const [currentTarget,  setCurrentTarget]  = useState<number>(0);
  const [percentage,     setPercentage]     = useState<number>(0);

  // Load data on mount
  useEffect(() => {
    const query: ActivityDaysQuery = {
      from:  startDate,
      to:    endDate,
      type:  'QURAN',
      first: 7,
    };

    dispatch(getActivityDays({ ...query }) as any);
    dispatch(getGoal()          as any);
    dispatch(getLongestStrike() as any);
    dispatch(getFailedStrike()  as any);
  }, []);

  const goal         = useAppSelector((state: any) => state.user.goal);
  const goalData     = useAppSelector((state: any) => state.user.goal.data);
  const activityDays = useAppSelector((state: any) => state.user.activityDays);

  // BUG FIX: Watch `goalData` as a whole instead of individual primitive fields.
  // When goalData is a partially-initialised Redux object the individual field
  // selectors resolve to `undefined`, causing `target` to be `undefined` and
  // subsequently `Number(undefined) = NaN` inside CircularProgress.
  // Also added `?? 0` fallbacks so target / current are always valid numbers.
  useEffect(() => {
    if (!goalData) return;

    const target  = goalData.dailyTargetSeconds   ?? 0;
    const seconds = goalData.secondsRead           ?? 0;
    const manual  = goalData.manuallyAddedSeconds  ?? 0;
    const current = seconds + manual;
    const progress = target > 0 ? Math.round((current / target) * 100) : 0;

    setCurrentSeconds(current);
    setCurrentTarget(target);
    setPercentage(progress);
  }, [goalData]); // ✅ single stable dependency

  useEffect(() => {
    if (activityDays.loading) return;
    if (!activityDays.data)   return;

    const strikesFromActivities = buildDailyStrikes().map((s: StrikeInfo) => {
      const activity = activityDays.data.find((item: any) => item.date === s.date);

      if (!activity) {
        return { ...s, value: '0', isStrikeed: false };
      }

      const target         = activity.dailyTargetSeconds  ?? 0;
      const manuallyAdded  = activity.manuallyAddedSeconds ?? 0;
      const current        = (activity.secondsRead ?? 0) + manuallyAdded;

      const value = current > 0 && target > 0 && current >= target
        ? Math.floor(current / target).toString()
        : '0';

      return {
        ...s,
        value,
        isStrikeed: target > 0 && current >= target,
      };
    });

    setStrikes(strikesFromActivities);

    // Fill current-strike value in the stats row
    const currentStrike = strikesFromActivities.find((item) => item.date === todayDate);

    setStrikesData((prev: any) => {
      const index = prev.findIndex((item: any) => item.id === 'current');
      if (index === -1) return prev;
      return [
        ...prev.slice(0, index),
        { ...prev[index], value: currentStrike?.value ?? '0' },
        ...prev.slice(index + 1),
      ];
    });
  }, [activityDays]);

  // Longest strike
  useEffect(() => {
    if (longestStrike.loading) return;
    if (!longestStrike.data)   return;

    setStrikesData((prev: any) => {
      const index = prev.findIndex((item: any) => item.id === 'longest');
      if (index === -1) return prev;
      return [
        ...prev.slice(0, index),
        { ...prev[index], value: longestStrike.data.total_strikes },
        ...prev.slice(index + 1),
      ];
    });
  }, [longestStrike]);

  // Failed strike
  useEffect(() => {
    if (failedStrike.loading) return;
    if (!failedStrike.data)   return;

    setStrikesData((prev: any) => {
      const index = prev.findIndex((item: any) => item.id === 'failed');
      if (index === -1) return prev;
      return [
        ...prev.slice(0, index),
        { ...prev[index], value: failedStrike.data.total_failed_days },
        ...prev.slice(index + 1),
      ];
    });
  }, [failedStrike]);

  // Loading placeholder
  if (goal.loading || !goal.data || longestStrike.loading || failedStrike.loading) {
    return <LoadingSkeleton />;
  }

  return (
    <React.Fragment>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.contentRow}>
              <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 16, flexDirection: 'row' }}>
                <View>
                  {/* Header */}
                  <View style={styles.header}>
                    <MaterialIcons name="checklist" style={{ fontSize: 22 }} />
                    <Text style={[styles.title, { flex: 1, paddingLeft: 8 }]}>Daily Goal</Text>
                  </View>

                  <View style={styles.circleWrapper}>
                    <CircularProgress
                      current={currentSeconds}
                      target={currentTarget}
                      goal={goal.data}
                    />
                    <Text style={styles.todayLabel}>{percentage + '%'}</Text>
                  </View>
                </View>

                {/* Strike Info */}
                <View style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, gap: 14 }}>
                  {strikesData.map((item: any) => (
                    <View key={item.id} style={styles.strikeItem}>
                      <MaterialIcons name={item.icon} size={24} color={item.color} />
                      <View>
                        <Text style={styles.strikeLabel}>{item.label}</Text>
                        <Text style={styles.strikeValue}>{item.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {!activityDays.loading && (
                <View style={styles.dotGrid}>
                  <FlatList
                    scrollEnabled={false}
                    data={strikes}
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
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
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
    fontSize: 14,
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
    justifyContent: 'space-between',
    display: 'flex',
    width: '100%',
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Strike Info FlatList
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
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
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

  // Strike
  strikeItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e2e2',
    borderRadius: 14,
  },
  strikeLabel: {
    fontSize: 12,
    color: '#828fa1',
  },
  strikeValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
});