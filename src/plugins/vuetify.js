import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// A warm, restrained "road trip" palette in two flavors.
// Brand orange is reserved for primary actions and active states only.
const dark = {
  dark: true,
  colors: {
    background: '#0F0F11',
    surface: '#17181B',
    'surface-bright': '#1F2024',
    'surface-variant': '#2A2B30',
    'on-surface-variant': '#C8CACE',
    primary: '#FF7A1A',
    'primary-darken-1': '#E66A0F',
    secondary: '#A0A3AA',
    accent: '#FFC857',
    success: '#3DDC84',
    warning: '#FFB300',
    error: '#FF6B6B',
    info: '#7AA7FF',
    'on-primary': '#1B0E03',
    'on-background': '#ECECEE',
    'on-surface': '#ECECEE',
  },
}

const light = {
  dark: false,
  colors: {
    background: '#FAFAF7',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-variant': '#F2F2EE',
    'on-surface-variant': '#5A5C62',
    primary: '#E65100',
    'primary-darken-1': '#C7460A',
    secondary: '#5A5C62',
    accent: '#E08A00',
    success: '#2E7D32',
    warning: '#B26A00',
    error: '#C62828',
    info: '#1F5FBF',
    'on-primary': '#FFFFFF',
    'on-background': '#101113',
    'on-surface': '#101113',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: { dark, light },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      size: 'large',
      class: 'text-none',
    },
    VCard: { rounded: 'lg', flat: true },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VChip: { rounded: 'lg' },
    VAppBar: { flat: true },
  },
})
