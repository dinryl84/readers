import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated
} from 'react-native';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import { CVC_FAMILIES } from '../../constants/data';
import { isPaidUser } from '../../constants/subscription';
import { router } from 'expo-router';

export default function CVCScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [activity, setActivity] = useState(null); // 'see' | 'hear' | 'build'
  const [wordIndex, setWordIndex] = useState(0);

  // See It animations
  const seeAnim = useRef(new Animated.Value(0)).current;

  // Hear It animations
  const hearAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Build It state
  const [shuffled, setShuffled] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [buildResult, setBuildResult] = useState(null); // 'correct' | 'wrong'
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const correctAnim = useRef(new Animated.Value(0)).current;

  async function openFamily(family) {
    if (!family.free) {
      const paid = await isPaidUser();
      if (!paid) {
        router.push('/paywall');
        return;
      }
    }
    setSelectedFamily(family);
  } // ✅ FIX: closing brace was missing here

  function openActivity(act) {
    setActivity(act);
    setWordIndex(0);
    setBuildResult(null);
    if (act === 'see') startSeeIt(0);
    if (act === 'hear') startHearIt(0);
    if (act === 'build') setupBuild(0);
  }

  // ====== SEE IT ======
  function startSeeIt(idx) {
    seeAnim.setValue(0);
    Animated.spring(seeAnim, {
      toValue: 1, friction: 4, useNativeDriver: true
    }).start();
    const word = selectedFamily.words[idx];
    Speech.speak(word.word, { rate: 0.6, pitch: 1.3, language: 'en-US' });
  }

  function nextSeeWord() {
    const next = wordIndex + 1;
    if (next < selectedFamily.words.length) {
      setWordIndex(next);
      startSeeIt(next);
    } else {
      Speech.speak('Great job! You finished all the words!', {
        rate: 0.7, pitch: 1.3, language: 'en-US'
      });
      setActivity(null);
    }
  }

  // ====== HEAR IT ======
  function startHearIt(idx) {
    hearAnims.forEach(a => a.setValue(0));
    const word = selectedFamily.words[idx];
    const letters = word.word.split('');

    letters.forEach((_, i) => {
      setTimeout(() => {
        Animated.spring(hearAnims[i], {
          toValue: 1, friction: 4, useNativeDriver: true
        }).start();
        Speech.speak(letters[i], { rate: 0.5, pitch: 1.3, language: 'en-US' });
      }, i * 700);
    });

    setTimeout(() => {
      Speech.speak(word.word, { rate: 0.65, pitch: 1.3, language: 'en-US' });
    }, letters.length * 700 + 300);
  }

  function nextHearWord() {
    const next = wordIndex + 1;
    if (next < selectedFamily.words.length) {
      setWordIndex(next);
      startHearIt(next);
    } else {
      Speech.speak('Amazing! You finished hearing all the words!', {
        rate: 0.7, pitch: 1.3, language: 'en-US'
      });
      setActivity(null);
    }
  }

  // ====== BUILD IT ======
  function setupBuild(idx) {
    const word = selectedFamily.words[idx];
    const letters = word.word.toUpperCase().split('');
    setShuffled([...letters].sort(() => Math.random() - 0.5));
    setAnswer([]);
    setBuildResult(null);
    correctAnim.setValue(0);
  }

  function tapShuffled(letter, idx) {
    const newShuffled = [...shuffled];
    newShuffled.splice(idx, 1);
    setShuffled(newShuffled);
    setAnswer(prev => [...prev, letter]);
  }

  function tapAnswer(letter, idx) {
    const newAnswer = [...answer];
    newAnswer.splice(idx, 1);
    setAnswer(newAnswer);
    setShuffled(prev => [...prev, letter]);
  }

  function checkAnswer() {
    const word = selectedFamily.words[wordIndex].word.toUpperCase();
    const userWord = answer.join('');
    if (userWord === word) {
      setBuildResult('correct');
      Speech.speak(`${selectedFamily.words[wordIndex].word}! Correct! Great job!`, {
        rate: 0.7, pitch: 1.3, language: 'en-US'
      });
      Animated.spring(correctAnim, {
        toValue: 1, friction: 3, useNativeDriver: true
      }).start();
    } else {
      setBuildResult('wrong');
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      Speech.speak('Try again!', { rate: 0.7, pitch: 1.3, language: 'en-US' });
      setTimeout(() => setBuildResult(null), 1000);
    }
  }

  function nextBuildWord() {
    const next = wordIndex + 1;
    if (next < selectedFamily.words.length) {
      setWordIndex(next);
      setupBuild(next);
    } else {
      Speech.speak('You finished building all the words! Amazing!', {
        rate: 0.7, pitch: 1.3, language: 'en-US'
      });
      setActivity(null);
    }
  }

  // ====== SEE IT SCREEN ======
  if (selectedFamily && activity === 'see') {
    const word = selectedFamily.words[wordIndex];
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { Speech.stop(); setActivity(null); }}>
            <Text style={styles.backBtn}>⬅️ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>👁️ See It</Text>
          <Text style={styles.headerSub}>{wordIndex + 1}/{selectedFamily.words.length}</Text>
        </View>

        <View style={styles.activityArea}>
          <Animated.View style={[
            styles.seeCard,
            { transform: [{ scale: seeAnim }] }
          ]}>
            <Text style={styles.seeEmoji}>{word.emoji}</Text>
            <Text style={[styles.seeWord, { color: selectedFamily.color }]}>
              {word.word}
            </Text>

            {/* Letter tiles */}
            <View style={styles.letterTilesRow}>
              {word.word.split('').map((letter, i) => (
                <View
                  key={i}
                  style={[styles.letterTile, { backgroundColor: selectedFamily.color }]}
                >
                  <Text style={styles.letterTileText}>{letter.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <TouchableOpacity
            style={[styles.speakBtn, { backgroundColor: selectedFamily.color }]}
            onPress={() => Speech.speak(word.word, { rate: 0.6, pitch: 1.3, language: 'en-US' })}
          >
            <Text style={styles.speakBtnText}>🔊 Say It!</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={nextSeeWord}
          >
            <Text style={styles.nextBtnText}>
              {wordIndex < selectedFamily.words.length - 1 ? 'Next ➡️' : '🎉 Done!'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ====== HEAR IT SCREEN ======
  if (selectedFamily && activity === 'hear') {
    const word = selectedFamily.words[wordIndex];
    const letters = word.word.split('');
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { Speech.stop(); setActivity(null); }}>
            <Text style={styles.backBtn}>⬅️ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>👂 Hear It</Text>
          <Text style={styles.headerSub}>{wordIndex + 1}/{selectedFamily.words.length}</Text>
        </View>

        <View style={styles.activityArea}>
          <Text style={styles.hearEmoji}>{word.emoji}</Text>

          {/* Animated letter tiles */}
          <View style={styles.hearTilesRow}>
            {letters.map((letter, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.hearTile,
                  { backgroundColor: selectedFamily.color },
                  { transform: [{ scale: hearAnims[i] }] }
                ]}
              >
                <Text style={styles.hearTileText}>{letter.toUpperCase()}</Text>
              </Animated.View>
            ))}
          </View>

          <Text style={[styles.hearWord, { color: selectedFamily.color }]}>
            {word.word}
          </Text>

          <TouchableOpacity
            style={[styles.speakBtn, { backgroundColor: selectedFamily.color }]}
            onPress={() => startHearIt(wordIndex)}
          >
            <Text style={styles.speakBtnText}>🔊 Hear Again!</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={nextHearWord}
          >
            <Text style={styles.nextBtnText}>
              {wordIndex < selectedFamily.words.length - 1 ? 'Next ➡️' : '🎉 Done!'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ====== BUILD IT SCREEN ======
  if (selectedFamily && activity === 'build') {
    const word = selectedFamily.words[wordIndex];
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { Speech.stop(); setActivity(null); }}>
            <Text style={styles.backBtn}>⬅️ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🧩 Build It</Text>
          <Text style={styles.headerSub}>{wordIndex + 1}/{selectedFamily.words.length}</Text>
        </View>

        <View style={styles.activityArea}>
          <Text style={styles.buildEmoji}>{word.emoji}</Text>
          <Text style={styles.buildHint}>Build the word!</Text>

          {/* Answer slots */}
          <Animated.View style={[
            styles.answerRow,
            { transform: [{ translateX: shakeAnim }] }
          ]}>
            {word.word.split('').map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.answerSlot,
                  answer[i] && { backgroundColor: selectedFamily.color },
                  buildResult === 'correct' && answer[i] && { backgroundColor: COLORS.green },
                  buildResult === 'wrong' && answer[i] && { backgroundColor: COLORS.pink },
                ]}
                onPress={() => answer[i] && tapAnswer(answer[i], i)}
              >
                <Text style={styles.answerSlotText}>
                  {answer[i] || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Result message */}
          {buildResult === 'correct' && (
            <Animated.Text style={[
              styles.resultText,
              { transform: [{ scale: correctAnim }] }
            ]}>
              ⭐ Correct! {word.word}!
            </Animated.Text>
          )}
          {buildResult === 'wrong' && (
            <Text style={[styles.resultText, { color: COLORS.pink }]}>
              ❌ Try again!
            </Text>
          )}

          {/* Shuffled letters */}
          <View style={styles.shuffledRow}>
            {shuffled.map((letter, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.shuffledTile, { backgroundColor: COLORS.darkBlue }]}
                onPress={() => tapShuffled(letter, i)}
              >
                <Text style={styles.shuffledText}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buildBtnRow}>
            {buildResult !== 'correct' ? (
              <>
                <TouchableOpacity
                  style={[styles.buildBtn, { backgroundColor: COLORS.gray }]}
                  onPress={() => setupBuild(wordIndex)}
                >
                  <Text style={styles.buildBtnText}>🔄 Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.buildBtn, { backgroundColor: selectedFamily.color }]}
                  onPress={checkAnswer}
                  disabled={answer.length !== word.word.length}
                >
                  <Text style={styles.buildBtnText}>✅ Check!</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.buildBtn, { backgroundColor: COLORS.green }]}
                onPress={nextBuildWord}
              >
                <Text style={styles.buildBtnText}>
                  {wordIndex < selectedFamily.words.length - 1 ? 'Next ➡️' : '🎉 Done!'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ====== ACTIVITY SELECTION ======
  if (selectedFamily) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedFamily(null)}>
            <Text style={styles.backBtn}>⬅️ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedFamily.family} Words</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Word preview */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={styles.wordPreviewScroll}
          contentContainerStyle={styles.wordPreviewRow}
        >
          {selectedFamily.words.map((w, i) => (
            <View key={i} style={[styles.previewChip, { backgroundColor: selectedFamily.color }]}>
              <Text style={styles.previewChipText}>{w.emoji} {w.word}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Activity cards */}
        <View style={styles.activityGrid}>
          <TouchableOpacity
            style={[styles.activityCard, { backgroundColor: COLORS.blue }]}
            onPress={() => openActivity('see')}
          >
            <Text style={styles.activityEmoji}>👁️</Text>
            <Text style={styles.activityName}>See It</Text>
            <Text style={styles.activityDesc}>Look and learn the word</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.activityCard, { backgroundColor: COLORS.purple }]}
            onPress={() => openActivity('hear')}
          >
            <Text style={styles.activityEmoji}>👂</Text>
            <Text style={styles.activityName}>Hear It</Text>
            <Text style={styles.activityDesc}>Listen to each letter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.activityCard, { backgroundColor: COLORS.orange }]}
            onPress={() => openActivity('build')}
          >
            <Text style={styles.activityEmoji}>🧩</Text>
            <Text style={styles.activityName}>Build It</Text>
            <Text style={styles.activityDesc}>Arrange the letters!</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ====== FAMILY SELECTION GRID ======
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📖 CVC Words</Text>
        <Text style={styles.headerSub}>Pick a family!</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {CVC_FAMILIES.map((family, i) => (
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
                <Text style={styles.familyName}>{family.family}</Text>
                <Text style={styles.familyWords}>
                  {family.words.slice(0, 2).map(w => w.word).join(', ')}...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.familyNameLocked}>{family.family}</Text>
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
  container: { flex: 1, backgroundColor: COLORS.yellow },
  header: {
    paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  backBtn: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.dark },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.dark },
  headerSub: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.dark, opacity: 0.6 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingBottom: 40, gap: 12, justifyContent: 'space-between',
  },
  familyCard: {
    width: '47%', borderRadius: 20, padding: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  familyName: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.white },
  familyNameLocked: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.gray },
  familyWords: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.white, opacity: 0.85, marginTop: 4 },
  lockIcon: { fontSize: 20, marginTop: 4 },
  wordPreviewScroll: { maxHeight: 60, marginBottom: 10 },
  wordPreviewRow: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  previewChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  previewChipText: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.white },
  activityGrid: { padding: 20, gap: 14 },
  activityCard: {
    borderRadius: 24, padding: 22,
    flexDirection: 'row', alignItems: 'center', gap: 16, ...SHADOWS.medium,
  },
  activityEmoji: { fontSize: 36 },
  activityName: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.white },
  activityDesc: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.white, opacity: 0.85, marginTop: 2 },
  activityArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  seeCard: {
    backgroundColor: COLORS.white, borderRadius: 28,
    padding: 28, alignItems: 'center', width: '100%', ...SHADOWS.medium,
  },
  seeEmoji: { fontSize: 72, marginBottom: 12 },
  seeWord: { fontSize: 52, fontWeight: '900', marginBottom: 16 },
  letterTilesRow: { flexDirection: 'row', gap: 8 },
  letterTile: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  letterTileText: { fontSize: 24, fontWeight: '900', color: COLORS.white },
  speakBtn: { marginTop: 20, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 50, ...SHADOWS.small },
  speakBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.white },
  nextBtn: { marginTop: 12, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 50, backgroundColor: COLORS.white, ...SHADOWS.small },
  nextBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.dark },
  hearEmoji: { fontSize: 72, marginBottom: 20 },
  hearTilesRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  hearTile: { width: 70, height: 70, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
  hearTileText: { fontSize: 36, fontWeight: '900', color: COLORS.white },
  hearWord: { fontSize: 44, fontWeight: '900', marginBottom: 20 },
  buildEmoji: { fontSize: 64, marginBottom: 8 },
  buildHint: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.dark, marginBottom: 16 },
  answerRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  answerSlot: {
    width: 60, height: 60, borderRadius: 14,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: COLORS.gray, ...SHADOWS.small,
  },
  answerSlotText: { fontSize: 28, fontWeight: '900', color: COLORS.white },
  resultText: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.green, marginBottom: 12 },
  shuffledRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  shuffledTile: { width: 60, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center', ...SHADOWS.small },
  shuffledText: { fontSize: 28, fontWeight: '900', color: COLORS.white },
  buildBtnRow: { flexDirection: 'row', gap: 12 },
  buildBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 50, ...SHADOWS.small },
  buildBtnText: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.white },
});