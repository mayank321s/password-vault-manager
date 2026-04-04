import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import {
  CurrentScimContext,
  CurrentScimContextData,
  CurrentUser,
  CurrentUserData,
  RequireOrgRoles,
} from 'src/common/decorators';
import { OrganizationMemberRole } from 'src/database/models';
import { OrganizationRoleGuard } from 'src/common/guards/organization-role.guard';
import { ScimTokenAuthGuard } from 'src/common/guards/scim-token-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateScimTokenRequestDto,
  CreateScimTokenResponseDto,
  ScimDiagnosticsDto,
  ScimGroupListResponseDto,
  ScimGroupResourceDto,
  ScimPatchGroupRequestDto,
  ScimPatchUserRequestDto,
  ScimTokenResponseDto,
  ScimTokenListResponseDto,
  ScimUpdateUserRequestDto,
  ScimUserListResponseDto,
  ScimUserResourceDto,
  ScimCreateUserRequestDto,
} from './dto';
import { ScimService } from './scim.service';
import { ScimAdminService } from './scim-admin.service';

@Controller()
export class ScimController {
  constructor(
    private readonly scimService: ScimService,
    private readonly scimAdminService: ScimAdminService,
  ) {}

  @Get('v2/Users')
  @UseGuards(ScimTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimUserListResponseDto })
  listUsers(@CurrentScimContext() scimContext: CurrentScimContextData) {
    return this.scimService.listUsers(scimContext);
  }

  @Post('v2/Users')
  @UseGuards(ScimTokenAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ status: HttpStatus.CREATED, type: ScimUserResourceDto })
  createUser(
    @CurrentScimContext() scimContext: CurrentScimContextData,
    @Body() payload: ScimCreateUserRequestDto,
  ) {
    return this.scimService.createUser(scimContext, payload);
  }

  @Get('v2/Users/:resourceId')
  @UseGuards(ScimTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimUserResourceDto })
  getUser(
    @CurrentScimContext() scimContext: CurrentScimContextData,
    @Param('resourceId') resourceId: string,
  ) {
    return this.scimService.getUser(scimContext, resourceId);
  }

  @Patch('v2/Users/:resourceId')
  @UseGuards(ScimTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimUserResourceDto })
  patchUser(
    @CurrentScimContext() scimContext: CurrentScimContextData,
    @Param('resourceId') resourceId: string,
    @Body() payload: ScimPatchUserRequestDto,
  ) {
    return this.scimService.patchUser(scimContext, resourceId, payload);
  }

  @Put('v2/Users/:resourceId')
  @UseGuards(ScimTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimUserResourceDto })
  updateUser(
    @CurrentScimContext() scimContext: CurrentScimContextData,
    @Param('resourceId') resourceId: string,
    @Body() payload: ScimUpdateUserRequestDto,
  ) {
    return this.scimService.updateUser(scimContext, resourceId, payload);
  }

  @Get('v2/Groups')
  @UseGuards(ScimTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimGroupListResponseDto })
  listGroups(@CurrentScimContext() scimContext: CurrentScimContextData) {
    return this.scimService.listGroups(scimContext);
  }

  @Get('v2/Groups/:groupId')
  @UseGuards(ScimTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimGroupResourceDto })
  getGroup(
    @CurrentScimContext() scimContext: CurrentScimContextData,
    @Param('groupId') groupId: string,
  ) {
    return this.scimService.getGroup(scimContext, groupId);
  }

  @Patch('v2/Groups/:groupId')
  @UseGuards(ScimTokenAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimGroupResourceDto })
  patchGroup(
    @CurrentScimContext() scimContext: CurrentScimContextData,
    @Param('groupId') groupId: string,
    @Body() payload: ScimPatchGroupRequestDto,
  ) {
    return this.scimService.patchGroup(scimContext, groupId, payload);
  }

  @Get('admin/tokens')
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @RequireOrgRoles(OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimTokenListResponseDto })
  async listTokens(@CurrentUser() user: CurrentUserData) {
    return { tokens: await this.scimAdminService.listTokens(user) };
  }

  @Post('admin/tokens')
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @RequireOrgRoles(OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ status: HttpStatus.CREATED, type: CreateScimTokenResponseDto })
  createToken(
    @CurrentUser() user: CurrentUserData,
    @Body() payload: CreateScimTokenRequestDto,
  ) {
    return this.scimAdminService.createToken(user, payload);
  }

  @Patch('admin/tokens/:tokenId/revoke')
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @RequireOrgRoles(OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimTokenResponseDto })
  revokeToken(
    @CurrentUser() user: CurrentUserData,
    @Param('tokenId') tokenId: string,
  ) {
    return this.scimAdminService.revokeToken(user, tokenId);
  }

  @Get('admin/diagnostics')
  @UseGuards(JwtAuthGuard, OrganizationRoleGuard)
  @RequireOrgRoles(OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimDiagnosticsDto })
  getDiagnostics(@CurrentUser() user: CurrentUserData) {
    return this.scimAdminService.getDiagnostics(user);
  }
}
