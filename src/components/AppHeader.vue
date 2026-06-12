<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import logoMark from '@/assets/images/i-ate-there-logo-mark.png'
import logoMarkInvert from '@/assets/images/i-ate-there-logo-mark-INVERT.png'

const props = defineProps({
  title: { type: String, default: 'I Ate There!' },
  showBack: { type: Boolean, default: false },
})

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const canGoBack = computed(() => props.showBack || route.name !== 'home')
const logoSrc = computed(() => (themeStore.isDark ? logoMarkInvert : logoMark))

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
      <span class="title-content">
        <img class="brand-mark" :src="logoSrc" alt="I Ate There! logo" />
        <span class="title-text">{{ title }}</span>
      </span>
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
.app-title :deep(.v-toolbar-title__placeholder) {
  display: flex;
  align-items: center;
  height: 100%;
}
.title-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.title-text {
  line-height: 1.1;
}
.brand-mark {
  width: 26.25px;
  height: 26.25px;
  object-fit: contain;
  display: block;
}
</style>
