import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { useOrganizationContext } from '../../contexts/OrganizationContext';
import { getSessionData } from '../../lib/storage';
import { useLogoutMutation } from '../../hooks/useAuthMutations';

export function useVaultListColumn(onOrganizationChanged: () => void) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logoutMutation = useLogoutMutation();
  const {
    activeOrganizationId,
    organizationIds,
    setActiveOrganizationId,
    isReady,
  } = useOrganizationContext();

  const { data: userProfile } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const [rawEmail, rawUsername] = await Promise.all([
        getSessionData('user_email'),
        getSessionData('user_username'),
      ]);
      const email = typeof rawEmail === 'string' ? rawEmail : '';
      const username = typeof rawUsername === 'string' ? rawUsername : '';
      return { email, username };
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleToggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    logoutMutation.mutate();
  };

  const handleOrganizationChange = async (organizationId: string) => {
    if (!organizationId || organizationId === activeOrganizationId) {
      return;
    }

    await setActiveOrganizationId(organizationId);
    onOrganizationChanged();
  };

  const displayName =
    userProfile?.username ||
    (userProfile?.email ? userProfile.email.split('@')[0] : '');

  return {
    userProfile,
    displayName,
    isDropdownOpen,
    dropdownRef,
    handleToggleDropdown,

    handleSignOut,
    activeOrganizationId,
    organizationIds,
    handleOrganizationChange,
    isOrganizationSwitcherVisible: isReady && organizationIds.length > 1,
  };
}
