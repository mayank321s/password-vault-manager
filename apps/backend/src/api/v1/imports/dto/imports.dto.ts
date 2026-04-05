import { createZodDto } from 'nestjs-zod';
import {
  parseImportRequestSchema,
  parseImportResponseSchema,
} from '@repo/shared';

export class ParseImportRequestDto extends createZodDto(
  parseImportRequestSchema,
) {}

export class ParseImportResponseDto extends createZodDto(
  parseImportResponseSchema,
) {}
