<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

const props = defineProps({
  title: { type: String, default: 'Road Trip Eats' },
  showBack: { type: Boolean, default: false },
})

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const canGoBack = computed(() => props.showBack || route.name !== 'home')

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <v-app-bar
    color="background"
    density="comfortable"
    class="safe-top app-header"
  >
    <template v-if="canGoBack" #prepend>
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        density="comfortable"
        @click="goBack"
      />
    </template>

    <v-app-bar-title class="app-title">
      <span class="brand-mark">●</span>
      {{ title }}
    </v-app-bar-title>

    <template #append>
      <v-btn
        :icon="themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        density="comfortable"
        :aria-label="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="themeStore.toggle()"
      />
    </template>
  </v-app-bar>
</template>

<style scoped>
.app-header {
  border-bottom: var(--rte-border);
}
.app-title {
  font-weight: 700;
}
.brand-mark {
  color: rgb(var(--v-theme-primary));
  margin-right: 8px;
  font-size: 14px;
  vertical-align: middle;
}
</style>
