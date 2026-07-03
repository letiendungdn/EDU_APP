import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#1d4ed8',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Nihongo — EDU APP' }} />
        <Stack.Screen name="vocab" options={{ title: 'Từ vựng' }} />
        <Stack.Screen name="srs" options={{ title: 'Ôn tập SRS' }} />
        <Stack.Screen name="login" options={{ title: 'Đăng nhập' }} />
        <Stack.Screen
          name="camera-translate"
          options={{
            title: 'Dịch camera',
            headerStyle: { backgroundColor: '#111' },
            headerTintColor: '#fff',
          }}
        />
      </Stack>
    </>
  );
}
