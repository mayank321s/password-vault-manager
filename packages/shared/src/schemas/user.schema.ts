import z from 'zod';

export const userSearchResponseSchema = z.object({
  users: z
    .object({
      id: z.string(),
      email: z.string().email(),
      username: z.string(),
      publicKey: z.string(),
    })
    .array(),
});
