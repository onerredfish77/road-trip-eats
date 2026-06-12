import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import restaurantsData from '@/data/restaurants.json'
import {
  decodePolyline,
  haversineKm,
  milesToKm,
  closestPointOnPolyline,
} from '@/utils/geo'
import { isOpenAt, mealPeriodForTime } from '@/utils/time'

const DEFAULT_CORRIDOR_MILES = 10

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    allRestaurants: [],
    filteredRestaurants: [],
    // Same set after route + meal-period filters but BEFORE cuisine filter,
    // used to drive the cuisine chip list so it stays stable as you pick chips.
    routeMealRestaurants: [],
    selectedRestaurantId: null,
    activeCuisineFilters: [],
    activeShowFilters: [],
    activeMealPeriod: null,
    corridorMiles: DEFAULT_CORRIDOR_MILES,
    loaded: false,
  }),

  actions: {
    loadRestaurants() {
      if (this.loaded) return
      this.allRestaurants = restaurantsData.map((r) => ({ ...r }))
      this.loaded = true
    },

    setSelectedRestaurant(id) {
      this.selectedRestaurantId = id
    },

    getRestaurantById(id) {
      return this.allRestaurants.find((r) => r.id === id) || null
    },

    setCuisineFilters(list) {
      this.activeCuisineFilters = Array.isArray(list) ? list : []
    },

    setShowFilters(list) {
      this.activeShowFilters = Array.isArray(list) ? list : []
    },

    setMealPeriod(period) {
      this.activeMealPeriod = period || null
    },

    // Count route-matching restaurants using proximity only.
    // This intentionally ignores meal period and cuisine filters.
    countStopsAlongRoute(routePolyline) {
      const points = decodePolyline(routePolyline || '')
      if (points.length === 0) return this.allRestaurants.length
      const corridorKm = milesToKm(this.corridorMiles)
      return this.allRestaurants.reduce((count, r) => {
        const target = { lat: r.address.lat, lng: r.address.lng }
        const c = closestPointOnPolyline(points, target)
        return c.distanceKm <= corridorKm ? count + 1 : count
      }, 0)
    },

    // Core filtering pipeline.
    // routePolyline: encoded polyline string from Directions API (or null/empty).
    // departureTime: ISO string or Date.
    // totalDurationSec: total trip duration in seconds.
    applyFilters({
      routePolyline,
      departureTime,
      totalDurationSec = 0,
      cuisines = [],
      shows = [],
      mealPeriod = null,
    } = {}) {
      this.activeCuisineFilters = cuisines
      this.activeShowFilters = shows
      this.activeMealPeriod = mealPeriod

      const corridorKm = milesToKm(this.corridorMiles)
      const points = decodePolyline(routePolyline || '')
      const departure = departureTime ? dayjs(departureTime) : null

      const enriched = this.allRestaurants.map((r) => {
        const target = { lat: r.address.lat, lng: r.address.lng }
        let distanceKm = Infinity
        let fraction = 0

        if (points.length > 0) {
          const c = closestPointOnPolyline(points, target)
          distanceKm = c.distanceKm
          fraction = c.fraction
        }

        let estimatedArrival = null
        if (departure && totalDurationSec > 0 && points.length > 0) {
          estimatedArrival = departure.add(
            Math.round(fraction * totalDurationSec),
            'second'
          )
        } else if (departure) {
          estimatedArrival = departure
        }

        const arrivalMealPeriod = estimatedArrival
          ? mealPeriodForTime(estimatedArrival)
          : null
        const isOpen = estimatedArrival
          ? isOpenAt(r, estimatedArrival)
          : false

        return {
          ...r,
          _distanceKm: distanceKm,
          _routeFraction: fraction,
          _estimatedArrival: estimatedArrival
            ? estimatedArrival.toISOString()
            : null,
          _arrivalMealPeriod: arrivalMealPeriod,
          _isOpenAtArrival: isOpen,
        }
      })

      let result = enriched

      // Step 1: Proximity filter (only if we actually have a route)
      if (points.length > 0) {
        result = result.filter((r) => r._distanceKm <= corridorKm)
      }

      // Step 2: Meal period filter (auto-derived if not explicitly set)
      const effectiveMealPeriod =
        mealPeriod ||
        (departure ? mealPeriodForTime(departure) : null)
      if (effectiveMealPeriod) {
        result = result.filter(
          (r) =>
            Array.isArray(r.meal_periods) &&
            r.meal_periods.includes(effectiveMealPeriod)
        )
      }

      // Snapshot the set after route + meal filters for the cuisine chip list.
      this.routeMealRestaurants = result

      // Step 3: Cuisine filter
      if (cuisines.length > 0) {
        result = result.filter((r) =>
          (r.cuisine || []).some((c) => cuisines.includes(c))
        )
      }

      // Step 4: Show filter
      if (shows.length > 0) {
        result = result.filter((r) =>
          typeof r.show === 'string' && shows.includes(r.show)
        )
      }

      // Sort by position along route (or alphabetically if no route)
      if (points.length > 0) {
        result.sort((a, b) => a._routeFraction - b._routeFraction)
      } else {
        result.sort((a, b) => a.name.localeCompare(b.name))
      }

      this.filteredRestaurants = result
    },
  },

  getters: {
    selectedRestaurant: (s) =>
      s.allRestaurants.find((r) => r.id === s.selectedRestaurantId) || null,

    availableCuisines: (s) => {
      const set = new Set()
      // Use the route+meal filtered set so chips reflect what's actually
      // visible, but ignore the cuisine filter itself so toggling chips
      // doesn't collapse the option list.
      const source =
        s.routeMealRestaurants.length > 0
          ? s.routeMealRestaurants
          : s.allRestaurants
      source.forEach((r) =>
        (r.cuisine || []).forEach((c) => set.add(c))
      )
      return Array.from(set).sort()
    },

    availableShows: (s) => {
      const set = new Set()
      const source =
        s.routeMealRestaurants.length > 0
          ? s.routeMealRestaurants
          : s.allRestaurants
      source.forEach((r) => {
        if (typeof r.show === 'string' && r.show.trim() !== '') {
          set.add(r.show)
        }
      })
      return Array.from(set).sort()
    },

    allCuisines: (s) => {
      const set = new Set()
      s.allRestaurants.forEach((r) =>
        (r.cuisine || []).forEach((c) => set.add(c))
      )
      return Array.from(set).sort()
    },
  },
})
