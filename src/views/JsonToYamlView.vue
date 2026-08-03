<script setup>
import { ref } from 'vue'
import { parseJsonSafeExtract } from '../utils/jsonParse.js'

const input = ref('')
const output = ref('')
const error = ref('')

let timer = null

function jsonToYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent)
  if (obj === null) return 'null'
  if (obj === undefined) return 'null'
  if (typeof obj === 'boolean') return obj ? 'true' : 'false'
  if (typeof obj === 'number') return String(obj)
  if (typeof obj === 'string') {
    if (obj === '') return '""'
    if (/^[\d.+-]/.test(obj) || /[:#{}\[\],&*?|<>=!%@`"'\n]/.test(obj) || obj === 'true' || obj === 'false' || obj === 'null' || obj === '~') {
      return JSON.stringify(obj)
    }
    return obj
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map(item => pad + '- ' + jsonToYaml(item, indent + 1).replace(/^  /, '')).join('\n')
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (keys.length === 0) return '{}'
    return keys.map(key => {
      const val = obj[key]
      const yamlKey = /^[a-zA-Z0-9_-]+$/.test(key) ? key : JSON.stringify(key)
      if (val !== null && typeof val === 'object' && Object.keys(val).length > 0) {
        return pad + yamlKey + ':\n' + jsonToYaml(val, indent + 1)
      }
      if (Array.isArray(val) && val.length > 0) {
        return pad + yamlKey + ':\n' + jsonToYaml(val, indent + 1)
      }
      return pad + yamlKey + ': ' + jsonToYaml(val, indent + 1)
    }).join('\n')
  }
  return String(obj)
}

function convert() {
  error.value = ''
  output.value = ''
  if (!input.value.trim()) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const { ok, value, error: err } = parseJsonSafeExtract(input.value)
    if (!ok) {
      error.value = err
      return
    }
    try {
      output.value = jsonToYaml(value)
    } catch (e) {
      error.value = `Conversion error: ${e.message}`
    }
  }, 200)
}

function copyOutput() {
  if (!output.value) return
  navigator.clipboard?.writeText(output.value)
}

function loadExample() {
  input.value = '{"server":{"host":"localhost","port":8080,"ssl":false},"database":{"name":"myapp","pool_size":10,"timeout":30},"features":["auth","logging","cache"],"version":"1.0.0"}'
  convert()
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>JSON to YAML Converter</h1>
      <p class="subtitle">Convert JSON data to YAML format instantly. Free online converter with proper indentation and type handling.</p>
    </header>

    <div class="panel">
      <div class="toolbar">
        <button class="btn-secondary" @click="loadExample">Load Example</button>
      </div>

      <div class="two-cols">
        <div class="field">
          <label>Input JSON</label>
          <textarea v-model="input" placeholder="Paste your JSON here..." rows="12" @input="convert"></textarea>
        </div>
        <div class="field">
          <label>YAML Output <button v-if="output" class="btn-copy-small" @click="copyOutput">Copy</button></label>
          <pre class="output-box" v-if="output">{{ output }}</pre>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else class="placeholder-box">YAML output will appear here</div>
        </div>
      </div>
    </div>

    <section class="seo-content">
      <h2>What is JSON to YAML Converter?</h2>
      <p>A JSON to YAML Converter transforms JSON (JavaScript Object Notation) data into YAML (YAML Ain't Markup Language) format. YAML is a human-friendly data serialization standard that uses indentation for structure instead of braces and brackets, making it more readable for configuration files and data documents.</p>

      <h2>How to Convert JSON to YAML</h2>
      <ol>
        <li>Paste your JSON data into the input text area</li>
        <li>The YAML output is generated instantly</li>
        <li>Review the converted YAML in the output area</li>
        <li>Click "Copy" to copy the YAML to your clipboard</li>
      </ol>

      <h2>JSON vs YAML Comparison</h2>
      <table class="comparison-table">
        <thead>
          <tr><th>Feature</th><th>JSON</th><th>YAML</th></tr>
        </thead>
        <tbody>
          <tr><td>Structure</td><td>Braces <code>{}</code> and brackets <code>[]</code></td><td>Indentation-based</td></tr>
          <tr><td>Quotes</td><td>Double quotes required for strings</td><td>Quotes optional for simple strings</td></tr>
          <tr><td>Comments</td><td>Not supported</td><td>Supported with <code>#</code></td></tr>
          <tr><td>Readability</td><td>Compact but verbose</td><td>More human-readable</td></tr>
          <tr><td>Use case</td><td>APIs, data exchange</td><td>Configuration files</td></tr>
          <tr><td>File size</td><td>Larger</td><td>Smaller (no braces/brackets)</td></tr>
        </tbody>
      </table>

      <h2>When to Use YAML Instead of JSON</h2>
      <ul>
        <li><strong>Configuration files:</strong> Docker Compose, Kubernetes, CI/CD pipelines</li>
        <li><strong>Human-edited data:</strong> YAML's indentation-based syntax is easier to read and edit</li>
        <li><strong>Documentation:</strong> YAML is more readable in documentation and tutorials</li>
        <li><strong>DevOps tools:</strong> Ansible, Helm, GitHub Actions all use YAML</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Is this converter free?</h3>
        <p>Yes, completely free with no limits or sign-up required.</p>

        <h3>Does it handle nested objects and arrays?</h3>
        <p>Yes. The converter properly handles deeply nested JSON structures, arrays, and mixed types.</p>

        <h3>Are special characters handled correctly?</h3>
        <p>Yes. Strings containing special YAML characters (<code>: # {} [] & * ? | </code> etc.) are automatically quoted in the output.</p>

        <h3>Is my data safe?</h3>
        <p>Yes. All conversion happens in your browser. Your data is never sent to a server.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/">JSON Diff</router-link> — Compare two JSON files side by side</li>
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify JSON data</li>
        <li><router-link to="/json-validator">JSON Validator</router-link> — Check JSON syntax</li>
        <li><router-link to="/json-minify">JSON Minifier</router-link> — Compress JSON to one line</li>
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
.toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
.btn-secondary { padding: 0.375rem 0.875rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.8125rem; transition: all 0.2s; }
.btn-secondary:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-light); }
.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.field { margin-bottom: 1.25rem; }
.field label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; }
textarea { width: 100%; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; line-height: 1.6; font-family: var(--font-mono); }
textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
.output-box { margin: 0; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.6; overflow: auto; max-height: 400px; white-space: pre-wrap; word-break: break-all; }
.placeholder-box { padding: 3rem 1.25rem; background: var(--surface-hover); border: 1px dashed var(--border); border-radius: var(--radius-sm); color: var(--text-subtle); font-size: 0.875rem; text-align: center; }
.btn-copy-small { padding: 0.15rem 0.5rem; font-size: 0.75rem; color: var(--text-muted); background: transparent; border: 1px solid var(--border); border-radius: 4px; }
.btn-copy-small:hover { color: var(--accent); border-color: var(--accent); }
.error { padding: 1rem 1.25rem; background: var(--remove-bg); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: #dc2626; font-size: 0.9rem; }
.seo-content { margin-top: 3rem; padding: 2rem; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow); border: 1px solid var(--border-light); }
.seo-content h2 { font-size: 1.375rem; font-weight: 700; color: var(--text); margin: 2rem 0 0.75rem; }
.seo-content h2:first-child { margin-top: 0; }
.seo-content h3 { font-size: 1.0625rem; font-weight: 600; color: var(--text); margin: 1.25rem 0 0.5rem; }
.seo-content p { font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted); margin: 0 0 0.75rem; }
.seo-content ul, .seo-content ol { font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted); padding-left: 1.5rem; margin: 0 0 1rem; }
.seo-content li { margin-bottom: 0.35rem; }
.seo-content code { font-family: var(--font-mono); font-size: 0.85em; background: var(--accent-light); color: var(--accent); padding: 0.15em 0.4em; border-radius: 4px; }
.seo-content a { color: var(--accent); text-decoration: none; }
.seo-content a:hover { text-decoration: underline; }
.comparison-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
.comparison-table th, .comparison-table td { padding: 0.625rem 0.75rem; border: 1px solid var(--border); text-align: left; }
.comparison-table th { background: var(--surface-hover); font-weight: 600; color: var(--text); }
.comparison-table td { color: var(--text-muted); }
.related-tools li { margin-bottom: 0.5rem; }
@media (max-width: 768px) { .page { padding: 1rem 1rem 3rem; } .page-header { padding: 1.5rem; } .panel { padding: 1.25rem; } .seo-content { padding: 1.25rem; } .two-cols { grid-template-columns: 1fr; } }
</style>
