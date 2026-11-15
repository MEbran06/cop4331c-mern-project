const { Event, Club, Membership, Survey, SurveyResponse } = require('../db_schema');
const { toEventResponse } = require('../utils/events');

const viewer = req => ({ id: req.userId, role: req.userRole });
const owns = (req, event) => req.userRole === 'club' && String(event.club) === req.userId;
const fail = (res, status, error) => res.status(status).json({ error });

// Accept timezone-qualified ISO timestamps (including Date.toISOString()).
// Checking calendar components also rejects dates JS would silently normalize,
// such as February 30. No database schema changes are needed.
function parseTimestamp(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = '0', zone] = match;
  const leap = +year % 4 === 0 && (+year % 100 !== 0 || +year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (+month < 1 || +month > 12 || +day < 1 || +day > days[+month - 1] ||
      +hour > 23 || +minute > 59 || +second > 59) return null;
  if (zone !== 'Z' && (+zone.slice(1, 3) > 23 || +zone.slice(4) > 59)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be an object' };
  }
  const { title, startsAt, endsAt, location, description } = body;
  if (typeof title !== 'string' || !title.trim()) return { error: 'title must be a non-empty string' };
  if (typeof location !== 'string' || typeof description !== 'string') {
    return { error: 'location and description must be strings (empty strings are allowed)' };
  }
  const start = parseTimestamp(startsAt);
  const end = parseTimestamp(endsAt);
  if (!start || !end) return { error: 'startsAt and endsAt must be valid ISO 8601 timestamps with a timezone' };
  if (end <= start) return { error: 'endsAt must be after startsAt' };
  // Whitelist writable fields. Body-supplied club, _id, or survey fields cannot
  // change ownership or bypass the separate survey endpoints.
  return { fields: { title: title.trim(), startsAt: start, endsAt: end, location, description } };
}

// POST /api/events — the authenticated club is always the owner.
exports.createEvent = async (req, res, next) => {
  try {
    if (req.userRole !== 'club') return fail(res, 403, 'Only clubs can create events');
    const input = validateBody(req.body);
    if (input.error) return fail(res, 400, input.error);
    if (!await Club.exists({ _id: req.userId })) return fail(res, 404, 'Club not found');
    const event = await Event.create({ ...input.fields, club: req.userId });
    res.status(201).location(`/api/events/${event._id}`).json(await toEventResponse(event, viewer(req), true));
  } catch (err) { next(err); }
};

// Shared read logic preserves the two frontend response types.
function readEvent(managed) {
  return async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.eventId);
      if (!event) return fail(res, 404, 'Event not found');
      if (managed && !owns(req, event)) return fail(res, 403, 'Only the owning club can manage this event');
      res.status(200).json(await toEventResponse(event, viewer(req), managed));
    } catch (err) { next(err); }
  };
}
exports.getEvent = readEvent(false);
exports.getManagedEvent = readEvent(true);

// PATCH uses the same full body as POST, as required by the frontend contract.
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return fail(res, 404, 'Event not found');
    if (!owns(req, event)) return fail(res, 403, 'Only the owning club can update this event');
    const input = validateBody(req.body);
    if (input.error) return fail(res, 400, input.error);
    // The ownership condition is repeated in the write; never upsert a missing event.
    const updated = await Event.findOneAndUpdate(
      { _id: event._id, club: req.userId },
      { $set: input.fields },
      { new: true, runValidators: true }
    );
    if (!updated) return fail(res, 404, 'Event not found');
    res.status(200).json(await toEventResponse(updated, viewer(req), true));
  } catch (err) { next(err); }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return fail(res, 404, 'Event not found');
    if (!owns(req, event)) return fail(res, 403, 'Only the owning club can delete this event');
    // Delete children first, leaving the event available for retry if a database
    // operation fails. This works with standalone MongoDB; it is not atomic.
    // Future concurrent survey writers must coordinate with event deletion.
    const surveys = await Survey.find({ event: event._id }).select('_id').lean();
    const surveyIds = surveys.map(survey => survey._id);
    await SurveyResponse.deleteMany({ survey: { $in: surveyIds } });
    await Survey.deleteMany({ event: event._id });
    await Event.deleteOne({ _id: event._id, club: req.userId });
    res.status(204).end();
  } catch (err) { next(err); }
};

// GET /api/events/feed — only events from clubs this student follows.
exports.getFeed = async (req, res, next) => {
  try {
    if (req.userRole !== 'student') return fail(res, 403, 'Only students can view the feed');
    const clubIds = await Membership.distinct('club', { student: req.userId });
    const events = await Event.find({ club: { $in: clubIds } }).sort({ startsAt: 1, _id: 1 });
    res.status(200).json(await Promise.all(events.map(event => toEventResponse(event, viewer(req)))));
  } catch (err) { next(err); }
};

// Club page list: public survey view, no server-side past/upcoming filtering.
exports.getClubEvents = async (req, res, next) => {
  try {
    if (!await Club.exists({ _id: req.params.clubId })) return fail(res, 404, 'Club not found');
    const events = await Event.find({ club: req.params.clubId }).sort({ startsAt: 1, _id: 1 });
    res.status(200).json(await Promise.all(events.map(event => toEventResponse(event, viewer(req)))));
  } catch (err) { next(err); }
};

function pageNumber(value, fallback, minimum) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= minimum ? number : null;
}

exports.getManagedEvents = async (req, res, next) => {
  try {
    if (req.userRole !== 'club' || req.userId !== req.params.clubId) {
      return fail(res, 403, 'Only the owning club can view managed events');
    }
    const { when } = req.query;
    const limit = pageNumber(req.query.limit, 20, 1);
    const skip = pageNumber(req.query.skip, 0, 0);
    if (!['upcoming', 'past'].includes(when) || limit === null || skip === null) {
      return fail(res, 400, 'when must be upcoming or past; limit must be positive and skip non-negative integers');
    }
    if (!await Club.exists({ _id: req.params.clubId })) return fail(res, 404, 'Club not found');
    // Reuse one instant for both the count and page. In-progress events belong
    // to upcoming, and total counts every match before pagination.
    const now = new Date();
    const filter = { club: req.params.clubId, endsAt: when === 'past' ? { $lt: now } : { $gte: now } };
    const direction = when === 'past' ? -1 : 1;
    const [events, total] = await Promise.all([
      Event.find(filter).sort({ startsAt: direction, _id: direction }).skip(skip).limit(limit),
      Event.countDocuments(filter)
    ]);
    res.status(200).json({
      events: await Promise.all(events.map(event => toEventResponse(event, viewer(req), true))),
      total
    });
  } catch (err) { next(err); }
};
