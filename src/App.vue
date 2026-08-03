<script setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="app-layout">
    <NavBar />
    <router-view />
    <footer class="site-footer">
      <div class="footer-content">
        <p>&copy; {{ new Date().getFullYear() }} JSON Diff Tools. All rights reserved.</p>
        <nav class="footer-nav">
          <router-link to="/about">About</router-link>
          <router-link to="/privacy-policy">Privacy Policy</router-link>
          <router-link to="/contact">Contact</router-link>
        </nav>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-footer {
  margin-top: auto;
  padding: 2rem 1.5rem;
  background: var(--surface);
  border-top: 1px solid var(--border-light);
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-content p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.footer-nav {
  display: flex;
  gap: 1.5rem;
}

.footer-nav a {
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-nav a:hover {
  color: var(--accent);
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
