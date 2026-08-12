<script setup>
import { ref, onMounted } from 'vue'
import { useTheme } from '../composables/useTheme.js'

const menuOpen = ref(false)
const { theme, toggleTheme, initTheme } = useTheme()

const navLinks = [
  { to: '/', label: 'JSON Diff' },
  { to: '/json-formatter', label: 'Formatter' },
  { to: '/json-validator', label: 'Validator' },
  { to: '/json-minify', label: 'Minify' },
  { to: '/json-repair', label: 'Repair' },
  { to: '/json-to-csv', label: 'JSON→CSV' },
  { to: '/json-viewer', label: 'Viewer' },
  { to: '/json-to-yaml', label: 'JSON→YAML' },
  { to: '/yaml-to-json', label: 'YAML→JSON' },
  { to: '/xml-to-json', label: 'XML→JSON' },
]

function closeMenu() {
  menuOpen.value = false
}

onMounted(() => {
  initTheme()
})
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-logo" @click="closeMenu">
        <span class="logo-text">JSON Diff Tools</span>
      </router-link>
      <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
        <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
      <button class="nav-toggle" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
        <svg v-if="!menuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <ul class="nav-links" :class="{ open: menuOpen }">
        <li v-for="link in navLinks" :key="link.to">
          <router-link :to="link.to" @click="closeMenu">{{ link.label }}</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 200;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  gap: 0.5rem;
}

.nav-logo {
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  color: var(--accent);
  white-space: nowrap;
}

.logo-text {
  letter-spacing: -0.02em;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.theme-toggle:hover {
  color: var(--accent);
  background: var(--accent-light);
  border-color: var(--accent);
}

.nav-toggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--text);
  padding: 0.25rem;
}

.nav-links {
  display: flex;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-links a {
  display: block;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-links a:hover {
  color: var(--accent);
  background: var(--accent-light);
}

.nav-links a.router-link-exact-active {
  color: var(--accent);
  background: var(--accent-light);
  font-weight: 600;
}

@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 56px;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow);
    padding: 0.5rem;
    gap: 0.125rem;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-links a {
    padding: 0.75rem 1rem;
  }
}
</style>
