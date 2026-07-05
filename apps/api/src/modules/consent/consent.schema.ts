import { z } from 'zod';

export const consentKindSchema = z.enum([
  'privacy_policy',
  'terms_of_service',
  'email_marketing',
  'whatsapp_marketing',
]);

export const upsertConsentSchema = z.object({
  kind: consentKindSchema,
  accepted: z.boolean(),
});

export type ConsentKindInput = z.infer<typeof consentKindSchema>;
export type UpsertConsentInput = z.infer<typeof upsertConsentSchema>;
