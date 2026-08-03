<script setup>
import { ref, nextTick } from 'vue'
import { parseJsonSafeExtract, formatJson } from '../utils/jsonParse.js'
import * as jsondiffpatch from 'jsondiffpatch'
import { formatSideBySide } from '../utils/sideBySideDiff.js'

const mode = ref('diff')
const rawInput = ref('')
const formatResult = ref('')
const formatError = ref('')
const formatUsedUnescape = ref(false)

const leftInput = ref('')
const rightInput = ref('')
const diffRows = ref([])
const diffNoChange = ref(false)
const diffLoading = ref(false)
const diffFormattedResult = ref('')
const diffError = ref('')
const diffOutputRef = ref(null)

const diffpatcher = jsondiffpatch.create({
  objectHash: (obj) => obj?.id ?? obj?.name ?? JSON.stringify(obj),
  arrays: { detectMove: true },
})

let formatTimer = null
function doFormat() {
  formatError.value = ''
  formatResult.value = ''
  formatUsedUnescape.value = false
  if (formatTimer) clearTimeout(formatTimer)
  formatTimer = setTimeout(() => {
    const { ok, value, error } = parseJsonSafeExtract(rawInput.value)
    if (!ok) {
      formatError.value = error
      return
    }
    formatResult.value = formatJson(value)
    formatUsedUnescape.value = rawInput.value.includes('\\"') && !isDirectParse(rawInput.value)
    formatTimer = null
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

function doDiff() {
  diffError.value = ''
  diffRows.value = []
  diffNoChange.value = false
  diffFormattedResult.value = ''
  diffLoading.value = true
  const leftResult = parseJsonSafeExtract(leftInput.value)
  const rightResult = parseJsonSafeExtract(rightInput.value)
  if (!leftResult.ok) {
    diffError.value = `Left JSON parse failed: ${leftResult.error}`
    diffLoading.value = false
    return
  }
  if (!rightResult.ok) {
    diffError.value = `Right JSON parse failed: ${rightResult.error}`
    diffLoading.value = false
    return
  }
  const delta = diffpatcher.diff(leftResult.value, rightResult.value)
  if (delta === undefined) {
    diffNoChange.value = true
    diffFormattedResult.value = formatJson(leftResult.value)
    diffLoading.value = false
    return
  }
  setTimeout(() => {
    try {
      const { rows } = formatSideBySide(leftResult.value, rightResult.value, delta)
      diffRows.value = rows
      diffLoading.value = false
      nextTick(() => scrollToFirstDiff())
    } catch (e) {
      diffError.value = `Diff rendering failed: ${e.message}`
      diffLoading.value = false
    }
  })
}

function scrollToFirstDiff() {
  const el = diffOutputRef.value?.querySelector('.diff-removed, .diff-added')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function hasDiffInRow(row) {
  const norm = (s) => (s || '').replace(/,\s*$/, '').trim()
  return norm(row.left) !== norm(row.right)
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
  el.style.top = '0'
  document.body.appendChild(el)
  el.select()
  try {
    document.execCommand('copy')
  } finally {
    document.body.removeChild(el)
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToBottom() {
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
}

function getDiffElements() {
  const container = diffOutputRef.value
  if (!container) return []
  return Array.from(container.querySelectorAll('.diff-cell.diff-left.diff-row-changed'))
}

function scrollToPrevDiff() {
  const elements = getDiffElements()
  if (elements.length === 0) return
  const viewportCenter = window.innerHeight / 2
  const scrollTop = window.scrollY
  let target = null
  for (let i = elements.length - 1; i >= 0; i--) {
    const rect = elements[i].getBoundingClientRect()
    const elTop = rect.top + scrollTop
    if (elTop < scrollTop + viewportCenter - 50) {
      target = elements[i]
      break
    }
  }
  if (!target && elements.length > 0) target = elements[0]
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function scrollToNextDiff() {
  const elements = getDiffElements()
  if (elements.length === 0) return
  const viewportCenter = window.innerHeight / 2
  const scrollTop = window.scrollY
  let target = null
  for (let i = 0; i < elements.length; i++) {
    const rect = elements[i].getBoundingClientRect()
    const elTop = rect.top + scrollTop
    if (elTop > scrollTop + viewportCenter + 50) {
      target = elements[i]
      break
    }
  }
  if (!target && elements.length > 0) target = elements[elements.length - 1]
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>JSON Diff - Compare Two JSON Files Online</h1>
      <p class="subtitle">Compare JSON side by side with visual diff highlighting. Supports escaped strings, comments, and auto-extraction.</p>
      <div class="tabs">
        <button :class="{ active: mode === 'diff' }" @click="mode = 'diff'">JSON Diff</button>
        <button :class="{ active: mode === 'format' }" @click="mode = 'format'">Format JSON</button>
      </div>
    </header>

    <main class="main">
      <!-- Format Mode -->
      <section v-show="mode === 'format'" class="panel">
        <div class="field">
          <label>Raw JSON String <span class="label-hint">(supports <code>\"</code>, <code>\n</code>, <code>\uXXXX</code> escapes)</span></label>
          <textarea
            v-model="rawInput"
            placeholder='e.g., {"name":"test","values":[1,2,3]}'
            rows="8"
            @input="doFormat"
          />
        </div>
        <div v-if="formatUsedUnescape" class="hint">
          Auto-detected and processed escape characters
        </div>
        <div v-if="formatError" class="error">{{ formatError }}</div>
        <div v-if="formatResult" class="field result">
          <div class="result-label-row">
            <label>Formatted Result</label>
            <button class="btn-copy-label" type="button" @click="copyToClipboard(formatResult)">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </button>
          </div>
          <div class="result-box">
            <button class="btn-copy-inline" type="button" @click="copyToClipboard(formatResult)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            <pre class="formatted">{{ formatResult }}</pre>
          </div>
        </div>
      </section>

      <!-- Diff Mode -->
      <section v-show="mode === 'diff'" class="panel">
        <div class="two-cols">
          <div class="field">
            <label>Left JSON (Original)</label>
            <textarea
              v-model="leftInput"
              placeholder='e.g., {"a":1,"b":2}'
              rows="10"
            />
          </div>
          <div class="field">
            <label>Right JSON (Modified)</label>
            <textarea
              v-model="rightInput"
              placeholder='e.g., {"a":1,"b":3}'
              rows="10"
            />
          </div>
        </div>
        <button class="btn-primary" @click="doDiff" :disabled="diffLoading">
          {{ diffLoading ? 'Comparing...' : 'Compare JSON' }}
        </button>
        <div v-if="diffError" class="error">{{ diffError }}</div>
        <div v-if="diffNoChange" class="diff-output diff-no-change-wrap">
          <p class="diff-no-change-msg">Both JSON objects are identical. No differences found.</p>
          <div class="field result">
            <div class="result-label-row">
              <label>Formatted Result</label>
              <button class="btn-copy-label" type="button" @click="copyToClipboard(diffFormattedResult)">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>
            </div>
            <div class="result-box">
              <button class="btn-copy-inline" type="button" @click="copyToClipboard(diffFormattedResult)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
              <pre class="formatted">{{ diffFormattedResult }}</pre>
            </div>
          </div>
        </div>
        <div v-else-if="diffRows.length" ref="diffOutputRef" class="diff-output diff-side-by-side">
          <div class="diff-col-label">Left (Original)</div>
          <div class="diff-col-label">Right (Modified)</div>
          <template v-for="(row, i) in diffRows" :key="i">
            <div class="diff-cell diff-left" :class="{ 'diff-row-changed': hasDiffInRow(row) }">
              <pre class="diff-line" v-html="row.left || '&nbsp;'"></pre>
            </div>
            <div class="diff-cell diff-right" :class="{ 'diff-row-changed': hasDiffInRow(row) }">
              <pre class="diff-line" v-html="row.right || '&nbsp;'"></pre>
            </div>
          </template>
        </div>
      </section>
    </main>

    <!-- SEO Content Section -->
    <section class="seo-content">
      <h2>What is JSON Diff?</h2>
      <p>JSON Diff is a tool that compares two JSON objects and highlights the differences between them. It shows added, removed, and modified fields in a side-by-side view, making it easy to spot changes between two versions of JSON data. This is particularly useful for debugging API responses, comparing configuration files, and tracking data changes over time.</p>

      <h2>How to Compare Two JSON Files</h2>
      <ol>
        <li>Paste your original JSON into the left text box</li>
        <li>Paste your modified JSON into the right text box</li>
        <li>Click the "Compare JSON" button</li>
        <li>View the highlighted differences in the side-by-side output</li>
        <li>Red highlights show removed or changed values in the original</li>
        <li>Green highlights show added or changed values in the modified version</li>
      </ol>

      <h2>Key Features</h2>
      <ul>
        <li><strong>Side-by-side comparison:</strong> View both JSON versions simultaneously with aligned rows</li>
        <li><strong>Visual highlighting:</strong> Red for deletions, green for additions</li>
        <li><strong>Escape character support:</strong> Automatically handles <code>\"</code>, <code>\n</code>, <code>\uXXXX</code> and other escape sequences</li>
        <li><strong>Comment stripping:</strong> Supports JSON with <code>//</code> and <code>/* */</code> comments</li>
        <li><strong>Auto-extraction:</strong> Automatically extracts JSON from wrapper objects</li>
        <li><strong>No data stored:</strong> All processing happens in your browser — your data never leaves your device</li>
      </ul>

      <h2>JSON Diff Use Cases</h2>
      <ul>
        <li><strong>API Development:</strong> Compare API responses before and after code changes</li>
        <li><strong>Configuration Management:</strong> Track changes in JSON configuration files</li>
        <li><strong>Data Migration:</strong> Verify data integrity before and after migration</li>
        <li><strong>Debugging:</strong> Identify unexpected changes in JSON payloads</li>
        <li><strong>Version Control:</strong> Compare JSON data across different versions</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Is this JSON Diff tool free?</h3>
        <p>Yes, this tool is completely free to use. There are no limits, no sign-up required, and no hidden costs.</p>

        <h3>Is my JSON data safe?</h3>
        <p>Absolutely. All JSON processing happens entirely in your browser. Your data is never sent to any server, stored, or logged. You can safely use this tool with sensitive data.</p>

        <h3>Does it support JSON with comments?</h3>
        <p>Yes. The tool automatically strips <code>//</code> single-line comments and <code>/* */</code> multi-line comments before parsing, so you can compare JSONC files directly.</p>

        <h3>Can it handle escaped JSON strings?</h3>
        <p>Yes. If your JSON contains double-escaped strings (e.g., <code>{\"key\":\"value\"}</code>), the tool automatically detects and processes the escape characters before comparison.</p>

        <h3>What happens if the JSON is invalid?</h3>
        <p>The tool will display an error message indicating which side (left or right) has invalid JSON and what the parse error is, helping you quickly identify and fix the issue.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify and pretty-print JSON data</li>
        <li><router-link to="/json-validator">JSON Validator</router-link> — Check JSON syntax for errors</li>
        <li><router-link to="/json-minify">JSON Minifier</router-link> — Compress JSON to reduce file size</li>
        <li><router-link to="/json-to-yaml">JSON to YAML Converter</router-link> — Convert JSON to YAML format</li>
      </ul>
    </section>

    <!-- Floating navigation icons -->
    <div class="nav-icons">
      <button type="button" title="Previous diff" @click="scrollToPrevDiff">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
      <button type="button" title="Next diff" @click="scrollToNextDiff">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      <button type="button" title="Back to top" @click="scrollToTop">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </button>
      <button type="button" title="Scroll to bottom" @click="scrollToBottom">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 2rem 1.5rem 4rem;
  max-width: 1280px;
  margin: 0 auto;
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
  letter-spacing: -0.03em;
  color: var(--text);
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin: 0 0 1.5rem;
}

.tabs {
  display: inline-flex;
  gap: 0.25rem;
  padding: 4px;
  background: var(--surface-hover);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.tabs button {
  padding: 0.5rem 1.25rem;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.tabs button:hover {
  color: var(--text);
  background: var(--surface);
}

.tabs button.active {
  background: var(--surface);
  color: var(--accent);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.panel {
  animation: fade 0.25s ease;
  padding: 2rem;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
}

@keyframes fade {
  from { opacity: 0.6; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.field {
  margin-bottom: 1.25rem;
}

.field label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.label-hint {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.field label code {
  font-family: var(--font-mono);
  font-size: 0.75em;
  background: var(--accent-light);
  color: var(--accent);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}

textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 0.875rem;
  line-height: 1.6;
  transition: border-color 0.2s, box-shadow 0.2s;
}

textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

textarea::placeholder {
  color: var(--text-subtle);
}

.hint {
  font-size: 0.8125rem;
  color: var(--accent);
  margin: -0.25rem 0 0.5rem;
}

.error {
  padding: 1rem 1.25rem;
  background: var(--remove-bg);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius-sm);
  color: #dc2626;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.result-label-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.result-label-row label {
  margin-bottom: 0;
}

.btn-copy-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-copy-label:hover {
  color: var(--accent);
  background: var(--accent-light);
  border-color: var(--border);
}

.result-box {
  position: relative;
}

.result .formatted {
  margin: 0;
  padding: 1.25rem 3rem 1.25rem 1.25rem;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.6;
  overflow: auto;
  max-height: 60vh;
  white-space: pre-wrap;
  word-break: break-all;
}

.btn-copy-inline {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  opacity: 0.8;
  transition: all 0.2s ease;
  z-index: 1;
}

.btn-copy-inline:hover {
  opacity: 1;
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-light);
}

.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
  color: white;
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.diff-output {
  margin-top: 1.5rem;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: auto;
  min-height: 120px;
  box-shadow: var(--shadow-sm);
}

.diff-no-change-wrap {
  padding: 1.5rem;
}

.diff-no-change-msg {
  margin: 0 0 1rem;
  color: var(--text-muted);
  font-style: italic;
}

.diff-side-by-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-radius: var(--radius-sm);
  overflow: auto;
  min-height: 200px;
}

.diff-col-label {
  padding: 0.625rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.diff-col-label:first-child {
  border-right: 1px solid var(--border);
}

.diff-cell {
  padding: 0 1.25rem;
  min-width: 0;
}

.diff-cell.diff-left {
  border-right: 1px solid var(--border);
}

.diff-cell.diff-row-changed.diff-left {
  background: var(--remove-bg);
}

.diff-cell.diff-row-changed.diff-right {
  background: var(--add-bg);
}

.diff-line {
  margin: 0;
  padding: 0.2rem 0;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.diff-line :deep(.diff-removed) {
  background: #fecaca;
  color: #991b1b;
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid #dc2626;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.diff-line :deep(.diff-added) {
  background: #bbf7d0;
  color: #166534;
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid #22c55e;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/* SEO Content */
.seo-content {
  margin-top: 3rem;
  padding: 2rem;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
  max-width: none;
}

.seo-content h2 {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text);
  margin: 2rem 0 0.75rem;
  letter-spacing: -0.02em;
}

.seo-content h2:first-child {
  margin-top: 0;
}

.seo-content h3 {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text);
  margin: 1.25rem 0 0.5rem;
}

.seo-content p {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--text-muted);
  margin: 0 0 0.75rem;
}

.seo-content ul,
.seo-content ol {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--text-muted);
  padding-left: 1.5rem;
  margin: 0 0 1rem;
}

.seo-content li {
  margin-bottom: 0.35rem;
}

.seo-content code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--accent-light);
  color: var(--accent);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}

.seo-content a {
  color: var(--accent);
  text-decoration: none;
}

.seo-content a:hover {
  text-decoration: underline;
}

.faq {
  padding-left: 0;
}

.related-tools li {
  margin-bottom: 0.5rem;
}

/* Floating nav */
.nav-icons {
  position: fixed;
  right: 1.5rem;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 100;
}

.nav-icons button {
  width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  color: var(--accent);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
}

.nav-icons button:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

@media (max-width: 768px) {
  .page {
    padding: 1rem 1rem 3rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .panel {
    padding: 1.25rem;
  }

  .seo-content {
    padding: 1.25rem;
  }

  .two-cols,
  .diff-side-by-side {
    grid-template-columns: 1fr;
  }

  .diff-col-label:first-child,
  .diff-cell.diff-left {
    border-right: none;
  }

  .nav-icons {
    right: 1rem;
    bottom: 1.5rem;
  }

  .nav-icons button {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
}
</style>
