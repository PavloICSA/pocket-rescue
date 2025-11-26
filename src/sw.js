const CACHE_NAME = 'pocket-rescue-v1'
const STATIC_CACHE = 'pocket-rescue-static-v1'

// URLs to cache on install (critical assets)
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
]

/**
 * Install event: Cache critical static assets on first load
 * Requirements: 9.1 - Cache static assets (HTML, CSS, JS) on first load
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Failed to cache some assets during install:', error)
          // Continue even if some assets fail to cache
          return Promise.resolve()
        })
      }),
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Failed to cache some assets:', error)
          return Promise.resolve()
        })
      }),
    ])
  )
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

/**
 * Fetch event: Implement stale-while-revalidate strategy
 * Requirements: 9.2 - Serve cached assets when offline
 * Strategy:
 * 1. Return cached response immediately if available
 * 2. Fetch fresh version in background
 * 3. Update cache with fresh version
 * 4. If offline and no cache, return offline fallback
 */
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Stale-while-revalidate: return cached response immediately
      if (cachedResponse) {
        // Fetch fresh version in background (don't wait for it)
        fetchAndUpdateCache(request)
        return cachedResponse
      }

      // No cached response, fetch from network
      return fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response
          }

          // Clone the response before caching
          const responseToCache = response.clone()

          // Cache the response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Network request failed and no cache available
          // Return a basic offline response for HTML requests
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html')
          }
          return null
        })
    })
  )
})

/**
 * Helper function to fetch and update cache in background
 * Used for stale-while-revalidate strategy
 */
function fetchAndUpdateCache(request) {
  return fetch(request)
    .then((response) => {
      if (!response || response.status !== 200 || response.type === 'error') {
        return
      }

      const responseToCache = response.clone()
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache)
      })
    })
    .catch(() => {
      // Silently fail - we already have cached version
    })
}

/**
 * Activate event: Clean up old caches
 * Removes any cache versions that are not the current version
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old cache versions
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Claim all clients immediately
  self.clients.claim()
})
