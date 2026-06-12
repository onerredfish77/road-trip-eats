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

const view = ref('list')
const selectedCuisines = ref([])
const selectedShows = ref([])
const mealPeriod = ref(null)

onMounted(() => {
  if (!routeStore.departureTime && routeStore.origin === '') {
    router.replace('/')
    return
  }
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
    shows: selectedShows.value,
    mealPeriod: mealPeriod.value,
  })
}

watch([selectedCuisines, selectedShows, mealPeriod], runFilters, { deep: true })

const cuisineOptions = computed(() => restaurantStore.availableCuisines)
const results = computed(() => restaurantStore.filteredRestaurants)
const showOptions = computed(() => {
  const set = new Set()
  results.value.forEach((r) => {
    if (typeof r.show === 'string' && r.show.trim() !== '') {
      set.add(r.show)
    }
  })
  return Array.from(set).sort()
})
const routeChoices = computed(() =>
  routeStore.routeOptions.slice(0, 3).map((route) => ({
    ...route,
    totalStops: restaurantStore.countStopsAlongRoute(route.polyline),
  }))
)
const selectedRouteIndex = computed({
  get: () => routeStore.selectedRouteIndex,
  set: (index) => {
    routeStore.selectRouteOption(index)
    runFilters()
  },
})

function formatDuration(totalSeconds) {
  const minutes = Math.round((totalSeconds || 0) / 60)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins}m`
}

function openDetail(id) {
  router.push({ name: 'detail', params: { id } })
}
</script>

<template>
  <div>
    <AppHeader title="Options along your route" />
    <FilterBar
      :cuisines="cuisineOptions"
      :shows="showOptions"
      v-model:selected-cuisines="selectedCuisines"
      v-model:selected-shows="selectedShows"
      v-model:meal-period="mealPeriod"
    />

    <v-main>
      <div v-if="routeChoices.length > 1" class="route-switcher-wrap">
        <div class="route-switcher-label">Routes</div>
        <div class="route-switcher-scroll no-scrollbar">
          <v-btn-toggle
            v-model="selectedRouteIndex"
            mandatory
            density="compact"
            variant="outlined"
            divided
            class="route-toggle"
          >
            <v-btn
              v-for="(route, i) in routeChoices"
              :key="`${route.summary}-${i}`"
              :value="i"
              size="small"
              class="route-option text-none"
            >
              Route {{ i + 1 }} · {{ formatDuration(route.totalDuration) }} · {{ route.totalStops }} options
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <div class="results-toolbar">
        <div class="results-summary">
          <strong>{{ results.length }}</strong> options found
          <template v-if="routeStore.origin">
            · <em>{{ routeStore.origin }}</em>
            <v-icon size="14">mdi-arrow-right</v-icon>
            <em>{{ routeStore.destination }}</em>
          </template>
        </div>
        <v-btn-toggle
          v-model="view"
          mandatory
          density="compact"
          variant="outlined"
          divided
          class="view-toggle"
        >
          <v-btn value="list" size="small" icon="mdi-format-list-bulleted" />
          <v-btn value="map" size="small" icon="mdi-map-outline" />
        </v-btn-toggle>
      </div>

      <div v-if="view === 'map'" class="map-pane">
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
        <div v-if="results.length === 0" class="empty-state">
          <v-icon size="40">mdi-silverware-clean</v-icon>
          <h3 class="empty-title">No options match your filters</h3>
          <p class="empty-sub">
            Try adjusting cuisines, switching meal period, or check that your
            route is correct.
          </p>
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

<style scoped>
.results-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
}
.results-summary {
  font-size: 0.85rem;
  color: rgb(var(--v-theme-on-surface-variant));
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.results-summary strong {
  color: rgb(var(--v-theme-on-surface));
}
.view-toggle {
  border-radius: 999px !important;
  min-width: 120px;
  flex: 0 0 auto;
}
:deep(.view-toggle .v-btn) {
  border-radius: 999px !important;
  min-width: 56px;
}
.route-switcher-wrap {
  padding: 10px 16px 4px;
}
.route-switcher-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 6px;
}
.route-switcher-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.route-toggle {
  border-radius: 999px !important;
  min-width: max-content;
}
:deep(.route-toggle .v-btn) {
  border-radius: 999px !important;
}
.route-option {
  white-space: nowrap;
}
.map-pane {
  height: calc(100vh - 230px);
  min-height: 320px;
}
.empty-state {
  text-align: center;
  padding: 64px 24px;
  color: rgb(var(--v-theme-on-surface-variant));
}
.empty-title {
  margin: 12px 0 4px;
  font-size: 1.1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}
.empty-sub {
  margin: 0;
  font-size: 0.9rem;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}
</style>
