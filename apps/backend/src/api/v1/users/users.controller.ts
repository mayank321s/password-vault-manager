import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, type CurrentUserData } from '../../../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UserSearchResponse } from '@repo/shared';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Search users by email or username
   * GET /users/search?q=query&vaultId=vaultId
   *
   * Returns id, email, username — no sensitive data.
   * The current user and existing vault members are excluded from results.
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchUsers(
    @CurrentUser() user: CurrentUserData,
    @Query('q') query: string = '',
    @Query('vaultId', ParseUUIDPipe) vaultId: string = '',
  ): Promise<UserSearchResponse> {
    return this.usersService.searchUsers(query, user.userId, vaultId);
  }
}
