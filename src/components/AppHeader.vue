<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import logoMark from '@/assets/images/i-ate-there-logo-mark.png'

const props = defineProps({
  title: { type: String, default: 'I Ate There!' },
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
      <span class="brand-mark-circle">
        <img class="brand-mark" :src="logoMark" alt="I Ate There! logo" />
      </span>
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
.brand-mark-circle {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  vertical-align: middle;
}
.brand-mark {
  width: 17.5px;
  height: 17.5px;
  object-fit: contain;
}
</style>
