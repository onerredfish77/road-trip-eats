import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const lightTheme = {
  dark: false,
  colors: {
    primary: '#E65100',
    secondary: '#FFF8E1',
    accent: '#FFB300',
    success: '#2E7D32',
    error: '#C62828',
    background: '#FFFDF7',
    surface: '#FFFFFF',
    'on-primary': '#FFFFFF',
    'on-secondary': '#3E2723',
    'on-background': '#1B1B1B',
    'on-surface': '#1B1B1B',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'lightTheme',
    themes: { lightTheme },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  defaults: {
    VBtn: { rounded: 'lg', size: 'large' },
    VCard: { rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VChip: { rounded: 'lg' },
  },
})
