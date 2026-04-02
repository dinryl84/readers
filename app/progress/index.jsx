import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import { BADGES } from '../../constants/data';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [stars, setStars] = useState(0);
  const [learnedLetters, setLearnedLetters] = useState([]);
  const [learnedRhymes, setLearnedRhymes] = useState([]);
  const [completedSyllables, setCompletedSyllables] = useState([]);
  const [completedWords, setCompletedWords] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const bearAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProgress();
    // Bear bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(bearAnim, { toValue: -10, duration: 500, useNativeDriver: true }),
        Animated.timing(bearAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  async function loadProgress() {
    try {
      const s = await AsyncStorage.getItem('rb_stars');
      const l = await AsyncStorage.getItem('rb_letters');
      const r = await AsyncStorage.getItem('rb_rhymes');
      const sy = await AsyncStorage.getItem('rb_syllables');
      const w = await AsyncStorage.getItem('rb_words');

      const starCount = s ? parseInt(s) : 0;
      const letters = l ? JSON.parse(l) : [];
      const rhymes = r ? JSON.parse(r) : [];
      const syllables = sy ? JSON.parse(sy) : [];
      const words = w ? parseInt(w) : 0;

      setStars(starCount);
      setLearnedLetters(letters);
      setLearnedRhymes(rhymes);
      setCompletedSyllables(syllables);
      setCompletedWords(words);

      // Animate progress bar
      const pct = letters.length / 26;
      Animated.timing(progressAnim, {
        toValue: pct, duration: 1000, useNativeDriver: false
      }).start();

    } catch (e) {
      console.log('Error loading progress:', e);
    }
  }

  async function resetProgress() {
    try {
      await AsyncStorage.multiRemove([
        'rb_stars', 'rb_letters', 'rb_rhymes',
        'rb_syllables', 'rb_words'
      ]);
      setStars(0);
      setLearnedLetters([]);
      setLearnedRhymes([]);
      setCompletedSyllables([]);
      setCompletedWords(0);
      progressAnim.setValue(0);
    } catch (e) {
      console.log('Error resetting:', e);
    }
  }

  function isBadgeUnlocked(badge) {
    if (badge.type === 'letters') return learnedLetters.length >= badge.req;
    if (badge.type === 'rhymes') return learnedRhymes.length >= badge.req;
    if (badge.type === 'syllables') return completedSyllables.length >= badge.req;
    if (badge.type === 'words') return completedWords >= badge.req;
    return false;
  }

  const lettersPct = Math.round((learnedLetters.length / 26) * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⭐ My Progress</Text>
        </View>

        {/* Bear mascot */}
        <Animated.Text style={[
          styles.bear,
          { transform: [{ translateY: bearAnim }] }
        ]}>
          🐻
        </Animated.Text>

        {/* Stars card */}
        <View style={[styles.starsCard, SHADOWS.medium]}>
          <Text style={styles.starsEmoji}>⭐</Text>
          <Text style={styles.starsCount}>{stars}</Text>
          <Text style={styles.starsLabel}>Total Stars Earned!</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: COLORS.blue }]}>
            <Text style={styles.statNumber}>{learnedLetters.length}</Text>
            <Text style={styles.statLabel}>Letters{'\n'}Learned</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.pink }]}>
            <Text style={styles.statNumber}>{learnedRhymes.length}</Text>
            <Text style={styles.statLabel}>Rhymes{'\n'}Read</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.purple }]}>
            <Text style={styles.statNumber}>{completedSyllables.length}</Text>
            <Text style={styles.statLabel}>Syllable{'\n'}Families</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.orange }]}>
            <Text style={styles.statNumber}>{completedWords}</Text>
            <Text style={styles.statLabel}>Words{'\n'}Built</Text>
          </View>
        </View>

        {/* ABC Progress bar */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>
            🔤 ABC Progress — {learnedLetters.length} / 26 letters
          </Text>
          <View style={styles.progressBarBg}>
            <Animated.View style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                })
              }
            ]}>
              <Text style={styles.progressPct}>{lettersPct}%</Text>
            </Animated.View>
          </View>
        </View>

        {/* Learned letters */}
        {learnedLetters.length > 0 && (
          <View style={styles.learnedSection}>
            <Text style={styles.sectionTitle}>✅ Letters I Know</Text>
            <View style={styles.learnedRow}>
              {learnedLetters.map((l, i) => (
                <View key={i} style={[styles.learnedChip, { backgroundColor: COLORS.green }]}>
                  <Text style={styles.learnedChipText}>{l}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Badges */}
        <Text style={styles.sectionTitle}>🏅 My Badges</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map((badge, i) => {
            const unlocked = isBadgeUnlocked(badge);
            return (
              <View
                key={i}
                style={[
                  styles.badgeCard,
                  unlocked ? styles.badgeUnlocked : styles.badgeLocked,
                  SHADOWS.small,
                ]}
              >
                <Text style={[
                  styles.badgeIcon,
                  !unlocked && styles.badgeIconLocked
                ]}>
                  {badge.icon}
                </Text>
                <Text style={[
                  styles.badgeName,
                  !unlocked && styles.badgeTextLocked
                ]}>
                  {badge.name}
                </Text>
                <Text style={[
                  styles.badgeDesc,
                  !unlocked && styles.badgeTextLocked
                ]}>
                  {badge.desc}
                </Text>
                {unlocked && (
                  <Text style={styles.badgeCheck}>✅</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Reset button */}
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={resetProgress}
        >
          <Text style={styles.resetBtnText}>🔄 Reset Progress</Text>
        </TouchableOpacity>

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
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.dark,
  },
  bear: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 16,
  },
  starsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  starsEmoji: {
    fontSize: 48,
  },
  starsCount: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.dark,
    lineHeight: 72,
  },
  starsLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.gray,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statCard: {
    width: '47%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statNumber: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 10,
  },
  progressBarBg: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    height: 32,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.green,
    borderRadius: 20,
    justifyContent: 'center',
    paddingLeft: 10,
    minWidth: 40,
  },
  progressPct: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '900',
    color: COLORS.white,
  },
  learnedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.dark,
    marginBottom: 12,
  },
  learnedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  learnedChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnedChipText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
    color: COLORS.white,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  badgeCard: {
    width: '47%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  badgeUnlocked: {
    backgroundColor: COLORS.white,
  },
  badgeLocked: {
    backgroundColor: COLORS.lightGray,
  },
  badgeIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  badgeIconLocked: {
    opacity: 0.3,
  },
  badgeName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
    color: COLORS.dark,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  badgeTextLocked: {
    opacity: 0.4,
  },
  badgeCheck: {
    fontSize: 20,
    marginTop: 6,
  },
  resetBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  resetBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.gray,
  },
});