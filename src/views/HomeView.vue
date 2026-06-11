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

  // Prefer LatLng objects from autocomplete to avoid geocoding ambiguity.
  const originArg = originPlace
    ? new google.maps.LatLng(originPlace.lat, originPlace.lng)
    : origin
  const destinationArg = destinationPlace
    ? new google.maps.LatLng(destinationPlace.lat, destinationPlace.lng)
    : destination

  const result = await service.route({
    origin: originArg,
    destination: destinationArg,
    travelMode: google.maps.TravelMode.DRIVING,
  })
  if (!result.routes?.length) throw new Error('No route found.')
  const route = result.routes[0]
  const legs = route.legs || []
  const totalDuration = legs.reduce(
    (s, l) => s + (l.duration?.value || 0),
    0
  )
  const totalDistance = legs.reduce(
    (s, l) => s + (l.distance?.value || 0),
    0
  )
  const startLoc = legs[0]?.start_location
  const endLoc = legs[legs.length - 1]?.end_location

  // overview_polyline can be a string OR { points: '...' } depending on API shape.
  const polyline =
    typeof route.overview_polyline === 'string'
      ? route.overview_polyline
      : route.overview_polyline?.points || ''

  routeStore.setRoute({
    origin,
    destination,
    originCoords: startLoc
      ? { lat: startLoc.lat(), lng: startLoc.lng() }
      : null,
    destinationCoords: endLoc
      ? { lat: endLoc.lat(), lng: endLoc.lng() }
      : null,
    departureTime,
    polyline,
    legs: legs.map((l) => ({
      distance: l.distance?.value,
      duration: l.duration?.value,
    })),
    totalDuration,
    totalDistance,
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
  <div>
    <AppHeader />
    <v-main>
      <div class="hero-bg" style="min-height: 220px; padding: 48px 16px 24px;">
        <v-container class="text-center" style="color: white;">
          <div class="text-h4 font-weight-bold mb-2">
            Find TV-famous eats along your route
          </div>
          <div class="text-body-1" style="opacity: 0.9;">
            From Diners, Drive-Ins and Dives to Man v. Food — discover the iconic
            stops worth pulling off the highway for.
          </div>
        </v-container>
      </div>

      <v-container class="py-6" style="max-width: 560px;">
        <v-card elevation="6" class="pa-4">
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
        </v-card>

        <div class="text-center text-caption text-medium-emphasis mt-6">
          {{ restaurantStore.allRestaurants.length }} TV-featured restaurants in our database
        </div>
      </v-container>
    </v-main>
  </div>
</template>
