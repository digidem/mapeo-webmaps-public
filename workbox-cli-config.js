module.exports = {
  "globDirectory": "dist/",
  "globPatterns": [
    "**/*.{js,json,jpg,html}"
  ],
  "swDest": "dist/sw.js",
  "runtimeCaching": [{
    // You can use a RegExp as the pattern:
    urlPattern: /api\.mapbox\.com|tiles\.mapbox\.com|tiles\.virtualearth\.net/,
    handler: 'staleWhileRevalidate',
    // Any options provided will be used when
    // creating the caching strategy.
    options: {
      cacheName: 'map-cache'
    }
  }],
  "globIgnores": [
    "../workbox-cli-config.js"
  ]
}
