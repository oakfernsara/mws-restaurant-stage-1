/**
 * Add site files to the cache
 */
 
 // ! Add an import statement to pull in IDB library and make it accessible... also add const dbPromise...? Replace the const below with your actual code.
 
 // ! Remove data/restaurants.json

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('mws-restaurant-stage-1').then(function(cache) {
      console.log("Cache opened")
      return cache.addAll([
        '/',
        'index.html',
        'restaurant.html',
        'js/main.js',
        'js/dbhelper.js',
        'js/restaurant_info.js',
        'css/styles.css',
        'css/responsive.css',
        'js/restaurant_info.js',
        ]);
    })
    );
});

/**
 * Add Service Worker
 */
 
 // ! Fetch listener split is optional... but you can tell the service worker to respond differently to requests coming to port 1337

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      
      if (response) {
        console.log('got it!', response);
        return response
      }
      
      console.log('fetching from network')
      
      return fetch(event.request).then(function(fetchResp) {
        return caches.open('mws-restaurant-stage-1').then(function(cache) {
          cache.put(event.request, fetchResp.clone());
          return fetchResp;
        });
      });
    })
    );
});
 
 /**
  * Cache Response
  */
  
  // ! Why is this empty?
 
  self.addEventListener('fetch', function(event) {
   event.respondWith(
     
     );
 });