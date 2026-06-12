import { defineStore } from 'pinia'

export const useRouteStore = defineStore('route', {
  state: () => ({
    origin: '',
    destination: '',
    originCoords: null, // { lat, lng }
    destinationCoords: null, // { lat, lng }
    departureTime: null, // ISO string
    routePolyline: '', // encoded polyline
    routeLegs: [], // raw Directions legs (for ETA)
    totalDuration: 0, // seconds
    totalDistance: 0, // meters
    routeOptions: [], // [{ summary, polyline, legs, totalDuration, totalDistance }]
    selectedRouteIndex: 0,
  }),

  actions: {
    applyRouteOption(index) {
      const option = this.routeOptions[index]
      if (!option) return
      this.selectedRouteIndex = index
      this.routePolyline = option.polyline || ''
      this.routeLegs = option.legs || []
      this.totalDuration = option.totalDuration || 0
      this.totalDistance = option.totalDistance || 0
    },

    setRoute({
      origin,
      destination,
      originCoords,
      destinationCoords,
      departureTime,
      polyline,
      legs,
      totalDuration,
      totalDistance,
    }) {
      this.origin = origin ?? this.origin
      this.destination = destination ?? this.destination
      this.originCoords = originCoords ?? this.originCoords
      this.destinationCoords = destinationCoords ?? this.destinationCoords
      this.departureTime = departureTime ?? this.departureTime
      this.routePolyline = polyline ?? ''
      this.routeLegs = legs ?? []
      this.totalDuration = totalDuration ?? 0
      this.totalDistance = totalDistance ?? 0
      this.routeOptions = [
        {
          summary: 'Route 1',
          polyline: this.routePolyline,
          legs: this.routeLegs,
          totalDuration: this.totalDuration,
          totalDistance: this.totalDistance,
        },
      ]
      this.selectedRouteIndex = 0
    },

    setRouteOptions({
      origin,
      destination,
      originCoords,
      destinationCoords,
      departureTime,
      options,
      selectedIndex = 0,
    }) {
      this.origin = origin ?? this.origin
      this.destination = destination ?? this.destination
      this.originCoords = originCoords ?? this.originCoords
      this.destinationCoords = destinationCoords ?? this.destinationCoords
      this.departureTime = departureTime ?? this.departureTime
      this.routeOptions = Array.isArray(options) ? options : []
      this.applyRouteOption(selectedIndex)
    },

    selectRouteOption(index) {
      this.applyRouteOption(index)
    },

    clearRoute() {
      this.$reset()
    },
  },

  getters: {
    hasRoute: (s) => Boolean(s.routePolyline && s.departureTime),
  },
})
