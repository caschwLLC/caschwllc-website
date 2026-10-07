import { z } from 'zod';

export const launchSchema = z.object({
  contentAndAssetsApproved: z.literal(true),
  responsiblePublisher: z
    .string()
    .trim()
    .min(3)
    .refine((value) => !/pending|placeholder|tbd/i.test(value)),
  effectiveDate: z.iso.date(),
  providerDisclosuresApproved: z.literal(true),
  deletionGuidanceVerified: z.literal(true),
  domainAndHostingVerified: z.literal(true),
  dependencyRiskReviewed: z.literal(true),
});
