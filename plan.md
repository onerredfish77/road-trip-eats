# 🛠️ Road Trip Eats — Technical Brief for Copilot

---

## Project Overview

Build a mobile-first web application called **Road Trip Eats** using **Vue 3**, **Vuetify 3**, and **Vue Router**. The app helps road trippers find TV-famous restaurants along their driving route, filtered by time of day and cuisine preference. The app runs entirely in a mobile phone browser with no backend required for the prototype — all data is served from a local JSON file.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vue 3** (Composition API) | Core application framework |
| **Vuetify 3** | Material Design UI component library |
| **Vue Router 4** | Client-side routing between views |
| **Pinia** | State management |
| **Google Maps JavaScript API** | Route rendering and map display |
| **Google Maps Directions API** | Route corridor calculation |
| **Day.js** | Time/day parsing and comparison |
| **Local JSON file** | Restaurant data store for prototype |

---

## Project Structure

```
road-trip-eats/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── RouteSearchBar.vue
│   │   ├── FilterBar.vue
│   │   ├── RestaurantCard.vue
│   │   ├── RestaurantDetailSheet.vue
│   │   └── MapView.vue
│   ├── data/
│   │   └── restaurants.json
│   ├── plugins/
│   │   ├── vuetify.js
│   │   └── router.js
│   ├── stores/
│   │   ├── routeStore.js
│   │   └── restaurantStore.js
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── ResultsView.vue
│   │   └── DetailView.vue
│   ├── App.vue
│   └── main.js
├── package.json
└── vite.config.js
```

---

## Views & Routing

### Route Configuration
```
/           → HomeView.vue
/results    → ResultsView.vue
/detail/:id → DetailView.vue
```

---

### View 1: HomeView.vue
**Purpose:** The landing screen. The user enters their trip details here.

**Components Used:**
- `AppHeader.vue` — App name, logo, tagline
- `RouteSearchBar.vue` — Origin and destination inputs
- Departure date/time picker (`v-date-picker`, `v-time-picker`)
- `v-btn` — "Find My Stops" CTA button

**Behavior:**
- User enters **origin** and **destination** using Google Places Autocomplete inputs
- User selects **departure date and time**
- On submit, the app calls the **Google Maps Directions API** to retrieve the route polyline
- Route data and departure time are saved to **Pinia `routeStore`**
- User is navigated to `/results`

**UI Notes:**
- Full-screen mobile layout with a hero background image
- Bold, centered CTA
- Inputs styled with `v-text-field` (Vuetify) with Google Places Autocomplete attached

---

### View 2: ResultsView.vue
**Purpose:** Displays TV-famous restaurants found along the route, filtered by time of day and cuisine preference.

**Components Used:**
- `AppHeader.vue` — Back navigation, app name
- `FilterBar.vue` — Cuisine type chips, meal period toggle
- `MapView.vue` — Google Map showing route + restaurant pins
- `RestaurantCard.vue` — Scrollable list of restaurant result cards
- `v-bottom-sheet` or `v-tabs` — Toggle between Map View and List View

**Behavior:**
- On load, reads route polyline from `routeStore`
- Calls filtering logic in `restaurantStore`:
  - **Step 1 — Proximity Filter:** For each restaurant in `restaurants.json`, calculate whether the restaurant's `lat/lng` falls within a configurable corridor distance (default: **10 miles**) of the route polyline
  - **Step 2 — Time Filter:** Calculate the estimated time of arrival at each restaurant's geographic area based on departure time + drive time along the route. Compare against restaurant `hours` and `meal_periods`. Default meal period shown is based on estimated arrival time:
    - 5:00am–10:30am → Breakfast
    - 10:30am–3:00pm → Lunch
    - 3:00pm–close → Dinner
  - **Step 3 — Cuisine Filter:** Filter by selected cuisine chips in `FilterBar.vue`. Defaults to showing all cuisines.
- Results are displayed as a **scrollable card list** and as **pins on the map**
- Tapping a card or map pin navigates to `/detail/:id`

**UI Notes:**
- Sticky `FilterBar.vue` at the top below the header
- Map takes up top ~40% of screen, list scrolls below (or full toggle between views)
- Each `RestaurantCard.vue` shows: restaurant name, city/state, show name, featured dish, cuisine tags, and open/closed status based on estimated arrival time
- Use `v-chip` for cuisine tags
- Use `v-badge` or colored `v-chip` for open/closed status

---

### View 3: DetailView.vue
**Purpose:** Full detail screen for a selected restaurant.

**Components Used:**
- `AppHeader.vue` — Back navigation
- `RestaurantDetailSheet.vue` — Full restaurant detail display
- `MapView.vue` — Small static map showing restaurant location
- `v-btn` — "Get Directions" button (opens Google Maps native app via deep link)

**Behavior:**
- Reads restaurant `id` from route params
- Looks up full restaurant record from `restaurantStore`
- Displays all restaurant details
- "Get Directions" button constructs a Google Maps URL:
  `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`
- "Back" button returns to `/results` without resetting filters

**UI Notes:**
- Hero image area at top (placeholder image or show logo)
- Restaurant name, city, state in bold
- Show name and episode info displayed with a 📺 icon
- Featured dish highlighted with a 🍽️ icon
- Hours displayed in a clean `v-list`
- Cuisine tags as `v-chip` components
- Tags (iconic, cash-only, etc.) displayed as outlined `v-chip` components
- `still_open` status prominently displayed

---

## Components Detail

### AppHeader.vue
- Vuetify `v-app-bar`
- Shows app name/logo
- Conditionally shows back button (`v-btn` with arrow icon) on Results and Detail views
- Uses Vue Router `$router.back()` for navigation

---

### RouteSearchBar.vue
- Two `v-text-field` inputs: **From** and **To**
- Google Places Autocomplete attached to each input
- `v-date-input` and `v-time-input` for departure date/time selection
- Emits `{ origin, destination, departureTime }` to `HomeView`

---

### FilterBar.vue
- Horizontally scrollable row of `v-chip` components for cuisine types
- Meal period toggle using `v-btn-toggle`: Breakfast / Lunch / Dinner
- Emits selected filters to `ResultsView`
- Chips are dynamically generated from unique cuisine values in the filtered restaurant dataset

---

### RestaurantCard.vue
- Vuetify `v-card` component
- Props: `restaurant` object
- Displays:
  - Restaurant name (`v-card-title`)
  - City, State + Show name (`v-card-subtitle`)
  - Featured dish
  - Cuisine `v-chip` tags
  - Open/Closed `v-chip` (green/red) based on estimated arrival time
- Emits `click` event to navigate to detail view

---

### RestaurantDetailSheet.vue
- Full detail display component
- Props: `restaurant` object
- Displays all fields from the restaurant data model
- Hours rendered as a `v-table` or `v-list`
- External links use `v-btn` with `target="_blank"`

---

### MapView.vue
- Wraps the **Google Maps JavaScript API**
- Props:
  - `routePolyline` — encoded polyline from Directions API
  - `restaurants` — array of restaurant objects to plot as markers
  - `mode` — `'results'` (full map with route) or `'detail'` (single pin)
- Custom map markers using restaurant pin icons
- Emits `markerClick(restaurantId)` event when a pin is tapped
- Uses `@googlemaps/js-api-loader` npm package to load Maps API

---

## State Management (Pinia)

### routeStore.js
```
state:
  - origin: String
  - destination: String
  - departureTime: DateTime
  - routePolyline: String (encoded polyline)
  - routeLegs: Array (for ETA calculations)
  - totalDuration: Number (seconds)

actions:
  - setRoute(origin, destination, departureTime, polyline, legs)
  - clearRoute()
```

### restaurantStore.js
```
state:
  - allRestaurants: Array (loaded from restaurants.json)
  - filteredRestaurants: Array
  - selectedRestaurantId: String
  - activeCuisineFilters: Array
  - activeMealPeriod: String

actions:
  - loadRestaurants()
  - applyFilters(routePolyline, departureTime, cuisines, mealPeriod)
  - setSelectedRestaurant(id)
  - getRestaurantById(id)

getters:
  - selectedRestaurant
  - availableCuisines
```

---

## Key Logic: Route Corridor Filtering

The core filtering logic lives in `restaurantStore.js`. Here is the approach:

```
1. Decode the Google Maps encoded polyline into an array of lat/lng points
2. For each restaurant in the dataset:
   a. Loop through each point on the polyline
   b. Calculate the distance between the restaurant lat/lng 
      and each polyline point using the Haversine formula
   c. If any polyline point is within the corridor threshold 
      (default 10 miles / ~16km), include the restaurant
3. For included restaurants, estimate the arrival time:
   a. Find the closest polyline point to the restaurant
   b. Determine what % along the route that point is
   c. Apply that % to the total route duration
   d. Add to departure time to get estimated arrival time
4. Compare estimated arrival time to restaurant hours 
   and meal periods
5. Return filtered and sorted results (sorted by position 
   along the route — first stop to last stop)
```

---

## Google Maps Integration

### APIs Required
| API | Usage |
|-----|-------|
| **Maps JavaScript API** | Render interactive map |
| **Directions API** | Calculate route + polyline |
| **Places API** | Autocomplete for origin/destination inputs |

### Environment Variable
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Maps Configuration
- Map style: Custom styled map (muted road colors, bold highway lines)
- Restaurant markers: Custom pin with fork/knife icon
- Route line: Bold, brand-colored polyline overlay
- On mobile: disable unnecessary controls for clean UI

---

## Vuetify Theme Configuration

### plugins/vuetify.js
```javascript
const theme = {
  themes: {
    light: {
      colors: {
        primary: '#E65100',    // Deep orange — road trip/food energy
        secondary: '#FFF8E1',  // Warm cream background
        accent: '#FFB300',     // Amber — highlights and CTAs
        success: '#2E7D32',    // Green — open status
        error: '#C62828',      // Red — closed status
        background: '#FFFDF7', // Off-white warm background
        surface: '#FFFFFF',
      }
    }
  }
}
```

---

## Mobile UX Requirements

| Requirement | Implementation |
|-------------|---------------|
| Touch-friendly tap targets | Minimum 48px height on all interactive elements |
| No horizontal scrolling | All layouts use `v-container` with full width |
| Safe area support | Respect iOS/Android safe areas with CSS env() variables |
| Fast load | Lazy load map component, paginate restaurant list |
| Readable in sunlight | High contrast text, bold typography |
| One-handed use | Primary actions anchored to bottom of screen |
| No app install required | Pure mobile web, PWA-ready structure |

---

## Package.json Dependencies

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vuetify": "^3.5.0",
    "vue-router": "^4.3.0",
    "pinia": "^2.1.0",
    "@mdi/font": "^7.4.0",
    "@googlemaps/js-api-loader": "^1.16.6",
    "dayjs": "^1.11.10"
  },
  "devDependencies": {
    "vite": "^5.1.0",
    "@vitejs/plugin-vue": "^5.0.0",
    "vite-plugin-vuetify": "^2.0.0"
  }
}
```

---

## Build & Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## Development Sequence for Copilot

Build the application in this order:

| Step | Task |
|------|------|
| 1 | Scaffold Vue 3 + Vuetify 3 project with Vite |
| 2 | Configure Vuetify theme, router, and Pinia |
| 3 | Create `restaurants.json` data file |
| 4 | Build `AppHeader.vue` component |
| 5 | Build `HomeView.vue` with route search inputs |
| 6 | Integrate Google Maps Places Autocomplete |
| 7 | Integrate Google Maps Directions API |
| 8 | Build `routeStore.js` and `restaurantStore.js` |
| 9 | Build corridor filtering and time-of-day logic |
| 10 | Build `MapView.vue` with route polyline and markers |
| 11 | Build `FilterBar.vue` with cuisine chips and meal toggle |
| 12 | Build `RestaurantCard.vue` |
| 13 | Build `ResultsView.vue` assembling all result components |
| 14 | Build `RestaurantDetailSheet.vue` |
| 15 | Build `DetailView.vue` with directions deep link |
| 16 | End-to-end testing of full user flow on mobile |
| 17 | Polish: transitions, loading states, empty states, error handling |

---

*Road Trip Eats — Technical Blueprint v1.0*