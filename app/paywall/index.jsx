import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView, TextInput, Alert
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';

const PLANS = [
  {
    id: 'free',
    label: '🆓 FREE',
    price: '₱0',
    desc: 'Forever',
    features: ['Letters A–E', 'Ba syllables', '-at CVC words', '2 Nursery Rhymes', '3 Basic Badges'],
    color: COLORS.green,
    best: false,
  },
  {
    id: 'monthly',
    label: '📅 MONTHLY',
    price: '₱59',
    desc: 'per month',
    features: ['All 26 Letters', 'All Syllables', 'All CVC Words', 'All Rhymes', 'Full Badges'],
    color: COLORS.blue,
    best: false,
  },
  {
    id: 'lifetime',
    label: '🏆 LIFETIME',
    price: '₱149',
    desc: 'one-time',
    features: ['Everything in Monthly', 'Never expires', 'Future content', 'Best Value!'],
    color: COLORS.orange,
    best: true,
  },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [planType, setPlanType] = useState('free');
  const scaleAnim0 = useRef(new Animated.Value(1));
const scaleAnim1 = useRef(new Animated.Value(1));
const scaleAnim2 = useRef(new Animated.Value(1));
const scaleAnims = [scaleAnim0.current, scaleAnim1.current, scaleAnim2.current];
  const bestAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkSubscription();
    // Pulse best value badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(bestAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(bestAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  async function checkSubscription() {
    try {
      const type = await AsyncStorage.getItem('rb_plan');
      const expiry = await AsyncStorage.getItem('rb_expiry');
      if (type === 'lifetime') {
        setSubscribed(true);
        setPlanType('lifetime');
      } else if (type === 'monthly' && expiry) {
        const exp = new Date(expiry);
        if (exp > new Date()) {
          setSubscribed(true);
          setPlanType('monthly');
        }
      }
    } catch (e) { console.log(e); }
  }

  async function activateCode() {
    if (!code.trim()) {
      Alert.alert('Oops!', 'Please enter your activation code.');
      return;
    }
    setLoading(true);
    try {
      // TODO: Replace with actual Supabase validation in Stage 9 final
      // For now simulate code check
      const trimmed = code.trim().toUpperCase();

      if (trimmed.startsWith('BEAR-L-')) {
        // Lifetime code
        await AsyncStorage.setItem('rb_plan', 'lifetime');
        await AsyncStorage.removeItem('rb_expiry');
        setSubscribed(true);
        setPlanType('lifetime');
        Alert.alert('🎉 Unlocked!', 'Welcome to ReaderBears Lifetime! All content is now unlocked!');
      } else if (trimmed.startsWith('BEAR-M-')) {
        // Monthly code — 30 days
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        await AsyncStorage.setItem('rb_plan', 'monthly');
        await AsyncStorage.setItem('rb_expiry', expiry.toISOString());
        setSubscribed(true);
        setPlanType('monthly');
        Alert.alert('🎉 Unlocked!', 'Welcome to ReaderBears Monthly! Enjoy 30 days of full access!');
      } else {
        Alert.alert('❌ Invalid Code', 'This code is not valid. Please check and try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    setLoading(false);
    setCode('');
  }

  async function deactivate() {
    Alert.alert(
      'Remove Subscription?',
      'This will remove your current plan.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('rb_plan');
            await AsyncStorage.removeItem('rb_expiry');
            setSubscribed(false);
            setPlanType('free');
          }
        }
      ]
    );
  }

  // ====== ALREADY SUBSCRIBED SCREEN ======
  if (subscribed) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>⬅️ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Plan</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.subscribedCard}>
          <Text style={styles.subscribedEmoji}>
            {planType === 'lifetime' ? '🏆' : '📅'}
          </Text>
          <Text style={styles.subscribedTitle}>
            {planType === 'lifetime' ? 'Lifetime Access!' : 'Monthly Access!'}
          </Text>
          <Text style={styles.subscribedDesc}>
            {planType === 'lifetime'
              ? 'You have full access forever! 🎉'
              : 'You have full access for 30 days!'}
          </Text>
          <Text style={styles.subscribedStar}>⭐ All content unlocked!</Text>

          <TouchableOpacity
            style={styles.deactivateBtn}
            onPress={deactivate}
          >
            <Text style={styles.deactivateBtnText}>Remove Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ====== PAYWALL SCREEN ======
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>⬅️ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔓 Unlock ReaderBears</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Choose a plan to unlock all content! 🐻
        </Text>

        {/* Plan cards */}
        {PLANS.map((plan, i) => (
          <Animated.View
            key={plan.id}
            style={[
              styles.planCard,
              { borderColor: plan.color, borderWidth: 3 },
              plan.best && { transform: [{ scale: bestAnim }] },
              SHADOWS.medium,
            ]}
          >
            {plan.best && (
              <View style={[styles.bestBadge, { backgroundColor: plan.color }]}>
                <Text style={styles.bestBadgeText}>⭐ BEST VALUE</Text>
              </View>
            )}

            <Text style={[styles.planLabel, { color: plan.color }]}>
              {plan.label}
            </Text>
            <Text style={[styles.planPrice, { color: plan.color }]}>
              {plan.price}
            </Text>
            <Text style={styles.planDesc}>{plan.desc}</Text>

            <View style={styles.featureList}>
              {plan.features.map((f, j) => (
                <Text key={j} style={styles.featureItem}>✅ {f}</Text>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Activation code section */}
        {/* Activation code section */}
<View style={styles.codeSection}>
  <Text style={styles.codeTitle}>🔑 Have an Activation Code?</Text>
  <Text style={styles.codeDesc}>
    Enter your activation code below to unlock full access.
  </Text>

          <TextInput
            style={styles.codeInput}
            placeholder="Enter code e.g. BEAR-M-XXXX"
            placeholderTextColor={COLORS.gray}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.activateBtn, loading && { opacity: 0.6 }]}
            onPress={activateCode}
            disabled={loading}
          >
            <Text style={styles.activateBtnText}>
              {loading ? '⏳ Checking...' : '🔓 Activate Code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact section */}
        {/* Contact section */}
<View style={styles.contactSection}>
  <Text style={styles.contactTitle}>💬 Coming Soon</Text>
  <Text style={styles.contactStep}>
    In-app purchase will be available soon. Stay tuned for updates!
  </Text>
</View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.yellow,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.dark,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.dark,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  bestBadge: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bestBadgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '900',
    color: COLORS.white,
  },
  planLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    lineHeight: 40,
  },
  planDesc: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray,
    marginBottom: 12,
  },
  featureList: {
    gap: 4,
  },
  featureItem: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.dark,
  },
  codeSection: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  codeTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.dark,
    marginBottom: 6,
  },
  codeDesc: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray,
    marginBottom: 14,
  },
  codeInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 12,
    letterSpacing: 1,
  },
  activateBtn: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  activateBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
    color: COLORS.white,
  },
  contactSection: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  contactTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.dark,
    marginBottom: 12,
  },
  contactStep: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
  },
  fbBtn: {
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    ...SHADOWS.small,
  },
  fbBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
    color: COLORS.white,
  },
  subscribedCard: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  subscribedEmoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  subscribedTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.dark,
    marginBottom: 8,
  },
  subscribedDesc: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 8,
  },
  subscribedStar: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.green,
    marginBottom: 24,
  },
  deactivateBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: COLORS.lightGray,
  },
  deactivateBtnText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
    color: COLORS.gray,
  },
});