import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Sequelize } from 'sequelize-typescript';
import { createHash } from 'crypto';
import {
  OrganizationRepository,
  OrganizationMemberRepository,
  OrganizationPolicyRepository,
  SessionRepository,
  SsoConfigurationRepository,
  SsoVerifiedDomainRepository,
  UsersRepository,
  VaultMemberRepository,
  VaultRepository,
} from 'src/database/repositories';
import { argon2Hash, argon2Verify } from 'src/utils/hashing.utils';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationType,
  SsoProvider,
  User,
  VaultMemberRole,
} from '../../../database/models';
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
  SsoCallbackResponseDto,
  SsoLookupResponseDto,
  SsoStartResponseDto,
} from './dto';
import { accountRecoveryPayloadSchema } from '@repo/shared';
import { TotpService } from 'src/common/services/totp.service';
import { SsoConfig } from 'src/config/sso.config';

// Number of failed TOTP attempts during registration / re-enrollment before lockout.
const TOTP_REG_LOCKOUT_THRESHOLD = 5;
// Duration (ms) an account is locked after breaching the attempt threshold.
const TOTP_REG_LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sequelize: Sequelize,
    private readonly vaultRepository: VaultRepository,
    private readonly vaultMemberRepository: VaultMemberRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly organizationPolicyRepository: OrganizationPolicyRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly ssoConfigurationRepository: SsoConfigurationRepository,
    private readonly ssoVerifiedDomainRepository: SsoVerifiedDomainRepository,
    private readonly jwtService: JwtService,
    private readonly ssoConfig: SsoConfig,
    private readonly totpService: TotpService,
  ) {}

  /**
   * Get encryption salt for a user by email
   * Required by client before hashing password for login/recovery
   */
  async getSalt(email: string): Promise<SaltResponseDto> {
    const user = await this.usersRepository.findOneBy({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      encryptionSalt: user.encryptionSalt,
      exists: true,
    };
  }

  /**
   * Get recovery data for account recovery
   * Returns encrypted keys that can only be decrypted with seed phrase-derived wrapping key
   */
  async getRecoveryData(email: string): Promise<RecoveryDataResponseDto> {
    const user = await this.usersRepository.findOneBy({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      encryptedPrivateKey: user.encryptedPrivateKey,
      encryptedSigningPrivateKey: user.encryptedSigningPrivateKey,
      signingPublicKey: user.signingPublicKey,
      publicKey: user.publicKey,
    };
  }

  /**
   * Step 1 of registration: create the user record with an encrypted TOTP secret
   * and return the QR code setup payload alongside a short-lived registration token.
   *
   * The registration token (purpose=registration-completion) binds this step to
   * POST /register/complete, ensuring only the client who initiated registration
   * can complete it. No session is created at this point.
   */
  async register(request: RegisterUserDto): Promise<TotpSetupResponseDto> {
    const {
      email,
      username,
      passwordHash,
      publicKey,
      signingPublicKey,
      encryptedSeedPhrase,
      encryptedPrivateKey,
      encryptedSigningPrivateKey,
      encryptionSalt,
      vaultEncryptedKey,
    } = request;

    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const serverPasswordHash = await argon2Hash(passwordHash);

    // Generate and immediately encrypt the TOTP secret before any DB write.
    // The raw secret is held only in this function scope and never persisted.
    const rawSecret = this.totpService.generateSecret();
    const encryptedTotpSecret = this.totpService.encryptSecret(rawSecret);

    // Pre-generate the JTI so it can be written into the user record and
    // embedded in the registration token atomically in the same scope.
    const registrationJti = uuidv4();
    let createdUserId: string;

    try {
      await this.sequelize.transaction(async (transaction) => {
        const newUser = await this.usersRepository.create(
          {
            email,
            username,
            passwordHash: serverPasswordHash,
            publicKey,
            signingPublicKey,
            encryptedPrivateKey,
            encryptedSigningPrivateKey,
            encryptedSeedPhrase,
            encryptionSalt,
            totpSecret: encryptedTotpSecret,
            registrationJti,
          },
          transaction,
        );

        createdUserId = newUser.id;

        const personalOrganization = await this.organizationRepository.create(
          {
            name: `${newUser.username}'s Personal Organization`,
            organizationType: OrganizationType.PERSONAL,
            createdByUserId: newUser.id,
          },
          transaction,
        );

        await this.organizationMemberRepository.create(
          {
            organizationId: personalOrganization.id,
            userId: newUser.id,
            role: OrganizationMemberRole.OWNER,
            status: OrganizationMemberStatus.ACTIVE,
            joinedAt: new Date(),
            invitedAt: new Date(),
          },
          transaction,
        );

        const personalVault = await this.vaultRepository.createPersonalVault(
          newUser.id,
          transaction,
          personalOrganization.id,
        );

        await this.vaultMemberRepository.create(
          {
            vaultId: personalVault.id,
            userId: newUser.id,
            userRole: VaultMemberRole.OWNER,
            vaultEncryptedKey,
          },
          transaction,
        );
      });

      // QR code is generated with the raw (unencrypted) secret so the
      // authenticator app can scan it. The raw secret is also returned
      // in plaintext exactly once so the user can enter it manually.
      const qrCodeDataUrl = await this.totpService.generateQRCodeDataUrl(
        rawSecret,
        email,
      );

      // Sign a short-lived registration token that couples POST /register to
      // POST /register/complete. The token carries a purpose claim that is
      // explicitly checked in completeRegistration(); it grants no session
      // privileges and the JWT strategy rejects any token that carries a
      // purpose claim (see jwt.strategy.ts).
      const registrationToken = this.jwtService.sign(
        {
          sub: createdUserId!,
          jti: registrationJti,
          purpose: 'registration-completion',
        },
        { expiresIn: '15m' },
      );

      return {
        qrCodeDataUrl,
        secret: rawSecret,
        email,
        registrationToken,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to create user: ' + (error as Error).message,
      );
    }
  }

  /**
   * Step 2 of registration: verify the registration token issued by POST /register
   * and the TOTP code the user scanned from the QR code shown in step 1.
   *
   * Security layers applied in order:
   *  1. JWT signature + expiry — jwtService.verify() rejects tampered / expired tokens.
   *  2. Purpose claim — only tokens with purpose=registration-completion are accepted;
   *     pre-auth tokens, enrollment tokens, and full session JWTs are all rejected.
   *  3. Subject–email binding — token.sub must match the user resolved by email,
   *     preventing cross-account token reuse.
   *  4. JTI binding — token.jti must equal user.registrationJti, which is cleared on
   *     success, making the token permanently single-use inside its validity window.
   *  5. Completion guard — registrationCompletedAt must be null; already-completed
   *     accounts are rejected even if a valid token is somehow presented.
   *  6. Per-account TOTP lockout — complementary to the IP-level throttle on the
   *     controller; prevents brute-force via IP rotation.
   *
   * All failure paths return the same UnauthorizedException to prevent enumeration.
   */
  async completeRegistration(
    dto: CompleteRegistrationDto,
  ): Promise<AuthResponseDto> {
    const { email, totpCode, registrationToken } = dto;

    // Inline payload type to avoid circular import with jwt.strategy.
    type RegistrationTokenPayload = {
      sub: string;
      jti: string;
      purpose: string;
      iat: number;
      exp: number;
    };

    let tokenPayload: RegistrationTokenPayload;

    try {
      // Layer 1 — validates signature and expiry in a single call.
      // Any tampered or expired token throws before the database is touched.
      tokenPayload =
        this.jwtService.verify<RegistrationTokenPayload>(registrationToken);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Layer 2 — explicit purpose check.
    // A full session JWT, a pre-auth token, or an enrollment token that
    // happens to pass signature verification must be rejected here.
    if (tokenPayload.purpose !== 'registration-completion') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersRepository.findOneBy({
      email: email.toLowerCase().trim(),
    });

    // Uniform response for "user does not exist", "no TOTP secret", and all
    // token-binding failures below to prevent information leakage.
    if (!user || !user.totpSecret) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Layer 3 — subject–email binding.
    // A valid token from a different account must not complete this account.
    if (tokenPayload.sub !== user.id) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Layer 4 — JTI binding.
    // Ties this exact token to the user row created in POST /register.
    // After a successful completion the field is set to null, so any replay
    // within the token's 15-minute window is also blocked.
    if (tokenPayload.jti !== user.registrationJti) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Layer 5 — completion guard (idempotency).
    // Prevents calling this endpoint more than once per account lifetime.
    if (user.registrationCompletedAt !== null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Layer 6 — per-account TOTP lockout.
    // Independent of the IP-level throttle on the controller so that IP
    // rotation cannot bypass the attempt ceiling.
    if (
      user.totpRegistrationLockedUntil &&
      user.totpRegistrationLockedUntil > new Date()
    ) {
      throw new HttpException(
        'Too many failed attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // --- TOTP verification ---
    const isValidCode = await this.totpService.verify(
      totpCode,
      user.totpSecret,
    );

    if (!isValidCode) {
      const newAttempts = (user.totpRegistrationAttempts ?? 0) + 1;
      await user.update({
        totpRegistrationAttempts: newAttempts,
        ...(newAttempts >= TOTP_REG_LOCKOUT_THRESHOLD
          ? {
              totpRegistrationLockedUntil: new Date(
                Date.now() + TOTP_REG_LOCKOUT_DURATION_MS,
              ),
            }
          : {}),
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // --- Finalize: mark completed, invalidate token, reset counters ---
    await user.update({
      registrationCompletedAt: new Date(),
      registrationJti: null,
      totpRegistrationAttempts: 0,
      totpRegistrationLockedUntil: null,
    });

    const { accessToken } = await this.generateTokenAndSession(user);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        publicKey: user.publicKey,
        signingPublicKey: user.signingPublicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        encryptedSigningPrivateKey: user.encryptedSigningPrivateKey,
        encryptedSeedPhrase: user.encryptedSeedPhrase,
        isActive: user.isActive,
        createdAt: user.createdAt,
        encryptionSalt: user.encryptionSalt,
      },
    } satisfies AuthResponseDto;
  }

  async login(loginDto: LoginDto): Promise<PreAuthResponseDto> {
    const { email, passwordHash } = loginDto;

    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid User');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await argon2Verify(user.passwordHash, passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const preAuthToken = this.jwtService.sign(
      { sub: user.id, purpose: 'totp-login' },
      { expiresIn: '5m' },
    );

    return {
      requiresTotp: true,
      preAuthToken,
    } satisfies PreAuthResponseDto;
  }

  async lookupSsoRoute(email: string): Promise<SsoLookupResponseDto> {
    const domain = this.extractEmailDomain(email);
    const verifiedDomain = await this.ssoVerifiedDomainRepository.findByDomain(domain);

    if (
      !verifiedDomain ||
      !verifiedDomain.verifiedAt ||
      !verifiedDomain.ssoConfiguration?.isActive
    ) {
      return {
        requiresSso: false,
        organizationId: null,
        provider: null,
        primaryDomain: null,
      };
    }

    return {
      requiresSso: true,
      organizationId: verifiedDomain.organizationId,
      provider: verifiedDomain.ssoConfiguration.provider,
      primaryDomain: verifiedDomain.domain,
    };
  }

  async startSso(email: string): Promise<SsoStartResponseDto> {
    const domain = this.extractEmailDomain(email);
    const verifiedDomain = await this.ssoVerifiedDomainRepository.findByDomain(domain);

    if (
      !verifiedDomain ||
      !verifiedDomain.verifiedAt ||
      !verifiedDomain.ssoConfiguration?.isActive
    ) {
      throw new NotFoundException('No verified SSO route found for email domain');
    }

    const configuration = verifiedDomain.ssoConfiguration;
    const state = this.jwtService.sign(
      {
        purpose: 'sso-state',
        configId: configuration.id,
        organizationId: configuration.organizationId,
        emailDomain: domain,
      },
      {
        secret: this.ssoConfig.stateSecret,
        expiresIn: '10m',
      },
    );

    const nonce = createHash('sha256').update(state).digest('hex').slice(0, 32);
    const params = new URLSearchParams({
      client_id: configuration.clientId,
      response_type: 'code',
      redirect_uri: configuration.redirectUri,
      response_mode: 'query',
      scope: configuration.scopes,
      state,
      nonce,
      login_hint: email.toLowerCase().trim(),
    });

    return {
      redirectUrl: `${configuration.authorizationEndpoint}?${params.toString()}`,
      state,
      organizationId: configuration.organizationId,
      provider: configuration.provider,
    };
  }

  async completeSsoCallback(
    code: string,
    state: string,
  ): Promise<SsoCallbackResponseDto> {
    if (!code || !state) {
      throw new BadRequestException('Authorization code and state are required');
    }

    type SsoStatePayload = {
      purpose: string;
      configId: string;
      organizationId: string;
      emailDomain: string;
      iat: number;
      exp: number;
    };

    let payload: SsoStatePayload;
    try {
      payload = this.jwtService.verify<SsoStatePayload>(state, {
        secret: this.ssoConfig.stateSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid SSO state');
    }

    if (payload.purpose !== 'sso-state') {
      throw new UnauthorizedException('Invalid SSO state');
    }

    const configuration =
      await this.ssoConfigurationRepository.findByIdWithDomains(payload.configId);
    if (
      !configuration ||
      !configuration.isActive ||
      configuration.organizationId !== payload.organizationId
    ) {
      throw new UnauthorizedException('SSO configuration is unavailable');
    }

    const matchedDomain = configuration.domains?.find(
      (domain) =>
        domain.domain === payload.emailDomain && Boolean(domain.verifiedAt),
    );
    if (!matchedDomain) {
      throw new UnauthorizedException('SSO domain is not verified');
    }

    return {
      organizationId: configuration.organizationId,
      provider: configuration.provider,
      emailDomain: payload.emailDomain,
      authorizationCode: code,
      tokenExchangePending: true,
    };
  }

  /**
   * Step 2 of login: exchange a valid pre-auth token and a correct TOTP code
   * for a full session. The pre-auth token is manually verified (not delegated
   * to the Passport guard) so that its `purpose` claim can be assert-checked
   * and it cannot be replayed against any other endpoint.
   *
   * All failure paths throw the same UnauthorizedException to give no signal
   * to a caller about which specific check failed.
   */
  async loginWithTotp(dto: LoginTotpDto): Promise<AuthResponseDto> {
    const { preAuthToken, totpCode } = dto;

    // Pre-auth payload type — these tokens carry only sub + purpose.
    // Importing JwtPayload from jwt.strategy would be circular; define inline.
    type PreAuthPayload = {
      sub: string;
      purpose: string;
      iat: number;
      exp: number;
    };

    let payload: PreAuthPayload;

    try {
      // verify() validates both the signature and the expiry. Any tampered or
      // expired token throws here before touching the database.
      payload = this.jwtService.verify<PreAuthPayload>(preAuthToken);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Explicit purpose check — a full session JWT with an injected purpose
    // field, or any other token that passes signature verification, must be
    // rejected here.
    if (payload.purpose !== 'totp-login') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersRepository.findById(payload.sub);

    if (!user || !user.totpSecret) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isValidCode = await this.totpService.verify(
      totpCode,
      user.totpSecret,
    );

    if (!isValidCode) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken } = await this.generateTokenAndSession(user);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        publicKey: user.publicKey,
        signingPublicKey: user.signingPublicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        encryptedSigningPrivateKey: user.encryptedSigningPrivateKey,
        encryptedSeedPhrase: user.encryptedSeedPhrase,
        isActive: user.isActive,
        createdAt: user.createdAt,
        encryptionSalt: user.encryptionSalt,
      },
    } satisfies AuthResponseDto;
  }

  /**
   * Recover account using seed phrase with digital signature verification.
   *
   * On success:
   *  - All existing sessions are invalidated.
   *  - A fresh TOTP secret is generated and stored (encrypted).
   *  - A short-lived enrollment token (purpose=totp-enrollment) is issued so
   *    the client can complete TOTP re-enrollment via POST /totp/enroll.
   *  - registrationCompletedAt is reset to null so the enrollment flow can run.
   *
   * Zero-knowledge architecture is maintained: private key material is always
   * encrypted before leaving the client and the server never sees plaintext keys.
   */
  async recoverPassword(
    recoverDto: RecoverPasswordDto,
  ): Promise<RecoverPasswordResponseDto> {
    const { email, payload, signature } = recoverDto;

    const user = await this.usersRepository.findOneBy({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    try {
      const payloadJson = Buffer.from(payload, 'base64').toString('utf-8');
      const validation = accountRecoveryPayloadSchema.safeParse(
        JSON.parse(payloadJson),
      );
      const data = validation.data;

      if (!validation.success) {
        throw new BadRequestException('Invalid recovery payload format');
      }

      const signingPublicKeyPem = user.signingPublicKey
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s/g, '');

      const signingPublicKeyDer = Buffer.from(signingPublicKeyPem, 'base64');

      const publicKey = crypto.createPublicKey({
        key: signingPublicKeyDer,
        format: 'der',
        type: 'spki',
      });

      const signatureBuffer = Buffer.from(signature, 'base64');

      const isValid = crypto.verify(
        'sha256',
        Buffer.from(payloadJson, 'utf-8'),
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: 32,
        },
        signatureBuffer,
      );

      if (!isValid) {
        throw new UnauthorizedException(
          'Invalid signature. Recovery request rejected.',
        );
      }

      const serverPasswordHash = await argon2Hash(data.passwordHash);

      // Generate a fresh TOTP secret for the re-enrollment flow.
      // The raw secret is held only in this scope and never persisted.
      const rawSecret = this.totpService.generateSecret();
      const encryptedTotpSecret = this.totpService.encryptSecret(rawSecret);

      // Pre-generate JTI; it is stored in the DB and signed into the
      // enrollment token so POST /totp/enroll can validate the exact binding.
      const enrollJti = uuidv4();

      await this.sequelize.transaction(async (transaction) => {
        await user.update(
          {
            passwordHash: serverPasswordHash,
            encryptedPrivateKey: data.encryptedPrivateKey,
            encryptedSigningPrivateKey: data.encryptedSigningPrivateKey,
            encryptedSeedPhrase: data.encryptedSeedPhrase,
            encryptionSalt: data.encryptionSalt,
            totpSecret: encryptedTotpSecret,
            // Bind the pending enrollment token to this user record.
            registrationJti: enrollJti,
            // Allow POST /totp/enroll to run (cleared again on success).
            registrationCompletedAt: null,
            // Reset any leftover lockout state from a previous registration.
            totpRegistrationAttempts: 0,
            totpRegistrationLockedUntil: null,
          },
          { transaction },
        );

        await this.sessionRepository.updateWhere(
          {
            userId: user.id,
            revokedAt: null,
          },
          { revokedAt: new Date() },
          transaction,
        );
      });

      // Sign the enrollment token after the transaction commits so it is only
      // issued on guaranteed DB success. The jti matches user.registrationJti.
      const enrollToken = this.jwtService.sign(
        { sub: user.id, jti: enrollJti, purpose: 'totp-enrollment' },
        { expiresIn: '15m' },
      );

      const qrCodeDataUrl = await this.totpService.generateQRCodeDataUrl(
        rawSecret,
        user.email,
      );

      return {
        enrollToken,
        qrCodeDataUrl,
        secret: rawSecret,
        email: user.email,
      } satisfies RecoverPasswordResponseDto;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid recovery payload.');
    }
  }

  /**
   * Post-recovery TOTP re-enrollment: exchange a valid enrollment token issued
   * by POST /recover and a correct TOTP code for a full session.
   *
   * Security layers mirror completeRegistration() with one difference:
   * the user is resolved via token.sub (no email in the request body) so the
   * token is self-contained and cannot be redirected to a different account.
   *
   *  1. JWT signature + expiry.
   *  2. Purpose claim — only purpose=totp-enrollment is accepted.
   *  3. JTI binding — token.jti must match user.registrationJti.
   *  4. Per-account TOTP lockout.
   *  5. TOTP code verification.
   */
  async enrollTotp(dto: TotpEnrollDto): Promise<AuthResponseDto> {
    const { enrollToken, totpCode } = dto;

    // Inline payload type to avoid circular import with jwt.strategy.
    type EnrollTokenPayload = {
      sub: string;
      jti: string;
      purpose: string;
      iat: number;
      exp: number;
    };

    let tokenPayload: EnrollTokenPayload;

    try {
      // Layer 1 — validates signature and expiry in a single call.
      tokenPayload = this.jwtService.verify<EnrollTokenPayload>(enrollToken);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Layer 2 — explicit purpose check.
    // Registration tokens, pre-auth tokens, and full sessions are all rejected.
    if (tokenPayload.purpose !== 'totp-enrollment') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersRepository.findById(tokenPayload.sub);

    if (!user || !user.totpSecret) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Layer 3 — JTI binding.
    // Ensures this token was generated by the most recent POST /recover call
    // for this user. Cleared on success to prevent replay.
    if (tokenPayload.jti !== user.registrationJti) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Layer 4 — per-account TOTP lockout.
    if (
      user.totpRegistrationLockedUntil &&
      user.totpRegistrationLockedUntil > new Date()
    ) {
      throw new HttpException(
        'Too many failed attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Layer 5 — TOTP code verification.
    const isValidCode = await this.totpService.verify(
      totpCode,
      user.totpSecret,
    );

    if (!isValidCode) {
      const newAttempts = (user.totpRegistrationAttempts ?? 0) + 1;
      await user.update({
        totpRegistrationAttempts: newAttempts,
        ...(newAttempts >= TOTP_REG_LOCKOUT_THRESHOLD
          ? {
              totpRegistrationLockedUntil: new Date(
                Date.now() + TOTP_REG_LOCKOUT_DURATION_MS,
              ),
            }
          : {}),
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // --- Finalize: mark enrollment complete, invalidate token, reset counters ---
    await user.update({
      registrationCompletedAt: new Date(),
      registrationJti: null,
      totpRegistrationAttempts: 0,
      totpRegistrationLockedUntil: null,
    });

    const { accessToken } = await this.generateTokenAndSession(user);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        publicKey: user.publicKey,
        signingPublicKey: user.signingPublicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        encryptedSigningPrivateKey: user.encryptedSigningPrivateKey,
        encryptedSeedPhrase: user.encryptedSeedPhrase,
        isActive: user.isActive,
        createdAt: user.createdAt,
        encryptionSalt: user.encryptionSalt,
      },
    } satisfies AuthResponseDto;
  }

  /**
   * Logout current session
   */
  async logout(
    userId: string,
    jwtTokenId: string,
  ): Promise<{ message: string }> {
    await this.sequelize.transaction(async (transaction) => {
      await this.sessionRepository.updateWhere(
        {
          userId,
          jwtTokenId,
          revokedAt: null,
        },
        { revokedAt: new Date() },
        transaction,
      );
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Logout all sessions for a user
   */
  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.sequelize.transaction(
      async (transaction) =>
        await this.sessionRepository.updateWhere(
          {
            userId,
            revokedAt: null,
          },
          { revokedAt: new Date() },
          transaction,
        ),
    );

    return { message: 'All sessions logged out successfully' };
  }

  /**
   * Verify if a session is valid (not revoked and not expired)
   */
  async isSessionValid(jwtTokenId: string): Promise<boolean> {
    const session = await this.sessionRepository.findOneBy({ jwtTokenId });

    if (!session) {
      return false;
    }

    // Check if session is revoked
    if (session.revokedAt) {
      return false;
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      return false;
    }

    return true;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.usersRepository.findById(userId);
  }

  /**
   * Generate JWT token and create session in database
   */
  private async generateTokenAndSession(
    user: User,
  ): Promise<{
    accessToken: string;
    jwtTokenId: string;
    organizationId: string | null;
    organizationType: OrganizationType | null;
  }> {
    const organizationContext =
      await this.organizationMemberRepository.findActiveMembershipWithOrganization(
        user.id,
      );
    const organizationPolicy =
      organizationContext?.organization?.organizationType === OrganizationType.BUSINESS &&
      organizationContext.organizationId
      ? await this.organizationPolicyRepository.findOneBy({
          organizationId: organizationContext.organizationId,
        })
      : null;

    if (organizationPolicy?.requireMfa && !user.totpSecret) {
      throw new ForbiddenException(
        'Multi-factor authentication is required for this organization',
      );
    }

    const jwtTokenId = uuidv4();
    const payload = {
      sub: user.id,
      email: user.email,
      jti: jwtTokenId,
      organizationId: organizationContext?.organizationId ?? null,
      organizationType: organizationContext?.organization?.organizationType ?? null,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: organizationPolicy
        ? `${organizationPolicy.sessionTimeoutMinutes}m`
        : undefined,
    });
    const expiresAt = this.jwtService.decode<{ exp: number }>(accessToken)[
      'exp'
    ];

    await this.sequelize.transaction(async (transaction) => {
      if (organizationPolicy) {
        const activeSessions =
          await this.sessionRepository.findActiveSessionsForUser(user.id);
        const overflowCount =
          activeSessions.length - (organizationPolicy.maxDevicesPerUser - 1);

        if (overflowCount > 0) {
          await this.sessionRepository.revokeSessionsByIds(
            activeSessions.slice(0, overflowCount).map((session) => session.id),
            new Date(),
            transaction,
          );
        }
      }

      await this.sessionRepository.create(
        {
          userId: user.id,
          jwtTokenId,
          expiresAt: new Date(expiresAt * 1000),
        },
        transaction,
      );
    });

    return {
      accessToken,
      jwtTokenId,
      organizationId: payload.organizationId,
      organizationType: payload.organizationType,
    };
  }

  private extractEmailDomain(email: string) {
    const [, domain] = email.toLowerCase().trim().split('@');
    if (!domain) {
      throw new BadRequestException('Valid email is required');
    }
    return domain;
  }
}
