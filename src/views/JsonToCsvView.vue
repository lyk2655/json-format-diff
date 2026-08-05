<script setup>
import { ref } from 'vue'
import { parseJsonSafeExtract } from '../utils/jsonParse.js'

const input = ref('')
const output = ref('')
const error = ref('')
const repairedInfo = ref('')
const delimiter = ref(',')

let timer = null

function csvEscape(v, delim) {
  if (v === null || v === undefined) return ''
  let s
  if (typeof v === 'object') s = JSON.stringify(v)
  else s = String(v)
  if (s.includes(delim) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function jsonToCsv(data, delim) {
  let rows = []
  if (Array.isArray(data)) {
    if (data.length === 0) return ''
    const allObjects = data.every(
      (item) => item !== null && typeof item === 'object' && !Array.isArray(item)
    )
    if (allObjects) {
      const headers = []
      const seen = new Set()
      for (const item of data) {
        for (const k of Object.keys(item)) {
          if (!seen.has(k)) {
            seen.add(k)
            headers.push(k)
          }
        }
      }
      rows.push(headers)
      for (const item of data) {
        rows.push(headers.map((h) => item[h]))
      }
    } else {
      for (const item of data) {
        if (Array.isArray(item)) rows.push(item)
        else rows.push([item])
      }
    }
  } else if (data !== null && typeof data === 'object') {
    const headers = Object.keys(data)
    rows.push(headers)
    rows.push(headers.map((h) => data[h]))
  } else {
    return String(data)
  }
  return rows.map((r) => r.map((cell) => csvEscape(cell, delim)).join(delim)).join('\n')
}

function convert() {
  error.value = ''
  output.value = ''
  repairedInfo.value = ''
  if (!input.value.trim()) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const { ok, value, error: err, repaired } = parseJsonSafeExtract(input.value)
    if (!ok) {
      error.value = err
      return
    }
    try {
      output.value = jsonToCsv(value, delimiter.value)
      repairedInfo.value = repaired || ''
    } catch (e) {
      error.value = `Conversion error: ${e.message}`
    }
  }, 200)
}

function downloadCsv() {
  if (!output.value) return
  const blob = new Blob([output.value], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function copyOutput() {
  if (!output.value) return
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(output.value)
  } else {
    const el = document.createElement('textarea')
    el.value = output.value
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}

function loadExample() {
  input.value = '[\n  { "id": 1, "name": "Alice", "email": "alice@example.com", "active": true },\n  { "id": 2, "name": "Bob", "email": "bob@example.com", "active": false },\n  { "id": 3, "name": "Carol", "email": "carol@example.com", "active": true }\n]'
  convert()
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>JSON to CSV Converter</h1>
      <p class="subtitle">Convert JSON to CSV online for free. Auto-repairs broken JSON, handles nested objects and arrays, and exports with one click.</p>
    </header>

    <div class="panel">
      <div class="toolbar">
        <button class="btn-secondary" type="button" @click="loadExample">Load Example</button>
        <label class="delimiter-select">
          <span>Delimiter</span>
          <select v-model="delimiter" @change="convert">
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
          </select>
        </label>
        <button class="btn-secondary" type="button" v-if="output" @click="copyOutput">Copy</button>
        <button class="btn-secondary" type="button" v-if="output" @click="downloadCsv">Download CSV</button>
      </div>

      <div class="two-cols">
        <div class="field">
          <label>Input JSON</label>
          <textarea
            v-model="input"
            placeholder="{
  &quot;users&quot;: [
    { &quot;id&quot;: 1, &quot;name&quot;: 'Alice', &quot;active&quot;: true, },
    { &quot;id&quot;: 2, &quot;name&quot;: 'Bob', &quot;active&quot;: false, }
  ]
}"
            rows="12"
            @input="convert"
          ></textarea>
        </div>
        <div class="field">
          <label>CSV Output</label>
          <pre class="output-box" v-if="output">{{ output }}</pre>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else class="placeholder-box">CSV output will appear here</div>
        </div>
      </div>
      <div v-if="repairedInfo" class="hint">Auto-repaired: {{ repairedInfo }}</div>
    </div>

    <section class="seo-content">
      <h2>What is a JSON to CSV Converter?</h2>
      <p>A JSON to CSV converter transforms JSON (JavaScript Object Notation) data into CSV (Comma-Separated Values) format. CSV is the simplest tabular format — every row is a record and every column is a field — which makes it the standard for spreadsheets, databases, and data analysis tools like Excel and Google Sheets. This tool converts JSON arrays of objects into clean CSV tables in your browser, with no upload and no sign-up.</p>

      <h2>How to Convert JSON to CSV</h2>
      <ol>
        <li>Paste your JSON into the input box (an array of objects works best)</li>
        <li>The CSV output is generated instantly as you type</li>
        <li>Pick a delimiter — comma for Excel, semicolon for European locales, or tab for TSV</li>
        <li>Click <strong>Copy</strong> to copy the result, or <strong>Download CSV</strong> to save a file</li>
        <li>Open the file in Excel, Google Sheets, or any spreadsheet app</li>
      </ol>

      <h2>Handling Nested Objects and Arrays</h2>
      <p>JSON often contains nested structures. When a value is itself an object or array, this converter serializes it into a single cell as a JSON string, so the row count and column count stay predictable. For flat JSON (an array of simple objects) the result is a clean table with one column per key. Columns are derived from all keys across every object, so missing fields in some rows simply appear as empty cells.</p>

      <h2>Broken JSON? We Auto-Repair It</h2>
      <p>Other converters throw an error the moment your JSON has a single-quoted string, an unquoted key, a trailing comma, or a stray character. This tool auto-repairs those common mistakes before converting — paste messy JSON and get CSV out, no error screens.</p>

      <h2>Common Use Cases</h2>
      <ul>
        <li><strong>Export API responses:</strong> Turn a JSON API payload into a spreadsheet for sharing with non-developers</li>
        <li><strong>Data analysis:</strong> Load JSON logs or records into Excel or Google Sheets</li>
        <li><strong>Database import:</strong> Convert JSON exports into CSV for bulk database inserts</li>
        <li><strong>Reporting:</strong> Flatten JSON metrics into tabular reports</li>
        <li><strong>Data migration:</strong> Move JSON data between systems that only accept CSV</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Is this JSON to CSV converter free?</h3>
        <p>Yes. It is completely free, with no limits, no watermarks, and no sign-up required.</p>

        <h3>Can it handle a large JSON file?</h3>
        <p>The conversion runs entirely in your browser, so it depends on your device memory. For very large files, try splitting the JSON into smaller chunks.</p>

        <h3>What delimiter should I use?</h3>
        <p>Use <strong>comma</strong> for most tools and US Excel. Use <strong>semicolon</strong> if your Excel uses comma as a decimal separator (common in Europe). Use <strong>tab</strong> to produce TSV.</p>

        <h3>Does it fix invalid JSON?</h3>
        <p>Yes. Single quotes, unquoted keys, trailing commas, and extra characters are auto-repaired before conversion.</p>

        <h3>Is my data safe?</h3>
        <p>Yes. All processing happens in your browser. Your data is never uploaded to a server or stored.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/">JSON Diff</router-link> — Compare two JSON files side by side</li>
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify JSON data</li>
        <li><router-link to="/json-validator">JSON Validator</router-link> — Check JSON syntax</li>
        <li><router-link to="/json-minify">JSON Minifier</router-link> — Compress JSON to one line</li>
        <li><router-link to="/json-viewer">JSON Viewer</router-link> — View JSON in an interactive tree</li>
        <li><router-link to="/json-to-yaml">JSON to YAML</router-link> — Convert JSON to YAML</li>
        <li><router-link to="/yaml-to-json">YAML to JSON</router-link> — Convert YAML back to JSON</li>
        <li><router-link to="/xml-to-json">XML to JSON</router-link> — Convert XML to JSON format</li>
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
.toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; }
.btn-secondary { padding: 0.375rem 0.875rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.8125rem; transition: all 0.2s; cursor: pointer; }
.btn-secondary:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-light); }
.delimiter-select { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8125rem; color: var(--text-muted); }
.delimiter-select select { padding: 0.3rem 0.5rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-hover); color: var(--text); font-size: 0.8125rem; }
.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.field { margin-bottom: 1.25rem; }
.field label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; }
textarea { width: 100%; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; line-height: 1.6; font-family: var(--font-mono); resize: vertical; }
textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
.output-box { margin: 0; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.6; overflow: auto; max-height: 400px; white-space: pre-wrap; word-break: break-all; }
.placeholder-box { padding: 3rem 1.25rem; background: var(--surface-hover); border: 1px dashed var(--border); border-radius: var(--radius-sm); color: var(--text-subtle); font-size: 0.875rem; text-align: center; }
.error { padding: 1rem 1.25rem; background: var(--remove-bg); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: #dc2626; font-size: 0.9rem; }
.hint { font-size: 0.8125rem; color: var(--accent); margin-top: 0.75rem; }
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
