<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'
import { loadGoogleMaps, hasMapsKey } from '@/utils/googleMaps'

const props = defineProps({
  initialOrigin: { type: String, default: '' },
  initialDestination: { type: String, default: '' },
  initialDeparture: { type: String, default: '' },
})

const emit = defineEmits(['submit'])

const origin = ref(props.initialOrigin)
const destination = ref(props.initialDestination)

// Place objects when chosen via autocomplete; null until selected.
const originPlace = ref(null) // { description, lat, lng }
const destinationPlace = ref(null)

const today = dayjs().format('YYYY-MM-DD')
const nowTime = dayjs().format('HH:mm')
const departureDate = ref(
  props.initialDeparture
    ? dayjs(props.initialDeparture).format('YYYY-MM-DD')
    : today
)
const departureTimeOfDay = ref(
  props.initialDeparture
    ? dayjs(props.initialDeparture).format('HH:mm')
    : nowTime
)

const loading = ref(false)
const error = ref('')

const originInputRef = ref(null)
const destInputRef = ref(null)

let listeners = []

watch(
  () => [props.initialOrigin, props.initialDestination, props.initialDeparture],
  ([o, d, dep]) => {
    if (o) origin.value = o
    if (d) destination.value = d
    if (dep) {
      departureDate.value = dayjs(dep).format('YYYY-MM-DD')
      departureTimeOfDay.value = dayjs(dep).format('HH:mm')
    }
  }
)

function attachAutocomplete(google, input, onSelect) {
  if (!input) return null
  const ac = new google.maps.places.Autocomplete(input, {
    fields: ['formatted_address', 'geometry', 'name'],
    types: ['geocode'],
  })
  const listener = ac.addListener('place_changed', () => {
    const place = ac.getPlace()
    if (!place || !place.geometry?.location) return
    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    onSelect({
      description: place.formatted_address || place.name,
      lat,
      lng,
    })
  })
  listeners.push(listener)
  return ac
}

onMounted(async () => {
  if (!hasMapsKey()) return
  try {
    const google = await loadGoogleMaps()
    const originInput = originInputRef.value?.$el?.querySelector('input')
    const destInput = destInputRef.value?.$el?.querySelector('input')
    attachAutocomplete(google, originInput, (p) => {
      origin.value = p.description
      originPlace.value = p
    })
    attachAutocomplete(google, destInput, (p) => {
      destination.value = p.description
      destinationPlace.value = p
    })
  } catch (e) {
    console.warn('Places Autocomplete unavailable:', e)
  }
})

onBeforeUnmount(() => {
  listeners.forEach((l) => l && l.remove?.())
  listeners = []
})

// If the user re-edits a field after selecting, drop the saved place.
watch(origin, (v) => {
  if (originPlace.value && v !== originPlace.value.description) {
    originPlace.value = null
  }
})
watch(destination, (v) => {
  if (destinationPlace.value && v !== destinationPlace.value.description) {
    destinationPlace.value = null
  }
})

function onSubmit() {
  error.value = ''
  if (!origin.value || !destination.value) {
    error.value = 'Please enter a starting point and destination.'
    return
  }
  const iso = dayjs(`${departureDate.value}T${departureTimeOfDay.value}`).toISOString()
  emit('submit', {
    origin: origin.value,
    destination: destination.value,
    originPlace: originPlace.value,
    destinationPlace: destinationPlace.value,
    departureTime: iso,
  })
}

defineExpose({ setLoading: (v) => (loading.value = v) })
</script>

<template>
  <v-form @submit.prevent="onSubmit" class="d-flex flex-column ga-3">
    <v-text-field
      ref="originInputRef"
      v-model="origin"
      label="From"
      placeholder="Starting point"
      prepend-inner-icon="mdi-map-marker"
      autocomplete="off"
    />
    <v-text-field
      ref="destInputRef"
      v-model="destination"
      label="To"
      placeholder="Destination"
      prepend-inner-icon="mdi-flag-checkered"
      autocomplete="off"
    />
    <div class="d-flex ga-2">
      <v-text-field
        v-model="departureDate"
        type="date"
        label="Departure date"
        prepend-inner-icon="mdi-calendar"
        class="flex-1-1"
      />
      <v-text-field
        v-model="departureTimeOfDay"
        type="time"
        label="Time"
        prepend-inner-icon="mdi-clock-outline"
        class="flex-1-1"
      />
    </div>

    <v-alert v-if="error" type="error" density="compact" variant="tonal">
      {{ error }}
    </v-alert>

    <v-btn
      type="submit"
      color="primary"
      size="x-large"
      block
      :loading="loading"
      prepend-icon="mdi-silverware-fork-knife"
    >
      Find My Stops
    </v-btn>
  </v-form>
</template>

<style>
/* Google Places dropdown attaches to <body>; keep it above Vuetify layers. */
.pac-container {
  z-index: 3000 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
</style>
