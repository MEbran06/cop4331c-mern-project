const { Club, Membership } = require('../db_schema');
const { getClubSummary } = require('../utils/clubs');

exports.getClub = async (req, res) => {
  const club = await getClubSummary(req.params.clubId, { id: req.userId, role: req.userRole });
  if (!club) return res.status(404).json({ error: 'Club not found' });
  res.json(club);
};

// GET /api/clubs — Search & browse clubs (query params: ?q=name&followedOnly=true/false)
exports.searchClubs = async (req, res, next) => {
  try {
    const { q = '', followedOnly = 'false' } = req.query;
    const query = {};

    if (typeof q === 'string' && q.trim()) {
      const regex = new RegExp(RegExp.escape(q.trim()), 'i');
      query.$or = [{ name: regex }, { description: regex }];
    }

    let followedSet = new Set();
    if (req.userRole === 'student') {
      const memberships = await Membership.find({ student: req.userId }).select('club').lean();
      followedSet = new Set(memberships.map((m) => m.club.toString()));

      if (followedOnly === 'true') {
        query._id = { $in: Array.from(followedSet) };
      }
    }

    const clubs = await Club.find(query).select('-passwordHash').sort({ name: 1 }).lean();

    // Attach follower counts
    const clubIds = clubs.map((c) => c._id);
    const counts = await Membership.aggregate([
      { $match: { club: { $in: clubIds } } },
      { $group: { _id: '$club', count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const results = clubs.map((club) => ({
      ...club,
      followerCount: countMap.get(club._id.toString()) || 0,
      isFollowing: followedSet.has(club._id.toString())
    }));

    res.status(200).json({ clubs: results });
  } catch (err) {
    next(err);
  }
};

// POST /api/clubs/:clubId/follow — Follow or unfollow a club (toggles membership)
exports.toggleFollowClub = async (req, res, next) => {
  try {
    if (req.userRole !== 'student') {
      return res.status(403).json({ error: 'Only students can follow clubs' });
    }

    const { clubId } = req.params;
    if (!await Club.exists({ _id: clubId })) {
      return res.status(404).json({ error: 'Club not found' });
    }

    const existing = await Membership.findOne({ student: req.userId, club: clubId });

    let isFollowing;
    if (existing) {
      await Membership.deleteOne({ _id: existing._id });
      isFollowing = false;
    } else {
      await Membership.create({ student: req.userId, club: clubId });
      isFollowing = true;
    }

    const followerCount = await Membership.countDocuments({ club: clubId });

    res.status(200).json({
      clubId,
      isFollowing,
      followerCount
    });
  } catch (err) {
    next(err);
  }
};
