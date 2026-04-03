import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  CurrentUser,
  Public,
  type CurrentUserData,
} from '../../../common/decorators';

import { AuthService } from './auth.service';
import {
  AuthResponseDto,
  CompleteRegistrationDto,
  LoginDto,
  LoginTotpDto,
  PreAuthResponseDto,
  RecoverPasswordDto,
  RecoverPasswordResponseDto,
  RecoveryDataResponseDto,
  RegisterUserDto,
  SaltResponseDto,
  TotpEnrollDto,
  TotpSetupResponseDto,
} from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ParseEmailPipe } from 'src/common/pipes/parse-email.pipe';
import { ZodResponse } from 'nestjs-zod';

@Controller()
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Get encryption salt for a user by email.
   * Required before login/recovery to derive master key client-side.
   * Rate limited to 10 requests per minute per IP.
   */
  @Public()
  @Get('salt')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ZodResponse({ status: HttpStatus.OK, type: SaltResponseDto })
  async getSalt(
    @Query('email', ParseEmailPipe) email: string,
  ): Promise<SaltResponseDto> {
    return this.authService.getSalt(email);
  }

  /**
   * Get recovery data for account recovery.
   * Returns encrypted keys that can only be decrypted with the seed
   * phrase-derived wrapping key. Safe to expose because the payload is
   * ciphertext without knowledge of the seed phrase.
   * Rate limited to 5 requests per hour per IP.
   */
  @Public()
  @Get('recovery-data')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 3600000, limit: 5 } })
  @ZodResponse({ status: HttpStatus.OK, type: RecoveryDataResponseDto })
  async getRecoveryData(@Query('email', ParseEmailPipe) email: string) {
    return this.authService.getRecoveryData(email);
  }

  /**
   * Step 1 of registration: create the user record and generate a TOTP secret.
   * Returns a QR code data URL and the plaintext secret for manual entry.
   * No session is issued at this stage. The client must complete step 2
   * (POST /register/complete) by verifying a live TOTP code before the account
   * is activated and a session token is granted.
   *
   * Client-side responsibilities before calling this endpoint:
   *  1. Generate BIP39 seed phrase (12 words)
   *  2. Generate RSA-4096 key pair
   *  3. Derive wrapping key from seed phrase via HKDF
   *  4. Encrypt private key with wrapping key (AES-GCM)
   *  5. Derive master key from password + salt via PBKDF2
   *  6. Encrypt seed phrase with master key (AES-GCM)
   *  7. Client-side Argon2 hash of the password
   *
   * Rate limited to 3 attempts per hour per IP.
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 3600000, limit: 5 } })
  @ZodResponse({ status: HttpStatus.OK, type: TotpSetupResponseDto })
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Step 2 of registration: verify the registration token from step 1 and the
   * TOTP code scanned during step 1, and exchange them for a full session token.
   *
   * The registration token (purpose=registration-completion) binds this request
   * to the specific POST /register call that created the account. It is verified
   * for signature, expiry, purpose, subject–email binding, and JTI match before
   * any TOTP check is attempted. This ensures only the originating client can
   * complete registration.
   *
   * Per-account lockout kicks in after 5 failed TOTP attempts (15-minute window),
   * independently of the IP-level throttle below. This prevents brute-force via
   * IP rotation against the 1,000,000 possible 6-digit codes.
   *
   * Rate limited to 3 attempts per 15 minutes per IP.
   */
  @Public()
  @Post('register/complete')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 900000, limit: 3 } })
  @ZodResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  async completeRegistration(@Body() dto: CompleteRegistrationDto) {
    return this.authService.completeRegistration(dto);
  }

  /**
   * Step 1 of login: verify password.
   * If the account has TOTP enrolled, returns a short-lived pre-auth token
   * and `requiresTotp: true`. The client must then call POST /login/totp to
   * complete authentication.
   * If the account has no TOTP secret (legacy), issues a full session directly.
   *
   * Rate limited to 5 attempts per 15 minutes per IP.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 900000, limit: 5 } })
  @ZodResponse({ status: HttpStatus.OK, type: PreAuthResponseDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Step 2 of login: exchange a valid pre-auth token and a correct TOTP code
   * for a full session token.
   *
   * The pre-auth token expires in 5 minutes. If it has expired the client must
   * restart login from step 1. The pre-auth token is structurally blocked from
   * accessing any protected route by the JWT strategy even if intercepted.
   *
   * Rate limited to 5 attempts per 15 minutes per IP to prevent parallel
   * brute-force against the 1,000,000 possible 6-digit codes.
   */
  @Public()
  @Post('login/totp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 900000, limit: 5 } })
  @ZodResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  async loginWithTotp(@Body() dto: LoginTotpDto) {
    return this.authService.loginWithTotp(dto);
  }

  /**
   * Recover account using seed phrase with digital signature verification.
   * On success all existing sessions are invalidated and a fresh TOTP secret is
   * generated. Returns an enrollment token (purpose=totp-enrollment) and QR code
   * so the client can re-enroll their authenticator device via POST /totp/enroll.
   * Rate limited to 5 attempts per hour per IP.
   */
  @Public()
  @Post('recover')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 3600000, limit: 5 } })
  @ZodResponse({ status: HttpStatus.OK, type: RecoverPasswordResponseDto })
  async recoverPassword(@Body() recoverDto: RecoverPasswordDto) {
    return this.authService.recoverPassword(recoverDto);
  }

  /**
   * Post-recovery TOTP re-enrollment: exchange the enrollment token issued by
   * POST /recover and a correct TOTP code for a full session.
   *
   * The enrollment token (purpose=totp-enrollment) is verified for signature,
   * expiry, purpose, and JTI match before any TOTP check is attempted. This
   * ensures only the client who completed recovery can finish re-enrollment.
   *
   * Per-account lockout kicks in after 5 failed TOTP attempts (15-minute window),
   * independently of the IP-level throttle below.
   *
   * Rate limited to 3 attempts per 15 minutes per IP.
   */
  @Public()
  @Post('totp/enroll')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 900000, limit: 3 } })
  @ZodResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  async enrollTotp(@Body() dto: TotpEnrollDto) {
    return this.authService.enrollTotp(dto);
  }

  /**
   * Logout current session.
   * Requires a valid fully-authenticated session token.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: CurrentUserData) {
    return this.authService.logout(user.userId, user.jwtTokenId);
  }
}
