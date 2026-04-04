import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from 'src/config/jwt.config';
import { OrganizationType } from 'src/database/models';
import { AuthService } from '../auth.service';

interface JwtPayload {
  sub: string; // user ID
  email: string;
  jti: string; // JWT token ID
  organizationId?: string | null;
  organizationType?: OrganizationType | null;
  purpose?: string; // present only on pre-auth tokens - must never pass this guard
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: JwtConfig,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret,
    });
  }

  async validate(payload: JwtPayload) {
    // Reject pre-auth TOTP tokens unconditionally - they are single-purpose
    // and must never grant access to protected routes.
    if (payload.purpose === 'totp-login') {
      throw new UnauthorizedException('Invalid token');
    }

    // Verify session is still valid (not revoked)
    const isValid = await this.authService.isSessionValid(payload.jti);
    if (!isValid) {
      throw new UnauthorizedException('Session has been revoked or expired');
    }

    // Get user from database
    const user = await this.authService.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      jwtTokenId: payload.jti,
      organizationId: payload.organizationId ?? null,
      organizationType: payload.organizationType ?? null,
    };
  }
}
