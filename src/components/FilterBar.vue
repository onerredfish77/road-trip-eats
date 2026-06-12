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
  <div class="filter-bar">
    <div class="meal-row">
      <v-btn-toggle
        v-model="meal"
        mandatory="force"
        density="comfortable"
        variant="text"
        divided
        class="meal-toggle"
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
    </div>

    <div class="chip-row no-scrollbar">
      <v-chip
        v-for="c in cuisines"
        :key="c"
        :color="selected.includes(c) ? 'primary' : undefined"
        :variant="selected.includes(c) ? 'flat' : 'outlined'"
        class="text-capitalize cuisine-chip"
        size="small"
        @click="toggleCuisine(c)"
      >
        {{ c }}
      </v-chip>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  position: sticky;
  top: 64px;
  z-index: 5;
  background: rgb(var(--v-theme-background));
  border-bottom: var(--rte-border);
  padding: 8px 12px;
}
.meal-row {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}
.meal-toggle {
  border: var(--rte-border);
  border-radius: 999px;
  padding: 2px;
}
:deep(.meal-toggle .v-btn) {
  border-radius: 999px !important;
  letter-spacing: 0;
}
.chip-row {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  gap: 6px;
  padding-bottom: 2px;
}
/* Let each chip be sized by its content and never truncate */
.cuisine-chip {
  flex-shrink: 0;
  max-width: none !important;
  white-space: nowrap;
}
:deep(.cuisine-chip .v-chip__content) {
  overflow: visible;
  white-space: nowrap;
  text-overflow: unset;
}
</style>
