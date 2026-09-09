/**
 * Google Ads, AdSense, and Analytics Configuration for ENTEC.
 * Migrated from the legacy areacode platform.
 */

export const GOOGLE_ADS_CONFIG = {
  // Official AdSense Publisher Client ID
  publisherId: "pub-7997346618896033",
  client: "ca-pub-7997346618896033",

  // Google Analytics / Google Tag Manager Stream ID
  analyticsId: "G-XDZD19YSQS",

  // Official ads.txt record
  adsTxtRecord: "google.com, pub-7997346618896033, DIRECT, f08c47fec0942fa0",

  // Production Ad Units / Slots (replace with real slot IDs generated in AdSense console)
  slots: {
    // Leaderboard Banner (728x90 desktop / 320x50 mobile)
    homepageLeaderboard: "",
    // In-Feed / Mid-page Native Banner
    homepageInFeed: "",
    // Bottom High-Impact Rectangle / Banner
    homepageFooter: "",
    // Search / Results Page Unit
    resultsBanner: "",
  },

  // Toggle monetization globally
  enabled: true,
} as const;
