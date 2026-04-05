import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import {
  CurrentUser,
  CurrentUserData,
  RequireOrgRoles,
} from 'src/common/decorators';
import { OrganizationRoleGuard } from 'src/common/guards/organization-role.guard';
import { OrganizationMemberRole } from 'src/database/models';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditApiService } from './audit.service';
import { AuditEventListDto, AuditExportDto } from './dto';

@Controller()
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@RequireOrgRoles(OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN)
export class AuditController {
  constructor(private readonly auditApiService: AuditApiService) {}

  @Get('events')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: AuditEventListDto })
  listEvents(
    @CurrentUser() user: CurrentUserData,
    @Query('actorUserId') actorUserId?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditApiService.listEvents(user, {
      actorUserId,
      action,
      targetType,
      targetId,
      dateFrom,
      dateTo,
      limit,
    });
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: AuditExportDto })
  exportEvents(
    @CurrentUser() user: CurrentUserData,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Query('actorUserId') actorUserId?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditApiService.exportEvents(user, format, {
      actorUserId,
      action,
      targetType,
      targetId,
      dateFrom,
      dateTo,
      limit,
    });
  }
}
