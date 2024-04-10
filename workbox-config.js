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
    }
  ],
  globIgnores: ['../workbox-config.js']
}
