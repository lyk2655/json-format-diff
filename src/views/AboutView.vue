<script setup>
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>About JSON Diff Tools</h1>
      <p class="subtitle">Free online JSON utilities for developers</p>
    </header>

    <div class="content-panel">
      <p>JSON Diff Tools is a free online suite of JSON utilities designed to help developers work with JSON data more efficiently. Our tools run entirely in your browser, ensuring your data never leaves your device.</p>

      <h2>Our Tools</h2>
      <ul>
        <li><router-link to="/">JSON Diff</router-link> — Compare two JSON objects side by side with visual highlighting</li>
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify and pretty-print JSON data</li>
        <li><router-link to="/json-validator">JSON Validator</router-link> — Validate JSON syntax and find errors</li>
        <li><router-link to="/json-minify">JSON Minifier</router-link> — Compress JSON to reduce file size</li>
        <li><router-link to="/json-to-yaml">JSON to YAML Converter</router-link> — Convert JSON to YAML format</li>
      </ul>

      <h2>Privacy First</h2>
      <p>All our tools process data locally in your browser using JavaScript. We do not store, transmit, or log any data you enter into our tools. This means you can safely use our tools with sensitive data, including API keys, credentials, and personal information.</p>

      <h2>Open Standards</h2>
      <p>Our tools follow JSON specification (RFC 8259) and support common extensions like JSONC (JSON with comments). We believe in using open standards and providing tools that work for everyone, free of charge.</p>

      <h2>Contact Us</h2>
      <p>Have a feature request, bug report, or question? Visit our <router-link to="/contact">contact page</router-link> to get in touch. We welcome all feedback and suggestions.</p>
    </div>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; padding: 2rem 1.5rem 4rem; max-width: 896px; margin: 0 auto; }
.page-header { margin-bottom: 2.5rem; padding: 2rem; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow); border: 1px solid var(--border-light); }
.page-header h1 { font-size: 1.875rem; font-weight: 700; margin: 0 0 0.5rem; letter-spacing: -0.03em; color: var(--text); }
.subtitle { color: var(--text-muted); font-size: 0.9375rem; margin: 0; }
.content-panel { padding: 2rem; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow); border: 1px solid var(--border-light); }
.content-panel h2 { font-size: 1.375rem; font-weight: 700; color: var(--text); margin: 2rem 0 0.75rem; }
.content-panel h2:first-child { margin-top: 0; }
.content-panel p { font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted); margin: 0 0 1rem; }
.content-panel ul { padding-left: 1.5rem; margin: 0 0 1rem; }
.content-panel li { font-size: 0.9375rem; line-height: 1.8; color: var(--text-muted); }
.content-panel a { color: var(--accent); text-decoration: none; }
.content-panel a:hover { text-decoration: underline; }
@media (max-width: 768px) { .page { padding: 1rem 1rem 3rem; } .page-header, .content-panel { padding: 1.25rem; } }
</style>
