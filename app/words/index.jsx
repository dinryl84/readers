import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated
} from 'react-native';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { COLORS, FONTS, SHADOWS, Storage } from '../../constants/theme';

const CONSONANT_SOUNDS = {
  B:'buh', C:'kuh', D:'duh', F:'fuh', G:'guh', H:'huh',
  J:'juh', K:'kuh', L:'luh', M:'muh', N:'nuh', P:'puh',
  R:'ruh', S:'suh', T:'tuh', V:'vuh', W:'wuh', Y:'yuh', Z:'zuh'
};

const VOWEL_SOUNDS = {
  A:'at', E:'egg', I:'in', O:'on', U:'up'
};

const WORD_FAMILIES = [
  {
    syllable: 'Ba',
    color: '#FF6B8A',
    free: true,
    levels: [
      {
        level: 'Easy',
        emoji: '🟢',
        words: [
          { word: 'Bat', emoji: '🦇', ending: 'T' },
          { word: 'Bag', emoji: '👜', ending: 'G' },
          { word: 'Bad', emoji: '😠', ending: 'D' },
          { word: 'Ban', emoji: '🚫', ending: 'N' },
        ],
      },
      {
        level: 'Medium',
        emoji: '🟡',
        words: [
          { word: 'Ball', emoji: '⚽', ending: 'LL' },
          { word: 'Band', emoji: '🎸', ending: 'ND' },
          { word: 'Bark', emoji: '🐕', ending: 'RK' },
          { word: 'Bath', emoji: '🛁', ending: 'TH' },
        ],
      },
      {
        level: 'Advanced',
        emoji: '🔵',
        words: [
          { word: 'Baby', emoji: '👶', ending: 'BY' },
          { word: 'Basket', emoji: '🧺', ending: 'SKET' },
          { word: 'Banana', emoji: '🍌', ending: 'NANA' },
          { word: 'Balloon', emoji: '🎈', ending: 'LLOON' },
        ],
      },
    ],
  },
  {
    syllable: 'Ca',
    color: '#4DAAFF',
    free: false,
    levels: [
      {
        level: 'Easy',
        emoji: '🟢',
        words: [
          { word: 'Cat', emoji: '🐱', ending: 'T' },
          { word: 'Can', emoji: '🥫', ending: 'N' },
          { word: 'Cap', emoji: '🧢', ending: 'P' },
          { word: 'Car', emoji: '🚗', ending: 'R' },
        ],
      },
      {
        level: 'Medium',
        emoji: '🟡',
        words: [
          { word: 'Cake', emoji: '🎂', ending: 'KE' },
          { word: 'Camp', emoji: '⛺', ending: 'MP' },
          { word: 'Card', emoji: '🃏', ending: 'RD' },
          { word: 'Cart', emoji: '🛒', ending: 'RT' },
        ],
      },
      {
        level: 'Advanced',
        emoji: '🔵',
        words: [
          { word: 'Candy', emoji: '🍬', ending: 'NDY' },
          { word: 'Castle', emoji: '🏰', ending: 'STLE' },
          { word: 'Candle', emoji: '🕯️', ending: 'NDLE' },
          { word: 'Carrot', emoji: '🥕', ending: 'RROT' },
        ],
      },
    ],
  },
  {
    syllable: 'Da',
    color: '#B57BFF',
    free: false,
    levels: [
      {
        level: 'Easy',
        emoji: '🟢',
        words: [
          { word: 'Dad', emoji: '👨', ending: 'D' },
          { word: 'Dam', emoji: '💧', ending: 'M' },
          { word: 'Dan', emoji: '👦', ending: 'N' },
          { word: 'Dab', emoji: '👆', ending: 'B' },
        ],
      },
      {
        level: 'Medium',
        emoji: '🟡',
        words: [
          { word: 'Dark', emoji: '🌑', ending: 'RK' },
          { word: 'Dart', emoji: '🎯', ending: 'RT' },
          { word: 'Damp', emoji: '💦', ending: 'MP' },
          { word: 'Dash', emoji: '💨', ending: 'SH' },
        ],
      },
      {
        level: 'Advanced',
        emoji: '🔵',
        words: [
          { word: 'Daisy', emoji: '🌼', ending: 'ISY' },
          { word: 'Dance', emoji: '💃', ending: 'NCE' },
          { word: 'Dancer', emoji: '🕺', ending: 'NCER' },
          { word: 'Dagger', emoji: '🗡️', ending: 'GGER' },
        ],
      },
    ],
  },
];

export default function WordsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [showImage, setShowImage] = useState(false);

  const popAnim = useRef(new Animated.Value(0)).current;
  const celebAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  function openFamily(family) {
    if (!family.free) return;
    setSelectedFamily(family);
    setSelectedLevel(null);
    setWordIndex(0);
    setShowImage(false);
  }

  function openLevel(level) {
    setSelectedLevel(level);
    setWordIndex(0);
    setShowImage(false);
    popAnim.setValue(0);
    celebAnim.setValue(0);
    speakWord(level.words[0]);
  }

  function speakWord(wordObj) {
    Speech.speak(wordObj.word, {
      rate: 0.6, pitch: 1.3, language: 'en-US'
    });
  }

  function weSaidIt() {
    setShowImage(true);
    const word = selectedLevel.words[wordIndex];

    // Pop animation
    popAnim.setValue(0);
    Animated.spring(popAnim, {
      toValue: 1,
      friction: 3,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Celebrate
    Animated.timing(celebAnim, {
      toValue: 1, duration: 500, useNativeDriver: true
    }).start();

    // Speak confirmation
    Speech.speak(`${word.word}! Great job!`, {
      rate: 0.7, pitch: 1.3, language: 'en-US'
    });
    Storage.addWord();
  }

  function nextWord() {
    const words = selectedLevel.words;
    if (wordIndex < words.length - 1) {
      const next = wordIndex + 1;
      setWordIndex(next);
      setShowImage(false);
      popAnim.setValue(0);
      celebAnim.setValue(0);
      speakWord(words[next]);
    } else {
      // Finished all words in level
      Speech.speak('Amazing! You finished all the words! Great job!', {
        rate: 0.7, pitch: 1.3, language: 'en-US'
      });
      setSelectedLevel(null);
      setWordIndex(0);
      setShowImage(false);
    }
  }

  // ====== WORD LESSON SCREEN ======
  if (selectedFamily && selectedLevel) {
    const word = selectedLevel.words[wordIndex];
    const syllable = selectedFamily.syllable;
    const ending = word.ending;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            Speech.stop();
            setSelectedLevel(null);
            setShowImage(false);
          }}>
            <Text style={styles.backBtn}>⬅️ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedLevel.emoji} {selectedLevel.level}
          </Text>
          <Text style={styles.headerSub}>
            {wordIndex + 1} / {selectedLevel.words.length}
          </Text>
        </View>

        {/* Word tiles */}
        <View style={styles.wordArea}>

          {/* Syllable + ending tiles */}
          <View style={styles.tilesRow}>
            <TouchableOpacity
              onPress={() => Speech.speak(syllable, {
                rate: 0.6, pitch: 1.3, language: 'en-US'
              })}
              activeOpacity={0.8}
            >
              <View style={[styles.syllableTile, { backgroundColor: selectedFamily.color }]}>
                <Text style={styles.syllableText}>{syllable}</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.plusText}>+</Text>

            <TouchableOpacity
              onPress={() => Speech.speak(ending.toLowerCase(), {
                rate: 0.6, pitch: 1.3, language: 'en-US'
              })}
              activeOpacity={0.8}
            >
              <View style={[styles.endingTile, { backgroundColor: COLORS.darkBlue }]}>
                <Text style={styles.endingText}>{ending.toLowerCase()}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Equals sign */}
          <Text style={styles.equalsText}>=</Text>

          {/* Full word */}
          <TouchableOpacity onPress={() => speakWord(word)}>
            <View style={[styles.fullWordTile, { backgroundColor: selectedFamily.color }]}>
              <Text style={styles.fullWordText}>{word.word}</Text>
            </View>
          </TouchableOpacity>

          {/* Emoji pop-up */}
          {showImage && (
            <Animated.View style={[
              styles.emojiPop,
              { transform: [{ scale: popAnim }], opacity: celebAnim }
            ]}>
              <Text style={styles.emojiText}>{word.emoji}</Text>
              <Text style={styles.emojiLabel}>{word.word}!</Text>
              <Text style={styles.starText}>⭐ Great job!</Text>
            </Animated.View>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.btnCol}>
          {!showImage ? (
            <TouchableOpacity
              style={[styles.saidBtn, { backgroundColor: COLORS.green }]}
              onPress={weSaidIt}
            >
              <Text style={styles.saidBtnText}>✅ We Said It!</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.saidBtn, { backgroundColor: selectedFamily.color }]}
              onPress={nextWord}
            >
              <Text style={styles.saidBtnText}>
                {wordIndex < selectedLevel.words.length - 1 ? 'Next Word ➡️' : '🎉 Finish!'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.hearBtn}
            onPress={() => speakWord(word)}
          >
            <Text style={styles.hearBtnText}>🔊 Hear It Again</Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  }

  // ====== LEVEL SELECTION SCREEN ======
  if (selectedFamily) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedFamily(null)}>
            <Text style={styles.backBtn}>⬅️ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedFamily.syllable} Words</Text>
          <Text style={styles.headerSub}>Pick level!</Text>
        </View>

        <View style={styles.levelGrid}>
          {selectedFamily.levels.map((level, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.levelCard, { backgroundColor: selectedFamily.color }, SHADOWS.medium]}
              onPress={() => openLevel(level)}
              activeOpacity={0.85}
            >
              <Text style={styles.levelEmoji}>{level.emoji}</Text>
              <Text style={styles.levelName}>{level.level}</Text>
              <Text style={styles.levelCount}>{level.words.length} words</Text>
              <View style={styles.wordPreview}>
                {level.words.slice(0, 2).map((w, j) => (
                  <Text key={j} style={styles.wordPreviewText}>
                    {w.emoji} {w.word}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // ====== FAMILY SELECTION GRID ======
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Words</Text>
        <Text style={styles.headerSub}>Pick a syllable!</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {WORD_FAMILIES.map((family, i) => (
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
                <Text style={styles.familyLetter}>{family.syllable}</Text>
                <Text style={styles.familySub}>words</Text>
              </>
            ) : (
              <>
                <Text style={styles.familyLetterLocked}>{family.syllable}</Text>
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
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
  familyLetterLocked: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.gray,
  },
  familySub: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
    opacity: 0.9,
  },
  lockIcon: {
    fontSize: 14,
    marginTop: 4,
  },
  levelGrid: {
    padding: 20,
    gap: 16,
  },
  levelCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  levelEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  levelName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.white,
  },
  levelCount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.white,
    opacity: 0.85,
    marginBottom: 10,
  },
  wordPreview: {
    flexDirection: 'row',
    gap: 12,
  },
  wordPreviewText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.white,
    opacity: 0.9,
  },
  wordArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syllableTile: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  syllableText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.white,
  },
  plusText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.dark,
    opacity: 0.5,
  },
  endingTile: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  endingText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.white,
  },
  equalsText: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.dark,
    opacity: 0.5,
    marginVertical: 8,
  },
  fullWordTile: {
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  fullWordText: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.white,
  },
  emojiPop: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    ...SHADOWS.medium,
  },
  emojiText: {
    fontSize: 64,
  },
  emojiLabel: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.dark,
    marginTop: 6,
  },
  starText: {
    fontSize: FONTS.sizes.lg,
    marginTop: 4,
  },
  btnCol: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  saidBtn: {
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  saidBtnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.white,
  },
  hearBtn: {
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  hearBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.dark,
  },
});