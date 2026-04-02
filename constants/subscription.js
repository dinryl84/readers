import AsyncStorage from '@react-native-async-storage/async-storage';

export async function isPaidUser() {
  try {
    const plan = await AsyncStorage.getItem('rb_plan');
    const expiry = await AsyncStorage.getItem('rb_expiry');

    if (plan === 'lifetime') return true;

    if (plan === 'monthly' && expiry) {
      const exp = new Date(expiry);
      return exp > new Date();
    }

    return false;
  } catch (e) {
    return false;
  }
}