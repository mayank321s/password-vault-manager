import { PipeTransform } from '@nestjs/common';
import z from 'zod';

export class ParseEmailPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'string' || !this.validateEmail(value)) {
      throw new Error('Invalid email address');
    }
    return value.trim().toLowerCase();
  }

  private validateEmail(email: string): boolean {
    const validation = z.string().email().safeParse(email);
    if (!validation.success) {
      return false;
    }

    return true;
  }
}
