<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useRestaurantStore } from '@/stores/restaurantStore'

const restaurantStore = useRestaurantStore()

onMounted(() => {
  restaurantStore.loadRestaurants()
})
</script>

<template>
  <v-app>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </v-app>
</template>
