import { ZodError } from 'zod';

export const mapZodErrorMessage = (error: ZodError): string =>
  error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
