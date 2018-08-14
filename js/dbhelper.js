const database = 'restaurant';
const storeName = 'restaurants';

const dbPromise = idb.open(database, 1, function(upgradeDb) {
  return upgradeDb.createObjectStore(storeName, {
    keyPath: 'id'
  });
});

/**
 * Common database helper functions.
 */
class DBHelper {
 
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    return `http://localhost:1337/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
   
   static fetchRestaurants(callback) {
     //fetch statement that produces json response, THEN take the response and add each entry to the database, catch errors along the way
     
     /**dbPromise.then(db => {
       if (db) {
         console.log('Loading restaurants from IndexDB', db);
         let tx = db.transaction(storeName);
          let restStore = tx.objectStore(storeName);
          console.log(restStore.getAll());
          return restStore.getAll();
       }
       
       else {
         console.log('Loading restaurants from external server');
         getJSON(`${DBHelper.DATABASE_URL}`)
         .catch(e => {
           console.log(e);
         })
         .then(theseRest => {
           console.log('Got the restaurants!', theseRest);
          let tx = db.transaction(storeName, 'readwrite');
          let restStore = tx.objectStore(storeName);
              theseRest.forEach(rest => {
          let restData = restStore.put({
             id: rest.id,
             data: rest
           });
         });
         return tx.complete;
         }).catch(e => {
           console.log(e);
         });
       }
       }).then(final => {
         console.log(final[0]);
         callback(null, final);
       }).catch(e => {
         console.log(e);
       });*/
       
     
     
     fetch(`http://localhost:1337/restaurants`)
     .catch(e => {
       console.log('Offline mode' + e);
       return;
     })
     .then(response =>{
       if (!response || response.status !== 200) {return}
       return response.json();
     })
     .then(theseRest => {
       if (theseRest) {
       console.log('These restaurants are from the server', theseRest);
       dbPromise.then(db => {
         let tx = db.transaction(storeName, 'readwrite');
         let restStore = tx.objectStore(storeName);
         theseRest.forEach(rest => {
           let restData = restStore.put({
             id: rest.id,
             data: rest
           });
         });
       }).then( () => {
         console.log('theseRest', theseRest);
         callback(null, theseRest);
       });
       
       } else {
         console.log('No response from the network');
         dbPromise.then(db => {
           let tx = db.transaction(storeName);
           let restStore = tx.objectStore(storeName);
            
          //return restStore.getAll();
          restStore.getAll().then(data => {
            console.log('the .then on restStore.getAll() is returning',data);
            let finalData = data.map(values => {
              return values.data;
            });
            console.log('finalData is', finalData)
            callback(null, finalData);
          });
         });
       }
     });
     
   }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
   
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}.jpg`);
  }
  
  static imageUrlForSrcset(restaurant) {
    return [
      `/img/resize/${restaurant.photograph}-large.jpg`,
      `/img/resize/${restaurant.photograph}-medium.jpg`,
      `/img/resize/${restaurant.photograph}-small.jpg`
      ]
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
