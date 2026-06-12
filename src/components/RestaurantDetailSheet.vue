<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { formatHours } from '@/utils/time'
import { kmToMiles } from '@/utils/geo'

const props = defineProps({
  restaurant: { type: Object, required: true },
})

const days = [
  ['monday', 'Mon'],
  ['tuesday', 'Tue'],
  ['wednesday', 'Wed'],
  ['thursday', 'Thu'],
  ['friday', 'Fri'],
  ['saturday', 'Sat'],
  ['sunday', 'Sun'],
]

const arrivalLabel = computed(() => {
  const r = props.restaurant
  if (!r._estimatedArrival) return null
  return dayjs(r._estimatedArrival).format('dddd h:mm A')
})

const distanceMi = computed(() => {
  const r = props.restaurant
  return Number.isFinite(r._distanceKm)
    ? kmToMiles(r._distanceKm).toFixed(1)
    : null
})
</script>

<template>
  <v-container class="detail-container">
    <header class="detail-header">
      <div class="text-overline location">
        {{ restaurant.address.city }}, {{ restaurant.address.state }}
      </div>
      <h1 class="restaurant-name">{{ restaurant.name }}</h1>
      <div class="detail-status">
        <v-chip
          v-if="arrivalLabel"
          size="small"
          :color="restaurant._isOpenAtArrival ? 'success' : 'error'"
          variant="tonal"
        >
          {{ restaurant._isOpenAtArrival ? 'Open at arrival' : 'Closed at arrival' }}
        </v-chip>
        <v-chip
          v-else
          size="small"
          :color="restaurant.still_open ? 'success' : 'error'"
          variant="tonal"
        >
          {{ restaurant.still_open ? 'Currently open' : 'Permanently closed' }}
        </v-chip>
      </div>
    </header>

    <section class="rte-card section-card">
      <div class="card-row">
        <v-icon class="row-icon">mdi-television-classic</v-icon>
        <div>
          <div class="row-label">Featured on</div>
          <div class="row-value">{{ restaurant.show }}</div>
          <div class="row-sub">
            Season {{ restaurant.season }} · Episode {{ restaurant.episode }}
          </div>
        </div>
      </div>
      <div class="card-divider" />
      <div class="card-row">
        <v-icon class="row-icon">mdi-silverware-fork-knife</v-icon>
        <div>
          <div class="row-label">Featured dish</div>
          <div class="row-value">{{ restaurant.featured_dish }}</div>
        </div>
      </div>
    </section>

    <p class="description">{{ restaurant.description }}</p>

    <section v-if="arrivalLabel || distanceMi" class="rte-card section-card">
      <div v-if="arrivalLabel" class="card-row simple">
        <v-icon class="row-icon">mdi-clock-outline</v-icon>
        <div><span class="row-sub">Estimated arrival</span> · <strong>{{ arrivalLabel }}</strong></div>
      </div>
      <div v-if="distanceMi" class="card-row simple">
        <v-icon class="row-icon">mdi-map-marker-distance</v-icon>
        <div><strong>{{ distanceMi }} mi</strong> <span class="row-sub">off your route</span></div>
      </div>
    </section>

    <section class="meta-section">
      <h3 class="section-title">Cuisine</h3>
      <div class="chip-list">
        <v-chip
          v-for="c in restaurant.cuisine"
          :key="c"
          size="small"
          variant="tonal"
          class="text-capitalize"
        >
          {{ c }}
        </v-chip>
      </div>

      <template v-if="restaurant.tags && restaurant.tags.length">
        <h3 class="section-title">Tags</h3>
        <div class="chip-list">
          <v-chip
            v-for="t in restaurant.tags"
            :key="t"
            size="small"
            variant="outlined"
            class="text-capitalize"
          >
            {{ t }}
          </v-chip>
        </div>
      </template>
    </section>

    <section class="meta-section">
      <h3 class="section-title">Hours</h3>
      <div class="hours-grid">
        <div v-for="[key, label] in days" :key="key" class="hours-row">
          <span class="hours-day">{{ label }}</span>
          <span class="hours-value">{{ formatHours(restaurant.hours?.[key]) }}</span>
        </div>
      </div>
    </section>

    <section class="meta-section">
      <h3 class="section-title">Address</h3>
      <div class="address">
        {{ restaurant.address.street }}<br />
        {{ restaurant.address.city }}, {{ restaurant.address.state }}
        {{ restaurant.address.zip }}
      </div>

      <div v-if="restaurant.phone || restaurant.website" class="contact-list">
        <a v-if="restaurant.phone" :href="`tel:${restaurant.phone}`" class="contact-link">
          <v-icon size="16">mdi-phone</v-icon>
          {{ restaurant.phone }}
        </a>
        <a
          v-if="restaurant.website"
          :href="restaurant.website"
          target="_blank"
          rel="noopener"
          class="contact-link"
        >
          <v-icon size="16">mdi-web</v-icon>
          Visit website
        </a>
      </div>
    </section>
  </v-container>
</template>

<style scoped>
.detail-container {
  max-width: 720px;
}
.detail-header {
  padding: 16px 0 8px;
}
.location {
  color: rgb(var(--v-theme-on-surface-variant));
  letter-spacing: 0.08em;
}
.restaurant-name {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 4px 0 12px;
}
.detail-status {
  margin-bottom: 4px;
}
.section-card {
  padding: 16px;
  margin: 12px 0;
}
.card-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.card-row.simple {
  align-items: center;
  margin-top: 6px;
}
.card-row.simple:first-child {
  margin-top: 0;
}
.row-icon {
  color: rgb(var(--v-theme-primary));
  margin-top: 2px;
}
.row-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-on-surface-variant));
}
.row-value {
  font-size: 0.95rem;
  font-weight: 700;
  margin-top: 2px;
}
.row-sub {
  font-size: 0.8rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 2px;
}
.card-divider {
  height: 1px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  margin: 14px 0;
}
.description {
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.55;
  margin: 12px 4px 16px;
  font-size: 0.95rem;
}
.section-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 22px 4px 10px;
}
.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 4px;
}
.hours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 4px 16px;
  padding: 0 4px;
}
.hours-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  padding: 4px 0;
  border-bottom: var(--rte-border);
}
.hours-day {
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 500;
}
.address {
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 0 4px;
  margin-bottom: 12px;
}
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
}
.contact-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}
.contact-link:hover {
  text-decoration: underline;
}
</style>
