<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { formatHours } from '@/utils/time'
import { kmToMiles } from '@/utils/geo'

const props = defineProps({
  restaurant: { type: Object, required: true },
})

const days = [
  ['monday', 'Monday'],
  ['tuesday', 'Tuesday'],
  ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'],
  ['friday', 'Friday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
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
  <div>
    <div
      class="hero-bg"
      :style="{ height: '200px', position: 'relative' }"
    >
      <div
        class="d-flex flex-column justify-end h-100 pa-4"
        style="color: white;"
      >
        <div class="text-overline">{{ restaurant.address.city }}, {{ restaurant.address.state }}</div>
        <div class="text-h5 font-weight-bold">{{ restaurant.name }}</div>
      </div>
    </div>

    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card variant="flat" class="bg-secondary mb-3">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2" color="primary">mdi-television-classic</v-icon>
                <div>
                  <div class="font-weight-bold">{{ restaurant.show }}</div>
                  <div class="text-caption">
                    Season {{ restaurant.season }}, Episode {{ restaurant.episode }}
                  </div>
                </div>
              </div>
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="accent">mdi-silverware-fork-knife</v-icon>
                <div>
                  <div class="text-overline">Featured Dish</div>
                  <div class="font-weight-medium">{{ restaurant.featured_dish }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12">
          <p class="text-body-1">{{ restaurant.description }}</p>
        </v-col>

        <v-col cols="12" v-if="arrivalLabel || distanceMi">
          <v-card variant="outlined" class="pa-3">
            <div v-if="arrivalLabel" class="d-flex align-center mb-1">
              <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
              <span>Estimated arrival: <strong>{{ arrivalLabel }}</strong></span>
            </div>
            <div v-if="distanceMi" class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-map-marker-distance</v-icon>
              <span><strong>{{ distanceMi }} mi</strong> off your route</span>
            </div>
            <v-chip
              class="mt-2"
              size="small"
              :color="restaurant._isOpenAtArrival ? 'success' : 'error'"
              variant="flat"
            >
              {{ restaurant._isOpenAtArrival ? 'Open when you arrive' : 'Closed when you arrive' }}
            </v-chip>
          </v-card>
        </v-col>

        <v-col cols="12">
          <div class="text-overline mb-1">Cuisine</div>
          <div class="d-flex flex-wrap ga-1 mb-3">
            <v-chip
              v-for="c in restaurant.cuisine"
              :key="c"
              size="small"
              color="primary"
              variant="tonal"
              class="text-capitalize"
            >
              {{ c }}
            </v-chip>
          </div>

          <div v-if="restaurant.tags && restaurant.tags.length">
            <div class="text-overline mb-1">Tags</div>
            <div class="d-flex flex-wrap ga-1">
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
          </div>
        </v-col>

        <v-col cols="12">
          <div class="text-overline mb-1">Hours</div>
          <v-list density="compact" class="bg-transparent pa-0">
            <v-list-item
              v-for="[key, label] in days"
              :key="key"
              class="px-0"
            >
              <template #prepend>
                <span class="text-caption font-weight-medium" style="width: 100px">{{ label }}</span>
              </template>
              <v-list-item-title class="text-caption">
                {{ formatHours(restaurant.hours?.[key]) }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col cols="12">
          <div class="text-overline mb-1">Address</div>
          <div class="text-body-2 mb-3">
            {{ restaurant.address.street }}<br />
            {{ restaurant.address.city }}, {{ restaurant.address.state }}
            {{ restaurant.address.zip }}
          </div>

          <div v-if="restaurant.phone" class="d-flex align-center mb-2">
            <v-icon class="mr-2" size="18">mdi-phone</v-icon>
            <a :href="`tel:${restaurant.phone}`" class="text-decoration-none">
              {{ restaurant.phone }}
            </a>
          </div>
          <div v-if="restaurant.website" class="d-flex align-center">
            <v-icon class="mr-2" size="18">mdi-web</v-icon>
            <a
              :href="restaurant.website"
              target="_blank"
              rel="noopener"
              class="text-decoration-none"
            >
              Visit website
            </a>
          </div>
        </v-col>

        <v-col cols="12">
          <v-chip
            :color="restaurant.still_open ? 'success' : 'error'"
            variant="flat"
            size="small"
          >
            <v-icon start size="16">
              {{ restaurant.still_open ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
            {{ restaurant.still_open ? 'Still open today' : 'Permanently closed' }}
          </v-chip>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
