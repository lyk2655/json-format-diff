<script setup>
import { ref } from 'vue'
import { parseJsonSafe, formatJson } from './utils/jsonParse.js'
import * as jsondiffpatch from 'jsondiffpatch'
import * as htmlFormatter from 'jsondiffpatch/formatters/html'
import 'jsondiffpatch/formatters/styles/html.css'

const mode = ref('format') // 'format' | 'diff'
const rawInput = ref('')
const formatResult = ref('')
const formatError = ref('')
const formatUsedUnescape = ref(false)

const leftInput = ref('')
const rightInput = ref('')
const diffHtml = ref('')
const diffError = ref('')

const diffpatcher = jsondiffpatch.create({
  objectHash: (obj) => obj?.id ?? obj?.dish_id ?? obj?.store_id ?? obj?.name ?? JSON.stringify(obj),
  arrays: { detectMove: true },
})

let formatTimer = null
function doFormat() {
  formatError.value = ''
  formatResult.value = ''
  formatUsedUnescape.value = false
  if (formatTimer) clearTimeout(formatTimer)
  formatTimer = setTimeout(() => {
    const { ok, value, error } = parseJsonSafe(rawInput.value)
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
  diffHtml.value = ''
  const leftResult = parseJsonSafe(leftInput.value)
  const rightResult = parseJsonSafe(rightInput.value)
  if (!leftResult.ok) {
    diffError.value = `左侧 JSON 解析失败：${leftResult.error}`
    return
  }
  if (!rightResult.ok) {
    diffError.value = `右侧 JSON 解析失败：${rightResult.error}`
    return
  }
  const delta = diffpatcher.diff(leftResult.value, rightResult.value)
  if (delta === undefined) {
    diffHtml.value = '<div class="jdp-no-diff">两侧 JSON 相同，无差异。</div>'
    return
  }
  try {
    diffHtml.value = htmlFormatter.format(delta, leftResult.value, rightResult.value)
  } catch (e) {
    diffHtml.value = htmlFormatter.format(delta, leftResult.value)
  }
}

</script>

<template>
  <div class="app">
    <header class="header">
      <h1>JSON 格式化与 Diff</h1>
      <p class="subtitle">支持带转义字符的字符串自动识别并解析</p>
      <div class="tabs">
        <button
          :class="{ active: mode === 'format' }"
          @click="mode = 'format'"
        >
          格式化
        </button>
        <button
          :class="{ active: mode === 'diff' }"
          @click="mode = 'diff'"
        >
          Diff 对比
        </button>
      </div>
    </header>

    <main class="main">
      <!-- 格式化模式 -->
      <section v-show="mode === 'format'" class="panel format-panel">
        <div class="field">
          <label>原始 JSON 字符串（可含 <code>\"</code>、<code>\\n</code>、<code>\\uXXXX</code> 等转义）</label>
          <textarea
            v-model="rawInput"
            placeholder='例如：{"store_id":21849676,"dishes":[...]} 或带 \" 的字符串'
            rows="8"
            @input="doFormat"
          />
        </div>
        <div v-if="formatUsedUnescape" class="hint">
          已自动识别并处理转义字符后解析
        </div>
        <div v-if="formatError" class="error">
          {{ formatError }}
        </div>
        <div v-if="formatResult" class="field result">
          <label>格式化结果</label>
          <pre class="formatted">{{ formatResult }}</pre>
          <button class="btn-copy" @click="navigator.clipboard?.writeText(formatResult)">
            复制结果
          </button>
        </div>
      </section>

      <!-- Diff 模式 -->
      <section v-show="mode === 'diff'" class="panel diff-panel">
        <div class="two-cols">
          <div class="field">
            <label>左侧 JSON</label>
            <textarea
              v-model="leftInput"
              placeholder="粘贴第一段 JSON…"
              rows="10"
            />
          </div>
          <div class="field">
            <label>右侧 JSON</label>
            <textarea
              v-model="rightInput"
              placeholder="粘贴第二段 JSON…"
              rows="10"
            />
          </div>
        </div>
        <button class="btn-diff" @click="doDiff">生成 Diff</button>
        <div v-if="diffError" class="error">
          {{ diffError }}
        </div>
        <div
          v-if="diffHtml"
          class="diff-output jdp-wrapper"
          v-html="diffHtml"
        />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  padding: 1.5rem 2rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0 0 1.25rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
}

.tabs button {
  padding: 0.5rem 1rem;
  background: var(--surface);
  color: var(--text-muted);
  border: 1px solid var(--border);
  font-size: 0.9rem;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.tabs button:hover {
  color: var(--text);
  background: var(--surface-hover);
}

.tabs button.active {
  background: var(--accent-dim);
  color: white;
  border-color: var(--accent);
}

.main {
  margin-top: 1rem;
}

.panel {
  animation: fade 0.2s ease;
}

@keyframes fade {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}

.field label code {
  font-family: var(--font-mono);
  font-size: 0.8em;
  background: var(--surface);
  padding: 0.1em 0.35em;
  border-radius: 4px;
}

textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font-size: 0.875rem;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.2);
}

.hint {
  font-size: 0.85rem;
  color: var(--accent);
  margin: -0.5rem 0 0.5rem;
}

.error {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: var(--radius);
  color: #fca5a5;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.result .formatted {
  margin: 0;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.5;
  overflow: auto;
  max-height: 60vh;
  white-space: pre-wrap;
  word-break: break-all;
}

.btn-copy {
  margin-top: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: var(--surface-hover);
  color: var(--text);
  border: 1px solid var(--border);
  font-size: 0.85rem;
}

.btn-copy:hover {
  background: var(--accent-dim);
  color: white;
  border-color: var(--accent);
}

.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .two-cols {
    grid-template-columns: 1fr;
  }
}

.btn-diff {
  padding: 0.6rem 1.25rem;
  background: var(--accent-dim);
  color: white;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.btn-diff:hover {
  background: var(--accent);
}

.diff-output {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: auto;
  min-height: 120px;
}

.diff-output :deep(.jdp-no-diff) {
  color: var(--text-muted);
  font-style: italic;
}

/* 深色主题下 Diff 高亮可读 */
.diff-output :deep(.jsondiffpatch-delta) {
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}
.diff-output :deep(.jsondiffpatch-added .jsondiffpatch-property-name),
.diff-output :deep(.jsondiffpatch-added .jsondiffpatch-value pre),
.diff-output :deep(.jsondiffpatch-modified .jsondiffpatch-right-value pre),
.diff-output :deep(.jsondiffpatch-textdiff-added) {
  background: rgba(34, 197, 94, 0.35);
  color: #86efac;
}
.diff-output :deep(.jsondiffpatch-deleted .jsondiffpatch-property-name),
.diff-output :deep(.jsondiffpatch-deleted pre),
.diff-output :deep(.jsondiffpatch-modified .jsondiffpatch-left-value pre),
.diff-output :deep(.jsondiffpatch-textdiff-deleted) {
  background: rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  text-decoration: line-through;
}
.diff-output :deep(.jsondiffpatch-unchanged),
.diff-output :deep(.jsondiffpatch-movedestination) {
  color: var(--text-muted);
}
</style>
