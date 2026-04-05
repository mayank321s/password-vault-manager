import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { CurrentUser, type CurrentUserData } from 'src/common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImportsService } from './imports.service';
import { ParseImportRequestDto, ParseImportResponseDto } from './dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('parse')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ParseImportResponseDto })
  parseImport(
    @CurrentUser() user: CurrentUserData,
    @Body() payload: ParseImportRequestDto,
  ) {
    return this.importsService.parseImport(user.userId, payload);
  }
}
