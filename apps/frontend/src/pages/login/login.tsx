import { button } from '../../common/css/button.css';
import { formStyles } from '../../common/css/form.css';
import * as styles from './login.css';
import { useLoginPage } from './login.hook';
import {
  IoMdEye,
  IoMdEyeOff,
  IoMdLock,
  IoMdPhonePortrait,
} from 'react-icons/io';

export default function LoginPage() {
  const {
    step,
    formData,
    showPassword,
    progress,
    progressTitle,
    totpCode,
    isProgressVisible,
    loginMutation,
    loginWithTotpMutation,
    handleInputChange,
    setShowPassword,
    handleSubmit,
    handleTotpCodeChange,
    handleTotpSubmit,
    handleBackToLogin,
  } = useLoginPage();

  return (
    <>
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
          {/* ============================================
              Step 2: TOTP verification
          ============================================ */}
          {step === 'totp' && (
            <div className={styles.totpContainer}>
              <div className={styles.totpHeader}>
                <div className={styles.totpIconWrapper}>
                  <div className={styles.totpIcon}>
                    <IoMdPhonePortrait />
                  </div>
                </div>
                <h2 className={styles.totpTitle}>Two-Factor Authentication</h2>
                <p className={styles.totpSubtitle}>
                  Enter the 6-digit code from your authenticator app to
                  continue.
                </p>
              </div>

              <form onSubmit={handleTotpSubmit} className={styles.totpForm}>
                <div>
                  <label htmlFor="totpCode" className={styles.totpInputLabel}>
                    Verification code
                  </label>
                  <input
                    id="totpCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => handleTotpCodeChange(e.target.value)}
                    placeholder="000000"
                    className={styles.totpInput}
                    disabled={loginWithTotpMutation.isPending}
                    autoFocus
                  />
                  <p className={styles.totpInputHint}>
                    Code refreshes every 30 seconds
                  </p>
                </div>

                {loginWithTotpMutation.isError && (
                  <div className={styles.errorBox}>
                    <p className={styles.errorText}>
                      {loginWithTotpMutation.error instanceof Error
                        ? loginWithTotpMutation.error.message
                        : 'Invalid code. Please try again.'}
                    </p>
                  </div>
                )}

                <div className={styles.totpActions}>
                  <button
                    type="submit"
                    className={button.primary}
                    disabled={
                      totpCode.length !== 6 || loginWithTotpMutation.isPending
                    }
                  >
                    {loginWithTotpMutation.isPending
                      ? 'Verifying...'
                      : 'Verify'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className={styles.btnGhost}
                    disabled={loginWithTotpMutation.isPending}
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================
              Step 1: Credential form
          ============================================ */}
          {step === 'form' && (
            <>
              <div className={styles.loginHeader}>
                <p className={styles.loginSubtitle}>
                  Sign in to your password manager
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.loginForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={formStyles.formLabel}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={formStyles.formInput}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    disabled={loginMutation.isPending}
                    maxLength={100}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label
                    htmlFor="masterPassword"
                    className={formStyles.formLabel}
                  >
                    Password
                  </label>
                  <div className={styles.passwordInputGroup}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="masterPassword"
                      className={`${formStyles.formInput} ${styles.passwordInput}`}
                      value={formData.masterPassword}
                      onChange={(e) =>
                        handleInputChange('masterPassword', e.target.value)
                      }
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      disabled={loginMutation.isPending}
                      maxLength={50}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.btnIcon}
                      disabled={loginMutation.isPending}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                  <a href="/recover" className={styles.btnLink}>
                    Forgot your password?
                  </a>
                </div>

                <div className={styles.infoBox}>
                  <p className={styles.infoText}>
                    <IoMdLock /> Your password is never sent to our servers. All
                    decryption happens locally on your device.
                  </p>
                </div>

                {loginMutation.isError && (
                  <div className={styles.errorBox}>
                    <p className={styles.errorText}>
                      {loginMutation.error instanceof Error
                        ? loginMutation.error.message
                        : 'Login failed. Please check your credentials and try again.'}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className={button.primary}
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                </button>

                <div className={styles.divider}>
                  <div className={styles.dividerLine} />
                  <span className={styles.dividerText}>or</span>
                  <div className={styles.dividerLine} />
                </div>

                <p className={styles.formFooter}>
                  Don't have an account?{' '}
                  <a href="/register" className={styles.formFooterLink}>
                    Create one here
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Progress Overlay */}
      {isProgressVisible && (
        <div className={styles.progressOverlay}>
          <div className={styles.progressContainer}>
            <h2 className={styles.progressTitle}>{progressTitle}</h2>
            <p className={styles.progressStage}>{progress.stage}</p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className={styles.progressPercent}>{progress.percent}%</p>
          </div>
        </div>
      )}
    </>
  );
}
