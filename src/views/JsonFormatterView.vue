<script setup>
import { ref } from 'vue'
import { parseJsonSafeExtract, formatJson } from '../utils/jsonParse.js'

const input = ref('')
const output = ref('')
const error = ref('')
const indentSize = ref(2)
const usedUnescape = ref(false)

let timer = null

function format() {
  error.value = ''
  output.value = ''
  usedUnescape.value = false
  if (!input.value.trim()) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const { ok, value, error: err } = parseJsonSafeExtract(input.value)
    if (!ok) {
      error.value = err
      return
    }
    output.value = formatJson(value, parseInt(indentSize.value))
    usedUnescape.value = input.value.includes('\\"') && !isDirectParse(input.value)
  }, 200)
}

function isDirectParse(str) {
  try {
    JSON.parse(str.trim())
    return true
  } catch {
    return false
  }
}

function copyOutput() {
  if (!output.value) return
  navigator.clipboard?.writeText(output.value)
}

function loadExample() {
  input.value = '{"name":"John Doe","age":30,"email":"john@example.com","skills":["JavaScript","Python","Go"],"address":{"city":"New York","zip":"10001"},"active":true}'
  format()
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>JSON Formatter Online</h1>
      <p class="subtitle">Beautify and pretty-print your JSON data with customizable indentation. Free online JSON formatter.</p>
    </header>

    <div class="panel">
      <div class="toolbar">
        <div class="indent-control">
          <label>Indent:</label>
          <select v-model="indentSize" @change="format">
            <option :value="2">2 spaces</option>
            <option :value="4">4 spaces</option>
            <option :value="0">Minified</option>
          </select>
        </div>
        <button class="btn-secondary" @click="loadExample">Load Example</button>
      </div>

      <div class="two-cols">
        <div class="field">
          <label>Input JSON</label>
          <textarea v-model="input" placeholder="Paste your JSON here..." rows="12" @input="format"></textarea>
        </div>
        <div class="field">
          <label>Formatted Output <button v-if="output" class="btn-copy-small" @click="copyOutput">Copy</button></label>
          <pre class="output-box" v-if="output">{{ output }}</pre>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else class="placeholder-box">Formatted JSON will appear here</div>
        </div>
      </div>
      <div v-if="usedUnescape" class="hint">Auto-detected and processed escape characters</div>
    </div>

    <section class="seo-content">
      <h2>What is JSON Formatter?</h2>
      <p>A JSON Formatter is a tool that takes minified or unformatted JSON data and transforms it into a readable, properly indented structure. It adds line breaks, spaces, and consistent indentation to make JSON easy for humans to read and debug. Whether your JSON is a single line of compressed text or has inconsistent formatting, this tool will produce clean, well-structured output.</p>

      <h2>How to Format JSON Online</h2>
      <ol>
        <li>Paste your raw JSON data into the input text area</li>
        <li>Select your preferred indent size (2 spaces, 4 spaces, or minified)</li>
        <li>The formatted result appears instantly in the output area</li>
        <li>Click "Copy" to copy the formatted JSON to your clipboard</li>
      </ol>

      <h2>Why Format JSON?</h2>
      <ul>
        <li><strong>Readability:</strong> Properly formatted JSON is much easier to read and understand</li>
        <li><strong>Debugging:</strong> Spot syntax errors and structural issues quickly</li>
        <li><strong>Code review:</strong> Share formatted JSON in pull requests and documentation</li>
        <li><strong>Data inspection:</strong> Examine API responses and configuration files at a glance</li>
        <li><strong>Documentation:</strong> Include readable JSON examples in your docs</li>
      </ul>

      <h2>JSON Formatting Standards</h2>
      <p>JSON (JavaScript Object Notation) is a lightweight data-interchange format. While JSON specification does not mandate specific formatting, the most common conventions include:</p>
      <ul>
        <li>2-space indentation (most popular for JavaScript projects)</li>
        <li>4-space indentation (common in Python and Java ecosystems)</li>
        <li>Minified format (for production — smallest file size)</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Is this JSON Formatter free?</h3>
        <p>Yes, completely free with no limits or sign-up required.</p>

        <h3>Does it work with JSONC (JSON with comments)?</h3>
        <p>Yes, the formatter automatically strips <code>//</code> and <code>/* */</code> comments before processing.</p>

        <h3>Can it handle escaped JSON strings?</h3>
        <p>Yes, if your input contains double-escaped characters like <code>\"</code> or <code>\n</code>, the tool will automatically detect and process them.</p>

        <h3>Is my data sent to a server?</h3>
        <p>No. All formatting happens locally in your browser. Your data never leaves your device.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/">JSON Diff</router-link> — Compare two JSON files side by side</li>
        <li><router-link to="/json-validator">JSON Validator</router-link> — Check JSON for syntax errors</li>
        <li><router-link to="/json-minify">JSON Minifier</router-link> — Compress JSON to one line</li>
        <li><router-link to="/json-to-yaml">JSON to YAML</router-link> — Convert JSON to YAML format</li>
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
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
.indent-control { display: flex; align-items: center; gap: 0.5rem; }
.indent-control label { font-size: 0.875rem; font-weight: 600; color: var(--text); }
.indent-control select { padding: 0.375rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface-hover); color: var(--text); font-size: 0.875rem; }
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
.hint { font-size: 0.8125rem; color: var(--accent); margin-top: 0.5rem; }
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
