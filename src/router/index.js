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
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Side-by-side JSON comparison',
          'Visual diff highlighting',
          'Auto-repair invalid JSON',
          'Escape character support',
          'Comment stripping',
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
  // Title
  document.title = to.meta.title || 'JSON Diff Tools'

  // Description
  if (to.meta.description) {
    setMetaTag('name', 'description', to.meta.description)
  }

  // Canonical URL (dynamic based on current origin)
  const canonicalUrl = window.location.origin + to.path
  setCanonical(canonicalUrl)

  // Open Graph
  setMetaTag('property', 'og:title', to.meta.title || 'JSON Diff Tools')
  setMetaTag('property', 'og:description', to.meta.description || '')
  setMetaTag('property', 'og:url', canonicalUrl)
  setMetaTag('property', 'og:type', 'website')
  setMetaTag('property', 'og:site_name', 'JSON Diff Tools')

  // Twitter Card
  setMetaTag('name', 'twitter:card', 'summary')
  setMetaTag('name', 'twitter:title', to.meta.title || 'JSON Diff Tools')
  setMetaTag('name', 'twitter:description', to.meta.description || '')

  // JSON-LD Structured Data
  setJsonLd(to.meta.jsonLd || null)
})

export default router
