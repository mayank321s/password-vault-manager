import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { ScimTokenRepository } from 'src/database/repositories';

type RequestWithScimContext = {
  headers: Record<string, string | string[] | undefined>;
  scimContext?: {
    organizationId: string;
    scimTokenId: string;
    tokenLabel: string;
  };
};

@Injectable()
export class ScimTokenAuthGuard implements CanActivate {
  constructor(private readonly scimTokenRepository: ScimTokenRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithScimContext>();
    const authorization = request.headers.authorization;

    if (!authorization || Array.isArray(authorization)) {
      throw new UnauthorizedException('SCIM bearer token is required');
    }

    const [scheme, rawToken] = authorization.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !rawToken) {
      throw new UnauthorizedException('Invalid SCIM authorization header');
    }

    const tokenHash = createHash('sha256').update(rawToken.trim()).digest('hex');
    const token = await this.scimTokenRepository.findActiveByHash(tokenHash);

    if (!token) {
      throw new UnauthorizedException('SCIM token is invalid or revoked');
    }

    await token.update({ lastUsedAt: new Date() });

    request.scimContext = {
      organizationId: token.organizationId,
      scimTokenId: token.id,
      tokenLabel: token.label,
    };

    return true;
  }
}
