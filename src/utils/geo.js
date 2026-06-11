// Geo utilities: Haversine distance, polyline decoding, and corridor filtering.

const EARTH_RADIUS_KM = 6371

export function haversineKm(a, b) {
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export const milesToKm = (miles) => miles * 1.609344
export const kmToMiles = (km) => km / 1.609344

// Decode a Google encoded polyline string to [{lat, lng}, ...].
// Spec: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
export function decodePolyline(encoded) {
  if (!encoded || typeof encoded !== 'string') return []
  const points = []
  let index = 0
  let lat = 0
  let lng = 0
  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let b
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    result = 0
    shift = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }
  return points
}

// Find closest polyline point to a target. Returns { index, distanceKm, fraction }.
// fraction is the cumulative distance ratio along the polyline (0..1).
export function closestPointOnPolyline(polyline, target) {
  if (!polyline || polyline.length === 0) {
    return { index: -1, distanceKm: Infinity, fraction: 0 }
  }
  let bestIndex = 0
  let bestDist = Infinity
  for (let i = 0; i < polyline.length; i++) {
    const d = haversineKm(polyline[i], target)
    if (d < bestDist) {
      bestDist = d
      bestIndex = i
    }
  }

  let cumulative = 0
  let total = 0
  for (let i = 1; i < polyline.length; i++) {
    const seg = haversineKm(polyline[i - 1], polyline[i])
    if (i <= bestIndex) cumulative += seg
    total += seg
  }
  const fraction = total > 0 ? cumulative / total : 0
  return { index: bestIndex, distanceKm: bestDist, fraction }
}
