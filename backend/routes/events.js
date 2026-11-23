const express = require('express');
const events = require('../controllers/eventsController');
const { requireAuth } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();
router.use(requireAuth);
router.param('eventId', validateObjectId);

// Static paths must precede /:eventId so "feed" is not treated as an ID.
router.get('/feed', events.getFeed);
router.post('/', events.createEvent);
router.use('/:eventId/survey', require('./surveys'));
router.get('/:eventId/manage', events.getManagedEvent);
router.get('/:eventId', events.getEvent);
router.patch('/:eventId', events.updateEvent);
router.delete('/:eventId', events.deleteEvent);

// These event-list endpoints live under /clubs in the frontend contract.
// Keeping their router separate allows other club routes to be added later.
const clubEventsRouter = express.Router();
clubEventsRouter.use(requireAuth);
clubEventsRouter.param('clubId', validateObjectId);
clubEventsRouter.get('/:clubId/events', events.getClubEvents);
clubEventsRouter.get('/:clubId/managed-events', events.getManagedEvents);

module.exports = router;
module.exports.clubEventsRouter = clubEventsRouter;
