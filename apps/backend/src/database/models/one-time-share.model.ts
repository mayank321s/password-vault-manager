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

@Table({
  tableName: 'one_time_shares',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['expires_at', 'is_used'],
      name: 'one_time_shares_expires_at_is_used_idx',
    },
  ],
})
export class OneTimeShare extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Password)
  @Index('one_time_shares_password_id_idx')
  @Column(DataType.UUID)
  declare passwordId: string;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: 'Password encrypted with random symmetric key',
  })
  declare encryptedBlob: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index('one_time_shares_created_by_user_id_idx')
  @Column(DataType.UUID)
  declare createdByUserId: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  declare createdAt: Date;

  @AllowNull(false)
  @Index('one_time_shares_expires_at_idx')
  @Column({
    type: DataType.DATE,
    comment: 'Expiration timestamp for the share link',
  })
  declare expiresAt: Date;

  @AllowNull(false)
  @Default(false)
  @Index('one_time_shares_is_used_idx')
  @Column({
    type: DataType.BOOLEAN,
    comment: 'Whether the share link has been accessed',
  })
  declare isUsed: boolean;

  // Associations
  @BelongsTo(() => Password, 'passwordId')
  declare password: Password;

  @BelongsTo(() => User, 'createdByUserId')
  declare creator: User;
}
