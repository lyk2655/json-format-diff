<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)

const navLinks = [
  { to: '/', label: 'JSON Diff' },
  { to: '/json-formatter', label: 'JSON Formatter' },
  { to: '/json-validator', label: 'JSON Validator' },
  { to: '/json-minify', label: 'JSON Minify' },
  { to: '/json-to-yaml', label: 'JSON to YAML' },
]

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-logo" @click="closeMenu">
        <span class="logo-text">JSON Diff Tools</span>
      </router-link>
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
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
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
