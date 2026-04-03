// PII redaction format
export const piiRedactionFormat = (info) => {
  const sensitiveKeys = [
    // Password related
    'password',
    'password_hash',
    'passwordhash',
    'master_password',
    'masterpassword',
    'current_password',
    'new_password',
    'confirm_password',
    // Tokens and auth
    'token',
    'access_token',
    'accesstoken',
    'refresh_token',
    'refreshtoken',
    'jwt',
    'jwt_token',
    'bearer',
    'authorization',
    'auth',
    'api_key',
    'apikey',
    // Encryption keys and data
    'encrypted_private_key',
    'encryptedprivatekey',
    'encryption_key',
    'encryptionkey',
    'vault_encrypted_key',
    'vaultencryptedkey',
    'password_encrypted_key',
    'passwordencryptedkey',
    'encrypted_data',
    'encrypteddata',
    'encrypted_blob',
    'encryptedblob',
    'public_key',
    'publickey',
    'private_key',
    'privatekey',
    'symmetric_key',
    'symmetrickey',
    'shared_key',
    'sharedkey',
    // Seed phrases and recovery
    'seed_phrase',
    'seedphrase',
    'mnemonic',
    'recovery_code',
    'recoverycode',
    'backup_code',
    'backupcode',
    // Sensitive user data
    'ssn',
    'social_security',
    'credit_card',
    'creditcard',
    'cvv',
    'pin',
    'secret',
    'salt',
    'iv',
    'nonce',
  ];

  const redact = (obj: any): any => {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => redact(item));
    }

    const redacted: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const lowerKey = key.toLowerCase().replace(/[_-]/g, '');
        const shouldRedact = sensitiveKeys.some((sensitive) => {
          const cleanSensitive = sensitive.toLowerCase().replace(/[_-]/g, '');
          return lowerKey.includes(cleanSensitive);
        });

        if (shouldRedact) {
          redacted[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          redacted[key] = redact(obj[key]);
        } else {
          redacted[key] = obj[key];
        }
      }
    }
    return redacted;
  };

  // Redact request bodies on auth endpoints
  if (info.url && typeof info.url === 'string') {
    const url = info.url as string;
    const authEndpoints = ['/auth/register', '/auth/login', '/auth/refresh'];
    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      url.includes(endpoint),
    );

    if (isAuthEndpoint && info.body) {
      info.body = '[REDACTED]';
    }
  }

  // Redact the entire log info object
  return redact(info);
};
