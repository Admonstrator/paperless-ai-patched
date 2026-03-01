import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const docsBasePath = process.env.DOCS_BASE_PATH || '/';

function remarkPillifyPaperlessNext() {
  const target = 'Paperless-AI next';
  const skipNodeTypes = new Set(['link', 'inlineCode', 'code', 'html']);

  function replaceTextWithPillNodes(text) {
    const nodes = [];
    let start = 0;

    while (start < text.length) {
      const matchIndex = text.indexOf(target, start);

      if (matchIndex === -1) {
        const trailing = text.slice(start);
        if (trailing) {
          nodes.push({ type: 'text', value: trailing });
        }
        break;
      }

      const before = text.slice(start, matchIndex);
      if (before) {
        nodes.push({ type: 'text', value: before });
      }

      nodes.push({
        type: 'html',
        value: '<span class="next-pill">Paperless-AI next</span>'
      });

      start = matchIndex + target.length;
    }

    return nodes;
  }

  function transformChildren(children) {
    const transformed = [];

    for (const child of children) {
      if (child.type === 'text' && child.value.includes(target)) {
        transformed.push(...replaceTextWithPillNodes(child.value));
        continue;
      }

      if (Array.isArray(child.children) && !skipNodeTypes.has(child.type)) {
        child.children = transformChildren(child.children);
      }

      transformed.push(child);
    }

    return transformed;
  }

  function visit(node) {
    if (!node || typeof node !== 'object') {
      return;
    }

    if (node.type === 'paragraph' && Array.isArray(node.children)) {
      node.children = transformChildren(node.children);
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        visit(child);
      }
    }
  }

  return (tree) => {
    visit(tree);
  };
}

export default defineConfig({
  site: process.env.DOCS_SITE_URL || 'http://localhost:4321',
  base: docsBasePath,
  markdown: {
    remarkPlugins: [remarkPillifyPaperlessNext]
  },
  integrations: [
    starlight({
      title: 'Paperless-AI next',
      description:
        'Next-generation fork of paperless-ai for Paperless-ngx, improving AI/OCR reliability with an OCR rescue queue (Mistral), a permanent-failure queue, and ignore filters. Adds history + one-click rescan, restore-original-metadata, and Date/Boolean custom fields support.',
      customCss: ['./src/styles/docs.css'],
      head: [
        {
          tag: 'script',
          attrs: { type: 'module' },
          content: `
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict'
});

async function renderMermaidDiagrams() {
  const codeBlocks = document.querySelectorAll('code.language-mermaid');
  const nodesToRender = [];

  for (const code of codeBlocks) {
    if (code.dataset.mermaidProcessed === 'true') {
      continue;
    }

    const pre = code.closest('pre');
    if (!pre) {
      continue;
    }

    const container = document.createElement('div');
    container.className = 'mermaid';
    container.textContent = code.textContent || '';

    pre.replaceWith(container);
    code.dataset.mermaidProcessed = 'true';
    nodesToRender.push(container);
  }

  if (nodesToRender.length > 0) {
    await mermaid.run({ nodes: nodesToRender });
  }
}

document.addEventListener('astro:page-load', () => {
  renderMermaidDiagrams().catch(console.error);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderMermaidDiagrams().catch(console.error);
  });
} else {
  renderMermaidDiagrams().catch(console.error);
}
          `
        }
      ],
      favicon: '/site-logo.png',
      logo: {
        src: '/site-logo.png',
        alt: 'Paperless-AI next'
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/admonstrator/paperless-ai-next'
        }
      ],
      sidebar: [
        {
          label: 'Home',
          link: '/'
        },
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' }
        },
        {
          label: 'Using Paperless-AI',
          autogenerate: { directory: 'features' }
        },
        {
          label: 'Project',
          items: [
            { label: 'How It Works', link: '/how-it-works/' },
            { label: 'Changelog', link: '/changelog/' },
            { label: 'Contributing', link: '/contributing/' },
            { label: 'Security Policy', link: '/security/' }
          ]
        },
        {
          label: 'Fixes',
          collapsed: true,
          autogenerate: { directory: 'fixes', collapsed: true }
        }
      ]
    })
  ]
});
