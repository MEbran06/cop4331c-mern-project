const express = require('express');

const router = express.Router();

// GET /api/ping - Health check
router.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Hello World' });
});

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));

// Event CRUD and the club event lists required by the mobile frontend.
const eventsRouter = require('./events');
router.use('/events', eventsRouter);
router.use('/clubs', eventsRouter.clubEventsRouter);

// Add general club routes (search, follow/unfollow)
router.use('/clubs', require('./clubs'));

module.exports = router;
