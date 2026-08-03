import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: 'JSON Diff - Compare Two JSON Files Online | Free JSON Tool',
      description: 'Compare two JSON objects side by side with visual diff highlighting. Free online JSON diff tool with syntax highlighting and escape character support.',
    },
  },
  {
    path: '/json-formatter',
    name: 'json-formatter',
    component: () => import('../views/JsonFormatterView.vue'),
    meta: {
      title: 'JSON Formatter Online - Beautify & Pretty Print JSON | Free Tool',
      description: 'Format and beautify JSON data online for free. Pretty print JSON with customizable indentation. Supports escaped strings and comments.',
    },
  },
  {
    path: '/json-validator',
    name: 'json-validator',
    component: () => import('../views/JsonValidatorView.vue'),
    meta: {
      title: 'JSON Validator Online - Validate & Check JSON Syntax | Free Tool',
      description: 'Validate JSON online and find syntax errors instantly. Free JSON validator tool that checks your JSON and highlights exact error locations.',
    },
  },
  {
    path: '/json-minify',
    name: 'json-minify',
    component: () => import('../views/JsonMinifyView.vue'),
    meta: {
      title: 'JSON Minify Online - Compress JSON to One Line | Free Tool',
      description: 'Minify JSON online to reduce file size. Free JSON compressor tool that removes whitespace and line breaks from your JSON data.',
    },
  },
  {
    path: '/json-to-yaml',
    name: 'json-to-yaml',
    component: () => import('../views/JsonToYamlView.vue'),
    meta: {
      title: 'JSON to YAML Converter Online - Free Tool',
      description: 'Convert JSON to YAML format online for free. Simple, fast JSON to YAML conversion tool with copy-to-clipboard support.',
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
      description: 'Read the privacy policy for JSON Diff Tools. We respect your privacy and do not store your data.',
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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title || 'JSON Diff Tools'
  const descTag = document.querySelector('meta[name="description"]')
  if (descTag && to.meta.description) {
    descTag.setAttribute('content', to.meta.description)
  }
})

export default router
