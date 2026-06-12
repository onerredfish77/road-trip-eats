import { defineStore } from 'pinia'

const STORAGE_KEY = 'rte:theme'

function readInitial() {
  if (typeof localStorage === 'undefined') return 'dark'
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === 'light' || v === 'dark') return v
  return 'dark'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    name: readInitial(),
  }),

  getters: {
    isDark: (s) => s.name === 'dark',
  },

  actions: {
    set(name) {
      this.name = name === 'light' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, this.name)
      } catch {
        /* ignore */
      }
    },
    toggle() {
      this.set(this.isDark ? 'light' : 'dark')
    },
  },
})
