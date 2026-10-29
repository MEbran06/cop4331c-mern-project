// Students and clubs live in separate collections (see db_schema.js) but share
// one login. These helpers look an account up in either collection.
const { Student, Club } = require('../db_schema');

// The role decides which model an account belongs to
const MODELS = {
  student: Student,
  club: Club
};

const ROLES = Object.keys(MODELS);

// Returns { account, role } or null. Searches students first, then clubs.
async function findAccountByEmail(email) {
  for (const role of ROLES) {
    const account = await MODELS[role].findOne({ email: String(email).toLowerCase().trim() });
    if (account) return { account, role };
  }
  return null;
}

async function findAccountById(id) {
  for (const role of ROLES) {
    const account = await MODELS[role].findById(id);
    if (account) return { account, role };
  }
  return null;
}

// What the API sends back about an account. Built field by field so the
// password hash can never slip into a response.
function toPublicUser(account, role) {
  const user = {
    id: String(account._id),
    name: account.name,
    email: account.email,
    role,
    createdAt: account.createdAt
  };
  if (role === 'club') user.description = account.description;
  return user;
}

module.exports = { MODELS, ROLES, findAccountByEmail, findAccountById, toPublicUser };
