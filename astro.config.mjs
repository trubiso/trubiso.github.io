// @ts-check
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkMath from 'remark-math';

// https://astro.build/config
export default defineConfig({
  site: "https://trubiso.github.io",
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "en",
    fallback: {
      es: "en",
    },
    routing: {
      fallbackType: "rewrite",
    },
  },
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: "ayu-dark",
      wrap: true,
    },
    processor: unified({
      remarkPlugins: [
        remarkMath,
      ],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            content: {
              type: "text",
              value: "#",
            },
            headingProperties: {
              className: ["anchor"],
            },
            properties: {
              className: ["anchor-link"],
            },
          },
        ],
        [
          rehypeExternalLinks,
          {
            properties: {
              className: ["external-link"],
            }
          }
        ],
        rehypeKatex,
      ]
    }),
  },
});
