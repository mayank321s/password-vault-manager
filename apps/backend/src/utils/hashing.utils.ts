import * as argon2 from 'argon2';
/**
 * Hash password using Argon2
 * This is the server-side hashing (second hash)
 * The argon2 generates a random salt for each password,
 * so we don't need to worry about generating and storing the salt separately.
 * The salt is included in the hash output, so it can be used for verification later.
 */
export const argon2Hash = async (password: string): Promise<string> => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
};

export const argon2Verify = async (
  hash: string,
  password: string,
): Promise<boolean> => {
  return argon2.verify(hash, password);
};
