const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash plain text password using bcryptjs.
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  if (!password) {
    throw new Error('Password is required for hashing');
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain text password with stored bcrypt hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  if (!password || !hash) {
    return false;
  }
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
