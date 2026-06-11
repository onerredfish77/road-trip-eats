<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'

const props = defineProps({
  routePolyline: { type: String, default: '' },
  restaurants: { type: Array, default: () => [] },
  mode: { type: String, default: 'results' }, // 'results' | 'detail'
  origin: { type: Object, default: null }, // {lat,lng}
  destination: { type: Object, default: null }, // {lat,lng}
})

const emit = defineEmits(['markerClick'])

const mapEl = ref(null)
const errorMessage = ref('')
let map = null
let markers = []
let routeLine = null
let google = null

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

async function initMap() {
  if (!apiKey || apiKey === 'your_api_key_here') {
    errorMessage.value = 'Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in .env to enable the map.'
    return
  }
  try {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    })
    google = await loader.load()
    renderMap()
  } catch (err) {
    errorMessage.value = `Could not load Google Maps: ${err.message || err}`
  }
}

function renderMap() {
  if (!google || !mapEl.value) return

  const center = props.restaurants[0]
    ? { lat: props.restaurants[0].address.lat, lng: props.restaurants[0].address.lng }
    : props.origin || { lat: 39.8283, lng: -98.5795 } // US center fallback

  map = new google.maps.Map(mapEl.value, {
    center,
    zoom: props.mode === 'detail' ? 14 : 6,
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'greedy',
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    ],
  })

  drawRoute()
  drawMarkers()
}

function drawRoute() {
  if (!google || !map) return
  if (routeLine) {
    routeLine.setMap(null)
    routeLine = null
  }
  if (!props.routePolyline) return

  const path = google.maps.geometry?.encoding?.decodePath
    ? google.maps.geometry.encoding.decodePath(props.routePolyline)
    : null

  if (!path) return

  routeLine = new google.maps.Polyline({
    path,
    strokeColor: '#E65100',
    strokeOpacity: 0.9,
    strokeWeight: 5,
  })
  routeLine.setMap(map)

  const bounds = new google.maps.LatLngBounds()
  path.forEach((p) => bounds.extend(p))
  if (path.length > 0 && props.mode === 'results') {
    map.fitBounds(bounds, 60)
  }
}

function drawMarkers() {
  if (!google || !map) return
  markers.forEach((m) => m.setMap(null))
  markers = []
  props.restaurants.forEach((r) => {
    const m = new google.maps.Marker({
      position: { lat: r.address.lat, lng: r.address.lng },
      map,
      title: r.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#E65100',
        fillOpacity: 1,
        strokeColor: '#FFF',
        strokeWeight: 2,
      },
    })
    m.addListener('click', () => emit('markerClick', r.id))
    markers.push(m)
  })
}

watch(
  () => [props.routePolyline, props.restaurants],
  () => {
    if (google && map) {
      drawRoute()
      drawMarkers()
    }
  },
  { deep: true }
)

onMounted(initMap)

onBeforeUnmount(() => {
  markers.forEach((m) => m.setMap(null))
  if (routeLine) routeLine.setMap(null)
})
</script>

<template>
  <div class="map-wrap">
    <div v-if="errorMessage" class="map-fallback">
      <v-icon size="32" color="primary">mdi-map-marker-off</v-icon>
      <div class="text-body-2 mt-2">{{ errorMessage }}</div>
    </div>
    <div v-else ref="mapEl" class="map-canvas" />
  </div>
</template>

<style scoped>
.map-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}
.map-canvas {
  width: 100%;
  height: 100%;
  min-height: 220px;
}
.map-fallback {
  width: 100%;
  height: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #FFF8E1;
  padding: 24px;
  text-align: center;
  color: #5D4037;
}
</style>
