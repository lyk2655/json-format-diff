<script setup>
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Privacy Policy</h1>
      <p class="subtitle">Last updated: August 2026</p>
    </header>

    <div class="content-panel">
      <h2>Overview</h2>
      <p>JSON Diff Tools ("we", "us", or "our") operates the website jsondifftools.com (the "Service"). This Privacy Policy explains how we handle your information when you use our Service.</p>

      <h2>Data We Do NOT Collect</h2>
      <p>Our core principle is privacy by design. All JSON processing — including diffing, formatting, validating, minifying, and converting — happens entirely in your browser using client-side JavaScript. We do NOT:</p>
      <ul>
        <li>Store or save any JSON data you enter into our tools</li>
        <li>Transmit your JSON data to any server</li>
        <li>Log or track the content of your JSON data</li>
        <li>Use cookies to store your data</li>
        <li>Require account registration or login</li>
      </ul>

      <h2>Analytics and Tracking</h2>
      <p>We may use privacy-friendly analytics to understand how visitors use our website (such as which pages are visited and general geographic data). This data is aggregated and anonymous — it is never linked to the JSON content you process.</p>

      <h2>Third-Party Services</h2>
      <p>Our website may use the following third-party services:</p>
      <ul>
        <li><strong>Google AdSense:</strong> May display ads on our website. Google uses cookies to serve ads based on your prior visits. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ad Settings</a>.</li>
        <li><strong>Google Fonts:</strong> We load web fonts from Google Fonts. Google may collect your IP address when fonts are loaded.</li>
      </ul>

      <h2>Cookies</h2>
      <p>Our Service does not use cookies for core functionality. Third-party services (such as Google AdSense) may use cookies as described above. You can control cookies through your browser settings.</p>

      <h2>Children's Privacy</h2>
      <p>Our Service is not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it.</p>

      <h2>Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date.</p>

      <h2>Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please visit our <router-link to="/contact">contact page</router-link>.</p>
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
