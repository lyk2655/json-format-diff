<script setup>
import { ref } from 'vue'
import { load as yamlLoad } from 'js-yaml'
import { formatJson } from '../utils/jsonParse.js'

const input = ref('')
const output = ref('')
const error = ref('')
let timer = null

function convert() {
  error.value = ''
  output.value = ''
  if (!input.value.trim()) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    try {
      const parsed = yamlLoad(input.value)
      if (parsed === undefined || parsed === null) {
        error.value = 'No valid YAML content found'
        return
      }
      output.value = formatJson(parsed)
    } catch (e) {
      error.value = `YAML parse error: ${e.message}`
    }
  }, 200)
}

function loadExample() {
  input.value = `name: YAML to JSON Example
version: 1.0.0
description: Convert YAML to JSON format
features:
  - fast conversion
  - syntax validation
  - copy to clipboard
config:
  theme: auto
  indent: 2
  debug: false
nested:
  server:
    host: localhost
    port: 8080
  database:
    name: mydb
    pool: 10`
  convert()
}

function copyToClipboard(text) {
  if (!text) return
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
    return
  }
  fallbackCopy(text)
}

function fallbackCopy(text) {
  const el = document.createElement('textarea')
  el.value = text
  el.style.position = 'fixed'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  try { document.execCommand('copy') } finally { document.body.removeChild(el) }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>YAML to JSON Converter - Convert YAML to JSON Online</h1>
      <p class="subtitle">Convert YAML data to JSON format instantly. Free online YAML to JSON converter with syntax validation and copy support.</p>
    </header>

    <main class="main">
      <section class="panel">
        <div class="toolbar">
          <button class="btn-tool" @click="loadExample">Load Example</button>
          <button class="btn-tool" @click="input = ''; output = ''; error = ''">Clear</button>
        </div>
        <div class="two-cols">
          <div class="field">
            <label>YAML Input</label>
            <textarea v-model="input" @input="convert" placeholder="key: value&#10;list:&#10;  - item1&#10;  - item2" rows="14" />
          </div>
          <div class="field">
            <div class="label-row">
              <label>JSON Output</label>
              <button v-if="output" class="btn-mini" @click="copyToClipboard(output)">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>
            </div>
            <div v-if="error" class="error">{{ error }}</div>
            <pre v-else-if="output" class="output-box">{{ output }}</pre>
            <div v-else class="empty-state"><p>Enter YAML to convert to JSON</p></div>
          </div>
        </div>
      </section>
    </main>

    <section class="seo-content">
      <h2>What is YAML to JSON Conversion?</h2>
      <p>YAML (YAML Ain't Markup Language) and JSON (JavaScript Object Notation) are both data serialization formats. YAML is known for its human-readable, indentation-based syntax, while JSON is more compact and widely used in APIs. Converting YAML to JSON is common when you need to use YAML configuration files in JSON-compatible applications.</p>

      <h2>How to Convert YAML to JSON</h2>
      <ol>
        <li>Paste your YAML data into the input box on the left</li>
        <li>The JSON output appears automatically on the right</li>
        <li>Click the "Copy" button to copy the JSON result</li>
        <li>Fix any syntax errors if the converter reports them</li>
      </ol>

      <h2>YAML vs JSON Comparison</h2>
      <table class="compare-table">
        <tr><th>Feature</th><th>YAML</th><th>JSON</th></tr>
        <tr><td>Syntax</td><td>Indentation-based</td><td>Braces and brackets</td></tr>
        <tr><td>Comments</td><td>Supported (#)</td><td>Not supported</td></tr>
        <tr><td>Quotes</td><td>Optional for strings</td><td>Required for strings</td></tr>
        <tr><td>Multi-line</td><td>Native support</td><td>Requires \n escape</td></tr>
        <tr><td>File size</td><td>Smaller (less punctuation)</td><td>Larger (more punctuation)</td></tr>
        <tr><td>API usage</td><td>Less common</td><td>Industry standard</td></tr>
      </table>

      <h2>Key Features</h2>
      <ul>
        <li><strong>Instant conversion:</strong> Real-time YAML to JSON as you type</li>
        <li><strong>Syntax validation:</strong> Catches YAML errors with clear messages</li>
        <li><strong>Nested structures:</strong> Handles complex nested YAML</li>
        <li><strong>Copy to clipboard:</strong> One-click copy of the JSON result</li>
        <li><strong>Privacy first:</strong> All processing in your browser</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Is this YAML to JSON converter free?</h3>
        <p>Yes, completely free with no limits.</p>
        <h3>Does it support YAML comments?</h3>
        <p>Yes, YAML comments (lines starting with #) are automatically handled and excluded from the JSON output.</p>
        <h3>Can I convert multi-document YAML?</h3>
        <p>Currently, single-document YAML is supported. For multi-document YAML (using ---), convert each document separately.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/json-to-yaml">JSON to YAML Converter</router-link> — Convert JSON to YAML format</li>
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify JSON data</li>
        <li><router-link to="/json-validator">JSON Validator</router-link> — Validate JSON syntax</li>
        <li><router-link to="/json-viewer">JSON Viewer</router-link> — View JSON as a tree</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; padding: 2rem 1.5rem 4rem; max-width: 1280px; margin: 0 auto; }
.page-header { margin-bottom: 2.5rem; padding: 2rem; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow); border: 1px solid var(--border-light); }
.page-header h1 { font-size: 1.875rem; font-weight: 700; margin: 0 0 0.5rem; letter-spacing: -0.03em; color: var(--text); }
.subtitle { color: var(--text-muted); font-size: 0.9375rem; line-height: 1.5; margin: 0; }
.panel { padding: 2rem; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow); border: 1px solid var(--border-light); }
.toolbar { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
.btn-tool { padding: 0.4rem 0.75rem; font-size: 0.8125rem; color: var(--text-muted); background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); transition: all 0.2s; cursor: pointer; }
.btn-tool:hover { color: var(--accent); background: var(--accent-light); border-color: var(--accent); }
.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.field { margin-bottom: 1.25rem; }
.field label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; }
.label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.btn-mini { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.5rem; font-size: 0.75rem; color: var(--text-muted); background: transparent; border: 1px solid transparent; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
.btn-mini:hover { color: var(--accent); background: var(--accent-light); border-color: var(--border); }
textarea { width: 100%; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; line-height: 1.6; resize: vertical; }
textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
.error { padding: 1rem 1.25rem; background: var(--remove-bg); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: var(--remove); font-size: 0.9rem; }
.output-box { margin: 0; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.6; overflow: auto; max-height: 60vh; white-space: pre-wrap; word-break: break-all; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1.5rem; text-align: center; color: var(--text-subtle); }
.compare-table { width: 100%; border-collapse: collapse; margin: 0 0 1rem; font-size: 0.875rem; }
.compare-table th { text-align: left; padding: 0.5rem 0.75rem; background: var(--surface-hover); border: 1px solid var(--border); font-weight: 600; color: var(--text); }
.compare-table td { padding: 0.5rem 0.75rem; border: 1px solid var(--border); color: var(--text-muted); }
.seo-content { margin-top: 3rem; padding: 2rem; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow); border: 1px solid var(--border-light); }
.seo-content h2 { font-size: 1.375rem; font-weight: 700; color: var(--text); margin: 2rem 0 0.75rem; letter-spacing: -0.02em; }
.seo-content h2:first-child { margin-top: 0; }
.seo-content h3 { font-size: 1.0625rem; font-weight: 600; color: var(--text); margin: 1.25rem 0 0.5rem; }
.seo-content p { font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted); margin: 0 0 0.75rem; }
.seo-content ul, .seo-content ol { font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted); padding-left: 1.5rem; margin: 0 0 1rem; }
.seo-content li { margin-bottom: 0.35rem; }
.seo-content a { color: var(--accent); text-decoration: none; }
.seo-content a:hover { text-decoration: underline; }
.related-tools li { margin-bottom: 0.5rem; }
@media (max-width: 768px) { .page { padding: 1rem 1rem 3rem; } .page-header, .panel, .seo-content { padding: 1.25rem; } .two-cols { grid-template-columns: 1fr; } }
</style>
