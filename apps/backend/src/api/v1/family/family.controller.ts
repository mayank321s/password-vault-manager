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
import { FamilyService } from './family.service';
import {
  AcceptFamilyInvitationRequestDto,
  AcceptFamilyInvitationResponseDto,
  CreateFamilyWorkspaceRequestDto,
  CreateFamilyWorkspaceResponseDto,
  FamilyMembersResponseDto,
  InviteFamilyMemberRequestDto,
  InviteFamilyMemberResponseDto,
} from './dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('workspaces')
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ status: HttpStatus.CREATED, type: CreateFamilyWorkspaceResponseDto })
  createWorkspace(
    @CurrentUser() user: CurrentUserData,
    @Body() payload: CreateFamilyWorkspaceRequestDto,
  ) {
    return this.familyService.createWorkspace(user, payload);
  }

  @Post('workspaces/:organizationId/invitations')
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ status: HttpStatus.CREATED, type: InviteFamilyMemberResponseDto })
  inviteMember(
    @CurrentUser() user: CurrentUserData,
    @Param('organizationId') organizationId: string,
    @Body() payload: InviteFamilyMemberRequestDto,
  ) {
    return this.familyService.inviteMember(user, organizationId, payload);
  }

  @Post('workspaces/:organizationId/invitations/accept')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: AcceptFamilyInvitationResponseDto })
  acceptInvitation(
    @CurrentUser() user: CurrentUserData,
    @Param('organizationId') organizationId: string,
    @Body() payload: AcceptFamilyInvitationRequestDto,
  ) {
    return this.familyService.acceptInvitation(user, organizationId, payload);
  }

  @Get('workspaces/:organizationId/members')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: FamilyMembersResponseDto })
  getMembers(
    @CurrentUser() user: CurrentUserData,
    @Param('organizationId') organizationId: string,
  ) {
    return this.familyService.getMembers(user, organizationId);
  }
}

