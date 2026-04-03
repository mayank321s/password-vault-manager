import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  Index,
  CreatedAt,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Password } from './password.model';
import { PasswordPermissionLevel } from '@repo/shared';

@Table({
  tableName: 'password_permissions',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['password_id', 'user_id'],
      name: 'password_permissions_password_user_unique_idx',
    },
  ],
})
export class PasswordPermission extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Password)
  @Index('password_permissions_password_id_idx')
  @Column(DataType.UUID)
  declare passwordId: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index('password_permissions_user_id_idx')
  @Column(DataType.UUID)
  declare userId: string;

  @AllowNull(false)
  @Default(PasswordPermissionLevel.VIEWER)
  @Column(DataType.ENUM(...Object.values(PasswordPermissionLevel)))
  declare permission: PasswordPermissionLevel;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'Password-specific encryption key for individual sharing',
  })
  declare passwordEncryptedKey: string;

  @Column({
    type: DataType.TEXT,
    comment:
      'Password data re-encrypted with the share-specific AES key (zero-knowledge per-share copy)',
  })
  declare encryptedData: string;

  @ForeignKey(() => User)
  @Index('password_permissions_granted_by_user_id_idx')
  @Column({
    type: DataType.UUID,
    comment: 'ID of the user who granted this permission',
  })
  declare grantedByUserId: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  declare createdAt: Date;

  // Associations
  @BelongsTo(() => Password, 'passwordId')
  declare password: Password;

  @BelongsTo(() => User, { foreignKey: 'userId', as: 'user' })
  declare user: User;

  @BelongsTo(() => User, { foreignKey: 'grantedByUserId', as: 'grantedBy' })
  declare grantedBy: User;
}
