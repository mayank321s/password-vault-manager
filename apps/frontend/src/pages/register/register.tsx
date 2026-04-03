import { useState } from 'react';
import { button } from '../../common/css/button.css';
import { formStyles } from '../../common/css/form.css';
import { PasswordFields } from '../../components/password-fields/password-fields';
import * as styles from './register.css';
import { useRegisterPage } from './register.hook';

export default function RegisterPage() {
  const {
    formData,
    step,
    errors,
    progress,
    processingTitle,
    isLockedOut,
    qrCodeDataUrl,
    totpSecret,
    totpCode,
    seedPhrase,
    seedPhraseCopied,
    seedPhraseConfirmed,
    completeRegistrationMutation,
    handleInputChange,
    handleSubmit,
    handleTotpCodeChange,
    handleTotpSubmit,
    handleRestartRegistration,
    handleCopySeedPhrase,
    handleDownloadSeedPhrase,
    handleCompleteSeedPhrase,
    setSeedPhraseConfirmed,
  } = useRegisterPage();

  // Local display-only state for the manual secret copy button
  const [secretCopied, setSecretCopied] = useState(false);

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(totpSecret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 3000);
    } catch {
      // Clipboard API unavailable — no-op
    }
  };

  // ============================================
  // Processing screen (steps 1 and 2 both use this)
  // ============================================

  if (step === 'processing') {
    return (
      <div className={styles.registerPage}>
        <div className={styles.registerContainer}>
          <div className={styles.progressContainer}>
            <h2>{processingTitle}</h2>
            <p className={styles.progressStage}>{progress.stage}</p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className={styles.progressPercent}>{progress.percent}%</p>
            <p className={styles.progressInfo}>Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // TOTP setup screen — scan QR code and verify
  // ============================================

  if (step === 'totp-setup') {
    return (
      <div className={styles.registerPage}>
        <div className={styles.registerContainer}>
          <div className={styles.totpContainer}>
            <div className={styles.totpHeader}>
              <h2 className={styles.totpTitle}>Set Up Authenticator</h2>
              <p className={styles.totpSubtitle}>
                Your account requires two-factor authentication. Scan the QR
                code below with an authenticator app to continue.
              </p>
            </div>

            <ol className={styles.totpSteps}>
              <li className={styles.totpStep}>
                Install an authenticator app (Google/Microsoft Authenticator,
                Authy, or similar)
              </li>
              <li className={styles.totpStep}>
                Enter the 6-digit code shown in your app below
              </li>
            </ol>

            <div className={styles.qrWrapper}>
              <img
                src={qrCodeDataUrl}
                alt="TOTP QR code — scan with your authenticator app"
                className={styles.qrImage}
              />
              <p className={styles.qrCaption}>
                Scan with your authenticator app
              </p>
            </div>

            <div className={styles.divider}>or enter the code manually</div>

            <div className={styles.secretContainer}>
              <p className={styles.secretLabel}>Manual entry key</p>
              <div className={styles.secretCodeRow}>
                <p className={styles.secretCode}>{totpSecret}</p>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className={styles.secretCopyButton}
                >
                  {secretCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
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
                  autoFocus
                />
                <p className={styles.totpInputHint}>
                  Code refreshes every 30 seconds
                </p>
              </div>

              {errors.length > 0 && (
                <div className={styles.errorBox}>
                  {errors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}

              <div className={styles.totpActions}>
                <button
                  type="submit"
                  className={button.primary}
                  disabled={
                    totpCode.length !== 6 ||
                    completeRegistrationMutation.isPending ||
                    isLockedOut
                  }
                >
                  {completeRegistrationMutation.isPending
                    ? 'Verifying...'
                    : isLockedOut
                      ? 'Locked — try again in 15 minutes'
                      : 'Verify and Continue'}
                </button>
                <button
                  type="button"
                  onClick={handleRestartRegistration}
                  className={styles.btnGhost}
                >
                  Start over
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // Seed phrase screen
  // ============================================

  if (step === 'seed-phrase') {
    return (
      <div className={styles.registerPage}>
        <div className={styles.registerContainer}>
          <div className={styles.seedPhraseContainer}>
            <h2>Save Your Recovery Phrase</h2>
            <div className={styles.warningBox}>
              <h3>CRITICAL: Save This Recovery Phrase</h3>
              <p>
                This 12-word phrase is the ONLY way to recover your account if
                you forget your password.
              </p>
              <ul>
                <li>Write it down and store it in a safe place</li>
                <li>Never share it with anyone</li>
                <li>We cannot recover your account without this phrase</li>
              </ul>
            </div>

            <div className={styles.seedPhraseBox}>
              {seedPhrase.split(' ').map((word, index) => (
                <div key={index} className={styles.seedWord}>
                  <span className={styles.seedWordNumber}>{index + 1}.</span>
                  <span className={styles.seedWordText}>{word}</span>
                </div>
              ))}
            </div>

            <div className={styles.seedPhraseActions}>
              <button
                type="button"
                onClick={handleCopySeedPhrase}
                className={styles.btnSecondary}
              >
                {seedPhraseCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                type="button"
                onClick={handleDownloadSeedPhrase}
                className={styles.btnSecondary}
              >
                Download as File
              </button>
            </div>

            <div className={styles.seedPhraseConfirm}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={seedPhraseConfirmed}
                  onChange={(e) => setSeedPhraseConfirmed(e.target.checked)}
                />
                <span>
                  I have saved my recovery phrase in a secure location
                </span>
              </label>
            </div>

            {errors.length > 0 && (
              <div className={styles.errorBox}>
                {errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleCompleteSeedPhrase}
              className={button.primary}
              disabled={!seedPhraseConfirmed}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // Complete screen
  // ============================================

  if (step === 'complete') {
    return (
      <div className={styles.registerPage}>
        <div className={styles.registerContainer}>
          <div className={styles.successContainer}>
            <h2>Registration Complete!</h2>
            <p>Your account has been created successfully.</p>
            <p>Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // Default: registration form
  // ============================================

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerContainer}>
        <div className={styles.registerHeader}>
          <p>Create Your Account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.registerForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={formStyles.formLabel}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              className={formStyles.formInput}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              maxLength={100}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username" className={formStyles.formLabel}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              className={formStyles.formInput}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Your display name"
              required
              autoComplete="username"
              maxLength={50}
            />
          </div>

          <PasswordFields
            password={formData.masterPassword}
            confirmPassword={formData.confirmPassword}
            onPasswordChange={(v) => handleInputChange('masterPassword', v)}
            onConfirmPasswordChange={(v) =>
              handleInputChange('confirmPassword', v)
            }
            passwordLabel="Password"
            confirmLabel="Confirm Password"
            passwordId="masterPassword"
            confirmId="confirmPassword"
          />

          {errors.length > 0 && (
            <div className={styles.errorBox}>
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          <button type="submit" className={button.primary}>
            Create Account
          </button>

          <p className={styles.formFooter}>
            Already have an account? <a href="/login">Log in here</a>
          </p>
        </form>
      </div>
    </div>
  );
}
