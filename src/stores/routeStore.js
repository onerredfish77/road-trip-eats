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
  }),

  actions: {
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
    },

    clearRoute() {
      this.$reset()
    },
  },

  getters: {
    hasRoute: (s) => Boolean(s.routePolyline && s.departureTime),
  },
})
