import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import './App.css';
import { useSession } from './contexts/SessionContext';

const AccountRecoveryPage = React.lazy(
  () => import('./pages/account-recovery/account-recovery'),
);
const LoginPage = React.lazy(() => import('./pages/login/login'));
const RegisterPage = React.lazy(() => import('./pages/register/register'));
const VaultsPage = React.lazy(() => import('./pages/vaults/vault'));
const PricingPage = React.lazy(() => import('./pages/pricing/pricing'));
const BillingSettingsPage = React.lazy(
  () => import('./pages/billing-settings/billing-settings'),
);
const OrgSettingsPage = React.lazy(
  () => import('./pages/org-settings/org-settings'),
);
const FamilyOnboardingPage = React.lazy(
  () => import('./pages/family-onboarding/family-onboarding'),
);
const EmergencyAccessPage = React.lazy(
  () => import('./pages/emergency-access/emergency-access'),
);
const ExtensionOnboardingPage = React.lazy(
  () => import('./pages/extension-onboarding/extension-onboarding'),
);
const ImportPage = React.lazy(() => import('./pages/import/import'));
const SsoCallbackPage = React.lazy(
  () => import('./pages/sso-callback/sso-callback'),
);
const ShareLinkViewPage = React.lazy(
  () => import('./pages/share-link-view/share-link-view'),
);
const UnlockPage = React.lazy(() => import('./pages/unlock/unlock'));

const PUBLIC_PATHS = ['/login', '/register', '/recover', '/unlock', '/share'];

/**
 * Watches session lock state and redirects to /unlock when the session
 * becomes locked while the user is on a protected page.
 * Only triggers when the session has been initialized (i.e. the user was
 * previously logged in this browser session), not on a fresh page load.
 */
function SessionLockNavigator() {
  const { isLocked, isInitialized } = useSession();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some(
      (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/'),
    );

    if (isLocked && !isPublic) {
      navigate('/unlock', { replace: true });
    }
  }, [isLocked, isInitialized, location.pathname, navigate]);

  return null;
}

// Placeholder components
function HomePage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Password Manager</h1>
      <p>Welcome to your zero-knowledge password manager</p>
      <p>
        <a href="/login" style={{ margin: '0 1rem' }}>
          Login
        </a>
        <a href="/register" style={{ margin: '0 1rem' }}>
          Register
        </a>
      </p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>
        <a href="/">Go back home</a>
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SessionLockNavigator />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/recover" element={<AccountRecoveryPage />} />
        <Route path="/unlock" element={<UnlockPage />} />
        <Route path="/login/sso/callback" element={<SsoCallbackPage />} />
        <Route path="/vaults" element={<VaultsPage />} />
        <Route path="/vaults/:vaultId" element={<VaultsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/settings/billing" element={<BillingSettingsPage />} />
        <Route path="/settings/organization" element={<OrgSettingsPage />} />
        <Route
          path="/settings/organization/:section"
          element={<OrgSettingsPage />}
        />
        <Route path="/family/onboarding" element={<FamilyOnboardingPage />} />
        <Route path="/extension/onboarding" element={<ExtensionOnboardingPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/settings/emergency-access" element={<EmergencyAccessPage />} />
        <Route
          path="/vaults/:vaultId/password/:passwordId"
          element={<VaultsPage />}
        />
        <Route path="/share/:shareId" element={<ShareLinkViewPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
