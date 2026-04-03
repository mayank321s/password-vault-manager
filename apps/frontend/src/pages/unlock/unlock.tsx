import * as loginStyles from '../login/login.css';
import * as styles from './unlock.css';
import { formStyles } from '../../common/css/form.css';
import { useUnlockPage } from './unlock.hook';
import { IoMdEye, IoMdEyeOff, IoMdLock } from 'react-icons/io';
import { button } from '../../common/css/button.css';

export default function UnlockPage() {
  const {
    email,
    masterPassword,
    setMasterPassword,
    showPassword,
    setShowPassword,
    unlockMutation,
    handleSubmit,
    handleSignInDifferentAccount,
  } = useUnlockPage();

  return (
    <div className={loginStyles.loginPage}>
      <div className={loginStyles.loginContainer}>
        <div className={loginStyles.loginHeader}>
          <span className={styles.lockIcon}>
            <IoMdLock />
          </span>
          <p className={loginStyles.loginSubtitle}>
            Your session auto expires after 15 minutes of inactivity for
            security.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={loginStyles.loginForm}>
          {/* Wrong-password error */}
          {unlockMutation.isError && unlockMutation.error && (
            <div className={loginStyles.errorBox}>
              <p className={loginStyles.errorText}>
                {unlockMutation.error.message}
              </p>
            </div>
          )}

          {/* Account (email, read-only) */}
          <div className={loginStyles.formGroup}>
            <label className={formStyles.formLabel}>Account</label>
            <div className={styles.emailDisplay}>{email}</div>
          </div>

          {/* Master Password */}
          <div className={loginStyles.formGroup}>
            <label htmlFor="masterPassword" className={formStyles.formLabel}>
              Password
            </label>
            <div className={loginStyles.passwordInputGroup}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="masterPassword"
                className={`${formStyles.formInput} ${loginStyles.passwordInput}`}
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                autoFocus
                disabled={unlockMutation.isPending}
                maxLength={50}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={loginStyles.btnIcon}
                disabled={unlockMutation.isPending}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
              </button>
            </div>
          </div>

          {/* Actions: switch account (left) + submit button (right) */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleSignInDifferentAccount}
              className={loginStyles.btnLink}
              disabled={unlockMutation.isPending}
            >
              Sign in to another account
            </button>
            <button
              type="submit"
              className={button.primarySmall}
              disabled={unlockMutation.isPending || !email}
            >
              {unlockMutation.isPending ? 'Unlocking...' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
