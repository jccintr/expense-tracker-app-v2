import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAppTheme } from '../theme/ThemeContext';
import { formatMoney } from '../utils/money';

const SIZE = 180;
const RADIUS = SIZE / 2;
const CENTER = SIZE / 2;

// Converte ângulo (graus, 0 = topo, sentido horário) num ponto na borda do
// círculo — matemática padrão de SVG pie/donut chart.
function polarPoint(angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + RADIUS * Math.cos(angleRad), y: CENTER + RADIUS * Math.sin(angleRad) };
}

function describeSlice(startAngle, endAngle) {
  const start = polarPoint(endAngle);
  const end = polarPoint(startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function MonthlyPieChart({ categories }) {
  const { colors } = useAppTheme();
  const total = categories.reduce((sum, c) => sum + (Number(c.total_amount) || 0), 0);

  if (total <= 0) {
    return (
      <View style={styles.emptyContainer}>
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill={colors.surfaceAlt} />
        </Svg>
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Nenhum gasto neste mês.</Text>
      </View>
    );
  }

  let cumulativeAngle = 0;
  const slices = categories.map((c, i) => {
    const amount = Number(c.total_amount) || 0;
    const angle = (amount / total) * 360;
    const slice = {
      path: amount > 0 ? describeSlice(cumulativeAngle, cumulativeAngle + angle) : null,
      color: colors.chartPalette[i % colors.chartPalette.length],
      name: c.category,
      amount,
    };
    cumulativeAngle += angle;
    return slice;
  });

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {slices.map(
          (slice) => slice.path && <Path key={slice.name} d={slice.path} fill={slice.color} />
        )}
      </Svg>

      <View style={styles.legend}>
        {slices.map((slice) => (
          <View key={slice.name} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <Text style={[styles.legendName, { color: colors.text }]} numberOfLines={1}>
              {slice.name}
            </Text>
            <Text style={[styles.legendAmount, { color: colors.textSecondary }]}>
              {formatMoney(slice.amount)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  emptyContainer: { alignItems: 'center' },
  legend: { width: '100%', marginTop: 16 },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: 13, fontWeight: '600' },
  legendAmount: { fontSize: 13 },
});