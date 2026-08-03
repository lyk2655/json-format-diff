<script setup>
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Contact Us</h1>
      <p class="subtitle">We'd love to hear from you</p>
    </header>

    <div class="content-panel">
      <p>Whether you have a feature request, found a bug, or just want to say hello, we welcome all feedback. Your input helps us improve our tools for the developer community.</p>

      <h2>Get in Touch</h2>
      <div class="contact-methods">
        <div class="contact-card">
          <div class="contact-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div class="contact-info">
            <h3>Email</h3>
            <p>For general inquiries and support</p>
            <a href="mailto:contact@jsondifftools.com">contact@jsondifftools.com</a>
          </div>
        </div>
      </div>

      <h2>What to Include</h2>
      <p>To help us assist you quickly, please include the following in your message:</p>
      <ul>
        <li>A clear description of your question or issue</li>
        <li>The specific tool you were using (JSON Diff, Formatter, Validator, etc.)</li>
        <li>Your browser and operating system (if reporting a bug)</li>
        <li>Any error messages you received</li>
        <li>Steps to reproduce the issue (if applicable)</li>
      </ul>

      <h2>Response Time</h2>
      <p>We typically respond within 1-2 business days. Thank you for your patience.</p>

      <h2>Feature Requests</h2>
      <p>Have an idea for a new JSON tool or feature? We'd love to hear it! Please describe the use case and what problem it would solve for you.</p>
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
.content-panel h2:first-child { margin-top: 1rem; }
.content-panel p { font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted); margin: 0 0 1rem; }
.content-panel ul { padding-left: 1.5rem; margin: 0 0 1rem; }
.content-panel li { font-size: 0.9375rem; line-height: 1.8; color: var(--text-muted); }
.content-panel a { color: var(--accent); text-decoration: none; }
.content-panel a:hover { text-decoration: underline; }
.contact-methods { display: flex; flex-direction: column; gap: 1rem; margin: 1.5rem 0; }
.contact-card { display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem; background: var(--surface-hover); border-radius: var(--radius-sm); border: 1px solid var(--border); }
.contact-icon { flex-shrink: 0; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--accent-light); color: var(--accent); border-radius: var(--radius-sm); }
.contact-info h3 { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 600; color: var(--text); }
.contact-info p { margin: 0 0 0.25rem; font-size: 0.8125rem; color: var(--text-muted); }
.contact-info a { font-size: 0.875rem; }
@media (max-width: 768px) { .page { padding: 1rem 1rem 3rem; } .page-header, .content-panel { padding: 1.25rem; } .contact-card { flex-direction: column; } }
</style>
