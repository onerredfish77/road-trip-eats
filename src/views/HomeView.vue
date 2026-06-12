<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import RouteSearchBar from '@/components/RouteSearchBar.vue'
import { useRouteStore } from '@/stores/routeStore'
import { useRestaurantStore } from '@/stores/restaurantStore'
import { loadGoogleMaps, hasMapsKey } from '@/utils/googleMaps'

const router = useRouter()
const routeStore = useRouteStore()
const restaurantStore = useRestaurantStore()

const loading = ref(false)
const errorMessage = ref('')

async function requestRoute(google, service, originArg, destinationArg) {
  return service.route({
    origin: originArg,
    destination: destinationArg,
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true,
  })
}

function isGeocodeRouteError(err) {
  const msg = String(err?.message || '').toUpperCase()
  return (
    msg.includes('DIRECTIONS_ROUTE_NOT_FOUND') ||
    msg.includes('NOT_FOUND') ||
    msg.includes('ZERO_RESULTS')
  )
}

async function fetchDirections({
  origin,
  destination,
  originPlace,
  destinationPlace,
  departureTime,
}) {
  if (!hasMapsKey()) {
    routeStore.setRoute({
      origin,
      destination,
      originCoords: null,
      destinationCoords: null,
      departureTime,
      polyline: '',
      legs: [],
      totalDuration: 0,
      totalDistance: 0,
    })
    return
  }

  const google = await loadGoogleMaps()
  const service = new google.maps.DirectionsService()

  const originArg = originPlace
    ? new google.maps.LatLng(originPlace.lat, originPlace.lng)
    : origin
  const destinationArg = destinationPlace
    ? new google.maps.LatLng(destinationPlace.lat, destinationPlace.lng)
    : destination

  let result
  try {
    result = await requestRoute(google, service, originArg, destinationArg)
  } catch (err) {
    // If geocoding fails on place coordinates, retry with plain address strings.
    const shouldRetryWithStrings =
      isGeocodeRouteError(err) && (originPlace || destinationPlace)
    if (!shouldRetryWithStrings) throw err
    result = await requestRoute(google, service, origin, destination)
  }
  if (!result.routes?.length) throw new Error('No route found.')
  const routes = result.routes.slice(0, 3)
  const firstLegs = routes[0]?.legs || []
  const startLoc = firstLegs[0]?.start_location
  const endLoc = firstLegs[firstLegs.length - 1]?.end_location

  const options = routes.map((route, i) => {
    const legs = route.legs || []
    const totalDuration = legs.reduce((s, l) => s + (l.duration?.value || 0), 0)
    const totalDistance = legs.reduce((s, l) => s + (l.distance?.value || 0), 0)
    const polyline =
      typeof route.overview_polyline === 'string'
        ? route.overview_polyline
        : route.overview_polyline?.points || ''
    return {
      summary: route.summary || `Route ${i + 1}`,
      polyline,
      legs: legs.map((l) => ({
        distance: l.distance?.value,
        duration: l.duration?.value,
      })),
      totalDuration,
      totalDistance,
    }
  })

  routeStore.setRouteOptions({
    origin,
    destination,
    originCoords: startLoc
      ? { lat: startLoc.lat(), lng: startLoc.lng() }
      : null,
    destinationCoords: endLoc ? { lat: endLoc.lat(), lng: endLoc.lng() } : null,
    departureTime,
    options,
    selectedIndex: 0,
  })
}

async function onSubmit(payload) {
  loading.value = true
  errorMessage.value = ''
  try {
    await fetchDirections(payload)
    restaurantStore.applyFilters({
      routePolyline: routeStore.routePolyline,
      departureTime: routeStore.departureTime,
      totalDurationSec: routeStore.totalDuration,
      cuisines: [],
      mealPeriod: null,
    })
    router.push('/results')
  } catch (err) {
    console.error('[HomeView] route error:', err)
    errorMessage.value =
      err?.message || 'Something went wrong calculating your route.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="home">
    <AppHeader />
    <v-main>
      <section class="hero">
        <div class="hero-inner">
          <div class="eyebrow">I Ate There!</div>
          <h1 class="hero-title">
            Find <span class="accent">TV-famous</span> eats along your route.
          </h1>
          <p class="hero-sub">
            From Diners, Drive-Ins and Dives to Man v. Food — discover the iconic
            stops worth pulling off the highway for.
          </p>
        </div>
      </section>

      <section class="form-wrap">
        <div class="rte-card form-card">
          <RouteSearchBar
            :initial-origin="routeStore.origin"
            :initial-destination="routeStore.destination"
            :initial-departure="routeStore.departureTime"
            @submit="onSubmit"
          />
          <v-progress-linear
            v-if="loading"
            indeterminate
            color="primary"
            class="mt-3"
          />
          <v-alert
            v-if="errorMessage"
            type="error"
            density="compact"
            variant="tonal"
            class="mt-3"
          >
            {{ errorMessage }}
          </v-alert>
        </div>

        <div class="footnote">
          {{ restaurantStore.allRestaurants.length }} TV-featured restaurants in our database
        </div>
      </section>
    </v-main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
}
.hero {
  padding: 56px 20px 24px;
  text-align: center;
}
.hero-inner {
  max-width: 600px;
  margin: 0 auto;
}
.eyebrow {
  color: rgb(var(--v-theme-primary));
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.hero-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.15;
  margin: 0 0 14px;
}
.hero-title .accent {
  color: rgb(var(--v-theme-primary));
}
.hero-sub {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}
.form-wrap {
  max-width: 520px;
  margin: 0 auto;
  padding: 8px 16px 56px;
}
.form-card {
  padding: 22px 20px;
}
.footnote {
  text-align: center;
  font-size: 0.8rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 24px;
}

@media (min-width: 600px) {
  .hero {
    padding: 80px 24px 32px;
  }
  .hero-title {
    font-size: 2.5rem;
  }
}
</style>
