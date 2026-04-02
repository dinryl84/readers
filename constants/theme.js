import AsyncStorage from '@react-native-async-storage/async-storage';

export const COLORS = {
  yellow: '#FFE44D',
  pink: '#FF6B8A',
  blue: '#4DAAFF',
  darkBlue: '#1565C0',
  green: '#5DD87A',
  orange: '#FF9F43',
  purple: '#B57BFF',
  white: '#FFFEF5',
  dark: '#2D2D3A',
  gray: '#90A4AE',
  lightGray: '#F5F5F5',
  cardBg: '#FFFDF0',
};

export const FONTS = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 16,
    lg: 20,
    xl: 26,
    xxl: 34,
    huge: 48,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
};

export const Storage = {
  async addStar(amount = 1) {
    try {
      const s = await AsyncStorage.getItem('rb_stars');
      const current = s ? parseInt(s) : 0;
      await AsyncStorage.setItem('rb_stars', String(current + amount));
    } catch (e) { console.log(e); }
  },

  async addLetter(letter) {
    try {
      const l = await AsyncStorage.getItem('rb_letters');
      const current = l ? JSON.parse(l) : [];
      if (!current.includes(letter)) {
        current.push(letter);
        await AsyncStorage.setItem('rb_letters', JSON.stringify(current));
        await Storage.addStar(2);
      }
    } catch (e) { console.log(e); }
  },

  async addRhyme(id) {
    try {
      const r = await AsyncStorage.getItem('rb_rhymes');
      const current = r ? JSON.parse(r) : [];
      if (!current.includes(id)) {
        current.push(id);
        await AsyncStorage.setItem('rb_rhymes', JSON.stringify(current));
        await Storage.addStar(3);
      }
    } catch (e) { console.log(e); }
  },

  async addSyllable(family) {
    try {
      const sy = await AsyncStorage.getItem('rb_syllables');
      const current = sy ? JSON.parse(sy) : [];
      if (!current.includes(family)) {
        current.push(family);
        await AsyncStorage.setItem('rb_syllables', JSON.stringify(current));
        await Storage.addStar(2);
      }
    } catch (e) { console.log(e); }
  },

  async addWord() {
    try {
      const w = await AsyncStorage.getItem('rb_words');
      const current = w ? parseInt(w) : 0;
      await AsyncStorage.setItem('rb_words', String(current + 1));
      await Storage.addStar(1);
    } catch (e) { console.log(e); }
  },
};