<script setup>
import { ref, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  initialOrigin: { type: String, default: '' },
  initialDestination: { type: String, default: '' },
  initialDeparture: { type: String, default: '' },
})

const emit = defineEmits(['submit'])

const origin = ref(props.initialOrigin)
const destination = ref(props.initialDestination)

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
    departureTime: iso,
  })
}

defineExpose({ setLoading: (v) => (loading.value = v) })
</script>

<template>
  <v-form @submit.prevent="onSubmit" class="d-flex flex-column ga-3">
    <v-text-field
      v-model="origin"
      label="From"
      placeholder="Starting point"
      prepend-inner-icon="mdi-map-marker"
      autocomplete="off"
      bg-color="white"
    />
    <v-text-field
      v-model="destination"
      label="To"
      placeholder="Destination"
      prepend-inner-icon="mdi-flag-checkered"
      autocomplete="off"
      bg-color="white"
    />
    <div class="d-flex ga-2">
      <v-text-field
        v-model="departureDate"
        type="date"
        label="Departure date"
        prepend-inner-icon="mdi-calendar"
        bg-color="white"
        class="flex-1-1"
      />
      <v-text-field
        v-model="departureTimeOfDay"
        type="time"
        label="Time"
        prepend-inner-icon="mdi-clock-outline"
        bg-color="white"
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
