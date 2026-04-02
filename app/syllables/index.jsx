import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated
} from 'react-native';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { COLORS, FONTS, SHADOWS, Storage } from '../../constants/theme';
import { isPaidUser } from '../../constants/subscription';
import { router } from 'expo-router';

const SYLLABLE_FAMILIES = [
  { consonant: 'B', color: '#FF6B8A', free: true },
  { consonant: 'C', color: '#4DAAFF', free: false },
  { consonant: 'D', color: '#B57BFF', free: false },
  { consonant: 'F', color: '#FF9F43', free: false },
  { consonant: 'G', color: '#5DD87A', free: false },
  { consonant: 'H', color: '#FF6B8A', free: false },
  { consonant: 'J', color: '#4DAAFF', free: false },
  { consonant: 'K', color: '#B57BFF', free: false },
  { consonant: 'L', color: '#FF9F43', free: false },
  { consonant: 'M', color: '#5DD87A', free: false },
  { consonant: 'N', color: '#FF6B8A', free: false },
  { consonant: 'P', color: '#4DAAFF', free: false },
  { consonant: 'R', color: '#B57BFF', free: false },
  { consonant: 'S', color: '#FF9F43', free: false },
  { consonant: 'T', color: '#5DD87A', free: false },
  { consonant: 'V', color: '#FF6B8A', free: false },
  { consonant: 'W', color: '#4DAAFF', free: false },
  { consonant: 'Y', color: '#B57BFF', free: false },
  { consonant: 'Z', color: '#FF9F43', free: false },
];

const VOWELS = ['A', 'E', 'I', 'O', 'U'];

const CONSONANT_SOUNDS = {
  B:'buh', C:'kuh', D:'duh', F:'fuh', G:'guh', H:'huh',
  J:'juh', K:'kuh', L:'luh', M:'muh', N:'nuh', P:'puh',
  R:'ruh', S:'suh', T:'tuh', V:'vuh', W:'wuh', Y:'yuh', Z:'zuh'
};

const VOWEL_SOUNDS = {
  A:'aa', E:'e', I:'ey', O:'on', U:'up'
};

export default function SyllablesScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [vowelIndex, setVowelIndex] = useState(0);
  const [merged, setMerged] = useState(false);

  const leftAnim = useRef(new Animated.Value(0)).current;
  const rightAnim = useRef(new Animated.Value(0)).current;
  const mergedScale = useRef(new Animated.Value(0)).current;
  const celebAnim = useRef(new Animated.Value(0)).current;

  async function openFamily(family) {
    if (!family.free) {
      const paid = await isPaidUser();
      if (!paid) {
        router.push('/paywall');
        return;
      }
    }
    setSelected(family);

  function resetAnims() {
    leftAnim.setValue(-80);
    rightAnim.setValue(80);
    mergedScale.setValue(0);
    celebAnim.setValue(0);
    setMerged(false);
    Animated.parallel([
      Animated.spring(leftAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
      Animated.spring(rightAnim, { toValue: 0, friction: 6, useNativeDriver: true }),
    ]).start();
  }

  function blendSyllable() {
    if (!selected) return;
    const vowel = VOWELS[vowelIndex];
    const syllable = selected.consonant + vowel.toLowerCase();

    Speech.speak(CONSONANT_SOUNDS[selected.consonant] || selected.consonant, {
      rate: 0.5, pitch: 1.3, language: 'en-US'
    });
    setTimeout(() => {
      Speech.speak(VOWEL_SOUNDS[vowel] || vowel, {
        rate: 0.5, pitch: 1.3, language: 'en-US'
      });
    }, 900);
    setTimeout(() => {
      Speech.speak(syllable, {
        rate: 0.6, pitch: 1.3, language: 'en-US'
      });
    }, 1800);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(leftAnim, { toValue: 30, duration: 400, useNativeDriver: true }),
        Animated.timing(rightAnim, { toValue: -30, duration: 400, useNativeDriver: true }),
      ]),
      Animated.spring(mergedScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start(() => setMerged(true));

    Animated.timing(celebAnim, {
      toValue: 1, duration: 800, delay: 1200, useNativeDriver: true
    }).start();
  }

  function nextVowel() {
    if (vowelIndex < VOWELS.length - 1) {
      setVowelIndex(prev => prev + 1);
      resetAnims();
    } else {
      Speech.speak('Amazing! You finished all syllables! Great job!', {
        rate: 0.7, pitch: 1.3, language: 'en-US'
      });
      Storage.addSyllable(selected.consonant);
      
      Animated.sequence([
        Animated.spring(mergedScale, { toValue: 1.3, friction: 3, useNativeDriver: true }),
        Animated.spring(mergedScale, { toValue: 1, friction: 3, useNativeDriver: true }),
        Animated.spring(mergedScale, { toValue: 1.2, friction: 3, useNativeDriver: true }),
        Animated.spring(mergedScale, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start(() => setSelected(null));
    }
  }

  function prevVowel() {
    if (vowelIndex > 0) {
      setVowelIndex(prev => prev - 1);
      resetAnims();
    }
  }

  // ====== LESSON SCREEN ======
  if (selected) {
    const vowel = VOWELS[vowelIndex];
    const syllable = selected.consonant + vowel.toLowerCase();

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { Speech.stop(); setSelected(null); }}>
            <Text style={styles.backBtn}>⬅️ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔡 Syllables</Text>
          <Text style={styles.headerSub}>{vowelIndex + 1} / {VOWELS.length}</Text>
        </View>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {VOWELS.map((v, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i <= vowelIndex ? selected.color : COLORS.lightGray }
              ]}
            />
          ))}
        </View>

        {/* Blending area */}
        <View style={styles.blendArea}>
          {!merged ? (
            <View style={styles.tilesRow}>

              {/* Consonant tile — Capital B, says "buh" */}
              <TouchableOpacity
                onPress={() => Speech.speak(
                  CONSONANT_SOUNDS[selected.consonant] || selected.consonant,
                  { rate: 0.5, pitch: 1.3, language: 'en-US' }
                )}
                activeOpacity={0.8}
              >
                <Animated.View style={[
                  styles.tile,
                  { backgroundColor: selected.color, transform: [{ translateX: leftAnim }] }
                ]}>
                  <Text style={styles.tileText}>{selected.consonant}</Text>
                </Animated.View>
              </TouchableOpacity>

              <Text style={styles.plusText}>+</Text>

              {/* Vowel tile — lowercase a, says "aah" */}
              <TouchableOpacity
                onPress={() => Speech.speak(
                  VOWEL_SOUNDS[vowel] || vowel,
                  { rate: 0.5, pitch: 1.3, language: 'en-US' }
                )}
                activeOpacity={0.8}
              >
                <Animated.View style={[
                  styles.tile,
                  { backgroundColor: COLORS.blue, transform: [{ translateX: rightAnim }] }
                ]}>
                  <Text style={styles.tileText}>{vowel.toLowerCase()}</Text>
                </Animated.View>
              </TouchableOpacity>

            </View>
          ) : (
            // Merged tile — shows "Ba", says "ba"
            <TouchableOpacity
              onPress={() => Speech.speak(syllable, {
                rate: 0.6, pitch: 1.3, language: 'en-US'
              })}
              activeOpacity={0.8}
            >
              <Animated.View style={[
                styles.mergedTile,
                { backgroundColor: selected.color, transform: [{ scale: mergedScale }] }
              ]}>
                <Text style={styles.mergedText}>{syllable}</Text>
              </Animated.View>
            </TouchableOpacity>
          )}

          {/* Celebration */}
          {merged && (
            <Animated.View style={[styles.celebRow, { opacity: celebAnim }]}>
              <Text style={styles.celebText}>⭐ {syllable}! Great job!</Text>
            </Animated.View>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          {!merged && (
            <TouchableOpacity
              style={[styles.blendBtn, { backgroundColor: selected.color }]}
              onPress={blendSyllable}
            >
              <Text style={styles.blendBtnText}>
                🔊 Blend {selected.consonant} + {vowel.toLowerCase()}!
              </Text>
            </TouchableOpacity>
          )}

          {merged && (
            <>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: COLORS.gray }]}
                onPress={resetAnims}
              >
                <Text style={styles.btnText}>🔄 Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: selected.color }]}
                onPress={nextVowel}
              >
                <Text style={styles.btnText}>
                  {vowelIndex < VOWELS.length - 1 ? 'Next ➡️' : '🎉 Done!'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Prev / Next navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, { opacity: vowelIndex === 0 ? 0.3 : 1 }]}
            onPress={prevVowel}
            disabled={vowelIndex === 0}
          >
            <Text style={styles.navBtnText}>⬅️ Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={nextVowel}
          >
            <Text style={styles.navBtnText}>
              {vowelIndex < VOWELS.length - 1 ? 'Next ➡️' : '🎉 Finish'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  }

  // ====== FAMILY SELECTION GRID ======
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔡 Syllables</Text>
        <Text style={styles.headerSub}>Pick a letter!</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {SYLLABLE_FAMILIES.map((family, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.familyCard,
              { backgroundColor: family.free ? family.color : COLORS.lightGray },
              SHADOWS.small,
            ]}
            onPress={() => openFamily(family)}
            activeOpacity={family.free ? 0.8 : 1}
          >
            {family.free ? (
              <>
                <Text style={styles.familyLetter}>{family.consonant}</Text>
                <Text style={styles.familySubs}>
                  {VOWELS.map(v => family.consonant + v.toLowerCase()).join(' ')}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.familyLetterLocked}>{family.consonant}</Text>
                <Text style={styles.lockIcon}>🔒</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
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
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.dark,
  },
  headerSub: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
    color: COLORS.dark,
    opacity: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
    justifyContent: 'space-between',
  },
  familyCard: {
    width: '22%',
    aspectRatio: 0.9,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  familyLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
  },
  familyLetterLocked: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.gray,
  },
  familySubs: {
    fontSize: 7,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.9,
  },
  lockIcon: {
    fontSize: 14,
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  blendArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tile: {
    width: 110,
    height: 110,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  tileText: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.white,
  },
  plusText: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.dark,
    opacity: 0.5,
  },
  mergedTile: {
    width: 180,
    height: 180,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  mergedText: {
    fontSize: 80,
    fontWeight: '900',
    color: COLORS.white,
  },
  celebRow: {
    marginTop: 20,
    alignItems: 'center',
  },
  celebText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.dark,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  blendBtn: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 50,
    ...SHADOWS.medium,
  },
  blendBtnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.white,
  },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    ...SHADOWS.small,
  },
  btnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
    color: COLORS.white,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    ...SHADOWS.small,
  },
  navBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.dark,
  },
});