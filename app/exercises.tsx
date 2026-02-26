import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '@/hooks/useDatabase';
import { getExercises, addExercise, deleteExercise } from '@/lib/database';
import { Exercise, EXERCISE_CATEGORIES } from '@/types';

export default function ExercisesScreen() {
  const router = useRouter();
  const { isReady } = useDatabase();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EXERCISE_CATEGORIES>('other');

  const loadExercises = useCallback(async () => {
    if (!isReady) return;
    const data = await getExercises();
    setExercises(data);
    setIsLoading(false);
  }, [isReady]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleAddExercise = async () => {
    if (!newExerciseName.trim()) {
      Alert.alert('错误', '请输入锻炼项目名称');
      return;
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: newExerciseName.trim(),
      category: selectedCategory,
      createdAt: Date.now(),
    };

    await addExercise(exercise);
    setNewExerciseName('');
    setShowAddModal(false);
    loadExercises();
  };

  const handleDelete = (exercise: Exercise) => {
    Alert.alert(
      '删除项目',
      `确定要删除 "${exercise.name}" 吗？相关的所有训练记录也会被删除。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await deleteExercise(exercise.id);
            loadExercises();
          },
        },
      ]
    );
  };

  const groupedExercises = exercises.reduce((acc, exercise) => {
    const cat = exercise.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const categories = Object.keys(groupedExercises).sort();

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(cat) => cat}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>还没有锻炼项目</Text>
            <Text style={styles.emptySubtext}>点击下方按钮添加</Text>
          </View>
        }
        renderItem={({ item: category }) => (
          <View style={styles.categoryGroup}>
            <Text style={styles.categoryHeader}>{EXERCISE_CATEGORIES[category]}</Text>
            {groupedExercises[category].map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseCard}
                onPress={() => router.push(`/workout/${exercise.id}`)}
                onLongPress={() => handleDelete(exercise)}
              >
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加锻炼项目</Text>
            
            <TextInput
              style={styles.input}
              placeholder="项目名称（如：深蹲）"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              autoFocus
            />

            <Text style={styles.label}>选择分类</Text>
            <View style={styles.categoryGrid}>
              {(Object.keys(EXERCISE_CATEGORIES) as Array<keyof typeof EXERCISE_CATEGORIES>).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    selectedCategory === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {EXERCISE_CATEGORIES[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewExerciseName('');
                }}
              >
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAddExercise}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>添加</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  categoryGroup: {
    marginBottom: 20,
  },
  categoryHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exerciseName: {
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#555',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonConfirm: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontWeight: '600',
  },
});
