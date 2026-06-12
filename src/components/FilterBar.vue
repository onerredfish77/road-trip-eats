<script setup>
import { computed } from 'vue'

const props = defineProps({
  cuisines: { type: Array, required: true },
  shows: { type: Array, default: () => [] },
  selectedCuisines: { type: Array, default: () => [] },
  selectedShows: { type: Array, default: () => [] },
  mealPeriod: { type: String, default: null },
})

const emit = defineEmits([
  'update:selectedCuisines',
  'update:selectedShows',
  'update:mealPeriod',
])

const meals = ['breakfast', 'lunch', 'dinner', 'late-night']

const selected = computed({
  get: () => props.selectedCuisines,
  set: (v) => emit('update:selectedCuisines', v),
})

const selectedShowList = computed({
  get: () => props.selectedShows,
  set: (v) => emit('update:selectedShows', v),
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

function toggleShow(show) {
  const has = selectedShowList.value.includes(show)
  selectedShowList.value = has
    ? selectedShowList.value.filter((x) => x !== show)
    : [...selectedShowList.value, show]
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

    <div class="chip-line">
      <div class="chip-label">Cuisine</div>
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

    <div class="chip-line">
      <div class="chip-label">Featured on</div>
      <div class="chip-row no-scrollbar">
        <v-chip
          v-for="show in shows"
          :key="show"
          :color="selectedShowList.includes(show) ? 'primary' : undefined"
          :variant="selectedShowList.includes(show) ? 'flat' : 'outlined'"
          class="show-chip"
          size="small"
          @click="toggleShow(show)"
        >
          {{ show }}
        </v-chip>
      </div>
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
.chip-line {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chip-line + .chip-line {
  margin-top: 8px;
}
.chip-label {
  flex: 0 0 112px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgb(var(--v-theme-on-surface-variant));
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
  flex: 1;
  min-width: 0;
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
.show-chip {
  flex-shrink: 0;
  max-width: none !important;
  white-space: nowrap;
}
:deep(.show-chip .v-chip__content) {
  overflow: visible;
  white-space: nowrap;
  text-overflow: unset;
}
</style>
