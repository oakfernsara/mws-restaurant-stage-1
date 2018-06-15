/**
 * Add site files to the cache
 */

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
        'data/restaurants.json',
        ]);
    })
    );
});

/**
 * Add Service Worker
 */

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
 
  self.addEventListener('fetch', function(event) {
   event.respondWith(
     
     );
 });