<script setup>
</script>

<template>
  <div class="page">
    <article class="article">
      <header class="article-header">
        <h1>How to Compare JSON: A Complete Guide</h1>
        <p class="meta">Published: 2026-08-03 · Reading time: 5 min</p>
      </header>

      <section>
        <p>Comparing JSON data is a common task for developers — whether you're debugging API responses, verifying configuration changes, or tracking data migrations. In this guide, we'll cover everything you need to know about JSON comparison, from manual methods to automated tools.</p>

        <h2>Why Compare JSON?</h2>
        <p>JSON (JavaScript Object Notation) is the most widely used data format in modern web development. When working with JSON, you'll frequently need to compare two versions:</p>
        <ul>
          <li><strong>API debugging:</strong> Compare expected vs actual API responses</li>
          <li><strong>Configuration management:</strong> Track changes in JSON config files</li>
          <li><strong>Data migration:</strong> Verify data integrity before and after migration</li>
          <li><strong>Testing:</strong> Validate test output against expected results</li>
          <li><strong>Version control:</strong> Review JSON changes in pull requests</li>
        </ul>

        <h2>Methods to Compare JSON</h2>

        <h3>1. Using a JSON Diff Tool (Recommended)</h3>
        <p>The easiest and most accurate way to compare JSON is using a dedicated <router-link to="/">JSON Diff tool</router-link>. These tools parse the JSON structure and highlight differences at the field level, showing exactly what was added, removed, or modified.</p>
        <p>Benefits of using a JSON diff tool:</p>
        <ul>
          <li>Structural comparison — not just text comparison</li>
          <li>Handles key order differences automatically</li>
          <li>Visual highlighting of changes</li>
          <li>Support for nested objects and arrays</li>
        </ul>

        <h3>2. Using Command Line Tools</h3>
        <p>For developers who prefer the terminal, tools like <code>jq</code> and <code>diff</code> can be combined:</p>
        <pre><code>diff &lt;(jq -S . file1.json) &lt;(jq -S . file2.json)</code></pre>
        <p>The <code>-S</code> flag sorts object keys, so key order differences won't show as false positives. However, this approach doesn't handle semantic differences like array reordering.</p>

        <h3>3. Using Programming Languages</h3>
        <p>In JavaScript/Node.js, you can use libraries like <code>jsondiffpatch</code> or <code>deep-diff</code>:</p>
        <pre><code>import { diff } from 'jsondiffpatch'
const delta = diff(obj1, obj2)
console.log(delta)</code></pre>
        <p>In Python, the <code>deepdiff</code> library provides similar functionality:</p>
        <pre><code>from deepdiff import DeepDiff
diff = DeepDiff(obj1, obj2)
print(diff)</code></pre>

        <h2>Common JSON Comparison Challenges</h2>

        <h3>Key Order Differences</h3>
        <p>JSON objects are unordered by specification, but text-based diff tools treat key order as significant. A proper JSON diff tool compares values regardless of key order.</p>

        <h3>Array Order</h3>
        <p>Arrays are ordered in JSON. However, sometimes you want to compare arrays regardless of element order (e.g., comparing sets). Our <router-link to="/">JSON Diff tool</router-link> supports "Ignore Array Order" mode for this.</p>

        <h3>Escaped Strings</h3>
        <p>JSON data that has been stringified (double-encoded) contains escape characters like <code>\"</code> and <code>\n</code>. A good JSON diff tool automatically detects and handles these.</p>

        <h3>Comments in JSON</h3>
        <p>Standard JSON doesn't support comments, but JSONC (JSON with Comments) is widely used. A diff tool that strips comments before comparison handles this gracefully.</p>

        <h2>Step-by-Step: Comparing JSON with Our Tool</h2>
        <ol>
          <li>Go to our <router-link to="/">JSON Diff tool</router-link></li>
          <li>Paste your original JSON into the left box (or drag & drop a .json file)</li>
          <li>Paste your modified JSON into the right box</li>
          <li>Click "Compare JSON" or press <code>Ctrl + Enter</code></li>
          <li>Review the highlighted differences — red for removed, green for added</li>
          <li>Use the download button to save the diff result</li>
        </ol>

        <h2>Best Practices for JSON Comparison</h2>
        <ul>
          <li><strong>Format before comparing:</strong> Use a <router-link to="/json-formatter">JSON Formatter</router-link> to standardize indentation</li>
          <li><strong>Validate first:</strong> Run your JSON through a <router-link to="/json-validator">JSON Validator</router-link> to catch syntax errors</li>
          <li><strong>Use semantic diff:</strong> Prefer structural comparison over text comparison</li>
          <li><strong>Handle large files:</strong> Collapse unchanged sections to focus on differences</li>
          <li><strong>Save results:</strong> Download diff results for documentation and sharing</li>
        </ul>

        <h2>Conclusion</h2>
        <p>Comparing JSON doesn't have to be difficult. Whether you use a web-based tool, command-line utilities, or programming libraries, the key is to choose a method that understands JSON structure rather than treating it as plain text. Our <router-link to="/">JSON Diff tool</router-link> provides a fast, free, and privacy-first solution that handles all the common challenges automatically.</p>
      </section>

      <footer class="article-footer">
        <h3>Related Tools</h3>
        <ul class="related-tools">
          <li><router-link to="/">JSON Diff</router-link> — Compare two JSON objects</li>
          <li><router-link to="/json-formatter">JSON Formatter</router-link> — Beautify JSON data</li>
          <li><router-link to="/json-validator">JSON Validator</router-link> — Validate JSON syntax</li>
          <li><router-link to="/json-viewer">JSON Viewer</router-link> — View JSON as a tree</li>
        </ul>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; padding: 2rem 1.5rem 4rem; max-width: 800px; margin: 0 auto; }
.article { background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--shadow); border: 1px solid var(--border-light); padding: 3rem; }
.article-header { margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); }
.article-header h1 { font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; letter-spacing: -0.03em; color: var(--text); }
.meta { font-size: 0.8125rem; color: var(--text-subtle); margin: 0; }
.article h2 { font-size: 1.375rem; font-weight: 700; color: var(--text); margin: 2rem 0 0.75rem; letter-spacing: -0.02em; }
.article h3 { font-size: 1.125rem; font-weight: 600; color: var(--text); margin: 1.5rem 0 0.5rem; }
.article p { font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted); margin: 0 0 1rem; }
.article ul, .article ol { font-size: 0.9375rem; line-height: 1.7; color: var(--text-muted); padding-left: 1.5rem; margin: 0 0 1rem; }
.article li { margin-bottom: 0.35rem; }
.article code { font-family: var(--font-mono); font-size: 0.85em; background: var(--accent-light); color: var(--accent); padding: 0.15em 0.4em; border-radius: 4px; }
.article pre { background: var(--surface-hover); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem 1.25rem; overflow: auto; margin: 0 0 1rem; }
.article pre code { background: none; padding: 0; font-size: 0.8125rem; }
.article a { color: var(--accent); text-decoration: none; }
.article a:hover { text-decoration: underline; }
.article-footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border-light); }
.article-footer h3 { font-size: 1rem; font-weight: 600; margin: 0 0 0.5rem; }
.related-tools li { margin-bottom: 0.5rem; }
@media (max-width: 768px) { .page { padding: 1rem; } .article { padding: 1.5rem; } .article-header h1 { font-size: 1.5rem; } }
</style>
