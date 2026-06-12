<script setup>
import { onMounted, watchEffect } from 'vue'
import { useTheme } from 'vuetify'
import { RouterView } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurantStore'
import { useThemeStore } from '@/stores/themeStore'

const restaurantStore = useRestaurantStore()
const themeStore = useThemeStore()
const theme = useTheme()

onMounted(() => {
  restaurantStore.loadRestaurants()
})

watchEffect(() => {
  theme.global.name.value = themeStore.name
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
