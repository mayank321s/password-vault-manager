import type { VaultMemberResponse, VaultResponse } from '@repo/shared';

export interface AddMemberFormState {
  email: string;
  role: 'manager' | 'team_member';
  selectedUserId?: string;
  publicKey: string;
}

export type VaultMember = VaultMemberResponse['members'][number];

export interface VaultSettingsPanelProps {
  vault: VaultResponse;
  // members: VaultMemberResponse['members'];
  // membersLoading: boolean;
  // membersError: boolean;
  // currentUserUserId: string;
  // addMemberForm: AddMemberFormState;
  // addMemberError: string | null;
  // updateRoleMutation: UseMutationResult<
  //   SuccessResponse,
  //   Error,
  //   { memberId: string; role: 'manager' | 'team_member' }
  // >;
  // removeMemberMutation: UseMutationResult<
  //   SuccessResponse,
  //   Error,
  //   { memberId: string }
  // >;
  // addMemberMutation: UseMutationResult<
  //   SuccessResponse,
  //   Error,
  //   { email: string; role: 'manager' | 'team_member' }
  // >;
  // onAddMemberFormChange: (form: AddMemberFormState) => void;
  // onAddMember: () => void;
}

export interface MemberFlags {
  isCurrentUser: boolean;
  isOwner: boolean;
  canEdit: boolean;
}
