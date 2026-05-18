import { StyleSheet, Text, View } from "react-native";

const PRIMARY = "#258c91";

export default function ReadingStats({ activity }: { activity: any }) {
  if (!activity) return null;

  const totalSeconds = (activity.manuallyAddedSeconds ?? 0) + (activity.secondsRead ?? 0);
  const targetSeconds = activity.dailyTargetSeconds ?? 600;
  const goalPct = Math.min(Math.round((totalSeconds / targetSeconds) * 100), 100);
  const quranPct = parseFloat((activity.progress ?? 0).toFixed(2));
  const remaining = Math.max(targetSeconds - totalSeconds, 0);

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
          <Text style={statStyles.metricSub}>of {fmtSeconds(targetSeconds)}</Text>
        </View>
        <View style={statStyles.metric}>
          <Text style={statStyles.metricLabel}>Verses</Text>
          <Text style={statStyles.metricValue}>{activity.versesRead ?? 0}</Text>
          <Text style={statStyles.metricSub}>verses read</Text>
        </View>
        <View style={statStyles.metric}>
          <Text style={statStyles.metricLabel}>Pages</Text>
          <Text style={statStyles.metricValue}>{(activity.pagesRead ?? 0).toFixed(2)}</Text>
          <Text style={statStyles.metricSub}>of Al-Qur'an</Text>
        </View>
        <View style={statStyles.metric}>
          <Text style={statStyles.metricLabel}>Sessions</Text>
          <Text style={statStyles.metricValue}>{activity.ranges?.length ?? 0}</Text>
          <Text style={statStyles.metricSub}>ranges today</Text>
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
          <Text style={statStyles.progressPct}>{quranPct}%</Text>
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
  metricValue: { fontSize: 20, fontWeight: '500', color: '#222' },
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