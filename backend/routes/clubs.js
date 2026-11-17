const express = require('express');
const clubs = require('../controllers/clubController');
const { requireAuth } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.use(requireAuth);
router.param('clubId', validateObjectId);

// GET /api/clubs - Search and browse clubs
router.get('/', clubs.searchClubs);

// POST /api/clubs/:clubId/follow - Toggle follow/unfollow status for a club
router.post('/:clubId/follow', clubs.toggleFollowClub);

module.exports = router;
