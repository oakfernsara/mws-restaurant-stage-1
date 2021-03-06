let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
 
 document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
  DBHelper.updatePending();
});


initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1Ijoib2FrZmVybnNhcmEiLCJhIjoiY2psMm9sNGo5MXNxZDNxcWoyc3BoeWxnaiJ9.Wad3aJdiqA83uPQulmlmYA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  const favStatus = restaurant.is_favorite;
  name.innerHTML = restaurant.name + '<button class="fas fa-heart" id="fav-heart" name="is a favorite"></button>';
  
  console.log("restaurant.is_favorite is", restaurant.is_favorite)
  
  const favHeart = document.getElementById('fav-heart');
  restaurant.is_favorite === "true"
    ? favHeart.classList.add('fav')
    : favHeart.classList.remove('fav');
 favHeart.onclick = () => {
   favHeart.classList.toggle('fav')
   favoriteClick(restaurant.id);
 }

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute("alt", restaurant.name);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  const id = restaurant.id;
  DBHelper.fetchReviewsById(id, (error, reviews) => {
    console.log("DBHelper is sending", reviews);
      self.reviews = reviews;
      if (!reviews) {
        console.error(error);
        return;
      }
      fillReviewsHTML();
  });
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  console.log("fillReviewsHTML is getting", reviews)
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  console.log('adding review HTML', review);
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  console.log('review.name is', review.name);
  li.appendChild(name);

  const date = document.createElement('p');
  let dateData;
  !review.updatedAt
  ? dateData = new Date()
  : dateData = new Date(review.updatedAt)
  date.innerHTML = dateData.toLocaleDateString("en-US");
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
/**
 * Review Form Functionality
 */
  
  
  const reviewDiv = document.getElementById('review-form');
  const revBtn = document.getElementById('rev-btn');
 
 revBtn.onclick = () => {
   
   reviewDiv.classList.toggle("rev-show")
 }
 
 const revSubmit = document.getElementById('review-submit')
 const id = getParameterByName('id');
 
revSubmit.onclick = () => {
  event.preventDefault();
   const form = document.getElementById("rev-form").elements;
   const revName = form.namedItem('name').value;
   const rating = form.namedItem('rating').value;
   const comments = form.namedItem('comments').value;
   
   
   let review = {restaurant_id: id, name: revName, rating: rating, comments: comments}
   
   DBHelper.createReview(review);
   document.getElementById('reviews-list').appendChild(createReviewHTML(review));
   
   reviewDiv.classList.toggle("rev-show")
    
 }
 
 /**
  *
  */
 
 /**
  * Favorite Functionality
  */
  
favoriteClick = (id) => {
  const favStatus = document.getElementById('fav-heart')
  const classList = favStatus.classList
  let status = true;
  classList.contains("fav")
    ? ( status = true,
      console.log("we have a favorite!", id)
    ) : ( status = false,
      console.log("we do not have a favorite!", id)
      );
      
      console.log("favoriteClick status is", status)
      
  DBHelper.updateFavorite(id, status)
}