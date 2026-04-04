import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { CurrentUser, CurrentUserData } from 'src/common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SsoService } from './sso.service';
import {
  SsoConfigurationResponseDto,
  UpsertSsoConfigurationRequestDto,
  VerifySsoDomainRequestDto,
} from './dto';

@Controller('config')
@UseGuards(JwtAuthGuard)
export class SsoController {
  constructor(private readonly ssoService: SsoService) {}

  @Get('current')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: SsoConfigurationResponseDto })
  getCurrentConfiguration(@CurrentUser() user: CurrentUserData) {
    return this.ssoService.getCurrentConfiguration(user);
  }

  @Post('current')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: SsoConfigurationResponseDto })
  upsertConfiguration(
    @CurrentUser() user: CurrentUserData,
    @Body() payload: UpsertSsoConfigurationRequestDto,
  ) {
    return this.ssoService.upsertConfiguration(user, payload);
  }

  @Post('domains/:domainId/verify')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: SsoConfigurationResponseDto })
  verifyDomain(
    @CurrentUser() user: CurrentUserData,
    @Param('domainId') domainId: string,
    @Body() payload: VerifySsoDomainRequestDto,
  ) {
    return this.ssoService.verifyDomain(user, domainId, payload);
  }
}
