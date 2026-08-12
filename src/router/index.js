import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: 'JSON Diff - Compare Two JSON Files Online | Free JSON Tool',
      description: 'Compare two JSON objects side by side with visual diff highlighting. Free online JSON diff tool with syntax highlighting, auto-repair, and escape character support.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON Diff Tool',
        description: 'Compare two JSON objects side by side with visual diff highlighting. Free online JSON diff tool.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Side-by-side JSON comparison',
          'Visual diff highlighting',
          'Auto-repair invalid JSON',
          'Escape character support',
          'Comment stripping',
          'Ignore key/array order',
          'Drag & drop files',
          'No data stored - browser-side processing',
        ],
      },
    },
  },
  {
    path: '/json-formatter',
    name: 'json-formatter',
    component: () => import('../views/JsonFormatterView.vue'),
    meta: {
      title: 'JSON Formatter Online - Beautify & Pretty Print JSON | Free Tool',
      description: 'Format and beautify JSON data online for free. Pretty print JSON with customizable indentation. Supports escaped strings, comments, and auto-repair.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON Formatter',
        description: 'Format and beautify JSON data online for free with customizable indentation.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    },
  },
  {
    path: '/json-validator',
    name: 'json-validator',
    component: () => import('../views/JsonValidatorView.vue'),
    meta: {
      title: 'JSON Validator Online - Validate & Check JSON Syntax | Free Tool',
      description: 'Validate JSON online and find syntax errors instantly. Free JSON validator tool that checks your JSON and highlights exact error locations.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON Validator',
        description: 'Validate JSON online and find syntax errors instantly.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    },
  },
  {
    path: '/json-minify',
    name: 'json-minify',
    component: () => import('../views/JsonMinifyView.vue'),
    meta: {
      title: 'JSON Minify Online - Compress JSON to One Line | Free Tool',
      description: 'Minify JSON online to reduce file size. Free JSON compressor tool that removes whitespace and line breaks from your JSON data.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON Minifier',
        description: 'Minify JSON online to reduce file size by removing whitespace.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    },
  },
  {
    path: '/json-repair',
    name: 'json-repair',
    component: () => import('../views/JsonRepairView.vue'),
    meta: {
      title: 'JSON Repair Tool - Fix Invalid JSON Online Free | Auto-Repair',
      description: 'Fix invalid JSON online for free. Auto-repairs single quotes, unquoted keys, trailing commas, comments, and stray characters. Get valid, formatted JSON with no upload.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON Repair Tool',
        description: 'Fix invalid JSON online for free with auto-repair and formatting.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Auto-repair invalid JSON',
          'Fix single quotes and unquoted keys',
          'Remove trailing commas',
          'Strip JSON comments',
          'Exact error position on failure',
          'No data stored - browser-side processing',
        ],
      },
    },
  },
  {
    path: '/json-to-csv',
    name: 'json-to-csv',
    component: () => import('../views/JsonToCsvView.vue'),
    meta: {
      title: 'JSON to CSV Converter Online - Convert JSON to CSV Free | Auto-Repair',
      description: 'Convert JSON to CSV online for free. Auto-repairs broken JSON, handles nested objects and arrays, with one-click copy and download to CSV.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON to CSV Converter',
        description: 'Convert JSON to CSV online for free with auto-repair and CSV download.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'JSON to CSV conversion',
          'Auto-repair invalid JSON',
          'Nested object and array support',
          'Comma, semicolon, and tab delimiters',
          'Copy and download to CSV',
          'No data stored - browser-side processing',
        ],
      },
    },
  },
  {
    path: '/json-to-yaml',
    name: 'json-to-yaml',
    component: () => import('../views/JsonToYamlView.vue'),
    meta: {
      title: 'JSON to YAML Converter Online - Free Tool',
      description: 'Convert JSON to YAML format online for free. Simple, fast JSON to YAML conversion tool with copy-to-clipboard support.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON to YAML Converter',
        description: 'Convert JSON to YAML format online for free.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    },
  },
  {
    path: '/yaml-to-json',
    name: 'yaml-to-json',
    component: () => import('../views/YamlToJsonView.vue'),
    meta: {
      title: 'YAML to JSON Converter Online - Free Tool',
      description: 'Convert YAML to JSON format online for free. Fast, accurate YAML to JSON conversion with syntax validation and copy support.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'YAML to JSON Converter',
        description: 'Convert YAML to JSON format online for free.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    },
  },
  {
    path: '/xml-to-json',
    name: 'xml-to-json',
    component: () => import('../views/XmlToJsonView.vue'),
    meta: {
      title: 'XML to JSON Converter Online - Free Tool',
      description: 'Convert XML to JSON format online for free. Fast XML to JSON converter with attribute support and copy to clipboard.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'XML to JSON Converter',
        description: 'Convert XML to JSON format online for free.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    },
  },
  {
    path: '/json-viewer',
    name: 'json-viewer',
    component: () => import('../views/JsonViewerView.vue'),
    meta: {
      title: 'JSON Viewer Online - Interactive JSON Tree Viewer | Free Tool',
      description: 'View JSON data in an interactive, collapsible tree structure. Free online JSON viewer with syntax highlighting and nested object support.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'JSON Viewer',
        description: 'View JSON data in an interactive, collapsible tree structure.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    },
  },
  // Articles
  {
    path: '/articles/how-to-compare-json',
    name: 'article-how-to-compare-json',
    component: () => import('../views/articles/HowToCompareJsonView.vue'),
    meta: {
      title: 'How to Compare JSON: A Complete Guide | JSON Diff Tools',
      description: 'Learn how to compare JSON data effectively. Complete guide covering JSON diff tools, command-line methods, programming libraries, and best practices.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'How to Compare JSON: A Complete Guide',
        datePublished: '2026-08-03',
        author: { '@type': 'Organization', name: 'JSON Diff Tools' },
      },
    },
  },
  {
    path: '/articles/json-diff-vs-text-diff',
    name: 'article-json-diff-vs-text-diff',
    component: () => import('../views/articles/JsonDiffVsTextDiffView.vue'),
    meta: {
      title: 'JSON Diff vs Text Diff: Which Should You Use? | JSON Diff Tools',
      description: 'Understand the difference between JSON diff and text diff. Learn when to use each approach for comparing JSON data accurately.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'JSON Diff vs Text Diff: Which Should You Use?',
        datePublished: '2026-08-03',
        author: { '@type': 'Organization', name: 'JSON Diff Tools' },
      },
    },
  },
  {
    path: '/articles/json-best-practices',
    name: 'article-json-best-practices',
    component: () => import('../views/articles/JsonBestPracticesView.vue'),
    meta: {
      title: 'JSON Best Practices: A Developer\'s Guide | JSON Diff Tools',
      description: '12 essential JSON best practices for developers. Learn proper formatting, validation, data types, structure, and tool usage.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'JSON Best Practices: A Developer\'s Guide',
        datePublished: '2026-08-03',
        author: { '@type': 'Organization', name: 'JSON Diff Tools' },
      },
    },
  },
  // Static pages
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: {
      title: 'About Us - JSON Diff Tools',
      description: 'Learn about JSON Diff Tools, a free online suite of JSON utilities for developers including JSON diff, formatter, validator, and converter.',
    },
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: () => import('../views/PrivacyPolicyView.vue'),
    meta: {
      title: 'Privacy Policy - JSON Diff Tools',
      description: 'Read the privacy policy for JSON Diff Tools. We respect your privacy and do not store your data. All processing happens in your browser.',
    },
  },
  {
    path: '/terms-of-service',
    name: 'terms-of-service',
    component: () => import('../views/TermsOfServiceView.vue'),
    meta: {
      title: 'Terms of Service - JSON Diff Tools',
      description: 'Read the terms of service for JSON Diff Tools. Free online JSON utilities with browser-side processing.',
    },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('../views/ContactView.vue'),
    meta: {
      title: 'Contact Us - JSON Diff Tools',
      description: 'Get in touch with the JSON Diff Tools team. We welcome feedback, feature requests, and bug reports.',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: '404 - Page Not Found | JSON Diff Tools',
      description: 'The page you are looking for does not exist.',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

function setMetaTag(attr, key, content) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

function setJsonLd(data) {
  const id = 'route-jsonld'
  let script = document.getElementById(id)
  if (!data) {
    if (script) script.remove()
    return
  }
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.setAttribute('type', 'application/ld+json')
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

router.afterEach((to) => {
  document.title = to.meta.title || 'JSON Diff Tools'
  if (to.meta.description) setMetaTag('name', 'description', to.meta.description)
  const canonicalUrl = window.location.origin + to.path
  setCanonical(canonicalUrl)
  setMetaTag('property', 'og:title', to.meta.title || 'JSON Diff Tools')
  setMetaTag('property', 'og:description', to.meta.description || '')
  setMetaTag('property', 'og:url', canonicalUrl)
  setMetaTag('property', 'og:type', 'website')
  setMetaTag('property', 'og:site_name', 'JSON Diff Tools')
  setMetaTag('name', 'twitter:card', 'summary')
  setMetaTag('name', 'twitter:title', to.meta.title || 'JSON Diff Tools')
  setMetaTag('name', 'twitter:description', to.meta.description || '')
  setJsonLd(to.meta.jsonLd || null)
})

export default router
