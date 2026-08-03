<script setup>
import { ref } from 'vue'
import { parseJsonSafe } from '../utils/jsonParse.js'

const input = ref('')
const parsed = ref(null)
const error = ref('')
const repaired = ref('')
let timer = null

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderTree(data, depth = 0) {
  if (data === null) return '<span class="tree-null">null</span>'
  if (typeof data === 'boolean') return `<span class="tree-bool">${data}</span>`
  if (typeof data === 'number') return `<span class="tree-num">${data}</span>`
  if (typeof data === 'string') return `<span class="tree-str">"${escapeHtml(data)}"</span>`

  const isObj = !Array.isArray(data)
  const entries = isObj ? Object.entries(data) : data.map((v, i) => [i, v])
  const openBracket = isObj ? '{' : '['
  const closeBracket = isObj ? '}' : ']'
  const summary = `${entries.length} ${isObj ? 'key' : 'item'}${entries.length !== 1 ? 's' : ''}`

  if (entries.length === 0) return `<span class="tree-bracket">${openBracket}${closeBracket}</span>`

  let html = `<span class="tree-bracket">${openBracket}</span>`
  html += `<span class="tree-summary">${summary}</span>`
  html += `<div class="tree-node">`
  for (const [key, val] of entries) {
    const keyStr = isObj ? `<span class="tree-key">"${escapeHtml(String(key))}"</span>: ` : `<span class="tree-key">${key}</span>: `
    html += `<div>${keyStr}${renderTree(val, depth + 1)}</div>`
  }
  html += `</div>`
  html += `<span class="tree-bracket">${closeBracket}</span>`
  return html
}

function parse() {
  error.value = ''
  parsed.value = null
  repaired.value = ''
  if (!input.value.trim()) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const result = parseJsonSafe(input.value)
    if (result.ok) {
      parsed.value = result.value
      if (result.repaired) repaired.value = result.repaired
    } else {
      error.value = result.error
    }
  }, 200)
}

function loadExample() {
  input.value = JSON.stringify({
    "name": "JSON Viewer Example",
    "version": "1.0.0",
    "features": ["tree view", "collapsible", "syntax highlighting"],
    "config": {
      "theme": "auto",
      "indent": 2,
      "debug": false
    },
    "metadata": {
      "author": "JSON Diff Tools",
      "license": "MIT",
      "tags": ["json", "viewer", "tree"]
    }
  }, null, 2)
  parse()
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
      <h1>JSON Viewer - Online JSON Tree Viewer</h1>
      <p class="subtitle">Visualize JSON data in an interactive, collapsible tree structure. Supports nested objects, arrays, and syntax highlighting.</p>
    </header>

    <main class="main">
      <section class="panel">
        <div class="toolbar">
          <button class="btn-tool" @click="loadExample">Load Example</button>
          <button class="btn-tool" @click="input = ''; parsed = null; error = ''">Clear</button>
        </div>
        <div class="two-cols">
          <div class="field">
            <label>JSON Input</label>
            <textarea v-model="input" @input="parse" placeholder='Paste JSON here...' rows="14" />
          </div>
          <div class="field">
            <label>Tree View</label>
            <div v-if="error" class="error">{{ error }}</div>
            <div v-else-if="parsed === null" class="empty-state">
              <p>Enter JSON to see the tree view</p>
            </div>
            <div v-else class="tree-view" v-html="renderTree(parsed)"></div>
          </div>
        </div>
        <div v-if="repaired" class="hint">Auto-repaired: {{ repaired }}</div>
      </section>
    </main>

    <section class="seo-content">
      <h2>What is a JSON Viewer?</h2>
      <p>A JSON Viewer is a tool that transforms raw JSON text into a structured, interactive tree view. Instead of reading through walls of text, you can expand and collapse nodes to navigate complex nested data structures. This makes it much easier to understand the shape and content of your JSON data at a glance.</p>

      <h2>How to Use the JSON Viewer</h2>
      <ol>
        <li>Paste your JSON data into the input box on the left</li>
        <li>The tree view appears automatically on the right</li>
        <li>Click on any node to expand or collapse it</li>
        <li>Different value types are color-coded: strings in teal, numbers in blue, booleans in purple, null in gray</li>
      </ol>

      <h2>Key Features</h2>
      <ul>
        <li><strong>Interactive tree:</strong> Click to expand/collapse any object or array node</li>
        <li><strong>Syntax highlighting:</strong> Color-coded values for easy identification</li>
        <li><strong>Auto-repair:</strong> Fixes common JSON errors automatically</li>
        <li><strong>Nested support:</strong> Handles deeply nested objects and arrays</li>
        <li><strong>Privacy first:</strong> All processing happens in your browser</li>
      </ul>

      <h2>JSON Viewer Use Cases</h2>
      <ul>
        <li><strong>API debugging:</strong> Inspect complex API response structures</li>
        <li><strong>Config files:</strong> Navigate large configuration files</li>
        <li><strong>Data exploration:</strong> Understand unfamiliar JSON data structures</li>
        <li><strong>Education:</strong> Learn JSON structure visually</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Is this JSON Viewer free?</h3>
        <p>Yes, completely free with no limits or sign-up required.</p>
        <h3>Can I view very large JSON files?</h3>
        <p>Yes, the tree view handles large JSON files efficiently. Collapse nodes you don't need to keep the view clean.</p>
        <h3>Does it work with JSON arrays?</h3>
        <p>Yes, arrays are displayed with index numbers and can be collapsed just like objects.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/">JSON Diff</router-link> — Compare two JSON objects</li>
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify JSON data</li>
        <li><router-link to="/json-validator">JSON Validator</router-link> — Check JSON for errors</li>
        <li><router-link to="/json-minify">JSON Minify</router-link> — Compress JSON</li>
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
textarea { width: 100%; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; line-height: 1.6; resize: vertical; }
textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
.hint { font-size: 0.8125rem; color: var(--accent); margin-top: 0.5rem; }
.error { padding: 1rem 1.25rem; background: var(--remove-bg); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: var(--remove); font-size: 0.9rem; }
.tree-view { font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.6; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: auto; max-height: 60vh; }
.tree-view :deep(.tree-node) { padding-left: 1.5rem; }
.tree-view :deep(.tree-key) { color: var(--json-key); }
.tree-view :deep(.tree-null) { color: var(--json-null); }
.tree-view :deep(.tree-bool) { color: var(--json-bool); }
.tree-view :deep(.tree-num) { color: var(--json-num); }
.tree-view :deep(.tree-str) { color: var(--json-str); }
.tree-view :deep(.tree-bracket) { color: var(--text-muted); }
.tree-view :deep(.tree-summary) { color: var(--text-subtle); font-style: italic; margin-left: 0.25rem; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1.5rem; text-align: center; color: var(--text-subtle); }
.seo-content { margin-top: 3rem; padding: 2rem; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow); border: 1px solid var(--border-light); }
.seo-content h2 { font-size: 1.375rem; font-weight: 700; color: var(--text); margin: 2rem 0 0.75rem; letter-spacing: -0.02em; }
.seo-content h2:first-child { margin-top: 0; }
.seo-content h3 { font-size: 1.0625rem; font-weight: 600; color: var(--text); margin: 1.25rem 0 0.5rem; }
.seo-content p { font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted); margin: 0 0 0.75rem; }
.seo-content ul, .seo-content ol { font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted); padding-left: 1.5rem; margin: 0 0 1rem; }
.seo-content li { margin-bottom: 0.35rem; }
.seo-content code { font-family: var(--font-mono); font-size: 0.85em; background: var(--accent-light); color: var(--accent); padding: 0.15em 0.4em; border-radius: 4px; }
.seo-content a { color: var(--accent); text-decoration: none; }
.seo-content a:hover { text-decoration: underline; }
.related-tools li { margin-bottom: 0.5rem; }
@media (max-width: 768px) { .page { padding: 1rem 1rem 3rem; } .page-header, .panel, .seo-content { padding: 1.25rem; } .two-cols { grid-template-columns: 1fr; } }
</style>
