import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated
} from 'react-native';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { COLORS, FONTS, SHADOWS, Storage } from '../../constants/theme';
import { RHYMES } from '../../constants/data';
import { isPaidUser } from '../../constants/subscription';
import { router } from 'expo-router';

export default function RhymesScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [activeLine, setActiveLine] = useState(-1);
  const [activeWord, setActiveWord] = useState(-1);
  const [activeLineWord, setActiveLineWord] = useState(-1);
  const [isReading, setIsReading] = useState(false);
  const [zoomWord, setZoomWord] = useState('');
  const zoomAnim = useRef(new Animated.Value(0)).current;
  const celebAnim = useRef(new Animated.Value(0)).current;
  const wordScaleAnim = useRef(new Animated.Value(1)).current;

  async function openRhyme(rhyme) {
    if (!rhyme.free) {
      const paid = await isPaidUser();
      if (!paid) {
        router.push('/paywall');
        return;
      }
    }
    setSelected(rhyme);
  } // ✅ FIX: closing brace was missing here

  function showZoom(word) {
    setZoomWord(word);
    zoomAnim.setValue(0);
    wordScaleAnim.setValue(0);
    Animated.spring(wordScaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 80,
      useNativeDriver: true,
    }).start();
    Animated.timing(zoomAnim, {
      toValue: 1, duration: 200, useNativeDriver: true
    }).start();
    // Auto hide after 1.5s
    setTimeout(() => {
      Animated.timing(zoomAnim, {
        toValue: 0, duration: 300, useNativeDriver: true
      }).start(() => setZoomWord(''));
    }, 1500);
  }

  function speakLine(line, lineIndex) {
    Speech.stop();
    setActiveLine(lineIndex);
    setActiveWord(-1);
    setActiveLineWord(-1);

    const words = line.split(' ');
    let i = 0;

    function speakNextWord() {
      if (i >= words.length) return;
      setActiveLineWord(i);
      showZoom(words[i]);
      Speech.speak(words[i], {
        rate: 0.7, pitch: 1.2, language: 'en-US',
        onDone: () => {
          i++;
          setTimeout(speakNextWord, 150);
        }
      });
    }
    speakNextWord();
  }

  function readAloud() {
    if (isReading) {
      Speech.stop();
      setIsReading(false);
      setActiveLine(-1);
      setActiveWord(-1);
      setActiveLineWord(-1);
      setZoomWord('');
      return;
    }

    setIsReading(true);
    celebAnim.setValue(0);

    let lineIdx = 0;

    function speakNextLine() {
      if (lineIdx >= selected.lines.length) {
        setIsReading(false);
        setActiveLine(-1);
        setActiveLineWord(-1);
        setZoomWord('');
        Animated.spring(celebAnim, {
          toValue: 1, friction: 4, useNativeDriver: true
        }).start();
        Speech.speak('Great job! You read the whole rhyme!', {
          rate: 0.7, pitch: 1.3, language: 'en-US'
        });
        Storage.addRhyme(selected.id);
        return;
      }

      setActiveLine(lineIdx);
      const words = selected.lines[lineIdx].split(' ');
      let wordIdx = 0;

      function speakNextWord() {
        if (wordIdx >= words.length) {
          lineIdx++;
          setTimeout(speakNextLine, 500);
          return;
        }
        setActiveLineWord(wordIdx);
        showZoom(words[wordIdx]);
        Speech.speak(words[wordIdx], {
          rate: 0.7, pitch: 1.2, language: 'en-US',
          onDone: () => {
            wordIdx++;
            setTimeout(speakNextWord, 150);
          }
        });
      }
      speakNextWord();
    }

    speakNextLine();
  }

  // ====== RHYME READER SCREEN ======
  if (selected) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            Speech.stop();
            setSelected(null);
            setActiveLine(-1);
            setActiveLineWord(-1);
            setIsReading(false);
            setZoomWord('');
          }}>
            <Text style={styles.backBtn}>⬅️ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selected.icon} {selected.title}</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Zoom word display */}
        {zoomWord !== '' && (
          <Animated.View style={[
            styles.zoomBox,
            { opacity: zoomAnim, transform: [{ scale: wordScaleAnim }] }
          ]}>
            <Text style={styles.zoomText}>{zoomWord}</Text>
          </Animated.View>
        )}

        <ScrollView
          contentContainerStyle={styles.readerContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Rhyme icon */}
          <Text style={styles.bigIcon}>{selected.icon}</Text>
          <Text style={styles.rhymeTitleText}>{selected.title}</Text>

          {/* Lines — word by word highlighting */}
          <View style={styles.linesBox}>
            {selected.lines.map((line, lineIdx) => {
              const words = line.split(' ');
              return (
                <TouchableOpacity
                  key={lineIdx}
                  onPress={() => speakLine(line, lineIdx)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.lineRow,
                    activeLine === lineIdx && styles.lineRowActive,
                  ]}>
                    <View style={styles.wordsRow}>
                      {activeLine === lineIdx && (
                        <Text style={styles.speakerIcon}>🔊 </Text>
                      )}
                      {words.map((word, wIdx) => (
                        <Text
                          key={wIdx}
                          style={[
                            styles.wordText,
                            activeLine === lineIdx &&
                              activeLineWord === wIdx &&
                              styles.wordTextActive,
                          ]}
                        >
                          {word}{' '}
                        </Text>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Celebration */}
          <Animated.View style={[styles.celebBox, {
            opacity: celebAnim,
            transform: [{ scale: celebAnim }]
          }]}>
            <Text style={styles.celebEmoji}>🎉⭐🎉</Text>
            <Text style={styles.celebText}>Amazing reading!</Text>
          </Animated.View>

          {/* Read aloud button */}
          <TouchableOpacity
            style={[
              styles.readBtn,
              { backgroundColor: isReading ? COLORS.pink : COLORS.blue }
            ]}
            onPress={readAloud}
          >
            <Text style={styles.readBtnText}>
              {isReading ? '⏹️ Stop Reading' : '🔊 Read It Aloud!'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.tapHint}>
            💡 Tap any line to hear it word by word!
          </Text>

        </ScrollView>
      </View>
    );
  }

  // ====== RHYME SELECTION GRID ======
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎵 Nursery Rhymes</Text>
        <Text style={styles.headerSub}>Pick a rhyme!</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {RHYMES.map((rhyme, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.rhymeCard,
              {
                backgroundColor: rhyme.free ? COLORS.white : COLORS.lightGray,
                borderLeftWidth: 6,
                borderLeftColor: rhyme.free ? COLORS.pink : COLORS.gray,
              },
              SHADOWS.small,
            ]}
            onPress={() => openRhyme(rhyme)}
            activeOpacity={rhyme.free ? 0.85 : 1}
          >
            <Text style={styles.rhymeIcon}>{rhyme.icon}</Text>
            <View style={styles.rhymeInfo}>
              <Text style={[
                styles.rhymeCardTitle,
                { color: rhyme.free ? COLORS.dark : COLORS.gray }
              ]}>
                {rhyme.title}
              </Text>
              <Text style={styles.rhymePreview}>{rhyme.preview}</Text>
            </View>
            {!rhyme.free && (
              <Text style={styles.lockIcon}>🔒</Text>
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
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
  },
  rhymeCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rhymeIcon: {
    fontSize: 36,
  },
  rhymeInfo: {
    flex: 1,
  },
  rhymeCardTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
  },
  rhymePreview: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    fontWeight: '600',
    marginTop: 2,
  },
  lockIcon: {
    fontSize: 20,
  },
  zoomBox: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: COLORS.darkBlue,
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 28,
    ...SHADOWS.medium,
  },
  zoomText: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
  },
  readerContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bigIcon: {
    fontSize: 64,
    marginTop: 10,
    marginBottom: 6,
  },
  rhymeTitleText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.dark,
    marginBottom: 24,
  },
  linesBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    gap: 4,
    ...SHADOWS.small,
  },
  lineRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  lineRowActive: {
    backgroundColor: COLORS.yellow,
  },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  speakerIcon: {
    fontSize: FONTS.sizes.md,
  },
  wordText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.dark,
    lineHeight: 28,
  },
  wordTextActive: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.darkBlue,
    textDecorationLine: 'underline',
  },
  celebBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  celebEmoji: {
    fontSize: 40,
  },
  celebText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.dark,
    marginTop: 6,
  },
  readBtn: {
    marginTop: 24,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 50,
    ...SHADOWS.medium,
  },
  readBtnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.white,
  },
  tapHint: {
    marginTop: 14,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.dark,
    opacity: 0.5,
  },
});