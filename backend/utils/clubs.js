const { Club, Membership } = require('../db_schema');

async function getClubSummary(clubId, viewer) {
  const club = await Club.findById(clubId).select('name description').lean();
  if (!club) return null;

  const [followers, following] = await Promise.all([
    Membership.countDocuments({ club: club._id }),
    viewer.role === 'student'
      ? Membership.exists({ club: club._id, student: viewer.id })
      : null
  ]);

  return {
    id: String(club._id),
    name: club.name,
    followers,
    isFollowing: Boolean(following),
    description: club.description || ''
  };
}

module.exports = { getClubSummary };
