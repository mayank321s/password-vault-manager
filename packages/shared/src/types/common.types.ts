import z from 'zod';
import { successResponseSchema } from '../schemas';

export type SuccessResponse = z.infer<typeof successResponseSchema>;
