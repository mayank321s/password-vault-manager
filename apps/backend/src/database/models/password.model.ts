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
  HasMany,
  Index,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Vault } from './vault.model';
import { OneTimeShare } from './one-time-share.model';
import { PasswordPermission } from './password-permission.model';
import { InferAttributes, InferCreationAttributes } from 'sequelize';

@Table({
  tableName: 'passwords',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['vault_id', 'is_note'],
      name: 'passwords_vault_id_is_note_idx',
    },
  ],
})
export class Password extends Model<
  InferAttributes<Password>,
  InferCreationAttributes<Password>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Vault)
  @Index('passwords_vault_id_idx')
  @Column({
    type: DataType.UUID,
    comment: 'ID of the vault this password belongs to',
  })
  declare vaultId: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
    comment: 'Encrypted title/name of the password entry',
  })
  declare name: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment:
      'Encrypted password blob (JSON with username, password, url, notes)',
  })
  declare encryptedData: string;

  @AllowNull(false)
  @Default(false)
  @Index('passwords_is_note_idx')
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Whether this is a secure note or password entry',
  })
  declare isNote: boolean;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index('passwords_created_by_user_id_idx')
  @Column(DataType.UUID)
  declare createdByUserId: string;

  @AllowNull(true)
  @ForeignKey(() => User)
  @Index('passwords_updated_by_user_id_idx')
  @Column({
    type: DataType.UUID,
    comment: 'ID of the user who last modified this password entry',
  })
  declare updatedByUserId: string | null;

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
  @BelongsTo(() => Vault, 'vaultId')
  declare vault: Vault;

  @BelongsTo(() => User, 'createdByUserId')
  declare creator: User;

  @BelongsTo(() => User, 'updatedByUserId')
  declare updater: User | null;

  @HasMany(() => PasswordPermission, 'passwordId')
  declare permissions?: PasswordPermission[];

  @HasMany(() => OneTimeShare, 'passwordId')
  declare shares?: OneTimeShare[];
}
