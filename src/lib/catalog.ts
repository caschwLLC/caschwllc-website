import { z } from 'zod';

export const slugSchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/)
  .refine(
    (slug) => !['privacy', 'support', '404', 'index'].includes(slug),
    'Reserved slug',
  );

export const httpsUrl = z
  .string()
  .regex(/^https:\/\/[^\s\\]+$/)
  .pipe(z.url())
  .superRefine((value, ctx) => {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      /[\s\\]/.test(value)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'A credential-free HTTPS URL is required',
      });
    }
  });

export const mediaSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9-]+$/),
  alt: z.string().trim().min(12),
  device: z.enum(['phone', 'tablet']),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const appSchema = z
  .object({
    slug: slugSchema,
    name: z.string().trim().min(1),
    visibility: z.enum(['marketed', 'draft']),
    status: z.enum(['coming-soon', 'available']),
    platforms: z
      .array(z.enum(['apple', 'windows']))
      .min(1)
      .refine((p) => new Set(p).size === p.length, 'Duplicate platform'),
    summary: z.string().trim().min(20),
    headline: z.string().trim().min(10),
    compatibility: z.string().trim().min(10),
    icon: z.string().regex(/^\/media\/[a-z0-9-]+\.png$/),
    hero: mediaSchema,
    secondaryHero: mediaSchema,
    features: z
      .array(
        z.object({
          title: z.string().min(5),
          paragraphs: z.array(z.string().min(10)).min(1),
          media: mediaSchema,
          tone: z.enum(['lavender', 'mint', 'sky', 'ink']),
          caption: z.string().min(10),
        }),
      )
      .min(1),
    store: z
      .object({
        url: httpsUrl,
        verifiedOn: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((date) => {
            const parsed = new Date(date);
            return (
              !Number.isNaN(parsed.valueOf()) &&
              parsed.toISOString().slice(0, 10) === date
            );
          }, 'Invalid verification date'),
      })
      .optional(),
  })
  .strict()
  .superRefine((app, ctx) => {
    if (app.status === 'available' && !app.store) {
      ctx.addIssue({
        code: 'custom',
        message: 'Available apps require a verified store URL',
        path: ['store'],
      });
    }
    if (app.status === 'coming-soon' && app.store) {
      ctx.addIssue({
        code: 'custom',
        message: 'Coming-soon apps cannot expose a store link',
        path: ['store'],
      });
    }
    if (app.store) {
      const url = new URL(app.store.url);
      const apple =
        url.hostname === 'apps.apple.com' &&
        /^\/[a-z]{2}\/app\/[^/]+\/id\d+$/.test(url.pathname);
      const windows =
        url.hostname === 'apps.microsoft.com' &&
        /^\/detail\/[a-zA-Z0-9]+$/.test(url.pathname);
      if (
        !(
          (apple && app.platforms.includes('apple')) ||
          (windows && app.platforms.includes('windows'))
        ) ||
        url.search ||
        url.hash
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Store URL must match a supported platform listing',
          path: ['store', 'url'],
        });
      }
    }
  });

export type App = z.infer<typeof appSchema>;
export type Media = z.infer<typeof mediaSchema>;

export function parseCatalog(input: unknown): App[] {
  const apps = z.array(appSchema).parse(input);
  const slugs = apps.map((app) => app.slug);
  if (new Set(slugs).size !== slugs.length)
    throw new Error('Duplicate app slug');
  return apps;
}

export function marketedApps(apps: App[]): App[] {
  return apps.filter((app) => app.visibility === 'marketed');
}

export function navigation(apps: App[]) {
  const visible = marketedApps(apps);
  const grouped =
    visible.some((app) => app.platforms.includes('apple')) &&
    visible.some((app) => app.platforms.includes('windows'));
  return grouped
    ? (['apple', 'windows'] as const).map((platform) => ({
        label: platform === 'apple' ? 'Apple' : 'Windows',
        apps: visible.filter((app) => app.platforms.includes(platform)),
      }))
    : [{ label: null, apps: visible }];
}

export function publicRoutes(apps: App[]): string[] {
  return [
    '/',
    '/privacy/',
    ...marketedApps(apps).flatMap((app) => [
      `/apps/${app.slug}/`,
      `/apps/${app.slug}/privacy/`,
      `/apps/${app.slug}/support/`,
    ]),
  ];
}

export function localPath(path: string, base = '/'): string {
  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    /[\\?#%]/.test(path) ||
    path.split('/').some((segment) => segment === '.' || segment === '..')
  )
    throw new Error('Unsafe internal path');
  return `${base.replace(/\/$/, '')}${path}`;
}

export function storeAction(app: App) {
  return app.status === 'available' && app.store
    ? { label: 'View store listing', href: app.store.url }
    : { label: 'Coming soon', href: null };
}
