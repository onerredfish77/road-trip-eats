<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Road Trip Eats' },
  showBack: { type: Boolean, default: false },
})

const router = useRouter()
const route = useRoute()

const canGoBack = computed(() => props.showBack || route.name !== 'home')

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <v-app-bar
    color="primary"
    :elevation="2"
    density="comfortable"
    class="safe-top"
  >
    <template v-if="canGoBack" #prepend>
      <v-btn icon="mdi-arrow-left" variant="text" color="white" @click="goBack" />
    </template>
    <v-app-bar-title class="text-white font-weight-bold">
      <v-icon size="22" class="mr-2" color="accent">mdi-silverware-fork-knife</v-icon>
      {{ title }}
    </v-app-bar-title>
  </v-app-bar>
</template>
