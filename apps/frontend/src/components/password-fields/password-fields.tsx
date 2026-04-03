import { useState } from 'react';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { formStyles } from '../../common/css/form.css';
import { calculatePasswordStrength } from '@repo/crypto-utils';
import { generatePassword } from '../../utils/password-utils';
import * as styles from './password-fields.css';

interface PasswordFieldsProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  disabled?: boolean;
  passwordLabel?: string;
  confirmLabel?: string;
  passwordId?: string;
  confirmId?: string;
}

export function PasswordFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  disabled = false,
  passwordLabel = 'Password',
  confirmLabel = 'Confirm Password',
  passwordId = 'password',
  confirmId = 'confirmPassword',
}: PasswordFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = password
    ? calculatePasswordStrength(password)
    : null;
  const strengthColors = ['red', 'orange', 'yellow', 'lightgreen', 'green'];

  const handleGenerate = () => {
    const generated = generatePassword({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });
    onPasswordChange(generated);
    onConfirmPasswordChange(generated);
  };

  return (
    <>
      <div className={styles.formGroup}>
        <label
          htmlFor={passwordId}
          className={`${formStyles.formLabel} ${styles.passwordLabel}`}
        >
          {passwordLabel}
          <button
            type="button"
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={disabled}
          >
            Generate Secure Password
          </button>
        </label>
        <div className={styles.passwordInputGroup}>
          <input
            type={showPassword ? 'text' : 'password'}
            id={passwordId}
            className={formStyles.formInput}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={`Enter ${passwordLabel.toLowerCase()}`}
            disabled={disabled}
            required
            autoComplete="new-password"
            maxLength={50}
          />
          <button
            type="button"
            className={styles.btnIcon}
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
          </button>
        </div>

        {passwordStrength && (
          <div className={styles.passwordStrengthContainer}>
            <div className={styles.strengthBar}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={styles.strengthSegment}
                  style={{
                    backgroundColor:
                      i <= passwordStrength.score
                        ? strengthColors[passwordStrength.score]
                        : '#e0e0e0',
                  }}
                />
              ))}
            </div>
            <p className={styles.strengthText}>{passwordStrength.feedback}</p>
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor={confirmId} className={formStyles.formLabel}>
          {confirmLabel}
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          id={confirmId}
          className={formStyles.formInput}
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          placeholder={`Re-enter ${passwordLabel.toLowerCase()}`}
          disabled={disabled}
          required
          autoComplete="new-password"
          maxLength={50}
        />
      </div>
    </>
  );
}
