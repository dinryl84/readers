import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF9C4',
          borderTopWidth: 3,
          borderTopColor: '#FFE44D',
          height: Platform.OS === 'android' ? 85 : 70,
          paddingBottom: Platform.OS === 'android' ? 25 : 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#1565C0',
        tabBarInactiveTintColor: '#90A4AE',
        tabBarLabelStyle: {
          fontWeight: '800',
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="abc/index"
        options={{
          title: 'ABC',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="syllables/index"
        options={{
          title: 'Syllables',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rhymes/index"
        options={{
          title: 'Rhymes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress/index"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden routes — no tab bar icon */}
      <Tabs.Screen name="cvc/index" options={{ href: null }} />
      <Tabs.Screen name="words/index" options={{ href: null }} />
      {/* ✅ FIX: Register trace route so it doesn't crash */}
      <Tabs.Screen name="trace/index" options={{ href: null }} />
      <Tabs.Screen name="paywall/index" options={{ href: null }} />
    </Tabs>
  );
}