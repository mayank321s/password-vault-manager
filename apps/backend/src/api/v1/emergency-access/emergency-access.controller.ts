import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import {
  CurrentUser,
  CurrentUserData,
  RequireFamilyRoles,
} from 'src/common/decorators';
import { TenantAccessGuard } from 'src/common/guards/tenant-access.guard';
import { FamilyRoleGuard } from 'src/common/guards/family-role.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmergencyAccessService } from './emergency-access.service';
import {
  CreateEmergencyAccessGrantRequestDto,
  EmergencyAccessGrantListResponseDto,
  EmergencyAccessGrantSummaryDto,
} from './dto';
import { OrganizationMemberRole } from 'src/database/models';

@Controller()
@UseGuards(JwtAuthGuard, TenantAccessGuard, FamilyRoleGuard)
export class EmergencyAccessController {
  constructor(
    private readonly emergencyAccessService: EmergencyAccessService,
  ) {}

  @Get('grants')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: EmergencyAccessGrantListResponseDto })
  listGrants(@CurrentUser() user: CurrentUserData) {
    return this.emergencyAccessService.listGrants(user);
  }

  @Post('grants')
  @HttpCode(HttpStatus.CREATED)
  @RequireFamilyRoles(OrganizationMemberRole.OWNER, OrganizationMemberRole.ADULT)
  @ZodResponse({ status: HttpStatus.CREATED, type: EmergencyAccessGrantSummaryDto })
  createGrant(
    @CurrentUser() user: CurrentUserData,
    @Body() payload: CreateEmergencyAccessGrantRequestDto,
  ) {
    return this.emergencyAccessService.createGrant(user, payload);
  }

  @Post('grants/:grantId/accept')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: EmergencyAccessGrantSummaryDto })
  acceptGrant(
    @CurrentUser() user: CurrentUserData,
    @Param('grantId') grantId: string,
  ) {
    return this.emergencyAccessService.acceptGrant(user, grantId);
  }

  @Delete('grants/:grantId')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: EmergencyAccessGrantSummaryDto })
  revokeGrant(
    @CurrentUser() user: CurrentUserData,
    @Param('grantId') grantId: string,
  ) {
    return this.emergencyAccessService.revokeGrant(user, grantId);
  }
}
