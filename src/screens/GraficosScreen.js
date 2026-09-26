import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchWeekSummary, fetchCategorySummary } from '../api/transactionsApi';
import { getCurrentServerWeekNumber } from '../utils/date';
import { formatMoney } from '../utils/money';
import WeeklyBarChart from '../components/WeeklyBarChart';
import MonthlyPieChart from '../components/MonthlyPieChart';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function GraficosScreen() {
  const { colors } = useAppTheme();
  const { token } = useAuth();

  const [mode, setMode] = useState('week'); // 'week' | 'month'

  const [weekNumber, setWeekNumber] = useState(() => getCurrentServerWeekNumber());
  const [weekData, setWeekData] = useState(null);
  const [loadingWeek, setLoadingWeek] = useState(true);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [monthData, setMonthData] = useState(null);
  const [loadingMonth, setLoadingMonth] = useState(true);

  const loadWeek = useCallback(async () => {
    setLoadingWeek(true);
    try {
      const data = await fetchWeekSummary(weekNumber, token);
      setWeekData(data);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoadingWeek(false);
    }
  }, [weekNumber, token]);

  const loadMonth = useCallback(async () => {
    setLoadingMonth(true);
    try {
      const data = await fetchCategorySummary(month, year, token);
      setMonthData(data);
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoadingMonth(false);
    }
  }, [month, year, token]);

  useFocusEffect(
    useCallback(() => {
      if (mode === 'week') loadWeek();
      else loadMonth();
    }, [mode, loadWeek, loadMonth])
  );

  const goPrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.toggle, { backgroundColor: colors.surfaceAlt }]}>
        <Pressable
          onPress={() => setMode('week')}
          style={[styles.toggleButton, mode === 'week' && { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: mode === 'week' ? colors.primaryText : colors.text, fontWeight: '600' }}>Semana</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('month')}
          style={[styles.toggleButton, mode === 'month' && { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: mode === 'month' ? colors.primaryText : colors.text, fontWeight: '600' }}>Mês</Text>
        </Pressable>
      </View>

      {mode === 'week' ? (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.navRow}>
            <Pressable onPress={() => setWeekNumber((w) => Math.max(1, w - 1))} hitSlop={10}>
              <Feather name="chevron-left" size={22} color={colors.text} />
            </Pressable>
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              {weekData ? `${weekData.first_day} — ${weekData.last_day}` : '...'}
            </Text>
            <Pressable onPress={() => setWeekNumber((w) => w + 1)} hitSlop={10}>
              <Feather name="chevron-right" size={22} color={colors.text} />
            </Pressable>
          </View>

          {loadingWeek ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
          ) : (
            <>
              <Text style={[styles.total, { color: colors.expense }]}>
                {formatMoney(weekData?.total_amount ?? 0)}
              </Text>
              <View style={styles.chartWrap}>
                <WeeklyBarChart weekDays={weekData?.week_days ?? []} />
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.navRow}>
            <Pressable onPress={goPrevMonth} hitSlop={10}>
              <Feather name="chevron-left" size={22} color={colors.text} />
            </Pressable>
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              {MONTH_NAMES[month - 1]} de {year}
            </Text>
            <Pressable onPress={goNextMonth} hitSlop={10}>
              <Feather name="chevron-right" size={22} color={colors.text} />
            </Pressable>
          </View>

          {loadingMonth ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
          ) : (
            <>
              <Text style={[styles.total, { color: colors.expense }]}>
                {formatMoney(monthData?.total_amount ?? 0)}
              </Text>
              <View style={styles.chartWrap}>
                <MonthlyPieChart categories={monthData?.categories ?? []} />
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  toggle: { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 16 },
  toggleButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  total: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  chartWrap: { alignItems: 'center' },
});
