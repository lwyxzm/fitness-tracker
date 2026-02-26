import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: '健身记录' }} />
        <Stack.Screen name="workout/[id]" options={{ title: '记录训练' }} />
        <Stack.Screen name="exercises" options={{ title: '锻炼项目' }} />
        <Stack.Screen name="settings" options={{ title: '设置' }} />
        <Stack.Screen name="stats/[id]" options={{ title: '进度统计' }} />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
