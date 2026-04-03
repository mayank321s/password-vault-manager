import z from 'zod';
import { userSearchResponseSchema } from '../schemas';

export type UserSearchResponse = z.infer<typeof userSearchResponseSchema>;
