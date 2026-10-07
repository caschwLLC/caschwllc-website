import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
import { appSchema } from './lib/catalog';

export const collections = {
  apps: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/apps' }),
    schema: appSchema,
  }),
  policies: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/policies' }),
    schema: z.object({ title: z.string(), description: z.string() }),
  }),
};
