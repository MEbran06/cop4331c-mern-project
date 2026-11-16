const bcrypt = require('bcryptjs');
const { createToken } = require('../middleware/auth');
const { findAccountByEmail, toPublicUser } = require('../utils/accounts');

// SALT_ROUNDS and minimum length matching your other controllers
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

// Temporary in-memory token store for password recovery requests
// (In production, you can add resetToken and resetTokenExpires fields to your schemas)
const resetTokens = new Map();

// POST /api/auth/login
// Body: { email, password }
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    // Bad Request
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    // String() matters: without it, a body like {"email": {"$ne": null}}
    // becomes a MongoDB operator instead of an email address.
    const found = await findAccountByEmail(String(email));

    // Same message whether the email or the password was wrong, so the
    // response doesn't reveal which emails have accounts.
    if (!found || !(await bcrypt.compare(String(password), found.account.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({
      token: createToken(found.account, found.role),
      user: toPublicUser(found.account, found.role)
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
// Body: { email }
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const found = await findAccountByEmail(String(email));

    // To prevent email enumeration attacks, always respond with success even if not found
    if (!found) {
      return res.status(200).json({ message: 'If that email exists, a password reset token has been generated.' });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

    resetTokens.set(resetToken, {
      email: found.account.email,
      role: found.role,
      expiresAt
    });

    // Returns devResetToken for Bruno API testing convenience
    res.status(200).json({
      message: 'Password reset token generated successfully',
      devResetToken: resetToken
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
// Body: { token, newPassword }
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body || {};

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'token and newPassword are required' });
    }

    if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const tokenData = resetTokens.get(String(token));
    if (!tokenData || Date.now() > tokenData.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    const found = await findAccountByEmail(tokenData.email);
    if (!found) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Hash new password and save
    const passwordHash = await bcrypt.hash(String(newPassword), SALT_ROUNDS);
    found.account.passwordHash = passwordHash;
    await found.account.save();

    // Invalidate token after use
    resetTokens.delete(String(token));

    res.status(200).json({ message: 'Password has been successfully reset. You can now log in.' });
  } catch (err) {
    next(err);
  }
};
