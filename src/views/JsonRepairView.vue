<script setup>
import { ref } from 'vue'
import { parseJsonSafeExtract, formatJson } from '../utils/jsonParse.js'

const input = ref('')
const output = ref('')
const error = ref('')
const errorLoc = ref(null)
const errorSnippet = ref('')
const repairedInfo = ref('')

let timer = null

function repair() {
  error.value = ''
  output.value = ''
  errorLoc.value = null
  errorSnippet.value = ''
  repairedInfo.value = ''
  if (!input.value.trim()) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const { ok, value, error: err, repaired, loc } = parseJsonSafeExtract(input.value)
    if (!ok) {
      error.value = err
      errorLoc.value = loc || null
      if (loc) {
        const prefix = String(loc.line).padEnd(4)
        errorSnippet.value = prefix + loc.sourceLine + '\n' + ' '.repeat(prefix.length) + loc.caret
      }
      return
    }
    output.value = formatJson(value, 2)
    repairedInfo.value = repaired || ''
  }, 200)
}

function copyOutput() {
  if (!output.value) return
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(output.value).catch(() => fallbackCopy(output.value))
    return
  }
  fallbackCopy(output.value)
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

function downloadJson() {
  if (!output.value) return
  const blob = new Blob([output.value], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'repaired.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function loadExample() {
  input.value = `{
  name: 'John Doe',
  age: 30,
  tags: ['admin', 'user',],
  active: true,
}`
  repair()
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>JSON Repair Tool</h1>
      <p class="subtitle">Paste broken JSON and get valid, formatted JSON back instantly. Auto-fixes single quotes, unquoted keys, trailing commas, comments, and stray characters — 100% local &amp; free.</p>
    </header>

    <div class="panel">
      <div class="toolbar">
        <button class="btn-secondary" type="button" @click="loadExample">Load Example</button>
        <button class="btn-secondary" type="button" v-if="output" @click="copyOutput">Copy</button>
        <button class="btn-secondary" type="button" v-if="output" @click="downloadJson">Download</button>
      </div>

      <div class="two-cols">
        <div class="field">
          <label>Broken JSON</label>
          <textarea
            v-model="input"
            placeholder="{
  &quot;name&quot;: 'John Doe',
  &quot;age&quot;: 30,
  &quot;tags&quot;: [&quot;admin&quot;, &quot;user&quot;,],
  &quot;email&quot;: &quot;john@example.com&quot;
  &quot;active&quot;: true,
}"
            rows="14"
            @input="repair"
          ></textarea>
        </div>
        <div class="field">
          <label>Repaired JSON <button v-if="output" class="btn-copy-small" @click="copyOutput">Copy</button></label>
          <pre class="output-box" v-if="output">{{ output }}</pre>
          <div v-else-if="error" class="error">
            <div class="error-title" v-if="errorLoc">⛔ Invalid JSON — line {{ errorLoc.line }}, column {{ errorLoc.column }}</div>
            <div class="error-msg">{{ error }}</div>
            <pre v-if="errorSnippet" class="error-code">{{ errorSnippet }}</pre>
            <div class="error-tip">We tried every auto-repair rule but couldn't fully fix this. The marker (^) above shows exactly where parsing stopped — correct the syntax there and it will repair automatically.</div>
          </div>
          <div v-else class="placeholder-box">Repaired JSON will appear here</div>
        </div>
      </div>
      <div v-if="repairedInfo" class="hint">Auto-repaired: {{ repairedInfo }}</div>
    </div>

    <section class="seo-content">
      <h2>What is a JSON Repair Tool?</h2>
      <p>A JSON repair tool fixes invalid JSON so it becomes valid and parseable again. Real-world JSON is rarely perfect: logs have trailing commas, config files mix single and double quotes, API copy-paste drops a comma, and snippets from docs include comments. Instead of throwing an error, this tool detects and corrects those common mistakes, then returns clean, formatted JSON — right in your browser.</p>

      <h2>What Gets Auto-Repaired</h2>
      <ul>
        <li><strong>Single quotes → double quotes:</strong> <code>{'name':'test'}</code> becomes <code>{"name":"test"}</code></li>
        <li><strong>Unquoted keys:</strong> <code>{name:"test"}</code> becomes <code>{"name":"test"}</code></li>
        <li><strong>Trailing commas:</strong> <code>{"a":1,}</code> becomes <code>{"a":1}</code></li>
        <li><strong>Comments:</strong> <code>//</code> and <code>/* */</code> are stripped before parsing</li>
        <li><strong>Extra trailing characters:</strong> stray text after the closing bracket is trimmed</li>
        <li><strong>Double-escaped strings:</strong> <code>\"</code> and <code>\n</code> are unwrapped automatically</li>
      </ul>

      <h2>How to Repair JSON</h2>
      <ol>
        <li>Paste your broken JSON into the left box</li>
        <li>The repaired, formatted result appears on the right as you type</li>
        <li>If something can't be fixed, the exact error position (line and column) is shown so you can correct it</li>
        <li>Click <strong>Copy</strong> or <strong>Download</strong> to save the fixed JSON</li>
      </ol>

      <h2>Why Not Just Use a JSON Validator?</h2>
      <p>A validator only tells you what's wrong. A repair tool goes further — it fixes the small, predictable mistakes that waste your time, then hands you valid JSON. Use the validator when you need a strict pass/fail check; use this tool when you just want the data fixed.</p>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Is this JSON repair tool free?</h3>
        <p>Yes. It is completely free, with no limits, no watermarks, and no sign-up required.</p>

        <h3>Can it fix heavily corrupted JSON?</h3>
        <p>It reliably fixes common syntax mistakes (quotes, commas, comments, escaping). For structurally broken JSON (unbalanced braces, missing values), it reports the exact error position so you can repair it manually.</p>

        <h3>Does it work with JSONC (JSON with comments)?</h3>
        <p>Yes. Single-line <code>//</code> and block <code>/* */</code> comments are stripped before parsing.</p>

        <h3>Is my data safe?</h3>
        <p>Yes. All processing happens in your browser. Your JSON is never uploaded to a server or stored.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/">JSON Diff</router-link> — Compare two JSON files side by side</li>
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify JSON data</li>
        <li><router-link to="/json-validator">JSON Validator</router-link> — Strict syntax check</li>
        <li><router-link to="/json-minify">JSON Minifier</router-link> — Compress JSON to one line</li>
        <li><router-link to="/json-to-csv">JSON to CSV</router-link> — Convert JSON to CSV</li>
        <li><router-link to="/json-viewer">JSON Viewer</router-link> — View JSON in an interactive tree</li>
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
.toolbar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.btn-secondary { padding: 0.375rem 0.875rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.8125rem; transition: all 0.2s; cursor: pointer; }
.btn-secondary:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-light); }
.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.field { margin-bottom: 1.25rem; }
.field label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 600; color: var(--text); margin-bottom: 0.5rem; }
textarea { width: 100%; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; line-height: 1.6; font-family: var(--font-mono); resize: vertical; }
textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
.output-box { margin: 0; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.6; overflow: auto; max-height: 400px; white-space: pre-wrap; word-break: break-all; }
.placeholder-box { padding: 3rem 1.25rem; background: var(--surface-hover); border: 1px dashed var(--border); border-radius: var(--radius-sm); color: var(--text-subtle); font-size: 0.875rem; text-align: center; }
.btn-copy-small { padding: 0.15rem 0.5rem; font-size: 0.75rem; color: var(--text-muted); background: transparent; border: 1px solid var(--border); border-radius: 4px; }
.btn-copy-small:hover { color: var(--accent); border-color: var(--accent); }
.hint { font-size: 0.8125rem; color: var(--accent); margin-top: 0.75rem; }
.error { padding: 1rem 1.25rem; background: var(--remove-bg); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: #dc2626; font-size: 0.9rem; }
.error-title { font-weight: 700; color: #b91c1c; margin-bottom: 0.35rem; }
.error-msg { font-size: 0.875rem; line-height: 1.5; color: #dc2626; }
.error-code { margin: 0.65rem 0 0; padding: 0.75rem 1rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.6; color: var(--text); white-space: pre; overflow-x: auto; }
.error-code :deep(.ln) { color: var(--text-subtle); user-select: none; }
.error-tip { margin-top: 0.5rem; font-size: 0.8125rem; color: var(--text-muted); line-height: 1.5; }
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
