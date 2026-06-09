import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quizblitz.app',
  appName: 'QuizBlitz',
  webDir: 'public',
  server: {
    // Point to the live Vercel deployment - the app loads from the web
    url: 'https://quizblitz-beige.vercel.app',
    // Allow navigation to external URLs if needed
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f0f23',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      iosSplashResourceName: 'Splash',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f0f23',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    App: {
      // Handle back button on Android
    },
  },
  // iOS specific
  ios: {
    contentInset: 'automatic',
    // Allow mixed content for dev
    allowsLinkPreview: false,
  },
  // Android specific
  android: {
    // Allow HTTP for development
    allowMixedContent: true,
    // Capture back button
    captureInput: true,
  },
};

export default config;
