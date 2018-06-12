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
 * Add Service Worker
 */
 
 /* self.addEventListener('fetch', function(event) {
   var requestUrl = new URL(event.request.url);
   
    if (requestUrl.origin === location.origin) {
     if (requestUrl.pathname === '/') {
       event.respondWith(caches.match('index.html'))
     }
   }
   console.log(requestUrl);
   
   event.respondWith(
     caches.match(event.request).then(function(response) {
       if (response.status == 404){
         return new Response('<h2>404 - Nothing like that here!<h2> <img src="img/giphy.gif" alt="Always Sunny Frank Whoops">', {
           headers: {'Content-Type': 'text/html'}
         })
       }
       
       return response || fetch(event.request).then(function(thisR) {
         console.log("it's putting! " + event.request.url);
         let respClone = thisR.clone();
         caches.open('newStuff').then(function(cache) {
           cache.put(event.request, respClone);
         });
         
       });
     }).catch(function() {
      return new Response("Whoops, that didn't work.")
     })
     );
 }); */
 
 /**
  * Cache Response
  */
 
  self.addEventListener('fetch', function(event) {
   event.respondWith(
     
     );
 });