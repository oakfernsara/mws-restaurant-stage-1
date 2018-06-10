/**
 * Add Service Worker
 */
 
 self.addEventListener('fetch', function(event) {
   console.log(event.request);
 });