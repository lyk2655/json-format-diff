<script setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="app-layout">
    <NavBar />
    <router-view />
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <router-link to="/" class="footer-logo">JSON Diff Tools</router-link>
          <p class="footer-tagline">Compare, format, validate, and convert JSON — all in your browser.</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>Tools</h4>
            <nav>
              <router-link to="/">JSON Diff</router-link>
              <router-link to="/json-formatter">JSON Formatter</router-link>
              <router-link to="/json-validator">JSON Validator</router-link>
              <router-link to="/json-minify">JSON Minify</router-link>
              <router-link to="/json-to-yaml">JSON to YAML</router-link>
            </nav>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <nav>
              <router-link to="/about">About</router-link>
              <router-link to="/contact">Contact</router-link>
            </nav>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <nav>
              <router-link to="/privacy-policy">Privacy Policy</router-link>
              <router-link to="/terms-of-service">Terms of Service</router-link>
            </nav>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} JSON Diff Tools. All rights reserved.</p>
        <p class="footer-note">All data processing happens locally in your browser. Your data never leaves your device.</p>
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
  padding: 2.5rem 1.5rem 1.5rem;
  background: var(--surface);
  border-top: 1px solid var(--border-light);
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-light);
}

.footer-brand {
  max-width: 300px;
}

.footer-logo {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--accent);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.footer-tagline {
  margin: 0.5rem 0 0;
  font-size: 0.8125rem;
  color: var(--text-muted);
  line-height: 1.6;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.footer-col h4 {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-col nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-col a {
  font-size: 0.8125rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-col a:hover {
  color: var(--accent);
}

.footer-bottom {
  max-width: 1280px;
  margin: 1.5rem auto 0;
  text-align: center;
}

.footer-bottom p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-subtle);
}

.footer-note {
  margin-top: 0.25rem !important;
  font-style: italic;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .footer-links {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .footer-brand {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .footer-links {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
