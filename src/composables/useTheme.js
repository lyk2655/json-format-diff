import { ref, watch } from 'vue'

const STORAGE_KEY = 'json-tools-theme'
const theme = ref('light')

function applyTheme(value) {
  document.documentElement.setAttribute('data-theme', value)
}

// Initialize from localStorage or system preference
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light') {
    theme.value = saved
  } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
  }
  applyTheme(theme.value)
}

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watch(theme, (val) => {
    applyTheme(val)
    localStorage.setItem(STORAGE_KEY, val)
  })

  return { theme, toggleTheme, initTheme }
}
