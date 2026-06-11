<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { kmToMiles } from '@/utils/geo'

const props = defineProps({
  restaurant: { type: Object, required: true },
})

const emit = defineEmits(['click'])

const arrival = computed(() =>
  props.restaurant._estimatedArrival
    ? dayjs(props.restaurant._estimatedArrival).format('ddd h:mm A')
    : null
)

const distanceMi = computed(() =>
  Number.isFinite(props.restaurant._distanceKm)
    ? kmToMiles(props.restaurant._distanceKm).toFixed(1)
    : null
)

const isOpen = computed(() => props.restaurant._isOpenAtArrival)
</script>

<template>
  <v-card
    class="ma-3"
    elevation="2"
    @click="emit('click', restaurant.id)"
  >
    <v-card-item>
      <template #prepend>
        <v-avatar color="primary" size="40" class="text-white">
          <v-icon>mdi-silverware-fork-knife</v-icon>
        </v-avatar>
      </template>
      <v-card-title class="text-wrap">{{ restaurant.name }}</v-card-title>
      <v-card-subtitle class="text-wrap">
        {{ restaurant.address.city }}, {{ restaurant.address.state }}
        <span class="mx-1">·</span>
        <v-icon size="14">mdi-television-classic</v-icon>
        {{ restaurant.show }}
      </v-card-subtitle>
    </v-card-item>

    <v-card-text class="pt-0">
      <div class="text-body-2 mb-2">
        <v-icon size="16" color="accent">mdi-food</v-icon>
        <span class="ml-1 font-weight-medium">{{ restaurant.featured_dish }}</span>
      </div>

      <div class="d-flex flex-wrap ga-1 mb-2">
        <v-chip
          v-for="c in restaurant.cuisine"
          :key="c"
          size="x-small"
          variant="tonal"
          color="primary"
          class="text-capitalize"
        >
          {{ c }}
        </v-chip>
      </div>

      <div class="d-flex align-center justify-space-between">
        <v-chip
          size="small"
          :color="isOpen ? 'success' : 'error'"
          variant="flat"
        >
          <v-icon start size="14">{{ isOpen ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
          {{ isOpen ? 'Open at arrival' : 'Closed at arrival' }}
        </v-chip>
        <div class="text-caption text-medium-emphasis text-right">
          <div v-if="arrival">
            <v-icon size="13">mdi-clock-outline</v-icon>
            {{ arrival }}
          </div>
          <div v-if="distanceMi">
            <v-icon size="13">mdi-map-marker-distance</v-icon>
            {{ distanceMi }} mi off route
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
