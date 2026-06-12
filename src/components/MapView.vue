<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import { loadGoogleMaps, hasMapsKey } from '@/utils/googleMaps'
import { useThemeStore } from '@/stores/themeStore'

const props = defineProps({
  routePolyline: { type: String, default: '' },
  restaurants: { type: Array, default: () => [] },
  mode: { type: String, default: 'results' },
  origin: { type: Object, default: null },
  destination: { type: Object, default: null },
})

const emit = defineEmits(['markerClick'])

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

const mapEl = ref(null)
const errorMessage = ref('')
let map = null
let markers = []
let routeLine = null
let google = null

const darkStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1d1f23' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1f23' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9aa0a6' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#bcbec1' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bcbec1' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2c30' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3d42' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9aa0a6' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1014' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5a6068' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#26282c' }] },
]

const lightStyles = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
]

async function initMap() {
  if (!hasMapsKey()) {
    errorMessage.value =
      'Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in .env to enable the map.'
    return
  }
  try {
    google = await loadGoogleMaps()
    renderMap()
  } catch (err) {
    errorMessage.value = `Could not load Google Maps: ${err.message || err}`
  }
}

function renderMap() {
  if (!google || !mapEl.value) return

  const center = props.restaurants[0]
    ? {
        lat: props.restaurants[0].address.lat,
        lng: props.restaurants[0].address.lng,
      }
    : props.origin || { lat: 39.8283, lng: -98.5795 }

  map = new google.maps.Map(mapEl.value, {
    center,
    zoom: props.mode === 'detail' ? 14 : 6,
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'greedy',
    backgroundColor: isDark.value ? '#1d1f23' : '#FAFAF7',
    styles: isDark.value ? darkStyles : lightStyles,
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
    strokeColor: isDark.value ? '#FF7A1A' : '#E65100',
    strokeOpacity: 0.95,
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
  const fill = isDark.value ? '#FF7A1A' : '#E65100'
  const stroke = isDark.value ? '#0F0F11' : '#FFFFFF'
  props.restaurants.forEach((r) => {
    const m = new google.maps.Marker({
      position: { lat: r.address.lat, lng: r.address.lng },
      map,
      title: r.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: fill,
        fillOpacity: 1,
        strokeColor: stroke,
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

watch(isDark, () => {
  if (!google || !map) return
  map.setOptions({
    styles: isDark.value ? darkStyles : lightStyles,
    backgroundColor: isDark.value ? '#1d1f23' : '#FAFAF7',
  })
  drawRoute()
  drawMarkers()
})

onMounted(initMap)

onBeforeUnmount(() => {
  markers.forEach((m) => m.setMap(null))
  if (routeLine) routeLine.setMap(null)
})
</script>

<template>
  <div class="map-wrap">
    <div v-if="errorMessage" class="map-fallback">
      <v-icon size="28">mdi-map-marker-off</v-icon>
      <div class="map-fallback-text">{{ errorMessage }}</div>
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
  gap: 8px;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  padding: 24px;
  text-align: center;
}
.map-fallback-text {
  font-size: 0.85rem;
  max-width: 320px;
}
</style>
