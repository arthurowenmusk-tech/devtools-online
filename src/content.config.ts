import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tools = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/tools" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    category: z.enum(['comparison', 'how-to', 'vs', 'review']),
    tags: z.array(z.string()),
    featuredImage: z.string().optional(),
    schemaType: z.enum(['Article', 'HowTo', 'Review']).default('Article'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { tools };
