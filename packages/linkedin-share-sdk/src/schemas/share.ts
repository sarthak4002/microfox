import { z } from 'zod';

export const mediaContentSchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export const mediaCategorySchema = z.enum([
  'NONE',
  'ARTICLE',
  'IMAGE',
  'VIDEO',
  'DOCUMENT',
]);
export const visibilitySchema = z.enum(['PUBLIC', 'CONNECTIONS', 'LOGGED_IN']);

export const postOptionsSchema = z.object({
  text: z.string(),
  visibility: visibilitySchema.optional(),
  mediaCategory: mediaCategorySchema.optional(),
  media: z.array(mediaContentSchema).optional(),
  isDraft: z.boolean().optional(),
});

export const shareContentSchema = z.object({
  author: z.string(),
  lifecycleState: z.enum(['PUBLISHED', 'DRAFT']),
  specificContent: z.object({
    'com.linkedin.ugc.ShareContent': z.object({
      shareCommentary: z.object({
        text: z.string(),
      }),
      shareMediaCategory: mediaCategorySchema,
      media: z
        .array(
          z.object({
            status: z.literal('READY'),
            originalUrl: z.string().optional(),
            title: z
              .object({
                text: z.string(),
              })
              .optional(),
            description: z
              .object({
                text: z.string(),
              })
              .optional(),
            thumbnails: z
              .array(
                z.object({
                  url: z.string(),
                }),
              )
              .optional(),
          }),
        )
        .optional(),
    }),
  }),
  visibility: z.object({
    'com.linkedin.ugc.MemberNetworkVisibility': visibilitySchema,
  }),
});

export const shareResponseSchema = z.object({
  id: z.string(),
  activity: z.string(),
  created: z.object({
    actor: z.string(),
    time: z.number(),
  }),
  lastModified: z.object({
    actor: z.string(),
    time: z.number(),
  }),
  lifecycleState: z.string(),
});

// Export inferred types
export type MediaContent = z.infer<typeof mediaContentSchema>;
export type MediaCategory = z.infer<typeof mediaCategorySchema>;
export type Visibility = z.infer<typeof visibilitySchema>;
export type PostOptions = z.infer<typeof postOptionsSchema>;
export type ShareContent = z.infer<typeof shareContentSchema>;
export type ShareResponse = z.infer<typeof shareResponseSchema>;
