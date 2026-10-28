import { z } from 'zod';

export const slugSchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/)
  .refine(
    (slug) =>
      !['privacy', 'support', 'accessibility', '404', 'index'].includes(slug),
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
  darkName: z
    .string()
    .regex(/^[a-z][a-z0-9-]+$/)
    .optional(),
  alt: z.string().trim().min(12),
  device: z.enum(['phone', 'tablet']),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const verificationDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((date) => {
    const parsed = new Date(date);
    return (
      !Number.isNaN(parsed.valueOf()) &&
      parsed.toISOString().slice(0, 10) === date
    );
  }, 'Invalid verification date');

const distributionSchema = z
  .object({
    kind: z.literal('github-dmg'),
    repository: z.literal('caschwLLC/caschwllc-website'),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    tag: z.string().regex(/^override-v\d+\.\d+\.\d+$/),
    asset: z.string().regex(/^Override-\d+\.\d+\.\d+\.dmg$/),
    channel: z.literal('beta'),
    draft: z.boolean(),
    verifiedOn: verificationDate,
  })
  .strict()
  .superRefine((release, ctx) => {
    if (
      release.tag !== `override-v${release.version}` ||
      release.asset !== `Override-${release.version}.dmg`
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Release tag and DMG asset must match the beta version',
      });
  });

const featureCopy = z.object({
  title: z.string().min(5),
  paragraphs: z.array(z.string().min(10)).min(1),
});

const iconDensities = (appearance: 'light' | 'dark') => {
  const prefix = `/media/override-icon-${appearance === 'dark' ? 'dark-' : ''}`;
  return z
    .object({
      '1x': z.literal(`${prefix}64.png`),
      '2x': z.literal(`${prefix}128.png`),
      '3x': z.literal(`${prefix}192.png`),
    })
    .strict();
};

const appBase = z
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
    socialImage: z
      .object({
        src: z.string().regex(/^\/media\/[a-z0-9-]+\.png$/),
        width: z.literal(1200),
        height: z.literal(630),
        alt: z.string().trim().min(12),
      })
      .strict()
      .optional(),
    pages: z
      .object({
        privacy: z.boolean(),
        support: z.literal(true),
        accessibility: z.boolean(),
      })
      .strict(),
  })
  .strict();

const screensApp = appBase.extend({
  presentation: z.literal('screens'),
  icon: z.string().regex(/^\/media\/[a-z0-9-]+\.png$/),
  hero: mediaSchema,
  secondaryHero: mediaSchema,
  features: z
    .array(
      featureCopy
        .extend({
          media: mediaSchema,
          tone: z.enum(['lavender', 'mint', 'sky', 'ink']),
          caption: z.string().min(10),
        })
        .strict(),
    )
    .min(1),
  store: z
    .object({
      url: httpsUrl,
      verifiedOn: verificationDate,
    })
    .optional(),
});

const utilityApp = appBase.extend({
  presentation: z.literal('utility'),
  icon: z.literal('/media/override-icon.png'),
  iconVariants: z
    .object({
      light: iconDensities('light'),
      dark: iconDensities('dark'),
    })
    .strict()
    .optional(),
  features: z.array(featureCopy.strict()).min(1),
  distribution: distributionSchema,
});

export const appSchema = z
  .discriminatedUnion('presentation', [screensApp, utilityApp])
  .superRefine((app, ctx) => {
    if (app.presentation === 'utility') {
      if (
        app.slug !== 'override' ||
        !app.platforms.includes('apple') ||
        app.platforms.includes('windows')
      )
        ctx.addIssue({
          code: 'custom',
          message:
            'Override DMG distribution requires the Override Apple catalog entry',
        });
      if ((app.status === 'coming-soon') !== app.distribution.draft)
        ctx.addIssue({
          code: 'custom',
          message:
            'Public downloads require a published release; drafts must be coming soon',
          path: ['distribution', 'draft'],
        });
      return;
    }
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

export function appMedia(app: App): Media[] {
  return app.presentation === 'screens'
    ? [
        app.hero,
        app.secondaryHero,
        ...app.features.map((feature) => feature.media),
      ]
    : [];
}

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
      ...(app.pages.privacy ? [`/apps/${app.slug}/privacy/`] : []),
      `/apps/${app.slug}/support/`,
      ...(app.pages.accessibility ? [`/apps/${app.slug}/accessibility/`] : []),
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
  if (app.presentation === 'utility') {
    const release = app.distribution;
    return app.status === 'available' && !release.draft
      ? {
          label: `Download beta ${release.version}`,
          href: `https://github.com/${release.repository}/releases/download/${release.tag}/${release.asset}`,
        }
      : { label: `Beta ${release.version} · Download coming soon`, href: null };
  }
  if (app.status !== 'available' || !app.store)
    return { label: 'Coming soon', href: null };
  return {
    label:
      new URL(app.store.url).hostname === 'apps.apple.com'
        ? 'View on the App Store'
        : 'View on Microsoft Store',
    href: app.store.url,
  };
}
