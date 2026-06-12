# Famous Eats

Famous Eats is a mobile-first Vue 3 app for finding TV-featured restaurants along your driving route.

## Features

- Route search with Google Directions
- Address typeahead with Google Places Autocomplete
- Route alternatives (up to 3) with duration and option count
- Filtering by meal period, cuisine, and featured TV show
- List and map result views
- Light and dark theme support

## Tech Stack

- Vue 3 + Vite
- Vuetify 3
- Pinia
- Vue Router
- Google Maps Platform APIs (Maps JavaScript, Places, Directions)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create or update `.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Run the development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Google Maps API Notes

Because autocomplete and map rendering run in the browser, the `VITE_GOOGLE_MAPS_API_KEY` value is exposed client-side.
Use Google Cloud API key restrictions:

- Application restriction: HTTP referrers
- API restriction: only APIs used by this app

Recommended referrers:

- `https://road-trip-eats.vercel.app/*`
- `https://*.vercel.app/*`
- `http://localhost:5173/*`

## Scripts

- `npm run dev` - Start local development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally

## Project Structure

```text
src/
  assets/
  components/
  data/
  plugins/
  stores/
  utils/
  views/
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.
