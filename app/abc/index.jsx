import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Modal
} from 'react-native';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { COLORS, FONTS, SHADOWS, Storage } from '../../constants/theme';
import { LETTERS } from '../../constants/data';
import { isPaidUser } from '../../constants/subscription';
import { router } from 'expo-router';

export default function ABCScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [learned, setLearned] = useState([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  async function openLetter(item) {
    if (!item.free) {
      const paid = await isPaidUser();
      if (!paid) {
        router.push('/paywall');
        return;
      }
    }
    setSelected(item);
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
    if (!learned.includes(item.letter)) {
      setLearned(prev => [...prev, item.letter]);
      Storage.addLetter(item.letter);
    }
  }

  function closeLetter() {
    setSelected(null);
    Speech.stop();
  }

  function sayIt(item) {
    Speech.speak(`${item.letter} is for ${item.word}`, {
      rate: 0.7,
      pitch: 1.3,
      language: 'en-US',
    });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔤 ABC Letters</Text>
        <Text style={styles.headerSub}>
          {learned.length} / 26 learned
        </Text>
      </View>

      {/* Grid */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {LETTERS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.card,
              { backgroundColor: item.free ? item.color : COLORS.lightGray },
              learned.includes(item.letter) && styles.cardLearned,
              SHADOWS.small,
            ]}
            onPress={() => openLetter(item)}
            activeOpacity={item.free ? 0.8 : 1}
          >
            {item.free ? (
              <>
                <Text style={styles.cardLetter}>{item.letter}</Text>
                <Text style={styles.cardEmoji}>{item.emoji}</Text>
                <Text style={styles.cardWord}>{item.word}</Text>
                {learned.includes(item.letter) && (
                  <Text style={styles.checkmark}>✅</Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.cardLetterLocked}>{item.letter}</Text>
                <Text style={styles.lockIcon}>🔒</Text>
              </>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Letter Detail Modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={closeLetter}
      >
        <View style={styles.modalOverlay}>
          {selected && (
            <Animated.View
              style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}
            >
              {/* Close button */}
              <TouchableOpacity style={styles.closeBtn} onPress={closeLetter}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>

              {/* Big letter */}
              <Text style={[styles.bigLetter, { color: selected.color }]}>
                {selected.letter}
              </Text>
              <Text style={styles.smallLetter}>
                {selected.letter}{selected.letter.toLowerCase()}
              </Text>

              {/* Emoji */}
              <Text style={styles.bigEmoji}>{selected.emoji}</Text>

              {/* Word */}
              <Text style={styles.wordText}>
                <Text style={{ color: selected.color }}>
                  {selected.letter}
                </Text>
                {selected.word.slice(1)}
              </Text>

              {/* Say It button */}
              <TouchableOpacity
                style={[styles.sayBtn, { backgroundColor: selected.color }]}
                onPress={() => sayIt(selected)}
              >
                <Text style={styles.sayBtnText}>🔊 Say It!</Text>
              </TouchableOpacity>

              {/* Trace It button */}
              <TouchableOpacity
                style={styles.traceBtn}
                onPress={() => {
                  closeLetter();
                  router.push('/trace');
                }}
              >
                <Text style={styles.traceBtnText}>✍️ Trace It!</Text>
              </TouchableOpacity>

              {/* Star earned */}
              <Text style={styles.starEarned}>⭐ Great job!</Text>
            </Animated.View>
          )}
        </View>
      </Modal>

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
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  card: {
    width: '22%',
    aspectRatio: 0.85,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  cardLearned: {
    borderWidth: 3,
    borderColor: COLORS.green,
  },
  cardLetter: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
  },
  cardLetterLocked: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.gray,
  },
  cardEmoji: {
    fontSize: 18,
    marginTop: 2,
  },
  cardWord: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 2,
    textAlign: 'center',
  },
  lockIcon: {
    fontSize: 16,
    marginTop: 4,
  },
  checkmark: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    ...SHADOWS.medium,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
  },
  closeBtnText: {
    fontSize: 22,
    color: COLORS.gray,
    fontWeight: '900',
  },
  bigLetter: {
    fontSize: 100,
    fontWeight: '900',
    lineHeight: 110,
  },
  smallLetter: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray,
    marginTop: -8,
  },
  bigEmoji: {
    fontSize: 60,
    marginTop: 12,
  },
  wordText: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.dark,
    marginTop: 8,
  },
  sayBtn: {
    marginTop: 20,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 50,
    ...SHADOWS.small,
  },
  sayBtnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.white,
  },
  traceBtn: {
    marginTop: 10,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: COLORS.blue,
    ...SHADOWS.small,
  },
  traceBtnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.white,
  },
  starEarned: {
    fontSize: FONTS.sizes.lg,
    marginTop: 16,
    fontWeight: '800',
  },
});