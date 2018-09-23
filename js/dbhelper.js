const database = 'restaurant';
const restStore = 'restaurants';
const revStore = 'reviews';
const pendStore = 'pending'

const dbPromise = idb.open(database, 3, function(upgradeDb) {
  switch(upgradeDb.oldVersion) {
    case 0:
      upgradeDb.createObjectStore(restStore, {keyPath: 'id'});
      /* falls through */
    case 1:
      upgradeDb.createObjectStore(revStore, {keyPath: 'id', autoIncrement:true}
        );
    case 2:
      upgradeDb.createObjectStore(pendStore, {autoIncrement:true}
      );
  }
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
  
  static get REVIEW_URL() {
    return `http://localhost:1337/reviews`;
  }
  
  static updatePending() {
    dbPromise.then(db => {
      const store = db.transaction(pendStore, 'readwrite').objectStore(pendStore);
      store
        .openCursor()
        .then(cursor => {
          if (!cursor) {
            return;
          }
        const update = cursor.value;
        console.log("cursor.value is", cursor.value);
        const url = update.url;
        const method = update.method;
        const id = update.id;
        const params = update.data;
        
        if (id) {
          console.log('updatePending() found an id!', id)
          fetch(url, {method}).then((response) => {
          if (!response.ok && !response.redirected) {
            return;
          }
        }).then(() => {
          const delPend = db.transaction(pendStore, 'readwrite').objectStore(pendStore);
          delPend.openCursor().then(cursor => {
            cursor.delete();
          });
        });
        }
        
        if (params) {
          console.log('updatePending() found some params!', params)
          fetch(url, {
            method: 'POST',
            body: JSON.stringify(params)
          }).then((response) => {
            if (!response.ok && !response.redirected) {
              return;
            }
          }).then(() => {
            const delPend = db.transaction(pendStore, 'readwrite').objectStore(pendStore);
            delPend.openCursor().then(cursor => {
              cursor.delete();
            })
          })
        }
        });
    });
  }

  /**
   * Fetch all restaurants.
   */
   
   static fetchRestaurants(callback) {
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
         let tx = db.transaction(restStore, 'readwrite');
         let thisStore = tx.objectStore(restStore);
         theseRest.forEach(rest => {
           let restData = thisStore.put({
             id: rest.id,
             data: rest
           });
         });
       }).then( () => {
         callback(null, theseRest);
       });
       
       } else {
         console.log('No response from the network');
         dbPromise.then(db => {
           let tx = db.transaction(restStore);
           let thisStore = tx.objectStore(restStore);
            
          //return restStore.getAll();
          thisStore.getAll().then(data => {
            console.log('the .then on restStore.getAll() is returning',data);
            let finalData = data.map(values => {
              return values.data;
            });
            console.log('finalData is', finalData);
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
          console.log(restaurant);
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }
  
  /**
   * Fetch Reviews by ID
   */
   
   static fetchReviewsById(id, callback) {
     console.log('Fetching Reviews for restaurant id', id)
     fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`).catch(e => {
       console.log(e);
     }).then(response => {
       if (!response || response.status !==200) {return}
       return response.json();
     })
     .then(theseRevs => {
       if (theseRevs) {
         console.log('These reviews are from the server', theseRevs);
         dbPromise.then(db => {
           let store = db.transaction(revStore, 'readwrite').objectStore(revStore);
           theseRevs.forEach(review => {
             store.put({
               id: review.id,
               data: review
             });
           });
         }).then(() => {
           callback(null, theseRevs);
         });
       } else {
         dbPromise.then(db => {
           let thisStore = db.transaction(revStore).objectStore(revStore)
           thisStore.getAll().then(data => {
             let finalData = data.map(values => {
               return values.data;
             });
             console.log('finalRevData is', finalData)
             callback(null, finalData);
           })
         })
       }
     });
   }
  
  /*static fetchReviewsById(id, callback) {
    fetch('http://localhost:1337/reviews/', {
      "restaurant_id": id
    }).then(response => {
      if (!response || response.status !== 200) {return}
      return response.json();
    }).then(theseReviews => {
      if (theseReviews) {
      dbPromise.then(db => {
        let store = db.transaction(revStore, 'readwrite').objectStore(revStore);
        theseReviews.forEach(review => {
          store.put({
            id: review.id,
            data: review
          });
        });
      }).then(() => {
        callback(null, theseReviews)
      })
      } else {
        results = [];
        dbPromise.then(db => {
          let store = db.transaction(revStore).objectStore(revStore);
          let revIndex = store.index('restaurant_id');
          let thisKey = IDBKeyRange.only(id);
          index.openCursor(thisKey).onsuccess = event => {
            let cursor = event.target.result
            console.log(cursor);
            results.push(event);
          }
          return results;
        }).then(reviews => {
          console.log(reviews);
          callback(null, reviews);
        })
      }
    });
  }*/


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
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
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
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
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
    return (`/img/${restaurant.id}.jpg`);
  }
  
  static imageUrlforWebp(restaurant) {
    return (`/img/webp/${restaurant.id}.webp`);
  }
  
  static imageUrlForSrcset(restaurant) {
    return `/img/resize/${restaurant.id}-large.jpg 800w,
      /img/resize/${restaurant.id}-medium.jpg 640w,
      /img/resize/${restaurant.id}-small.jpg 320w`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      });
      marker.addTo(newMap);
    return marker;
  }


/**
 * Update Favorite Data
 */
 
 static updateFavorite(id, newState) {
   console.log('updateFavorite running');
   const url = `http://localhost:1337/restaurants/${id}/?is_favorite=${newState}`;
   const method = "PUT";
   
   dbPromise.then(db => {
     const store = db.transaction(restStore, 'readwrite').objectStore(restStore);
     
     store.get(id).then(result => {
       //get returns a promise with result.data as the object I need to edit and then send back to store.put... otherwise I just overwrite all of the data with just the favorite.
         result.data.is_favorite = newState;
       store.put(result);
       console.log("The info going to the database is", result);
     });
     
     console.log('Added favorite to database');
   });
   
   fetch(url, {
     method
   }).catch( () => {
    
       dbPromise.then(db => {
         const store = db.transaction(pendStore, 'readwrite').objectStore(pendStore);
         
         console.log('No response from server, adding this to pending database', url, method);
         store.put({id, url, method});
       });
   });
 }
 
 
 /**
  * Create Review
  */
  
  static createReview(data) {
    console.log('createReview is running with', data);
    const url = `http://localhost:1337/reviews/`
    const method = 'POST'
    
    dbPromise.then(db => {
      const tx = db.transaction(revStore, 'readwrite');
      
      const id = data.restaurant_id;
      
      tx.objectStore(revStore).put({data});
      console.log('Added review to IndexedDB');
    });
    
    console.log('The data in createReview is', typeof data.comments);
    
    fetch(url, {
      method: method,
      body: JSON.stringify(data)
      
    }).catch( () => {
      dbPromise.then(db => {
        const store = db.transaction(pendStore, 'readwrite').objectStore(pendStore);
        console.log('No response from server, adding this to pending database', data, url, method);
      store.put({data, url, method})
      });
      
      
    });
  }
  
  
}
