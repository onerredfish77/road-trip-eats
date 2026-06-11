<script setup>
import { computed } from 'vue'

const props = defineProps({
  cuisines: { type: Array, required: true },
  selectedCuisines: { type: Array, default: () => [] },
  mealPeriod: { type: String, default: null },
})

const emit = defineEmits(['update:selectedCuisines', 'update:mealPeriod'])

const meals = ['breakfast', 'lunch', 'dinner', 'late-night']

const selected = computed({
  get: () => props.selectedCuisines,
  set: (v) => emit('update:selectedCuisines', v),
})

const meal = computed({
  get: () => props.mealPeriod,
  set: (v) => emit('update:mealPeriod', v),
})

function toggleCuisine(c) {
  const has = selected.value.includes(c)
  selected.value = has
    ? selected.value.filter((x) => x !== c)
    : [...selected.value, c]
}
</script>

<template>
  <div class="filter-bar bg-secondary py-2 px-3">
    <v-btn-toggle
      v-model="meal"
      mandatory="force"
      density="comfortable"
      color="primary"
      class="mb-2"
      variant="outlined"
    >
      <v-btn
        v-for="m in meals"
        :key="m"
        :value="m"
        size="small"
        class="text-capitalize"
      >
        {{ m.replace('-', ' ') }}
      </v-btn>
    </v-btn-toggle>

    <div class="chip-row">
      <v-chip
        v-for="c in cuisines"
        :key="c"
        :color="selected.includes(c) ? 'primary' : undefined"
        :variant="selected.includes(c) ? 'flat' : 'outlined'"
        class="mr-2 mb-1 text-capitalize"
        size="small"
        @click="toggleCuisine(c)"
      >
        {{ c }}
      </v-chip>
    </div>
  </div>
</template>

<style scoped>
.chip-row {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.chip-row::-webkit-scrollbar {
  display: none;
}
.filter-bar {
  position: sticky;
  top: 64px;
  z-index: 5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
</style>
