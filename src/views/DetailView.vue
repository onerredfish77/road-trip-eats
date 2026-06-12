<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import RestaurantDetailSheet from '@/components/RestaurantDetailSheet.vue'
import MapView from '@/components/MapView.vue'
import { useRestaurantStore } from '@/stores/restaurantStore'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const restaurantStore = useRestaurantStore()

onMounted(() => {
  if (restaurantStore.allRestaurants.length === 0) {
    restaurantStore.loadRestaurants()
  }
  restaurantStore.setSelectedRestaurant(props.id)
})

const restaurant = computed(() => {
  return (
    restaurantStore.filteredRestaurants.find((r) => r.id === props.id) ||
    restaurantStore.getRestaurantById(props.id)
  )
})

const directionsUrl = computed(() => {
  if (!restaurant.value) return '#'
  const { lat, lng } = restaurant.value.address
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
})

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/results')
}
</script>

<template>
  <div>
    <AppHeader :title="restaurant?.name || 'Restaurant'" show-back />
    <v-main>
      <div v-if="!restaurant" class="not-found">
        <v-icon size="40">mdi-alert-circle-outline</v-icon>
        <h3 class="not-found-title">Restaurant not found</h3>
        <v-btn class="mt-3" color="primary" @click="goBack">Back</v-btn>
      </div>

      <template v-else>
        <RestaurantDetailSheet :restaurant="restaurant" />

        <div class="detail-map">
          <MapView :restaurants="[restaurant]" mode="detail" />
        </div>

        <v-container class="cta-wrap">
          <v-btn
            color="primary"
            block
            size="x-large"
            :href="directionsUrl"
            target="_blank"
            rel="noopener"
            prepend-icon="mdi-directions"
          >
            Get Directions
          </v-btn>
        </v-container>
        <div class="safe-bottom" style="height: 16px;" />
      </template>
    </v-main>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 64px 24px;
  color: rgb(var(--v-theme-on-surface-variant));
}
.not-found-title {
  margin: 12px 0 4px;
  color: rgb(var(--v-theme-on-surface));
}
.detail-map {
  height: 240px;
  margin: 0 16px;
  border-radius: var(--rte-radius);
  overflow: hidden;
  border: var(--rte-border);
}
.cta-wrap {
  max-width: 720px;
  padding-top: 24px;
  padding-bottom: 24px;
}
</style>
