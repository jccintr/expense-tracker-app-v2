import { View, Text as RNText, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useAppTheme } from '../theme/ThemeContext';

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']; // day_of_week 0=segunda...6=domingo (ver API)

const CHART_HEIGHT = 160;
const BAR_WIDTH = 28;
const GAP = 14;

export default function WeeklyBarChart({ weekDays }) {
  const { colors } = useAppTheme();
  const maxAmount = Math.max(1, ...weekDays.map((d) => Number(d.total_amount) || 0));
  const chartWidth = weekDays.length * (BAR_WIDTH + GAP);

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={CHART_HEIGHT + 20}>
        {weekDays.map((day, i) => {
          const amount = Number(day.total_amount) || 0;
          const barHeight = Math.max(2, (amount / maxAmount) * CHART_HEIGHT);
          const x = i * (BAR_WIDTH + GAP) + GAP / 2;
          const y = CHART_HEIGHT - barHeight;
          return (
            <Rect
              key={day.date}
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={barHeight}
              rx={6}
              fill={amount > 0 ? colors.primary : colors.border}
            />
          );
        })}
      </Svg>

      <View style={[styles.labelsRow, { width: chartWidth }]}>
        {weekDays.map((day, i) => (
          <View key={day.date} style={{ width: BAR_WIDTH + GAP, alignItems: 'center' }}>
            <RNText style={[styles.dayLabel, { color: colors.textSecondary }]}>{DAY_LABELS[i]}</RNText>
            <RNText style={[styles.dayNumber, { color: colors.textSecondary }]}>{day.date.slice(8, 10)}</RNText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  labelsRow: { flexDirection: 'row', marginTop: 4 },
  dayLabel: { fontSize: 11, fontWeight: '600' },
  dayNumber: { fontSize: 10, marginTop: 1 },
});
