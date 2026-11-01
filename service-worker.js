// ===== SERVICE WORKER ZENTECH =====
// v5 : pages produits (référencement), animations, statistiques Google non mises en cache. Chemins relatifs (GitHub Pages).
const CACHE_NAME  = 'zentech-v9';
const CACHE_DATA  = 'zentech-data-v9';
const OFFLINE_URL = 'offline.html';

// Fichiers mis en cache dès l'installation (chemins relatifs au dossier du site)
const STATIC_FILES = [
  './',
  'index.html',
  'offline.html',
  'css/index.css',
  'js/app.js',
  'js/motion.js',
  'css/produit.css',
  'js/produit.js',
  'produits.html',
  'manifest.json',
  'data/produits.json'
];

// ===== INSTALLATION =====
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        // un fichier manquant ne bloque pas l'installation
        return Promise.allSettled(STATIC_FILES.map(function(f) { return cache.add(f); }));
      })
      .then(function() { return self.skipWaiting(); })
  );
});

// ===== ACTIVATION : supprime les anciens caches =====
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(names) {
        return Promise.all(names.map(function(name) {
          if (name !== CACHE_NAME && name !== CACHE_DATA) return caches.delete(name);
        }));
      })
      .then(function() { return self.clients.claim(); })
  );
});

// ===== INTERCEPTION DES REQUÊTES =====
self.addEventListener('fetch', function(event) {
  var req = event.request;
  var url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Espace admin et API GitHub : jamais de cache, toujours le réseau
  if (url.hostname === 'api.github.com') return;
  // Statistiques Google et pages d'autres sites (carte) : jamais de cache
  if (/(^|\.)(googletagmanager|google-analytics|analytics\.google)\.com$/.test(url.hostname)) return;
  if (url.origin !== self.location.origin && req.mode === 'navigate') return;
  if (/\/(admin\.html|js\/admin\.js|js\/seo-pages\.js|css\/admin\.css)$/.test(url.pathname)) return;

  // Articles et prix : réseau d'abord, copie hors ligne en secours
  if (url.origin === self.location.origin && url.pathname.indexOf('/data/') !== -1) {
    event.respondWith(networkFirst(req, CACHE_DATA, true));
    return;
  }

  // Pages HTML : réseau d'abord, page hors ligne en secours
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(networkFirst(req, CACHE_NAME, false).then(function(res) {
      return res || caches.match(OFFLINE_URL);
    }));
    return;
  }

  // Images, polices, CDN : cache d'abord
  if (req.destination === 'image' || url.origin !== self.location.origin) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // CSS / JS : cache immédiat, mise à jour en arrière-plan
  event.respondWith(staleWhileRevalidate(req));
});

// ===== STRATÉGIES =====
function networkFirst(request, cacheName, ignoreSearch) {
  return fetch(request)
    .then(function(response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(cacheName).then(function(cache) {
          // pour data/*.json, on range la réponse sans le ?v=... pour la retrouver hors ligne
          var key = ignoreSearch ? request.url.split('?')[0] : request;
          cache.put(key, clone);
        });
      }
      return response;
    })
    .catch(function() {
      return caches.match(ignoreSearch ? request.url.split('?')[0] : request, { ignoreSearch: ignoreSearch });
    });
}

function cacheFirst(request) {
  return caches.match(request).then(function(cached) {
    if (cached) return cached;
    return fetch(request).then(function(response) {
      if (response.ok || response.type === 'opaque') {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(request, clone); });
      }
      return response;
    }).catch(function() { return new Response('', { status: 504 }); });
  });
}

function staleWhileRevalidate(request) {
  return caches.open(CACHE_NAME).then(function(cache) {
    return cache.match(request).then(function(cached) {
      var fetching = fetch(request).then(function(response) {
        if (response.ok) cache.put(request, response.clone());
        return response;
      }).catch(function() { return cached; });
      return cached || fetching;
    });
  });
}

// ===== NOTIFICATIONS PUSH (optionnel) =====
self.addEventListener('push', function(event) {
  if (!event.data) return;
  var data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'ZenTech', {
      body:  data.body  || 'Nouvelle notification ZenTech',
      icon:  data.icon  || 'img/icons/icon-192x192.png',
      badge: data.badge || 'img/icons/icon-72x72.png',
      data:  data.url   || './'
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || './'));
});
