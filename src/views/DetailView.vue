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
  // Prefer the filtered version (includes computed fields like _isOpenAtArrival)
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
      <div v-if="!restaurant" class="pa-8 text-center text-medium-emphasis">
        <v-icon size="48">mdi-alert-circle-outline</v-icon>
        <div class="text-h6 mt-2">Restaurant not found</div>
        <v-btn class="mt-3" color="primary" @click="goBack">Back</v-btn>
      </div>

      <template v-else>
        <RestaurantDetailSheet :restaurant="restaurant" />

        <div style="height: 220px;" class="px-3">
          <MapView
            :restaurants="[restaurant]"
            mode="detail"
          />
        </div>

        <v-container class="pb-6">
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
