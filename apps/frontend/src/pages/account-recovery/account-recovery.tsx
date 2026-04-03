import { useState } from 'react';
import { button } from '../../common/css/button.css';
import * as styles from './account-recovery.css';
import { useAccountRecoveryPage } from './account-recovery.hook';
import { PasswordFields } from '../../components/password-fields/password-fields';

export default function AccountRecoveryPage() {
  const {
    step,
    formData,
    errors,
    progress,
    showSeedWords,
    seedWords,
    seedPhraseRef,
    recoveryMutation,
    enrollMutation,
    confirmPassword,
    totpCode,
    recoveryTotpData,
    isLockedOut,
    setConfirmPassword,
    handleInputChange,
    handleSubmit,
    handleTotpCodeChange,
    handleTotpSubmit,
    handleRestartRecovery,
    toggleSeedWordsDisplay,
    handleBackToLogin,
  } = useAccountRecoveryPage();

  // Local display-only state for the manual secret copy button
  const [secretCopied, setSecretCopied] = useState(false);

  const handleCopySecret = async () => {
    if (!recoveryTotpData) return;
    try {
      await navigator.clipboard.writeText(recoveryTotpData.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 3000);
    } catch {
      // Clipboard API unavailable — no-op
    }
  };

  // ============================================
  // TOTP re-enrollment screen
  // ============================================

  if (step === 'totp-setup' && recoveryTotpData) {
    return (
      <>
        <div className={styles.recoveryPage}>
          <div className={styles.recoveryContainer}>
            <div className={styles.totpContainer}>
              <div className={styles.totpHeader}>
                <h2 className={styles.totpTitle}>
                  Re-Enroll Your Authenticator
                </h2>
                <p className={styles.totpSubtitle}>
                  Your account recovery has reset your two-factor
                  authentication. Scan the QR code below with your authenticator
                  app to re-enroll.
                </p>
              </div>

              <ol className={styles.totpSteps}>
                <li className={styles.totpStep}>
                  Open your authenticator app (Google/Microsoft Authenticator,
                  Authy, or similar)
                </li>
                <li className={styles.totpStep}>
                  Scan the QR code or enter the manual key, then enter the
                  6-digit code below
                </li>
              </ol>

              <div className={styles.qrWrapper}>
                <img
                  src={recoveryTotpData.qrCodeDataUrl}
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
                  <p className={styles.secretCode}>{recoveryTotpData.secret}</p>
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
                    <ul className={styles.errorList}>
                      {errors.map((error, index) => (
                        <li key={index} className={styles.errorText}>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.totpActions}>
                  <button
                    type="submit"
                    className={button.primary}
                    disabled={
                      totpCode.length !== 6 ||
                      enrollMutation.isPending ||
                      isLockedOut
                    }
                  >
                    {enrollMutation.isPending
                      ? 'Verifying...'
                      : isLockedOut
                        ? 'Locked — try again in 15 minutes'
                        : 'Verify and Continue'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRestartRecovery}
                    className={styles.btnGhost}
                  >
                    Restart recovery
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {enrollMutation.isPending && (
          <div className={styles.progressOverlay}>
            <div className={styles.progressContainer}>
              <h2>{progress.stage || 'Verifying...'}</h2>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p style={{ marginTop: '1rem', color: '#718096' }}>
                {progress.percent}%
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // ============================================
  // Default: recovery form
  // ============================================

  return (
    <>
      <div className={styles.recoveryPage}>
        <div className={styles.recoveryContainer}>
          <div className={styles.recoveryHeader}>
            <h1 className={styles.title}>Account Recovery</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.recoveryForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                <span className={styles.labelText}>
                  Email Address <span className={styles.required}>*</span>
                </span>
              </label>
              <input
                type="email"
                id="email"
                className={styles.input}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="you@example.com"
                disabled={recoveryMutation.isPending}
                required
                autoComplete="email"
                maxLength={100}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="seedPhrase" className={styles.label}>
                <span className={styles.labelText}>
                  Recovery Phrase <span className={styles.required}>*</span>
                </span>
                <button
                  type="button"
                  onClick={toggleSeedWordsDisplay}
                  className={styles.linkButton}
                  disabled={recoveryMutation.isPending}
                >
                  {showSeedWords ? 'Hide words' : 'Show as words'}
                </button>
              </label>

              {!showSeedWords ? (
                <>
                  <textarea
                    ref={seedPhraseRef}
                    id="seedPhrase"
                    className={styles.textarea}
                    value={formData.seedPhrase}
                    onChange={(e) =>
                      handleInputChange('seedPhrase', e.target.value)
                    }
                    placeholder="Enter your 12-word recovery phrase (separated by spaces). Words should be in lowercase."
                    disabled={recoveryMutation.isPending}
                    required
                    autoComplete="off"
                    spellCheck={false}
                  />
                </>
              ) : (
                <>
                  <div className={styles.seedPhraseGrid}>
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div key={index} className={styles.seedWord}>
                        <span className={styles.seedWordNumber}>
                          {index + 1}.
                        </span>
                        {seedWords[index] || '---'}
                      </div>
                    ))}
                  </div>
                  {seedWords.length > 0 && seedWords.length !== 12 && (
                    <p className={styles.helpText}>
                      Words entered: {seedWords.length} / 12
                    </p>
                  )}
                </>
              )}
            </div>

            <PasswordFields
              password={formData.newPassword}
              confirmPassword={confirmPassword}
              onPasswordChange={(v) => handleInputChange('newPassword', v)}
              onConfirmPasswordChange={setConfirmPassword}
              passwordLabel="New Password"
              confirmLabel="Confirm Password"
              passwordId="newPassword"
              confirmId="confirmPassword"
              disabled={recoveryMutation.isPending}
            />

            {errors.length > 0 && (
              <div className={styles.errorBox}>
                <ul className={styles.errorList}>
                  {errors.map((error, index) => (
                    <li key={index} className={styles.errorText}>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              className={button.primary}
              disabled={
                recoveryMutation.isPending ||
                seedWords.length !== 12 ||
                !formData.newPassword ||
                !confirmPassword
              }
            >
              {recoveryMutation.isPending
                ? 'Recovering Account...'
                : 'Recover Account'}
            </button>

            <div className={styles.divider}>or</div>

            <button
              type="button"
              onClick={handleBackToLogin}
              className={styles.btnSecondary}
              disabled={recoveryMutation.isPending}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>

      {recoveryMutation.isPending && (
        <div className={styles.progressOverlay}>
          <div className={styles.progressContainer}>
            <h2>{progress.stage || 'Processing...'}</h2>
            <div className={styles.progressBar}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p style={{ marginTop: '1rem', color: '#718096' }}>
              {progress.percent}%
            </p>
          </div>
        </div>
      )}
    </>
  );
}
