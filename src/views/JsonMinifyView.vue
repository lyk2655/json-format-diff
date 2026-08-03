<script setup>
import { ref } from 'vue'
import { parseJsonSafeExtract } from '../utils/jsonParse.js'

const input = ref('')
const output = ref('')
const error = ref('')
const inputSize = ref(0)
const outputSize = ref(0)
const repairedInfo = ref('')

let timer = null

function minify() {
  error.value = ''
  output.value = ''
  repairedInfo.value = ''
  if (!input.value.trim()) {
    inputSize.value = 0
    outputSize.value = 0
    return
  }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const { ok, value, error: err, repaired } = parseJsonSafeExtract(input.value)
    if (!ok) {
      error.value = err
      return
    }
    output.value = JSON.stringify(value)
    inputSize.value = new Blob([input.value]).size
    outputSize.value = new Blob([output.value]).size
    repairedInfo.value = repaired || ''
  }, 200)
}

function copyOutput() {
  if (!output.value) return
  navigator.clipboard?.writeText(output.value)
}

function loadExample() {
  input.value = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "skills": [
    "JavaScript",
    "Python",
    "Go"
  ],
  "address": {
    "city": "New York",
    "zip": "10001"
  }
}`
  minify()
}

function onInput() {
  inputSize.value = new Blob([input.value]).size
  minify()
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>JSON Minify Online</h1>
      <p class="subtitle">Compress JSON by removing whitespace and line breaks. Reduce file size for faster transmission and storage.</p>
    </header>

    <div class="panel">
      <div class="toolbar">
        <button class="btn-secondary" @click="loadExample">Load Example</button>
      </div>

      <div class="two-cols">
        <div class="field">
          <label>Input JSON <span class="size-info" v-if="inputSize">{{ inputSize }} bytes</span></label>
          <textarea v-model="input" placeholder="Paste your JSON here to minify..." rows="12" @input="onInput"></textarea>
        </div>
        <div class="field">
          <label>Minified Output <button v-if="output" class="btn-copy-small" @click="copyOutput">Copy</button> <span class="size-info" v-if="outputSize">{{ outputSize }} bytes</span></label>
          <pre class="output-box" v-if="output">{{ output }}</pre>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else class="placeholder-box">Minified JSON will appear here</div>
          <div v-if="output && inputSize" class="savings">Saved {{ (100 - (outputSize / inputSize * 100)).toFixed(1) }}% ({{ inputSize - outputSize }} bytes)</div>
        </div>
      </div>
      <div v-if="repairedInfo" class="hint">Auto-repaired: {{ repairedInfo }}</div>
    </div>

    <section class="seo-content">
      <h2>What is JSON Minify?</h2>
      <p>JSON Minify is the process of compressing JSON data by removing all unnecessary whitespace, line breaks, and indentation. The resulting minified JSON has the exact same data content but a smaller file size, making it ideal for network transmission, API responses, and storage where bandwidth and space matter.</p>

      <h2>How to Minify JSON Online</h2>
      <ol>
        <li>Paste your formatted JSON into the input text area</li>
        <li>The minified output appears instantly</li>
        <li>See the size reduction percentage and byte savings</li>
        <li>Click "Copy" to copy the minified JSON</li>
      </ol>

      <h2>Why Minify JSON?</h2>
      <ul>
        <li><strong>Faster loading:</strong> Smaller JSON files transfer faster over the network</li>
        <li><strong>Reduced bandwidth:</strong> Save on data transfer costs for high-traffic APIs</li>
        <li><strong>Lower storage:</strong> Use less disk space for JSON data files</li>
        <li><strong>Better performance:</strong> Browsers parse smaller JSON faster</li>
        <li><strong>Production optimization:</strong> Minified JSON is standard for production environments</li>
      </ul>

      <h2>JSON Minification vs Compression</h2>
      <p>JSON minification removes whitespace and formatting to reduce file size. This is different from gzip compression, which encodes the entire file. For best results, minify your JSON first, then enable gzip compression on your web server. The two techniques are complementary.</p>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Does minification change the data?</h3>
        <p>No. Minification only removes whitespace and line breaks. The actual data content remains identical. You can format it back at any time using a JSON Formatter.</p>

        <h3>Is this tool free?</h3>
        <p>Yes, completely free with no limits.</p>

        <h3>Is my data safe?</h3>
        <p>Yes. All processing happens in your browser. Your JSON is never sent to a server.</p>

        <h3>Can I minify JSON with comments?</h3>
        <p>Yes. Comments (<code>//</code> and <code>/* */</code>) are automatically stripped during minification, which is the standard behavior.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/">JSON Diff</router-link> — Compare two JSON files side by side</li>
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify minified JSON</li>
        <li><router-link to="/json-validator">JSON Validator</router-link> — Check JSON syntax</li>
        <li><router-link to="/json-to-yaml">JSON to YAML</router-link> — Convert JSON to YAML</li>
        <li><router-link to="/json-viewer">JSON Viewer</router-link> — View JSON in a tree</li>
        <li><router-link to="/yaml-to-json">YAML to JSON</router-link> — Convert YAML to JSON</li>
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
.size-info { font-size: 0.75rem; font-weight: 400; color: var(--text-subtle); }
textarea { width: 100%; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; line-height: 1.6; font-family: var(--font-mono); }
textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
.output-box { margin: 0; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.6; overflow: auto; max-height: 400px; white-space: pre-wrap; word-break: break-all; }
.placeholder-box { padding: 3rem 1.25rem; background: var(--surface-hover); border: 1px dashed var(--border); border-radius: var(--radius-sm); color: var(--text-subtle); font-size: 0.875rem; text-align: center; }
.btn-copy-small { padding: 0.15rem 0.5rem; font-size: 0.75rem; color: var(--text-muted); background: transparent; border: 1px solid var(--border); border-radius: 4px; }
.btn-copy-small:hover { color: var(--accent); border-color: var(--accent); }
.savings { margin-top: 0.5rem; font-size: 0.75rem; color: var(--add); font-weight: 500; }
.hint { font-size: 0.8125rem; color: var(--accent); margin-top: 0.75rem; }
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
.related-tools li { margin-bottom: 0.5rem; }
@media (max-width: 768px) { .page { padding: 1rem 1rem 3rem; } .page-header { padding: 1.5rem; } .panel { padding: 1.25rem; } .seo-content { padding: 1.25rem; } .two-cols { grid-template-columns: 1fr; } }
</style>
