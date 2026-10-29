const bcrypt = require('bcryptjs');
const { createToken } = require('../middleware/auth');
const { MODELS, ROLES, findAccountByEmail, findAccountById, toPublicUser } = require('../utils/accounts');

// How much work bcrypt does per hash. Each +1 doubles the time it takes,
// which is what makes stolen hashes slow to crack. 10 is a common default.
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/users
// Body: { role: 'student' | 'club', name, email, password, description? }
exports.createUser = async (req, res, next) => {
  try {
    const { role, name, email, password, description = '' } = req.body || {};

    // Bad request
    if (!role || !name || !email || !password) {
      return res.status(400).json({ error: 'role, name, email and password are required' });
    }
    // Only 'student' and 'club' exist, so nobody can register as anything else
    if (!ROLES.includes(String(role))) {
      return res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` });
    }
    if (!EMAIL_PATTERN.test(String(email))) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    // Conflict: checks both collections, so one email can't be both a student and a club
    if (await findAccountByEmail(email)) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    // The schemas store a hash, never the password itself
    const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
    const fields = { name: String(name), email: String(email), passwordHash };
    if (role === 'club') fields.description = String(description);

    const account = await MODELS[role].create(fields);

    // A new user is logged in right away, so the response includes a token.
    // Created
    res
      .status(201)
      .location(`/api/users/${account._id}`)
      .json({ token: createToken(account, role), user: toPublicUser(account, role) });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:userId
exports.getUser = async (req, res, next) => {
  try {
    const found = await findAccountById(req.params.userId);

    if (!found) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(toPublicUser(found.account, found.role));
  } catch (err) {
    next(err);
  }
};
