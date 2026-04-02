import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { useRef, useState, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg'; // ✅ FIX: removed unused SvgText import
import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import { LETTERS } from '../../constants/data';

const LETTER_SOUNDS = {
  A: 'aa', B: 'bb', C: 'kuh', D: 'duh', E: 'e',
  F: 'fuh', G: 'guh', H: 'huh', I: 'e!!', J: 'juh',
  K: 'kuh', L: 'luh', M: 'muh', N: 'nuh', O: 'on',
  P: 'puh', Q: 'kwuh', R: 'ruh', S: 'suh', T: 'tuh',
  U: 'up', V: 'vuh', W: 'wuh', X: 'ksuh', Y: 'yuh', Z: 'zuh',
};

const CANVAS_SIZE = 260;

export default function TraceScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const startIndex = params.index ? parseInt(params.index) : 0;

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [done, setDone] = useState(false);
  const celebAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ✅ FIX: Use a ref to hold the current path so panResponder
  // always reads the latest value without needing to be recreated
  const currentPathRef = useRef('');

  const letter = LETTERS[currentIndex];

  // Guide dots — arranged in a 3x4 grid centered in canvas
  const dots = useMemo(() => {
    const cols = 4;
    const rows = 3;
    const spacingX = CANVAS_SIZE / (cols + 1);
    const spacingY = CANVAS_SIZE / (rows + 1);
    const result = [];
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        result.push({ cx: spacingX * c, cy: spacingY * r });
      }
    }
    return result;
  }, []);

  // ✅ FIX: panResponder created only ONCE with empty deps []
  // Uses currentPathRef instead of currentPath state to avoid stale closure
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      currentPathRef.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
      setCurrentPath(currentPathRef.current);
    },
    onPanResponderMove: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      currentPathRef.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
      setCurrentPath(currentPathRef.current);
    },
    onPanResponderRelease: () => {
      // ✅ Always reads fresh value from ref, never stale
      setPaths(prev => [...prev, currentPathRef.current]);
      currentPathRef.current = '';
      setCurrentPath('');
    },
  }), []); // ✅ Empty deps — created only once, no re-creation on every stroke

  function completedTrace() {
    setDone(true);
    const sound = LETTER_SOUNDS[letter.letter];
    Speech.speak(
      `${sound}! ${letter.letter} says ${sound}. ${letter.letter} is for ${letter.word}!`,
      { rate: 0.75, pitch: 1.2 }
    );
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.3, friction: 3, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    Animated.timing(celebAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }

  function clearTrace() {
    setPaths([]);
    setCurrentPath('');
    currentPathRef.current = '';
    setDone(false);
    celebAnim.setValue(0);
    scaleAnim.setValue(1);
    Speech.stop();
  }

  function goToLetter(index) {
    setCurrentIndex(index);
    setPaths([]);
    setCurrentPath('');
    currentPathRef.current = '';
    setDone(false);
    celebAnim.setValue(0);
    scaleAnim.setValue(1);
    Speech.stop();
  }

  // ✅ FIX: Next button on last letter now gives celebration feedback
  function handleNext() {
    if (currentIndex < LETTERS.length - 1) {
      goToLetter(currentIndex + 1);
    } else {
      Speech.speak('You traced all the letters! Amazing job!', {
        rate: 0.75, pitch: 1.3
      });
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { Speech.stop(); router.back(); }}>
          <Text style={styles.backBtn}>⬅️ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>✍️ Trace It!</Text>
        <Text style={styles.headerSub}>{currentIndex + 1} / {LETTERS.length}</Text>
      </View>

      {/* Letter display */}
      <View style={styles.letterInfo}>
        <Animated.Text style={[
          styles.letterLabel,
          { color: letter.color, transform: [{ scale: scaleAnim }] }
        ]}>
          {letter.letter}
        </Animated.Text>
        <Text style={styles.letterSmall}>
          {letter.letter}{letter.letter.toLowerCase()}
        </Text>
      </View>

      {/* Tracing Canvas */}
      <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
        {/* Ghost letter guide */}
        <Text style={[styles.guideText, { color: letter.color }]}>
          {letter.letter}
        </Text>

        <Svg
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={StyleSheet.absoluteFill}
        >
          {/* Guide dots */}
          {dots.map((dot, i) => (
            <Circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r={6}
              fill={letter.color}
              opacity={0.4}
            />
          ))}

          {/* Completed paths */}
          {paths.map((p, i) => (
            <Path
              key={i}
              d={p}
              stroke={letter.color}
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}

          {/* Current path being drawn */}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke={letter.color}
              strokeWidth={16}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : null}
        </Svg>
      </View>

      {/* Celebration box */}
      {done && (
        <Animated.View style={[styles.celebBox, { opacity: celebAnim }]}>
          <Text style={styles.celebEmoji}>{letter.emoji}</Text>
          <Text style={styles.celebText}>
            "{letter.letter}" says "{LETTER_SOUNDS[letter.letter]}"!
          </Text>
          <Text style={styles.celebWord}>{letter.word}! ⭐</Text>
        </Animated.View>
      )}

      {/* Action buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: COLORS.gray }]}
          onPress={clearTrace}
        >
          <Text style={styles.btnText}>🔄 Try Again</Text>
        </TouchableOpacity>

        {done && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: letter.color }]}
            onPress={handleNext} // ✅ FIX: uses handleNext with last letter feedback
          >
            <Text style={styles.btnText}>
              {currentIndex < LETTERS.length - 1 ? 'Next ➡️' : '🎉 Finish!'}
            </Text>
          </TouchableOpacity>
        )}

        {!done && paths.length > 0 && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: COLORS.green }]}
            onPress={completedTrace}
          >
            <Text style={styles.btnText}>✅ Done!</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Prev / Next navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
          onPress={() => currentIndex > 0 && goToLetter(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navBtnText}>⬅️ Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, { opacity: currentIndex === LETTERS.length - 1 ? 0.3 : 1 }]}
          onPress={() => currentIndex < LETTERS.length - 1 && goToLetter(currentIndex + 1)}
          disabled={currentIndex === LETTERS.length - 1}
        >
          <Text style={styles.navBtnText}>Next ➡️</Text>
        </TouchableOpacity>
      </View>

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
    paddingVertical: 12,
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
  headerSub: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
    color: COLORS.dark,
    opacity: 0.6,
  },
  letterInfo: {
    alignItems: 'center',
    marginVertical: 6,
  },
  letterLabel: {
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 80,
  },
  letterSmall: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.gray,
  },
  canvasWrapper: {
    marginHorizontal: 20,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignSelf: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  guideText: {
    fontSize: 180,
    fontWeight: '900',
    position: 'absolute',
    opacity: 0.08,
  },
  celebBox: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  celebEmoji: {
    fontSize: 36,
  },
  celebText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 4,
  },
  celebWord: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.dark,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 20,
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
    marginTop: 10,
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