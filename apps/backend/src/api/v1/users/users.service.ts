import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../database/repositories';
import { UserSearchResponse } from '@repo/shared';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async searchUsers(
    query: string,
    currentUserId: string,
    vaultId: string,
  ): Promise<UserSearchResponse> {
    if (!query || query.trim().length < 2) {
      return { users: [] };
    }

    const users = await this.usersRepository.searchByQuery(
      query.trim().slice(0, 50), // limit query length to prevent DDos and performance issues
      currentUserId,
      vaultId,
    );

    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        publicKey: u.publicKey,
      })),
    };
  }
}
