import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '@/hooks/useDatabase';
import { getWorkouts, getExerciseById, deleteWorkout } from '@/lib/database';
import { useSettings } from '@/hooks/useSettings';
import { Workout, Exercise, Unit } from '@/types';

interface WorkoutWithExercise extends Workout {
  exercise?: Exercise;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (dateStr === today.toISOString().split('T')[0]) return '今天';
  if (dateStr === yesterday.toISOString().split('T')[0]) return '昨天';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function getTotalVolume(sets: { reps: number; weight: number }[]): number {
  return sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
}

export default function HomeScreen() {
  const router = useRouter();
  const { isReady } = useDatabase();
  const { settings } = useSettings();
  const [workouts, setWorkouts] = useState<WorkoutWithExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkouts = useCallback(async () => {
    if (!isReady) return;
    const data = await getWorkouts();
    const withExercises = await Promise.all(
      data.map(async (w) => ({
        ...w,
        exercise: await getExerciseById(w.exerciseId),
      }))
    );
    setWorkouts(withExercises);
    setIsLoading(false);
  }, [isReady]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const handleDelete = (workout: WorkoutWithExercise) => {
    Alert.alert(
      '删除记录',
      `确定要删除 ${workout.exercise?.name || '这条记录'} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkout(workout.id);
            loadWorkouts();
          },
        },
      ]
    );
  };

  const groupedWorkouts = workouts.reduce((acc, workout) => {
    const date = workout.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(workout);
    return acc;
  }, {} as Record<string, WorkoutWithExercise[]>);

  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => b.localeCompare(a));

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedDates}
        keyExtractor={(date) => date}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>还没有训练记录</Text>
            <Text style={styles.emptySubtext}>点击下方按钮开始第一次训练</Text>
          </View>
        }
        renderItem={({ item: date }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{formatDate(date)}</Text>
            {groupedWorkouts[date].map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => router.push(`/stats/${workout.exerciseId}`)}
                onLongPress={() => handleDelete(workout)}
              >
                <View style={styles.workoutHeader}>
                  <Text style={styles.exerciseName}>
                    {workout.exercise?.name || '未知项目'}
                  </Text>
                  <Text style={styles.volumeText}>
                    {getTotalVolume(workout.sets).toFixed(0)} {settings?.defaultUnit || 'kg'}·次
                  </Text>
                </View>
                <View style={styles.setsContainer}>
                  {workout.sets.map((set, idx) => (
                    <View key={idx} style={styles.setBadge}>
                      <Text style={styles.setText}>
                        {set.weight}{settings?.defaultUnit || 'kg'} × {set.reps}次
                      </Text>
                    </View>
                  ))}
                </View>
                {workout.notes && (
                  <Text style={styles.notes} numberOfLines={1}>
                    📝 {workout.notes}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/exercises')}
        >
          <Ionicons name="list" size={24} color="#666" />
          <Text style={styles.navButtonText}>项目</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/workout/new')}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.navButtonText}>设置</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  volumeText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  setText: {
    fontSize: 13,
    color: '#555',
  },
  notes: {
    marginTop: 10,
    fontSize: 13,
    color: '#888',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  navButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
