import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '@/hooks/useDatabase';
import { getExercises, getExerciseById, addWorkout } from '@/lib/database';
import { useSettings } from '@/hooks/useSettings';
import { Exercise, Workout, WorkoutSet, convertWeight, Unit } from '@/types';

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isReady } = useDatabase();
  const { settings } = useSettings();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<WorkoutSet[]>([{ weight: 0, reps: 0 }]);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showExercisePicker, setShowExercisePicker] = useState(id === 'new');

  const loadData = useCallback(async () => {
    if (!isReady) return;
    const allExercises = await getExercises();
    setExercises(allExercises);
    
    if (id && id !== 'new') {
      const exercise = await getExerciseById(id);
      if (exercise) {
        setSelectedExercise(exercise);
      }
    }
  }, [isReady, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([...sets, { weight: lastSet?.weight || 0, reps: lastSet?.reps || 0 }]);
  };

  const removeSet = (index: number) => {
    if (sets.length <= 1) return;
    setSets(sets.filter((_, i) => i !== index));
  };

  const updateSet = (index: number, field: 'weight' | 'reps', value: string) => {
    const numValue = parseFloat(value) || 0;
    setSets(sets.map((set, i) => 
      i === index ? { ...set, [field]: numValue } : set
    ));
  };

  const saveWorkout = async () => {
    if (!selectedExercise) {
      Alert.alert('错误', '请选择锻炼项目');
      return;
    }

    const validSets = sets.filter(s => s.weight > 0 || s.reps > 0);
    if (validSets.length === 0) {
      Alert.alert('错误', '请至少记录一组数据');
      return;
    }

    const workout: Workout = {
      id: Date.now().toString(),
      exerciseId: selectedExercise.id,
      date,
      sets: validSets,
      notes: notes.trim() || undefined,
      createdAt: Date.now(),
    };

    await addWorkout(workout);
    Alert.alert('成功', '训练记录已保存', [
      { text: '确定', onPress: () => router.back() }
    ]);
  };

  const formatDisplayWeight = (weight: number): string => {
    return weight > 0 ? weight.toString() : '';
  };

  if (showExercisePicker) {
    return (
      <View style={styles.container}>
        <Text style={styles.pickerTitle}>选择锻炼项目</Text>
        <ScrollView style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseOption}
              onPress={() => {
                setSelectedExercise(exercise);
                setShowExercisePicker(false);
              }}
            >
              <Text style={styles.exerciseOptionText}>{exercise.name}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.exerciseSelector}
          onPress={() => setShowExercisePicker(true)}
        >
          <Text style={styles.label}>锻炼项目</Text>
          <View style={styles.exerciseValue}>
            <Text style={styles.exerciseName}>
              {selectedExercise?.name || '请选择'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </View>
        </TouchableOpacity>

        <View style={styles.dateSection}>
          <Text style={styles.label}>日期</Text>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.setsSection}>
          <View style={styles.setsHeader}>
            <Text style={styles.label}>组数</Text>
            <Text style={styles.unitLabel}>重量 ({settings?.defaultUnit || 'kg'})</Text>
            <Text style={styles.repsLabel}>次数</Text>
          </View>

          {sets.map((set, index) => (
            <View key={index} style={styles.setRow}>
              <Text style={styles.setNumber}>第 {index + 1} 组</Text>
              <TextInput
                style={styles.weightInput}
                keyboardType="decimal-pad"
                value={formatDisplayWeight(set.weight)}
                onChangeText={(v) => updateSet(index, 'weight', v)}
                placeholder="0"
              />
              <TextInput
                style={styles.repsInput}
                keyboardType="number-pad"
                value={set.reps > 0 ? set.reps.toString() : ''}
                onChangeText={(v) => updateSet(index, 'reps', v)}
                placeholder="0"
              />
              {sets.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeSet(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="#ff3b30" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addSetText}>添加一组</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.label}>备注（可选）</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            placeholder="记录一下今天的感受..."
          />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveWorkout}
        >
          <Text style={styles.saveButtonText}>保存记录</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  exerciseList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  exerciseOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseOptionText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  exerciseSelector: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  exerciseValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
  },
  dateSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dateInput: {
    fontSize: 17,
    color: '#333',
    padding: 0,
  },
  setsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 'auto',
    marginRight: 60,
  },
  repsLabel: {
    fontSize: 13,
    color: '#666',
    width: 50,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  setNumber: {
    width: 70,
    fontSize: 14,
    color: '#666',
  },
  weightInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  repsInput: {
    width: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 8,
    padding: 4,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },
  addSetText: {
    marginLeft: 6,
    fontSize: 15,
    color: '#007AFF',
  },
  notesSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  notesInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bottomBar: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
