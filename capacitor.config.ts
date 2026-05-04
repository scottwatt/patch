import type { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT: replace `serverUrl` with your deployed Astro URL before building for production.
// For local dev, point at your machine's IP and run `npm run dev -- --host` so the phone can reach it
// (e.g. http://192.168.1.42:4321).
const PROD_URL = 'https://patch.app'; // TODO: replace with real deployed URL
const DEV_URL = process.env.CAP_DEV_URL; // e.g. http://192.168.1.42:4321

const config: CapacitorConfig = {
  appId: 'com.patchbakersfield.app',
  appName: 'patch',
  webDir: 'public',
  server: {
    url: DEV_URL || PROD_URL,
    cleartext: !!DEV_URL,
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    Camera: {
      // iOS Info.plist usage descriptions are set in ios/App/App/Info.plist after `cap add ios`.
    },
  },
};

export default config;
