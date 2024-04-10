module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{js,json,jpg,html,png,css}'],
  swDest: 'dist/sw.js',
  cacheId: 'public-cache',
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /assets/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static',
        cacheableResponse: { statuses: [0, 200] }
      }
    },
    {
      urlPattern:
        /https:\/\/firestore.googleapis.com|https:\/\/firebasestorage.googleapis.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'dynamic',
        cacheableResponse: { statuses: [0, 200] }
      }
    },
    {
      // You can use a RegExp as the pattern:
      urlPattern:
        /https:\/\/api\.mapbox\.com|https:\/\/[abcd]\.tiles\.mapbox\.com|https:\/\/ecn\.t\d\.tiles\.virtualearth\.net/,
      handler: 'StaleWhileRevalidate',
      // Any options provided will be used when
      // creating the caching strategy.
      options: {
        cacheName: 'map',
        cacheableResponse: { statuses: [0, 200] }
      }
    }
  ],
  globIgnores: ['../workbox-config.js']
}
