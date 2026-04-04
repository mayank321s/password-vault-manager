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
import { CurrentUser, CurrentUserData, RequireOrgRoles } from 'src/common/decorators';
import { OrganizationMemberRole } from 'src/database/models';
import { OrganizationRoleGuard } from 'src/common/guards/organization-role.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ScimCreateUserRequestDto,
  ScimGroupListResponseDto,
  ScimGroupResourceDto,
  ScimPatchGroupRequestDto,
  ScimPatchUserRequestDto,
  ScimUpdateUserRequestDto,
  ScimUserListResponseDto,
  ScimUserResourceDto,
} from './dto';
import { ScimService } from './scim.service';

@Controller('v2')
@UseGuards(JwtAuthGuard, OrganizationRoleGuard)
@RequireOrgRoles(OrganizationMemberRole.OWNER, OrganizationMemberRole.ADMIN)
export class ScimController {
  constructor(private readonly scimService: ScimService) {}

  @Get('Users')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimUserListResponseDto })
  listUsers(@CurrentUser() user: CurrentUserData) {
    return this.scimService.listUsers(user);
  }

  @Post('Users')
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ status: HttpStatus.CREATED, type: ScimUserResourceDto })
  createUser(
    @CurrentUser() user: CurrentUserData,
    @Body() payload: ScimCreateUserRequestDto,
  ) {
    return this.scimService.createUser(user, payload);
  }

  @Get('Users/:resourceId')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimUserResourceDto })
  getUser(
    @CurrentUser() user: CurrentUserData,
    @Param('resourceId') resourceId: string,
  ) {
    return this.scimService.getUser(user, resourceId);
  }

  @Put('Users/:resourceId')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimUserResourceDto })
  updateUser(
    @CurrentUser() user: CurrentUserData,
    @Param('resourceId') resourceId: string,
    @Body() payload: ScimUpdateUserRequestDto,
  ) {
    return this.scimService.updateUser(user, resourceId, payload);
  }

  @Patch('Users/:resourceId')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimUserResourceDto })
  patchUser(
    @CurrentUser() user: CurrentUserData,
    @Param('resourceId') resourceId: string,
    @Body() payload: ScimPatchUserRequestDto,
  ) {
    return this.scimService.patchUser(user, resourceId, payload);
  }

  @Get('Groups')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimGroupListResponseDto })
  listGroups(@CurrentUser() user: CurrentUserData) {
    return this.scimService.listGroups(user);
  }

  @Get('Groups/:groupId')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimGroupResourceDto })
  getGroup(
    @CurrentUser() user: CurrentUserData,
    @Param('groupId') groupId: string,
  ) {
    return this.scimService.getGroup(user, groupId);
  }

  @Patch('Groups/:groupId')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: ScimGroupResourceDto })
  patchGroup(
    @CurrentUser() user: CurrentUserData,
    @Param('groupId') groupId: string,
    @Body() payload: ScimPatchGroupRequestDto,
  ) {
    return this.scimService.patchGroup(user, groupId, payload);
  }
}
