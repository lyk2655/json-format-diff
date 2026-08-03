<script setup>
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Terms of Service</h1>
      <p class="subtitle">Last updated: August 3, 2026</p>
    </header>

    <section class="content">
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using JSON Diff Tools (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>

      <h2>2. Description of Service</h2>
      <p>JSON Diff Tools provides free, browser-based JSON utility tools including JSON diff, formatter, validator, minifier, and converter. All data processing occurs locally in your browser. We do not store, transmit, or have access to your data.</p>

      <h2>3. No Warranty</h2>
      <p>The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that the Service will be error-free, secure, or available at all times.</p>

      <h2>4. Limitation of Liability</h2>
      <p>In no event shall JSON Diff Tools be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Since all processing happens in your browser, we have no access to your data and cannot be held responsible for data loss or corruption.</p>

      <h2>5. Privacy</h2>
      <p>Your privacy is our priority. All JSON data you input is processed entirely in your browser and is never sent to any server. Please review our <router-link to="/privacy-policy">Privacy Policy</router-link> for more information.</p>

      <h2>6. Acceptable Use</h2>
      <p>You agree to use the Service only for lawful purposes. You may not use the Service to process data that you do not have the right to process, or in violation of any applicable law or regulation.</p>

      <h2>7. Intellectual Property</h2>
      <p>The Service, including its design, code, and content, is owned by JSON Diff Tools. The tools are provided for your use, but the underlying software and content remain our property.</p>

      <h2>8. Third-Party Links</h2>
      <p>The Service may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of any third-party websites.</p>

      <h2>9. Changes to Terms</h2>
      <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting the updated terms on this page. Continued use of the Service after changes constitutes acceptance of the new terms.</p>

      <h2>10. Termination</h2>
      <p>You may stop using the Service at any time. Since the Service runs entirely in your browser, there is no account to terminate.</p>

      <h2>11. Contact</h2>
      <p>If you have any questions about these Terms of Service, please <router-link to="/contact">contact us</router-link>.</p>
    </section>
  </div>
</template>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

.page-header {
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: var(--text);
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.content {
  padding: 2rem;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
}

.content h2 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text);
  margin: 1.75rem 0 0.5rem;
}

.content h2:first-child {
  margin-top: 0;
}

.content p {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--text-muted);
  margin: 0 0 0.75rem;
}

.content a {
  color: var(--accent);
  text-decoration: none;
}

.content a:hover {
  text-decoration: underline;
}
</style>
