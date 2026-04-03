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
  Unique,
  Index,
  CreatedAt,
} from 'sequelize-typescript';
import { User } from './user.model';

type CreationAttributes = Pick<Session, 'userId' | 'jwtTokenId' | 'expiresAt'> &
  Partial<Pick<Session, 'revokedAt'>>;

@Table({
  tableName: 'sessions',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      fields: ['user_id', 'revoked_at'],
      name: 'sessions_user_id_revoked_at_idx',
    },
  ],
})
export class Session extends Model<Session, CreationAttributes> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index('sessions_user_id_idx')
  @Column(DataType.UUID)
  declare userId: string;

  @AllowNull(false)
  @Unique
  @Index('sessions_jwt_token_id_unique_idx')
  @Column({
    type: DataType.STRING(255),
    comment: 'JTI claim from JWT for token blacklisting',
  })
  declare jwtTokenId: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  declare createdAt: Date;

  @AllowNull(false)
  @Index('sessions_expires_at_idx')
  @Column({
    type: DataType.DATE,
    comment: 'JWT expiration timestamp',
  })
  declare expiresAt: Date;

  @AllowNull(true)
  @Index('sessions_revoked_at_idx')
  @Column({
    type: DataType.DATE,
    comment: 'Timestamp when session was manually revoked',
  })
  declare revokedAt: Date;

  // Associations
  @BelongsTo(() => User, 'userId')
  declare user: User;
}
