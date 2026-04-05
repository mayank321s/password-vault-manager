import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { CurrentUser, CurrentUserData } from 'src/common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  OrganizationPolicyResponseDto,
  UpsertOrganizationPolicyRequestDto,
} from './dto';
import { PoliciesService } from './policies.service';

@Controller('current')
@UseGuards(JwtAuthGuard)
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: OrganizationPolicyResponseDto })
  getCurrentPolicy(@CurrentUser() user: CurrentUserData) {
    return this.policiesService.getCurrentPolicy(user);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: OrganizationPolicyResponseDto })
  upsertPolicy(
    @CurrentUser() user: CurrentUserData,
    @Body() payload: UpsertOrganizationPolicyRequestDto,
  ) {
    return this.policiesService.upsertPolicy(user, payload);
  }
}
