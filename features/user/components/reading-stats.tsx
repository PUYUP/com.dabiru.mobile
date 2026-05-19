import { StyleSheet, Text, View } from "react-native";

const PRIMARY = "#258c91";
const TOTAL_VERSE = 6236;

export default function ReadingStats({ stats, goal, pagesPct }: { stats: any, goal: any, pagesPct: string }) {
  if (!stats) return null;

  const totalSeconds = (stats.total_read_seconds ?? 0);
  const targetSeconds = goal.dailyTargetSeconds ?? 600;
  const goalTotalSeconds = (goal.manuallyAddedSeconds ?? 0) + (goal.secondsRead ?? 0);
  const goalPct = Math.min(Math.round((goalTotalSeconds / targetSeconds) * 100), 100);
  const quranPct = (stats.total_unique_verses / TOTAL_VERSE) * 100;
  const remaining = Math.max(targetSeconds - goalTotalSeconds, 0);

  const fmtSeconds = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m === 0) return `${sec}s`;
    if (sec === 0) return `${m}m`;
    return `${m}m ${sec}s`;
  };

  return (
    <View style={statStyles.wrap}>
      {/* Metric Cards */}
      <View style={statStyles.grid}>
        <View style={statStyles.metric}>
          <Text style={statStyles.metricLabel}>Time read</Text>
          <Text style={[statStyles.metricValue, { color: PRIMARY }]}>{fmtSeconds(totalSeconds)}</Text>
          <Text style={statStyles.metricSub}>since start</Text>
        </View>
        <View style={statStyles.metric}>
          <Text style={statStyles.metricLabel}>Verses</Text>
          <Text style={statStyles.metricValue}>{stats.total_unique_verses ?? 0}</Text>
          <Text style={statStyles.metricSub}>verses read</Text>
        </View>
        <View style={statStyles.metric}>
          <Text style={statStyles.metricLabel}>Pages</Text>
          <Text style={statStyles.metricValue}>{pagesPct}%</Text>
          <Text style={statStyles.metricSub}>of Al-Qur'an</Text>
        </View>
        <View style={statStyles.metric}>
          <Text style={statStyles.metricLabel}>Sessions</Text>
          <Text style={statStyles.metricValue}>{stats.total_unique_sessions ?? 0}</Text>
          <Text style={statStyles.metricSub}>has done</Text>
        </View>
      </View>

      {/* Daily Target Progress */}
      <View style={statStyles.progressCard}>
        <View style={statStyles.progressHeader}>
          <Text style={statStyles.progressLabel}>Daily target</Text>
          <Text style={statStyles.progressPct}>{goalPct}%</Text>
        </View>
        <View style={statStyles.track}>
          <View style={[statStyles.fill, { width: `${goalPct}%`, backgroundColor: PRIMARY }]} />
        </View>
        <Text style={statStyles.progressHint}>
          {remaining > 0 ? `${fmtSeconds(remaining)} remaining` : 'Target achieved! 🎉'}
        </Text>
      </View>

      {/* Qur'an Overall Progress */}
      <View style={statStyles.progressCard}>
        <View style={statStyles.progressHeader}>
          <Text style={statStyles.progressLabel}>Al-Qur'an progress</Text>
          <Text style={statStyles.progressPct}>{quranPct.toFixed(2)}%</Text>
        </View>
        <View style={statStyles.track}>
          <View style={[statStyles.fill, { width: `${Math.min(quranPct, 100)}%`, backgroundColor: '#EF9F27' }]} />
        </View>
        <Text style={statStyles.progressHint}>Based on 6,236 total verses</Text>
      </View>
    </View>
  );
}

const statStyles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, paddingTop: 14, gap: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 10,
  },
  metricLabel: { fontSize: 14, color: '#888', marginBottom: 2 },
  metricValue: { fontSize: 18, fontWeight: '500', color: '#222' },
  metricSub: { fontSize: 12, color: '#aaa', marginTop: 1 },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 12,
    gap: 6,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 14, color: '#888' },
  progressPct: { fontSize: 14, fontWeight: '500', color: '#222' },
  track: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 99 },
  progressHint: { fontSize: 12, color: '#aaa' },
});