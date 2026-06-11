<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import MapView from '@/components/MapView.vue'
import RestaurantCard from '@/components/RestaurantCard.vue'
import { useRouteStore } from '@/stores/routeStore'
import { useRestaurantStore } from '@/stores/restaurantStore'
import { mealPeriodForTime } from '@/utils/time'

const router = useRouter()
const routeStore = useRouteStore()
const restaurantStore = useRestaurantStore()

const view = ref('list') // 'list' | 'map'
const selectedCuisines = ref([])
const mealPeriod = ref(null)

onMounted(() => {
  if (!routeStore.departureTime && routeStore.origin === '') {
    router.replace('/')
    return
  }
  // Default the meal period from the departure time if we have one.
  if (!mealPeriod.value && routeStore.departureTime) {
    mealPeriod.value = mealPeriodForTime(routeStore.departureTime)
  }
  runFilters()
})

function runFilters() {
  restaurantStore.applyFilters({
    routePolyline: routeStore.routePolyline,
    departureTime: routeStore.departureTime,
    totalDurationSec: routeStore.totalDuration,
    cuisines: selectedCuisines.value,
    mealPeriod: mealPeriod.value,
  })
}

watch([selectedCuisines, mealPeriod], runFilters, { deep: true })

const cuisineOptions = computed(() => restaurantStore.allCuisines)
const results = computed(() => restaurantStore.filteredRestaurants)

function openDetail(id) {
  router.push({ name: 'detail', params: { id } })
}
</script>

<template>
  <div>
    <AppHeader title="Stops along your route" />
    <FilterBar
      :cuisines="cuisineOptions"
      v-model:selected-cuisines="selectedCuisines"
      v-model:meal-period="mealPeriod"
    />

    <v-main>
      <div class="px-3 pt-2 pb-2 d-flex align-center justify-space-between">
        <div class="text-body-2 text-medium-emphasis">
          <strong>{{ results.length }}</strong> stops found
          <template v-if="routeStore.origin">
            from <em>{{ routeStore.origin }}</em>
            to <em>{{ routeStore.destination }}</em>
          </template>
        </div>
        <v-btn-toggle
          v-model="view"
          mandatory
          density="comfortable"
          color="primary"
          variant="outlined"
          divided
        >
          <v-btn value="list" size="small" icon="mdi-format-list-bulleted" />
          <v-btn value="map" size="small" icon="mdi-map-outline" />
        </v-btn-toggle>
      </div>

      <div v-if="view === 'map'" style="height: calc(100vh - 220px); min-height: 320px;">
        <MapView
          :route-polyline="routeStore.routePolyline"
          :restaurants="results"
          :origin="routeStore.originCoords"
          :destination="routeStore.destinationCoords"
          mode="results"
          @marker-click="openDetail"
        />
      </div>

      <div v-else>
        <div v-if="results.length === 0" class="pa-8 text-center text-medium-emphasis">
          <v-icon size="48" color="primary">mdi-silverware-clean</v-icon>
          <div class="text-h6 mt-2">No stops match your filters</div>
          <div class="text-body-2">
            Try adjusting cuisines, switching meal period, or check that your
            route is correct.
          </div>
        </div>

        <RestaurantCard
          v-for="r in results"
          :key="r.id"
          :restaurant="r"
          @click="openDetail"
        />
        <div class="safe-bottom" style="height: 16px;" />
      </div>
    </v-main>
  </div>
</template>
