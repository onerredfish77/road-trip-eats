import { Loader } from '@googlemaps/js-api-loader'

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

let loaderPromise = null

export function hasMapsKey() {
  return Boolean(apiKey) && apiKey !== 'your_api_key_here'
}

export function loadGoogleMaps() {
  if (!hasMapsKey()) {
    return Promise.reject(
      new Error('Google Maps API key not configured (VITE_GOOGLE_MAPS_API_KEY).')
    )
  }
  if (!loaderPromise) {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    })
    loaderPromise = loader.load()
  }
  return loaderPromise
}
