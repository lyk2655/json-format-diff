<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <div class="not-found-links">
        <button class="btn-primary" @click="goHome">Back to Home</button>
      </div>
      <div class="not-found-tools">
        <p>Or try one of our tools:</p>
        <nav>
          <router-link to="/json-formatter">JSON Formatter</router-link>
          <router-link to="/json-validator">JSON Validator</router-link>
          <router-link to="/json-minify">JSON Minifier</router-link>
          <router-link to="/json-viewer">JSON Viewer</router-link>
          <router-link to="/json-to-yaml">JSON to YAML</router-link>
          <router-link to="/yaml-to-json">YAML to JSON</router-link>
          <router-link to="/xml-to-json">XML to JSON</router-link>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.not-found-content {
  text-align: center;
  max-width: 480px;
}

.not-found-content h1 {
  font-size: 5rem;
  font-weight: 800;
  color: var(--accent);
  margin: 0;
  line-height: 1;
  letter-spacing: -0.05em;
}

.not-found-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin: 0.5rem 0 1rem;
}

.not-found-content p {
  color: var(--text-muted);
  font-size: 0.9375rem;
  margin: 0 0 1.5rem;
}

.btn-primary {
  padding: 0.625rem 1.5rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
  color: white;
  font-size: 0.9375rem;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.not-found-tools {
  margin-top: 2rem;
}

.not-found-tools p {
  font-size: 0.8125rem;
  margin-bottom: 0.75rem;
}

.not-found-tools nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.not-found-tools a {
  font-size: 0.8125rem;
  color: var(--accent);
  text-decoration: none;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.not-found-tools a:hover {
  background: var(--accent-light);
  border-color: var(--accent);
}
</style>
