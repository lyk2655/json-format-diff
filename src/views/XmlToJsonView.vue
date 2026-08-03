<script setup>
import { ref } from 'vue'
import { formatJson } from '../utils/jsonParse.js'

const input = ref('')
const output = ref('')
const error = ref('')
let timer = null

function xmlToJson(xmlNode) {
  const result = {}
  if (xmlNode.nodeType === 1) {
    if (xmlNode.attributes.length > 0) {
      result['@attributes'] = {}
      for (const attr of xmlNode.attributes) {
        result['@attributes'][attr.nodeName] = attr.nodeValue
      }
    }
  } else if (xmlNode.nodeType === 3) {
    const text = xmlNode.nodeValue.trim()
    if (text) return text
    return null
  }
  if (xmlNode.hasChildNodes()) {
    for (const child of xmlNode.childNodes) {
      const childResult = xmlToJson(child)
      if (childResult === null) continue
      if (result[child.nodeName]) {
        if (!Array.isArray(result[child.nodeName])) {
          result[child.nodeName] = [result[child.nodeName]]
        }
        result[child.nodeName].push(childResult)
      } else {
        result[child.nodeName] = childResult
      }
    }
  }
  const keys = Object.keys(result)
  if (keys.length === 1 && result['#text']) {
    return result['#text']
  }
  if (keys.length === 0 && xmlNode.nodeType === 1) {
    return ''
  }
  return result
}

function convert() {
  error.value = ''
  output.value = ''
  if (!input.value.trim()) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(input.value, 'text/xml')
      const parseError = doc.querySelector('parsererror')
      if (parseError) {
        error.value = 'Invalid XML: ' + parseError.textContent.split('\n')[0]
        return
      }
      const root = doc.documentElement
      const jsonResult = {}
      jsonResult[root.nodeName] = xmlToJson(root)
      output.value = formatJson(jsonResult)
    } catch (e) {
      error.value = `XML parse error: ${e.message}`
    }
  }, 200)
}

function loadExample() {
  input.value = `<?xml version="1.0" encoding="UTF-8"?>
<note>
  <to>John</to>
  <from>Jane</from>
  <heading>Reminder</heading>
  <body>Don't forget the meeting tomorrow at 10am</body>
  <priority level="high">1</priority>
  <tags>
    <tag>work</tag>
    <tag>important</tag>
  </tags>
</note>`
  convert()
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
      <h1>XML to JSON Converter - Convert XML to JSON Online</h1>
      <p class="subtitle">Convert XML data to JSON format instantly. Free online XML to JSON converter with attribute support and copy to clipboard.</p>
    </header>

    <main class="main">
      <section class="panel">
        <div class="toolbar">
          <button class="btn-tool" @click="loadExample">Load Example</button>
          <button class="btn-tool" @click="input = ''; output = ''; error = ''">Clear</button>
        </div>
        <div class="two-cols">
          <div class="field">
            <label>XML Input</label>
            <textarea v-model="input" @input="convert" placeholder='<root>&#10;  <item>value</item>&#10;</root>' rows="14" />
          </div>
          <div class="field">
            <div class="label-row">
              <label>JSON Output</label>
              <button v-if="output" class="btn-mini" @click="copyToClipboard(output)">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>
            </div>
            <div v-if="error" class="error">{{ error }}</div>
            <pre v-else-if="output" class="output-box">{{ output }}</pre>
            <div v-else class="empty-state"><p>Enter XML to convert to JSON</p></div>
          </div>
        </div>
      </section>
    </main>

    <section class="seo-content">
      <h2>What is XML to JSON Conversion?</h2>
      <p>XML (eXtensible Markup Language) and JSON (JavaScript Object Notation) are both popular data interchange formats. XML uses tags like HTML, while JSON uses a more compact key-value structure. Converting XML to JSON is common when modernizing legacy systems or when APIs need to return JSON instead of XML.</p>

      <h2>How to Convert XML to JSON</h2>
      <ol>
        <li>Paste your XML data into the input box on the left</li>
        <li>The JSON output appears automatically on the right</li>
        <li>Click the "Copy" button to copy the JSON result</li>
        <li>XML attributes are preserved as <code>@attributes</code> properties</li>
      </ol>

      <h2>Conversion Rules</h2>
      <ul>
        <li><strong>XML elements</strong> become JSON object properties</li>
        <li><strong>XML attributes</strong> are stored in <code>@attributes</code> object</li>
        <li><strong>Text content</strong> becomes string values</li>
        <li><strong>Repeated elements</strong> are converted to JSON arrays</li>
        <li><strong>Nested elements</strong> become nested JSON objects</li>
      </ul>

      <h2>XML vs JSON Comparison</h2>
      <table class="compare-table">
        <tr><th>Feature</th><th>XML</th><th>JSON</th></tr>
        <tr><td>Syntax</td><td>Tags (&lt;tag&gt;)</td><td>Key-value pairs</td></tr>
        <tr><td>Attributes</td><td>Supported</td><td>Not native</td></tr>
        <tr><td>Comments</td><td>Supported (&lt;!-- --&gt;)</td><td>Not supported</td></tr>
        <tr><td>Size</td><td>Larger (verbose)</td><td>Smaller (compact)</td></tr>
        <tr><td>Parsing</td><td>Complex (DOM parser)</td><td>Simple (JSON.parse)</td></tr>
        <tr><td>Usage</td><td>Legacy systems, SOAP</td><td>REST APIs, modern web</td></tr>
      </table>

      <h2>Key Features</h2>
      <ul>
        <li><strong>Instant conversion:</strong> Real-time XML to JSON as you type</li>
        <li><strong>Attribute support:</strong> XML attributes preserved in JSON</li>
        <li><strong>Array detection:</strong> Repeated elements become arrays</li>
        <li><strong>Copy to clipboard:</strong> One-click copy of JSON result</li>
        <li><strong>Privacy first:</strong> All processing in your browser</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h3>Is this XML to JSON converter free?</h3>
        <p>Yes, completely free with no limits.</p>
        <h3>How are XML attributes handled?</h3>
        <p>XML attributes are stored in a <code>@attributes</code> property within the element's JSON object. For example, <code>&lt;item id="1"&gt;value&lt;/item&gt;</code> becomes <code>{"item": {"@attributes": {"id": "1"}, "#text": "value"}}</code>.</p>
        <h3>Does it support XML namespaces?</h3>
        <p>Yes, namespaces are preserved in the element names. The converter does not strip namespace prefixes.</p>
      </div>

      <h2>Related Tools</h2>
      <ul class="related-tools">
        <li><router-link to="/json-to-yaml">JSON to YAML Converter</router-link> — Convert JSON to YAML</li>
        <li><router-link to="/yaml-to-json">YAML to JSON Converter</router-link> — Convert YAML to JSON</li>
        <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify JSON data</li>
        <li><router-link to="/json-viewer">JSON Viewer</router-link> — View JSON as a tree</li>
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
.label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
.btn-mini { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.5rem; font-size: 0.75rem; color: var(--text-muted); background: transparent; border: 1px solid transparent; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
.btn-mini:hover { color: var(--accent); background: var(--accent-light); border-color: var(--border); }
textarea { width: 100%; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text); font-size: 0.875rem; line-height: 1.6; resize: vertical; }
textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
.error { padding: 1rem 1.25rem; background: var(--remove-bg); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-sm); color: var(--remove); font-size: 0.9rem; }
.output-box { margin: 0; padding: 1rem 1.25rem; background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.8125rem; line-height: 1.6; overflow: auto; max-height: 60vh; white-space: pre-wrap; word-break: break-all; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1.5rem; text-align: center; color: var(--text-subtle); }
.compare-table { width: 100%; border-collapse: collapse; margin: 0 0 1rem; font-size: 0.875rem; }
.compare-table th { text-align: left; padding: 0.5rem 0.75rem; background: var(--surface-hover); border: 1px solid var(--border); font-weight: 600; color: var(--text); }
.compare-table td { padding: 0.5rem 0.75rem; border: 1px solid var(--border); color: var(--text-muted); }
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
