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
  <div class="rte-card restaurant-card" @click="emit('click', restaurant.id)">
    <div class="restaurant-header">
      <div class="restaurant-title">{{ restaurant.name }}</div>
      <v-chip
        size="x-small"
        :color="isOpen ? 'success' : 'error'"
        variant="tonal"
        class="status-chip"
      >
        {{ isOpen ? 'Open' : 'Closed' }}
      </v-chip>
    </div>

    <div class="restaurant-meta">
      {{ restaurant.address.city }}, {{ restaurant.address.state }}
      <span class="dot">·</span>
      <span class="show">{{ restaurant.show }}</span>
    </div>

    <div class="dish">
      <v-icon size="14" class="mr-1">mdi-silverware-fork-knife</v-icon>
      {{ restaurant.featured_dish }}
    </div>

    <div class="cuisine-row">
      <v-chip
        v-for="c in restaurant.cuisine.slice(0, 3)"
        :key="c"
        size="x-small"
        variant="tonal"
        class="text-capitalize"
      >
        {{ c }}
      </v-chip>
    </div>

    <div class="footer-meta">
      <span v-if="arrival">
        <v-icon size="12">mdi-clock-outline</v-icon>
        {{ arrival }}
      </span>
      <span v-if="distanceMi">
        <v-icon size="12">mdi-map-marker-distance</v-icon>
        {{ distanceMi }} mi off route
      </span>
    </div>
  </div>
</template>

<style scoped>
.restaurant-card {
  padding: 16px;
  margin: 12px 16px;
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.12s ease;
}
.restaurant-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
}
.restaurant-card:active {
  transform: scale(0.99);
}
.restaurant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.restaurant-title {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.status-chip {
  flex-shrink: 0;
}
.restaurant-meta {
  margin-top: 4px;
  font-size: 0.825rem;
  color: rgb(var(--v-theme-on-surface-variant));
}
.dot {
  margin: 0 4px;
}
.show {
  font-style: italic;
}
.dish {
  margin-top: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}
.cuisine-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 10px;
}
.footer-meta {
  margin-top: 12px;
  display: flex;
  gap: 14px;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}
.footer-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
