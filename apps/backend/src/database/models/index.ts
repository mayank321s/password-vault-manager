import { OneTimeShare } from './one-time-share.model';
import { PasswordPermission } from './password-permission.model';
import { Password } from './password.model';
import { User } from './user.model';
import { VaultMember } from './vault-member.model';
import { Vault } from './vault.model';
import { Session } from './session.model';

export { User } from './user.model';
export { Vault } from './vault.model';
export { VaultMember, VaultMemberRole } from './vault-member.model';
export { Password } from './password.model';
export { PasswordPermission } from './password-permission.model';
export { OneTimeShare } from './one-time-share.model';
export { Session } from './session.model';

// Array of all models for easy registration
export const models = [
  User,
  Vault,
  VaultMember,
  Password,
  PasswordPermission,
  OneTimeShare,
  Session,
];
