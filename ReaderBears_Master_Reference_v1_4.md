# 🐻 ReaderBears — Master Reference Document
**Version:** 1.4 — Play Store Ready  
**Developer:** Dinryl P. Basigsig  
**School:** Baganga National High School, Davao Oriental, Region XI  
**Date:** April 2026  
**Status:** ✅ EAS Build Successful — AAB Ready for Play Store Upload

---

## CHANGELOG
| Version | Changes |
|---|---|
| v1.0 | Initial planning — ABC, Rhymes, CVC, GCash + Codes |
| v1.1 | Added Syllables module, Letter Tracing phonics sounds, Words module (Easy/Medium/Advanced), emoji pop-up, microphone post-launch |
| v1.2 | Updated pricing ₱59/month + ₱149 lifetime, switched to Google Play Billing, master reference converted to Markdown |
| v1.3 | Added all 10 stages build log, critical decisions, Jest unit testing setup, Maestro UI testing plan, app icon, lock logic, AsyncStorage wiring |
| v1.4 | Completed Stage 9.6 Maestro UI testing, Stage 9.7 manual testing, Stage 10 EAS build. Fixed tracing bug (lines disappearing on finger lift). Removed react-native-iap (incompatible with Expo SDK 54 + RN 0.81.5). Removed GCash payment instructions from paywall (Google policy compliance). Added .npmrc legacy-peer-deps. First successful AAB build. Google Play Billing planned post-upload. |

---

## 1. App Overview

> ReaderBears is a freemium Android reading app for children ages 3–7. It teaches phonics-based reading through a structured progression: Letters → Sounds → Syllables → Words → Rhymes. Built with Expo + React Native, monetized via Google Play Billing.

### 1.1 App Identity

| Field | Detail |
|---|---|
| **App Name** | ReaderBears |
| **Package Name** | com.basigsig.readerbears |
| **Tagline** | Learn. Read. Grow. 🐻 |
| **Target Age** | 3 to 7 years old |
| **Platform** | Android (Google Play Store) |
| **Framework** | Expo SDK 54 + React Native 0.81.5 |
| **Backend** | Supabase (separate project from ClassRecord Pro) |
| **Language** | English (Filipino support planned post-launch) |
| **Operated By** | Parent guides the child |
| **Visual Style** | Bright, cartoonish — big buttons, emoji-based images |
| **Images** | Bundled emoji only — fully offline, no downloads needed |
| **Payment** | Google Play Billing — subscription + one-time purchase (post-upload) |
| **Google Play Account** | dinryl84@gmail.com |
| **Enrolled Fee** | 15% service fee (enrolled — saves vs 30% standard) |
| **EAS Project ID** | 87c6d213-30c9-47ee-af2c-424e9cd8c606 |

---

### 1.2 Phonics-Based Reading Progression

| Step | Module | What Child Learns | Example |
|---|---|---|---|
| 1 | ABC Letters | See and recognize each letter | A is for Apple 🍎 |
| 2 | Letter Tracing | Trace letter, hear its SOUND | Trace B → hear "buh" |
| 3 | Syllables | Blend consonant + vowel | B + A = BA |
| 4 | Words | Add final sound to syllable | BA + T = BAT 🦇 |
| 5 | CVC Words | Build and identify full words | See It, Hear It, Build It |
| 6 | Rhymes | Read full sentences | Twinkle Twinkle... |

---

## 2. Pricing & Monetization

### 2.1 Pricing Tiers

| Plan | Price | What's Included |
|---|---|---|
| 🆓 **FREE** | ₱0 | Letters A–E, Tracing A–E, Ba syllable family, -at CVC family, 2 nursery rhymes, 3 basic badges |
| 📅 **MONTHLY** | ₱59/month | Full access to all 26 letters, all syllables, all words, all rhymes, Build It game, full badges |
| 🏆 **LIFETIME** | ₱149 once | Everything in Monthly forever — no recurring charge. BEST VALUE badge on paywall. |

### 2.2 Earnings After Google's 15% Cut

| Plan | Gross | Google Takes | You Receive |
|---|---|---|---|
| ₱59/month | ₱59.00 | ₱8.85 | **₱50.15/month** |
| ₱149 lifetime | ₱149.00 | ₱22.35 | **₱126.65 once** |

### 2.3 Payment Method — Google Play Billing (Post-Upload)
- **Current state:** Activation code system in place (for internal use only)
- **Post-upload plan:** Integrate `react-native-iap` with real Play Console product IDs
- Monthly product ID: TBD (create in Play Console after AAB upload)
- Lifetime product ID: TBD (create in Play Console after AAB upload)
- **Why removed for v1 build:** `react-native-iap@14.7.19` requires `react-native-nitro-modules` which is incompatible with Expo SDK 54 + RN 0.81.5

### 2.4 Activation Code Format (Temporary — Internal Use Only)
- Monthly code prefix: `BEAR-M-` (e.g. BEAR-M-XXXX)
- Lifetime code prefix: `BEAR-L-` (e.g. BEAR-L-XXXX)
- Codes validated locally via AsyncStorage
- **Note:** GCash payment instructions removed from paywall UI (Google Play policy compliance)

---

## 3. Critical Decisions Log

### 3.1 Payment Method — Google Play Billing
**Decision:** Use Google Play Billing (not GCash direct payment)  
**Reason:** Google Play policy requires in-app purchases for digital content to go through Google Play Billing. Advertising external payment methods (GCash) inside the app violates policy and risks app removal.  
**Current state:** Paywall shows plans and activation code field only. No external payment instructions shown in-app.  
**Post-upload:** Integrate react-native-iap with real Play Console subscription + lifetime product IDs.

### 3.2 Supabase — New Separate Project
**Decision:** Create brand new Supabase project for ReaderBears, separate from ClassRecord Pro  
**Reason:** Clean data separation, easier to manage per product, no risk of mixing teacher and parent data  

### 3.3 Images — Emoji Only
**Decision:** Use device emoji instead of bundled illustrated images  
**Reason:** 100% offline, zero download size, universally supported on Android  
**Post-launch:** May add custom illustrated images in future update  

### 3.4 TTS — expo-speech (Device TTS)
**Decision:** Use `expo-speech` with device's built-in Google TTS instead of cloud TTS  
**Reason:** 100% offline, free, no API keys needed  
**Post-launch:** Replace with pre-recorded MP3 audio files using `expo-av`  
**Recording plan:** ~180 short clips (letter sounds, syllables, words, praise phrases)  

### 3.5 TTS Phonics Sound Approach
**Decision:** Use short English words to approximate phonics sounds instead of phonetic spellings  
**Solution:** A→"at", E→"egg", I→"in", O→"on", U→"up" for vowels; "buh","kuh" etc. for consonants  

### 3.6 Letter Tracing — Manual "Done!" Button
**Decision:** Child traces freely, then parent/child taps "✅ Done!" to trigger celebration  
**Bug fixed (v1.4):** Lines were disappearing on finger lift — fixed by saving `completedPath` to a local variable before clearing ref  

### 3.7 Microphone Detection — Post-Launch
**Decision:** Defer microphone speech detection to post-launch  
**Library planned:** `@react-native-voice/voice`  

### 3.8 Tab Structure — 5 Tabs Only
**Decision:** Show only 5 tabs (Home, ABC, Syllables, Rhymes, Progress); hide Words, CVC, Trace, Paywall  
**Reason:** 7 tabs caused overlapping on small screens  

### 3.9 react-native-iap — Removed for v1 Build
**Decision:** Removed `react-native-iap@14.7.19` from initial build  
**Reason:** Requires `react-native-nitro-modules` which fails Gradle compilation on Expo SDK 54 + RN 0.81.5  
**Fix:** Will install a compatible version after Play Console product IDs are created  

### 3.10 Jest Testing — Expo 54 Winter Runtime Fix
**Decision:** Removed `jest-expo` preset and used custom babel-jest config  
**Result:** 37/37 tests passing ✅  

### 3.11 EAS Build — .npmrc Fix
**Decision:** Added `.npmrc` with `legacy-peer-deps=true`  
**Reason:** EAS build server uses `npm ci` which fails without this flag due to Expo 54 + React 19.1.0 peer dependency conflicts  

---

## 4. Project File Structure

```
ReaderBears/
├── app/
│   ├── _layout.jsx          # Tab navigation (5 visible tabs)
│   ├── index.jsx            # Home screen — stars, module grid
│   ├── abc/index.jsx        # ABC grid + letter detail modal
│   ├── trace/index.jsx      # Letter tracing with PanResponder
│   ├── syllables/index.jsx  # Ba-Bu blending animation
│   ├── words/index.jsx      # BA+T=BAT word building
│   ├── rhymes/index.jsx     # Nursery rhymes + word zoom
│   ├── cvc/index.jsx        # See It, Hear It, Build It
│   ├── progress/index.jsx   # Stars, badges, progress bar
│   └── paywall/index.jsx    # 3-tier plan + activation code
├── constants/
│   ├── data.js              # LETTERS, RHYMES, CVC_FAMILIES, BADGES
│   ├── theme.js             # COLORS, FONTS, SHADOWS, Storage helper
│   └── subscription.js      # isPaidUser() function
├── __tests__/
│   ├── data.test.js         # 15 tests
│   ├── storage.test.js      # 14 tests
│   └── subscription.test.js # 8 tests
├── assets/
│   ├── icon.png             # 1024x1024 bear icon (yellow bg)
│   ├── adaptive-icon.png    # Android adaptive icon
│   ├── splash-icon.png      # Splash screen bear
│   └── favicon.png          # Web favicon
├── .maestro/
│   ├── 01_home.yml          # ✅ Passing
│   ├── 02_abc.yml           # ✅ Passing
│   └── 03_tracing.yml       # ⏳ Pending (needs standalone APK)
├── .npmrc                   # legacy-peer-deps=true (EAS build fix)
├── babel.config.js
├── jest.setup.js
├── eas.json
├── app.json
└── package.json
```

---

## 5. Tech Stack

| Tool / Library | Version | Purpose |
|---|---|---|
| Expo | SDK 54.0.33 | App framework & build system |
| React Native | 0.81.5 | UI components & Android runtime |
| expo-router | 6.0.23 | Screen navigation (tab + stack) |
| expo-speech | 14.0.8 | TTS — offline |
| expo-font | 14.0.x | Font loading (peer dep) |
| expo-constants | 18.0.x | App constants (peer dep) |
| react-native-svg | 15.12.1 | Letter tracing SVG paths |
| react-native-gesture-handler | 2.28.0 | Finger drawing (PanResponder) |
| @react-native-async-storage | 2.2.0 | Offline progress + subscription cache |
| react-native-iap | ⏳ Post-upload | Google Play Billing integration |
| EAS Build | Latest | Build AAB for Play Store |
| Jest | 30.2.0 | Unit testing |
| Maestro | 2.4.0 | UI testing (2 flows passing) |

---

## 6. Jest Testing Setup

> **Critical:** Expo 54 broke the standard `jest-expo` preset. Use this exact config.

```json
"jest": {
  "testEnvironment": "node",
  "setupFiles": ["./jest.setup.js"],
  "transform": { "^.+\\.[jt]sx?$": "babel-jest" },
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@react-native-async-storage/.*)"
  ],
  "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json"],
  "globals": { "__DEV__": true }
}
```

**Test Results:** 37/37 passing ✅

---

## 7. AsyncStorage Keys Reference

| Key | Type | Value | Set By |
|---|---|---|---|
| `rb_stars` | String | Number e.g. "12" | Storage.addStar() |
| `rb_letters` | JSON Array | e.g. '["A","B","C"]' | Storage.addLetter() |
| `rb_rhymes` | JSON Array | e.g. '[1,2]' | Storage.addRhyme() |
| `rb_syllables` | JSON Array | e.g. '["B","C"]' | Storage.addSyllable() |
| `rb_words` | String | Number e.g. "5" | Storage.addWord() |
| `rb_plan` | String | "free"/"monthly"/"lifetime" | paywall/index.jsx |
| `rb_expiry` | String | ISO date string | paywall/index.jsx |

---

## 8. App Features Summary

### 8.1 Freemium Content Map

| Content | Free | Paid |
|---|---|---|
| Letters | A–E | F–Z |
| Letter Tracing | A–E | All 26 |
| Syllable Families | B only (Ba Be Bi Bo Bu) | All 19 families |
| Words Module | Ba family only | All families |
| CVC Families | -at only | All 6 families |
| CVC Build It Game | ❌ | ✅ |
| Nursery Rhymes | 2 (Twinkle, Baa Baa) | All 6 |
| Badges | 3 basic | Full 8 badges |

### 8.2 Letter Sound Reference (Phonics TTS)

| Letter | TTS Text | Letter | TTS Text |
|---|---|---|---|
| A | "at" | N | "nuh" |
| B | "buh" | O | "on" |
| C | "kuh" | P | "puh" |
| D | "duh" | Q | "kwuh" |
| E | "egg" | R | "ruh" |
| F | "fuh" | S | "suh" |
| G | "guh" | T | "tuh" |
| H | "huh" | U | "up" |
| I | "in" | V | "vuh" |
| J | "juh" | W | "wuh" |
| K | "kuh" | X | "ksuh" |
| L | "luh" | Y | "yuh" |
| M | "muh" | Z | "zuh" |

### 8.3 Badge Collection

| Icon | Badge | Requirement | Access |
|---|---|---|---|
| 🌟 | First Star! | Learn 1 letter | FREE |
| 🔤 | ABC Starter | Learn 5 letters | FREE |
| 📖 | Word Worm | Learn 10 letters | PAID |
| 🏆 | Alphabet Hero | Learn all 26 letters | PAID |
| 🔡 | Syllable Star | Complete 3 syllable families | PAID |
| 🎵 | Rhyme Time | Read 1 rhyme | FREE |
| 🐻 | ReaderBear! | Read 3 rhymes | PAID |
| 💬 | Word Builder | Complete 5 words | PAID |

---

## 9. Build Roadmap

| Stage | Name | Status |
|---|---|---|
| **1** | Project Setup + Home Screen | ✅ Done |
| **2** | ABC Grid + Letter Detail + TTS | ✅ Done |
| **3** | Letter Tracing + Phonics Sound | ✅ Done |
| **4** | Syllables Module + Blending Animation | ✅ Done |
| **5** | Words Module + Emoji Pop-up | ✅ Done |
| **6** | Nursery Rhymes + Word Zoom | ✅ Done |
| **7** | CVC Words (See It, Hear It, Build It) | ✅ Done |
| **8** | Progress & Badges + AsyncStorage | ✅ Done |
| **9** | Paywall UI + Lock Logic + Stars Wiring | ✅ Done |
| **9.5** | Unit Testing (Jest) — 37/37 passing | ✅ Done |
| **9.6** | UI Testing (Maestro) — 2 flows passing | ✅ Done |
| **9.7** | Manual Test Checklist — all passed | ✅ Done |
| **9.8** | Bug Fix — Letter tracing lines disappearing | ✅ Fixed |
| **10** | EAS Build + AAB Generated | ✅ Done |
| **10.1** | Upload AAB to Play Console | ⏳ Next |
| **10.2** | Create subscription products in Play Console | ⏳ Pending |
| **10.3** | Integrate react-native-iap (Google Play Billing) | ⏳ Pending |
| **10.4** | Play Store listing + screenshots | ⏳ Pending |
| **10.5** | Submit for review + go live | ⏳ Pending |

---

## 10. Google Play Setup Status

| Item | Status |
|---|---|
| Google Play Developer Account | ✅ Existing account |
| ReaderBears app created in Play Console | ✅ Done |
| Google Payments merchant account | ✅ Created |
| 15% service fee enrollment | ✅ Enrolled |
| AAB built successfully | ✅ Done |
| AAB uploaded to Play Console | ⏳ Next step |
| Monthly subscription product (₱59) | ⏳ After AAB upload |
| Lifetime in-app product (₱149) | ⏳ After AAB upload |
| react-native-iap integrated | ⏳ After product IDs created |

---

## 11. Google Play Billing Integration Plan (Post-Upload)

### Step-by-Step After AAB Upload:

1. **Upload AAB** to Play Console → Internal Testing track
2. **Create products** in Play Console → Monetize → Products:
   - Subscription: `readerbears_monthly` — ₱59/month
   - One-time: `readerbears_lifetime` — ₱149
3. **Install compatible react-native-iap:**
   ```bash
   npx expo install react-native-iap -- --legacy-peer-deps
   ```
4. **Add back to app.json plugins:**
   ```json
   "plugins": ["expo-router", "react-native-iap"]
   ```
5. **Update paywall screen** to use `useIAP()` hook with real product IDs
6. **Rebuild and upload** new AAB
7. **Test purchasing** on internal track before going live

### Product ID Reference (to be filled after Play Console setup):
| Plan | Product ID | Type |
|---|---|---|
| Monthly ₱59 | `readerbears_monthly` (TBC) | Subscription |
| Lifetime ₱149 | `readerbears_lifetime` (TBC) | One-time |

---

## 12. Known Issues & Limitations

| Issue | Severity | Solution |
|---|---|---|
| TTS sounds slightly robotic | Medium | Post-launch: pre-recorded MP3 audio |
| Letter tracing doesn't work on emulator | Low | Works on real device — mouse ≠ finger |
| react-native-web peer dep conflict | Low | Use `--legacy-peer-deps` for all installs |
| Expo 54 breaks jest-expo preset | Fixed | Use babel-jest with custom config |
| react-native-iap incompatible with SDK 54 | Fixed for now | Removed for v1 build, reinstall post-upload |
| Maestro DEADLINE_EXCEEDED on real device | Low | Works with standalone APK (post-upload) |
| GCash payment instructions removed | Fixed | Google Play policy compliance |

---

## 13. Development Workflow

### 13.1 Daily Development
```bash
npx expo start
# Scan QR with Expo Go on phone (same WiFi)
```

### 13.2 Run Tests
```bash
npm test
```

### 13.3 Install New Packages
```bash
npx expo install <package> -- --legacy-peer-deps
```

> ⚠️ Always use `--legacy-peer-deps` — Expo 54 has React 19.1.0 peer dep conflicts

### 13.4 EAS Build (Production AAB)
```bash
eas build --platform android --profile production --non-interactive
```

### 13.5 EAS Build (Preview APK for testing)
```bash
eas build --platform android --profile preview --non-interactive
```

### 13.6 Environment Setup (Git Bash — run each new terminal)
```bash
export JAVA_HOME="C:/Program Files/Microsoft/jdk-17.0.13.11-hotspot"
export PATH="$PATH":"$HOME/.maestro/bin"
export PATH="$PATH":"/c/Users/dinry/AppData/Local/Android/Sdk/platform-tools"
```
> These are now saved in `~/.bashrc` — just run `source ~/.bashrc`

---

## 14. Post-Launch Roadmap

| Feature | Priority | Notes |
|---|---|---|
| Google Play Billing (react-native-iap) | 🔴 High | After AAB upload + product IDs |
| Pre-recorded audio (replace TTS) | 🔴 High | expo-av, ~180 clips |
| Maestro UI tests (full suite) | 🟡 Medium | Needs standalone APK |
| Microphone speech detection | 🟡 Medium | @react-native-voice/voice |
| Filipino CVC words | 🟡 Medium | Built-in data |
| Parent dashboard | 🟡 Medium | New screen |
| More nursery rhymes | 🟡 Medium | Built-in data |
| iOS version | 🟢 Low | Same Expo codebase |
| Printable word cards (PDF) | 🟢 Low | expo-print |

---

## 15. Offline Strategy

| Feature | Storage Method | Online Required? |
|---|---|---|
| All letter + word data | Bundled in app code | ❌ Never |
| Syllable families | Bundled in app code | ❌ Never |
| SVG tracing paths | Bundled in app code | ❌ Never |
| All emoji images | Device emoji (built-in) | ❌ Never |
| TTS (all sounds) | expo-speech device TTS | ❌ Never |
| Stars & progress | AsyncStorage local | ❌ Never |
| Activation code check | Local string match | ❌ Never |
| Google Play status | Google Play Billing API | ✅ On purchase |
| Subscription renewal | Google Play API | ✅ Monthly check |

---

*ReaderBears Master Reference v1.4 — Confidential — Dinryl P. Basigsig — April 2026*
