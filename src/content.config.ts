import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    published: z.date(),
    edited: z.date().optional(),
    tags: z.array(z.string()),
  }),
});

export const collections = { blog };
