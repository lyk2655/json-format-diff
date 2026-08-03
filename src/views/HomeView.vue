<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { parseJsonSafeExtract, formatJson } from '../utils/jsonParse.js'
import * as jsondiffpatch from 'jsondiffpatch'
import { formatSideBySide } from '../utils/sideBySideDiff.js'

const leftInput = ref('')
const rightInput = ref('')
const diffRows = ref([])
const diffNoChange = ref(false)
const diffLoading = ref(false)
const diffFormattedResult = ref('')
const diffError = ref('')
const diffRepaired = ref('')
const diffOutputRef = ref(null)
const dragOverLeft = ref(false)
const dragOverRight = ref(false)

// Diff options
const ignoreKeyOrder = ref(false)
const ignoreArrayOrder = ref(false)
const showTree = ref(false)

const hasResults = computed(() => diffRows.value.length > 0 || diffNoChange.value || !!diffFormattedResult.value)

function createDiffer() {
  const opts = {
    objectHash: (obj) => obj?.id ?? obj?.name ?? JSON.stringify(obj),
    arrays: { detectMove: true, ignoreOrder: ignoreArrayOrder.value },
  }
  if (ignoreKeyOrder.value) {
    opts.objectHash = (obj) => JSON.stringify(obj)
  }
  return jsondiffpatch.create(opts)
}

function doDiff() {
  diffError.value = ''
  diffRows.value = []
  diffNoChange.value = false
  diffFormattedResult.value = ''
  diffRepaired.value = ''
  diffLoading.value = true
  showTree.value = false
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
  const repairParts = []
  if (leftResult.repaired) repairParts.push(`Left: ${leftResult.repaired}`)
  if (rightResult.repaired) repairParts.push(`Right: ${rightResult.repaired}`)
  if (repairParts.length > 0) diffRepaired.value = repairParts.join('; ')
  const differ = createDiffer()
  const delta = differ.diff(leftResult.value, rightResult.value)
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

// --- New UX Features ---

function loadExample() {
  leftInput.value = JSON.stringify({
    "name": "John Doe",
    "age": 30,
    "email": "john@example.com",
    "address": {
      "city": "New York",
      "zip": "10001"
    },
    "hobbies": ["reading", "coding", "gaming"],
    "active": true
  })
  rightInput.value = JSON.stringify({
    "name": "John Doe",
    "age": 31,
    "email": "john.doe@example.com",
    "address": {
      "city": "Boston",
      "zip": "02101"
    },
    "hobbies": ["reading", "coding", "traveling"],
    "active": true,
    "phone": "+1-555-0100"
  })
  doDiff()
}

function clearAll() {
  leftInput.value = ''
  rightInput.value = ''
  diffRows.value = []
  diffNoChange.value = false
  diffFormattedResult.value = ''
  diffError.value = ''
  diffRepaired.value = ''
  diffLoading.value = false
}

function swapInputs() {
  const temp = leftInput.value
  leftInput.value = rightInput.value
  rightInput.value = temp
  if (diffRows.value.length || diffNoChange.value || diffError.value) {
    doDiff()
  }
}

async function pasteFromClipboard(target) {
  try {
    const text = await navigator.clipboard.readText()
    if (target === 'left') {
      leftInput.value = text
    } else {
      rightInput.value = text
    }
  } catch {
    // Clipboard API not available, user can paste manually
  }
}

function handleDrop(e, target) {
  e.preventDefault()
  if (target === 'left') dragOverLeft.value = false
  else dragOverRight.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') {
        if (target === 'left') leftInput.value = text
        else rightInput.value = text
      }
    }
    reader.readAsText(file)
    return
  }

  // Also support dropping text
  const text = e.dataTransfer?.getData('text/plain')
  if (text) {
    if (target === 'left') leftInput.value = text
    else rightInput.value = text
  }
}

function handleDragOver(e, target) {
  e.preventDefault()
  if (target === 'left') dragOverLeft.value = true
  else dragOverRight.value = true
}

function handleDragLeave(target) {
  if (target === 'left') dragOverLeft.value = false
  else dragOverRight.value = false
}

function downloadResult() {
  let content = ''
  let filename = 'json-diff-result'

  if (diffRows.value.length) {
    // Download as side-by-side text
    const lines = []
    for (const row of diffRows.value) {
      const left = (row.left || '').replace(/<[^>]*>/g, '').trim()
      const right = (row.right || '').replace(/<[^>]*>/g, '').trim()
      if (left !== right) {
        lines.push(`- ${left}`)
        lines.push(`+ ${right}`)
      } else {
        lines.push(`  ${left}`)
      }
    }
    content = lines.join('\n')
    filename = 'json-diff-result.txt'
  } else if (diffFormattedResult.value) {
    content = diffFormattedResult.value
    filename = 'json-diff-result.json'
  } else {
    return
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    doDiff()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>JSON Diff - Compare Two JSON Files Online</h1>
      <p class="subtitle">Compare JSON side by side with visual diff highlighting. Supports escaped strings, comments, auto-repair, and drag & drop.</p>
    </header>

    <main class="main">
      <section class="panel">
        <!-- Toolbar -->
        <div class="toolbar">
          <button class="btn-tool" type="button" @click="loadExample" title="Load example data">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="15" y2="17"/>
            </svg>
            Load Example
          </button>
          <button class="btn-tool" type="button" @click="clearAll" title="Clear all inputs and results">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Clear
          </button>
          <button class="btn-tool" type="button" @click="swapInputs" title="Swap left and right JSON">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            Swap
          </button>
          <button class="btn-tool" type="button" @click="downloadResult" v-if="diffRows.length || diffFormattedResult" title="Download diff result">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
          <span class="shortcut-hint">Ctrl + Enter to compare</span>
        </div>

        <!-- Options -->
        <div class="options-bar">
          <label class="option-chip">
            <input type="checkbox" v-model="ignoreKeyOrder" />
            <span>Ignore Key Order</span>
          </label>
          <label class="option-chip">
            <input type="checkbox" v-model="ignoreArrayOrder" />
            <span>Ignore Array Order</span>
          </label>
        </div>

        <div class="two-cols">
          <div
            class="field"
            :class="{ 'drag-over': dragOverLeft }"
            @drop="handleDrop($event, 'left')"
            @dragover="handleDragOver($event, 'left')"
            @dragleave="handleDragLeave('left')"
          >
            <div class="label-row">
              <label>Left JSON (Original)</label>
              <button class="btn-mini" type="button" @click="pasteFromClipboard('left')" title="Paste from clipboard">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                Paste
              </button>
            </div>
            <textarea
              v-model="leftInput"
              placeholder='Paste JSON or drag & drop a file here'
              rows="10"
            />
          </div>
          <div
            class="field"
            :class="{ 'drag-over': dragOverRight }"
            @drop="handleDrop($event, 'right')"
            @dragover="handleDragOver($event, 'right')"
            @dragleave="handleDragLeave('right')"
          >
            <div class="label-row">
              <label>Right JSON (Modified)</label>
              <button class="btn-mini" type="button" @click="pasteFromClipboard('right')" title="Paste from clipboard">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                Paste
              </button>
            </div>
            <textarea
              v-model="rightInput"
              placeholder='Paste JSON or drag & drop a file here'
              rows="10"
            />
          </div>
        </div>
        <button class="btn-primary" @click="doDiff" :disabled="diffLoading">
          <span v-if="diffLoading" class="loading-spinner"></span>
          {{ diffLoading ? 'Comparing...' : 'Compare JSON' }}
        </button>
        <div v-if="diffRepaired" class="hint">Auto-repaired: {{ diffRepaired }}</div>
        <div v-if="diffError" class="error">{{ diffError }}</div>

        <!-- Empty state when no results and no error -->
        <div v-if="!diffLoading && !hasResults && !diffError && !leftInput && !rightInput" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="15" y2="17"/>
          </svg>
          <p>Paste JSON on both sides, then click "Compare JSON" to see the differences.</p>
        </div>
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
        <li>Paste your original JSON into the left text box, or drag &amp; drop a .json file</li>
        <li>Paste your modified JSON into the right text box, or drag &amp; drop a .json file</li>
        <li>Click the "Compare JSON" button (or press <code>Ctrl + Enter</code>)</li>
        <li>View the highlighted differences in the side-by-side output</li>
        <li>Red highlights show removed or changed values in the original</li>
        <li>Green highlights show added or changed values in the modified version</li>
        <li>Use the download button to save the diff result for later reference</li>
      </ol>

      <h2>Key Features</h2>
      <ul>
        <li><strong>Side-by-side comparison:</strong> View both JSON versions simultaneously with aligned rows</li>
        <li><strong>Visual highlighting:</strong> Red for deletions, green for additions</li>
        <li><strong>Drag &amp; drop files:</strong> Drop .json files directly into the input areas</li>
        <li><strong>Paste from clipboard:</strong> One-click paste button for each input</li>
        <li><strong>Auto-repair:</strong> Automatically fixes common JSON errors like single quotes, unquoted keys, trailing commas, and extra characters</li>
        <li><strong>Escape character support:</strong> Automatically handles <code>\"</code>, <code>\n</code>, <code>\uXXXX</code> and other escape sequences</li>
        <li><strong>Comment stripping:</strong> Supports JSON with <code>//</code> and <code>/* */</code> comments</li>
        <li><strong>Swap inputs:</strong> Instantly swap left and right JSON for reverse comparison</li>
        <li><strong>Keyboard shortcut:</strong> Press <code>Ctrl + Enter</code> to compare instantly</li>
        <li><strong>Download results:</strong> Save the diff output as a text file</li>
        <li><strong>No data stored:</strong> All processing happens in your browser — your data never leaves your device</li>
      </ul>

      <h2>JSON Diff Use Cases</h2>
      <ul>
        <li><strong>API Development:</strong> Compare API responses before and after code changes</li>
        <li><strong>Configuration Management:</strong> Track changes in JSON configuration files</li>
        <li><strong>Data Migration:</strong> Verify data integrity before and after migration</li>
        <li><strong>Debugging:</strong> Identify unexpected changes in JSON payloads</li>
        <li><strong>Version Control:</strong> Compare JSON data across different versions</li>
        <li><strong>Testing:</strong> Verify expected vs actual JSON responses in test suites</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Is this JSON Diff tool free?</h3>
        <p>Yes, this tool is completely free to use. There are no limits, no sign-up required, and no hidden costs.</p>

        <h3>Is my JSON data safe?</h3>
        <p>Absolutely. All JSON processing happens entirely in your browser. Your data is never sent to any server, stored, or logged. You can safely use this tool with sensitive data.</p>

        <h3>Can I drag and drop JSON files?</h3>
        <p>Yes. You can drag and drop .json files directly into either input area. The file content will be loaded automatically.</p>

        <h3>Does it support JSON with comments?</h3>
        <p>Yes. The tool automatically strips <code>//</code> single-line comments and <code>/* */</code> multi-line comments before parsing, so you can compare JSONC files directly.</p>

        <h3>Can it handle escaped JSON strings?</h3>
        <p>Yes. If your JSON contains double-escaped strings (e.g., <code>{\"key\":\"value\"}</code>), the tool automatically detects and processes the escape characters before comparison.</p>

        <h3>What if my JSON has syntax errors?</h3>
        <p>The tool includes an auto-repair feature that can fix common JSON errors automatically, including single quotes, unquoted keys, trailing commas, and extra characters. If the JSON still cannot be parsed after repair attempts, it will display a clear error message indicating which side has the issue.</p>

        <h3>Is there a keyboard shortcut?</h3>
        <p>Yes. Press <code>Ctrl + Enter</code> (or <code>Cmd + Enter</code> on Mac) to instantly compare the two JSON inputs.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify and pretty-print JSON data</li>
        <li><router-link to="/json-validator">JSON Validator</router-link> — Check JSON syntax for errors</li>
        <li><router-link to="/json-minify">JSON Minifier</router-link> — Compress JSON to reduce file size</li>
        <li><router-link to="/json-viewer">JSON Viewer</router-link> — View JSON in an interactive tree structure</li>
        <li><router-link to="/json-to-yaml">JSON to YAML Converter</router-link> — Convert JSON to YAML format</li>
        <li><router-link to="/yaml-to-json">YAML to JSON Converter</router-link> — Convert YAML to JSON format</li>
        <li><router-link to="/xml-to-json">XML to JSON Converter</router-link> — Convert XML to JSON format</li>
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

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.btn-tool {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-tool:hover {
  color: var(--accent);
  background: var(--accent-light);
  border-color: var(--accent);
}

.shortcut-hint {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-subtle);
  font-family: var(--font-mono);
}

.options-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.option-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--text-muted);
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.option-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.option-chip input {
  accent-color: var(--accent);
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.field {
  margin-bottom: 1.25rem;
  transition: all 0.2s ease;
}

.field.drag-over {
  outline: 2px dashed var(--accent);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
  background: var(--accent-light);
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label-row label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.btn-mini {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-mini:hover {
  color: var(--accent);
  background: var(--accent-light);
  border-color: var(--border);
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
  resize: vertical;
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
  background: var(--diff-removed-bg);
  color: var(--diff-removed-text);
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid var(--diff-removed-border);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.diff-line :deep(.diff-added) {
  background: var(--diff-added-bg);
  color: var(--diff-added-text);
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid var(--diff-added-border);
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

  .shortcut-hint {
    display: none;
  }
}
</style>
