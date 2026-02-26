import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { useDatabase } from '@/hooks/useDatabase';
import { getExerciseById, getWorkoutsByExercise } from '@/lib/database';
import { useSettings } from '@/hooks/useSettings';
import { Exercise, Workout, convertWeight, Unit } from '@/types';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isReady } = useDatabase();
  const { settings } = useSettings();
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const loadData = useCallback(async () => {
    if (!isReady || !id) return;
    const [ex, ws] = await Promise.all([
      getExerciseById(id),
      getWorkoutsByExercise(id),
    ]);
    setExercise(ex);
    setWorkouts(ws);
  }, [isReady, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData = useMemo(() => {
    if (workouts.length === 0) return null;
    
    const labels = workouts.map(w => {
      const date = new Date(w.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    // 使用每组的最大重量
    const data = workouts.map(w => {
      const maxWeight = Math.max(...w.sets.map(s => s.weight));
      return maxWeight;
    });
    
    // 如果数据点太多，只显示最近10个
    const maxPoints = 10;
    if (data.length > maxPoints) {
      const skip = Math.ceil(data.length / maxPoints);
      return {
        labels: labels.filter((_, i) => i % skip === 0 || i === labels.length - 1).slice(-maxPoints),
        datasets: [{
          data: data.filter((_, i) => i % skip === 0 || i === data.length - 1).slice(-maxPoints),
        }],
      };
    }
    
    return { labels, datasets: [{ data }] };
  }, [workouts]);

  const stats = useMemo(() => {
    if (workouts.length === 0) return null;
    
    const allSets = workouts.flatMap(w => w.sets);
    const maxWeight = Math.max(...allSets.map(s => s.weight));
    const totalReps = allSets.reduce((sum, s) => sum + s.reps, 0);
    const totalVolume = allSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    const avgWeight = allSets.reduce((sum, s) => sum + s.weight, 0) / allSets.length;
    
    // 计算进步百分比
    const firstWorkoutMax = Math.max(...workouts[0].sets.map(s => s.weight));
    const lastWorkoutMax = Math.max(...workouts[workouts.length - 1].sets.map(s => s.weight));
    const progress = ((lastWorkoutMax - firstWorkoutMax) / firstWorkoutMax) * 100;
    
    return {
      totalWorkouts: workouts.length,
      maxWeight,
      totalReps,
      totalVolume,
      avgWeight: Math.round(avgWeight * 10) / 10,
      progress: Math.round(progress * 10) / 10,
    };
  }, [workouts]);

  if (!exercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (workouts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.emptyText}>暂无训练记录</Text>
        <Text style={styles.emptySubtext}>开始记录后查看进度统计</Text>
      </View>
    );
  }

  const unit = settings?.defaultUnit || 'kg';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.totalWorkouts}</Text>
          <Text style={styles.statLabel}>训练次数</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.maxWeight}{unit}</Text>
          <Text style={styles.statLabel}>最大重量</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.avgWeight}{unit}</Text>
          <Text style={styles.statLabel}>平均重量</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={[styles.statValue, stats!.progress >= 0 ? styles.positive : styles.negative]}>
            {stats!.progress >= 0 ? '+' : ''}{stats?.progress}%
          </Text>
          <Text style={styles.statLabel}>总体进步</Text>
        </View>
      </View>

      {chartData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>重量趋势</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#007AFF',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>最近记录</Text>
        {workouts.slice(-5).reverse().map((workout) => (
          <View key={workout.id} style={styles.historyItem}>
            <Text style={styles.historyDate}>{workout.date}</Text>
            <View style={styles.setsContainer}>
              {workout.sets.map((set, idx) => (
                <Text key={idx} style={styles.setText}>
                  {set.weight}{unit} × {set.reps}次
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#666',
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    width: (screenWidth - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  positive: {
    color: '#34c759',
  },
  negative: {
    color: '#ff3b30',
  },
  chartCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 6,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
  },
  historyCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setText: {
    fontSize: 13,
    color: '#333',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
