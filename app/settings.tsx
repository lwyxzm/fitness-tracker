import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSettings } from '@/hooks/useSettings';
import { Unit } from '@/types';

export default function SettingsScreen() {
  const { settings, isLoading, updateSettings } = useSettings();

  const handleUnitChange = async (unit: Unit) => {
    if (settings?.defaultUnit === unit) return;
    await updateSettings({ defaultUnit: unit });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>重量单位</Text>
        <View style={styles.optionGroup}>
          <TouchableOpacity
            style={[
              styles.option,
              settings?.defaultUnit === 'kg' && styles.optionActive,
            ]}
            onPress={() => handleUnitChange('kg')}
          >
            <Text
              style={[
                styles.optionText,
                settings?.defaultUnit === 'kg' && styles.optionTextActive,
              ]}
            >
              公斤 (kg)
            </Text>
            {settings?.defaultUnit === 'kg' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              settings?.defaultUnit === 'lbs' && styles.optionActive,
            ]}
            onPress={() => handleUnitChange('lbs')}
          >
            <Text
              style={[
                styles.optionText,
                settings?.defaultUnit === 'lbs' && styles.optionTextActive,
              ]}
            >
              磅 (lbs)
            </Text>
            {settings?.defaultUnit === 'lbs' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>切换单位不会影响已记录的数据</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>健身记录 App</Text>
          <Text style={styles.versionText}>版本 1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  optionGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionActive: {
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});
