const bcrypt = require('bcryptjs');
const { createToken } = require('../middleware/auth');
const { findAccountByEmail, toPublicUser } = require('../utils/accounts');

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
