<script setup>
import { ref } from 'vue'
import { parseJsonSafe } from '../utils/jsonParse.js'

const input = ref('')
const result = ref(null) // { valid: bool, error: string, line: number, col: number }
const repairedInfo = ref('')
let timer = null

function validate() {
  if (!input.value.trim()) {
    result.value = null
    repairedInfo.value = ''
    return
  }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const { ok, value, error, repaired } = parseJsonSafe(input.value)
    if (ok) {
      const type = Array.isArray(value) ? 'Array' : typeof value
      const keys = typeof value === 'object' && value !== null ? Object.keys(value).length : 0
      result.value = { valid: true, type, keys, error: null }
      repairedInfo.value = repaired || ''
    } else {
      const lineCol = extractLineCol(error)
      result.value = { valid: false, error, line: lineCol.line, col: lineCol.col }
      repairedInfo.value = ''
    }
  }, 200)
}

function extractLineCol(errorMsg) {
  const match = errorMsg.match(/position (\d+)/i)
  if (match) {
    const pos = parseInt(match[1])
    const lines = input.value.substring(0, pos).split('\n')
    return { line: lines.length, col: lines[lines.length - 1].length + 1 }
  }
  return { line: 0, col: 0 }
}

function loadExample() {
  input.value = '{"name":"John","age":30,"hobbies":["reading","coding"]}'
  validate()
}

function loadInvalidExample() {
  input.value = '{"name":"John","age":30,"hobbies":["reading",}'
  validate()
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>JSON Validator Online</h1>
      <p class="subtitle">Validate JSON syntax instantly. Find and fix errors in your JSON data with clear error messages and position indicators.</p>
    </header>

    <div class="panel">
      <div class="toolbar">
        <button class="btn-secondary" @click="loadExample">Load Valid Example</button>
        <button class="btn-secondary" @click="loadInvalidExample">Load Invalid Example</button>
      </div>

      <div class="field">
        <label>JSON to Validate</label>
        <textarea v-model="input" placeholder="Paste your JSON here to validate..." rows="10" @input="validate"></textarea>
      </div>

      <div v-if="result" class="result-banner" :class="result.valid ? 'success' : 'fail'">
        <div v-if="result.valid" class="result-icon">&#10003;</div>
        <div v-else class="result-icon">&#10007;</div>
        <div class="result-text">
          <strong v-if="result.valid">Valid JSON</strong>
          <strong v-else>Invalid JSON</strong>
          <span v-if="result.valid"> &mdash; Type: {{ result.type }}<span v-if="result.keys">, {{ result.keys }} key(s)</span></span>
          <span v-else> &mdash; {{ result.error }}<span v-if="result.line"> (Line {{ result.line }}, Column {{ result.col }})</span></span>
        </div>
      </div>
      <div v-if="repairedInfo" class="hint">Auto-repaired: {{ repairedInfo }}</div>
    </div>

    <section class="seo-content">
      <h2>What is JSON Validator?</h2>
      <p>A JSON Validator is a tool that checks whether a given string is valid JSON. It parses the input according to the JSON specification (RFC 8259) and reports any syntax errors found. If the JSON is valid, it displays the data type and key count. If invalid, it shows the exact error message and location, helping you quickly identify and fix issues.</p>

      <h2>How to Validate JSON Online</h2>
      <ol>
        <li>Paste your JSON string into the text area above</li>
        <li>The validator checks your JSON instantly as you type</li>
        <li>Green banner = valid JSON, red banner = invalid JSON</li>
        <li>For invalid JSON, the error message and line/column position are displayed</li>
      </ol>

      <h2>Common JSON Syntax Errors</h2>
      <ul>
        <li><strong>Trailing comma:</strong> <code>{"a":1,}</code> — remove the comma after the last element</li>
        <li><strong>Missing quotes:</strong> <code>{a:1}</code> — keys must be wrapped in double quotes</li>
        <li><strong>Single quotes:</strong> <code>{'a':1}</code> — JSON requires double quotes, not single</li>
        <li><strong>Missing closing bracket:</strong> <code>{"a":[1,2</code> — add the closing <code>]</code> and <code>}</code></li>
        <li><strong>Extra closing bracket:</strong> <code>{"a":1}}</code> — remove the extra <code>}</code></li>
        <li><strong>Unclosed string:</strong> <code>{"a":"test}</code> — add the closing <code>"</code></li>
        <li><strong>Comments:</strong> <code>// comment</code> — standard JSON does not allow comments (this tool strips them automatically)</li>
      </ul>

      <h2>JSON Data Types</h2>
      <p>Valid JSON supports the following data types:</p>
      <ul>
        <li><strong>String:</strong> Double-quoted Unicode text, e.g., <code>"hello"</code></li>
        <li><strong>Number:</strong> Integer or floating-point, e.g., <code>42</code> or <code>3.14</code></li>
        <li><strong>Boolean:</strong> <code>true</code> or <code>false</code></li>
        <li><strong>null:</strong> <code>null</code> (not <code>NULL</code> or <code>None</code>)</li>
        <li><strong>Array:</strong> Ordered list, e.g., <code>[1, 2, 3]</code></li>
        <li><strong>Object:</strong> Key-value pairs, e.g., <code>{"key":"value"}</code></li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Is this JSON Validator free?</h3>
        <p>Yes, completely free with no limits or sign-up required.</p>

        <h3>Does it support JSON with comments (JSONC)?</h3>
        <p>Yes. The validator strips <code>//</code> and <code>/* */</code> comments before validation, so JSONC files will pass validation.</p>

        <h3>Can it handle escaped JSON?</h3>
        <p>Yes. If your input contains double-escaped characters, the validator will detect and process them automatically.</p>

        <h3>Is my data secure?</h3>
        <p>Yes. All validation happens in your browser. Your JSON data is never sent to any server.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/">JSON Diff</router-link> — Compare two JSON files side by side</li>
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify JSON data</li>
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
.toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
.btn-secondary { padding: 0.375rem 0.875rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.8125rem; transition: all 0.2s; }
.btn-secondary:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-light); }
.field { margin-bottom: 1.25rem; }
.field label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; }
textarea { width: 100%; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; line-height: 1.6; font-family: var(--font-mono); }
textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
.result-banner { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; border-radius: var(--radius-sm); font-size: 0.9375rem; }
.result-banner.success { background: var(--add-bg); border: 1px solid rgba(34, 197, 94, 0.3); color: #166534; }
.result-banner.fail { background: var(--remove-bg); border: 1px solid rgba(239, 68, 68, 0.3); color: #991b1b; }
.result-icon { font-size: 1.5rem; font-weight: 700; }
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
@media (max-width: 768px) { .page { padding: 1rem 1rem 3rem; } .page-header { padding: 1.5rem; } .panel { padding: 1.25rem; } .seo-content { padding: 1.25rem; } }
</style>
