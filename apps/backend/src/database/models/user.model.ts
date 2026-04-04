import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { OneTimeShare } from './one-time-share.model';
import { Organization } from './organization.model';
import { PasswordPermission } from './password-permission.model';
import { Password } from './password.model';
import { VaultMember } from './vault-member.model';
import { Vault } from './vault.model';
import { Session } from './session.model';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @Unique
  @Index('users_email_unique_idx')
  @Column(DataType.STRING(255))
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare username: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
    comment: 'Double-hashed with Argon2 (client + server)',
  })
  declare passwordHash: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'RSA-4096 public key in PEM format',
  })
  declare publicKey: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'RSA-PSS signing public key for account recovery verification',
  })
  declare signingPublicKey: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'RSA private key encrypted with seed phrase-derived wrapping key',
  })
  declare encryptedPrivateKey: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment:
      'RSA-PSS signing private key encrypted with seed phrase-derived wrapping key',
  })
  declare encryptedSigningPrivateKey: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'BIP39 seed phrase encrypted with password-derived master key',
  })
  declare encryptedSeedPhrase: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'Salt for PBKDF2 master key derivation',
  })
  declare encryptionSalt: string;

  @AllowNull(false)
  @Default(true)
  @Index('users_is_active_idx')
  @Column(DataType.BOOLEAN)
  declare isActive: CreationOptional<boolean>;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare totpSecret: string | null;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    comment:
      'Timestamp when the user completed their initial registration (TOTP verified)',
  })
  declare registrationCompletedAt: Date | null;

  @AllowNull(true)
  @Column({
    type: DataType.STRING(36),
    comment:
      'JTI of the pending registration or TOTP-enrollment token; cleared on completion',
  })
  declare registrationJti: string | null;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment:
      'Number of failed TOTP attempts during registration or post-recovery re-enrollment',
  })
  declare totpRegistrationAttempts: CreationOptional<number>;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    comment:
      'Account locked for registration TOTP attempts until this timestamp',
  })
  declare totpRegistrationLockedUntil: Date | null;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  declare updatedAt: Date;

  // Associations
  @HasMany(() => Vault, 'ownerUserId')
  ownedVaults: Vault[];

  @HasMany(() => VaultMember, 'userId')
  vaultMemberships: VaultMember[];

  @HasMany(() => Password, 'createdByUserId')
  createdPasswords: Password[];

  @HasMany(() => PasswordPermission, 'userId')
  passwordPermissions: PasswordPermission[];

  @HasMany(() => OneTimeShare, 'createdByUserId')
  createdShares: OneTimeShare[];

  @HasMany(() => Session, 'userId')
  sessions: Session[];

  @HasMany(() => Organization, 'createdByUserId')
  createdOrganizations: Organization[];
}
