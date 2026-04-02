import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SHADOWS, FONTS } from '../constants/theme';

const MODULES = [
  { label: 'ABC Letters', emoji: '🔤', route: '/abc', color: COLORS.blue, desc: 'Learn A to Z' },
  { label: 'Syllables', emoji: '🔡', route: '/syllables', color: COLORS.purple, desc: 'Ba Be Bi Bo Bu' },
  { label: 'Words', emoji: '💬', route: '/words', color: COLORS.orange, desc: 'BA + T = BAT!' },
  { label: 'CVC Words', emoji: '📖', route: '/cvc', color: COLORS.green, desc: 'cat, bat, hat...' },
  { label: 'Rhymes', emoji: '🎵', route: '/rhymes', color: COLORS.pink, desc: 'Twinkle Twinkle' },
  { label: 'Progress', emoji: '⭐', route: '/progress', color: COLORS.yellow, desc: 'My stars & badges' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const bearAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [stars, setStars] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bearAnim, { toValue: -12, duration: 600, useNativeDriver: true }),
        Animated.timing(bearAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  // Reload stars every time home screen is focused
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  async function loadStats() {
    try {
      const s = await AsyncStorage.getItem('rb_stars');
      const plan = await AsyncStorage.getItem('rb_plan');
      const expiry = await AsyncStorage.getItem('rb_expiry');

      setStars(s ? parseInt(s) : 0);

      if (plan === 'lifetime') {
        setIsPaid(true);
      } else if (plan === 'monthly' && expiry) {
        const exp = new Date(expiry);
        setIsPaid(exp > new Date());
      } else {
        setIsPaid(false);
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Animated.Text style={[styles.bear, { transform: [{ translateY: bearAnim }] }]}>
            🐻
          </Animated.Text>
          <Text style={styles.appName}>ReaderBears</Text>
          <Text style={styles.tagline}>Learn. Read. Grow.</Text>
        </Animated.View>

        {/* Stars Bar */}
        <Animated.View style={[styles.starsBar, { opacity: fadeAnim }]}>
          <View style={styles.starsLeft}>
            <Text style={styles.starsText}>⭐ {stars} Stars</Text>
            <Text style={styles.starsLabel}>
              {isPaid ? '🏆 Full Access Unlocked!' : 'Keep learning to earn more!'}
            </Text>
          </View>
          {!isPaid && (
            <TouchableOpacity
              style={styles.unlockBtn}
              onPress={() => router.push('/paywall')}
            >
              <Text style={styles.unlockBtnText}>🔓 Unlock</Text>
            </TouchableOpacity>
          )}
          {isPaid && (
            <Text style={styles.paidBadge}>✅</Text>
          )}
        </Animated.View>

        {/* Module Grid */}
        <Text style={styles.sectionTitle}>What do you want to learn? 🎉</Text>
        <View style={styles.grid}>
          {MODULES.map((mod, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.card, { backgroundColor: mod.color }, SHADOWS.medium]}
              onPress={() => router.push(mod.route)}
              activeOpacity={0.85}
            >
              <Text style={styles.cardEmoji}>{mod.emoji}</Text>
              <Text style={styles.cardLabel}>{mod.label}</Text>
              <Text style={styles.cardDesc}>{mod.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>🐻 Happy Reading!</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.yellow,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  bear: {
    fontSize: 80,
  },
  appName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    color: COLORS.dark,
    letterSpacing: 1,
    marginTop: 8,
  },
  tagline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    fontWeight: '700',
    opacity: 0.7,
    marginTop: 4,
  },
  starsBar: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    ...SHADOWS.small,
  },
  starsLeft: {
    flex: 1,
  },
  starsText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.dark,
  },
  starsLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    fontWeight: '700',
    marginTop: 2,
  },
  unlockBtn: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  unlockBtnText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '900',
    color: COLORS.white,
  },
  paidBadge: {
    fontSize: 28,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.dark,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 4,
  },
  cardEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '700',
    opacity: 0.85,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    fontSize: FONTS.sizes.md,
    color: COLORS.dark,
    fontWeight: '700',
    marginTop: 24,
    opacity: 0.6,
  },
});