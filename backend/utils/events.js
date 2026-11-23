const { Survey } = require('../db_schema');
const { getClubSummary } = require('./clubs');
const { toSurveyResponse } = require('./surveys');

// Explicit response objects keep MongoDB internals and password hashes out of
// the API. Do not send populated model documents directly to the frontend.
async function toEventResponse(event, viewer, managed = false) {
  const [club, survey] = await Promise.all([
    getClubSummary(event.club, viewer),
    Survey.findOne({ event: event._id }).lean()
  ]);
  if (!club) throw new Error('Event references a missing club');

  const result = {
    id: String(event._id),
    title: event.title,
    club,
    startsAt: new Date(event.startsAt).toISOString(),
    endsAt: new Date(event.endsAt).toISOString(),
    location: event.location || '',
    description: event.description || ''
  };

  // Public event routes hide draft surveys, even from club accounts. Only an
  // ownership-checked management route may request the managed response shape.
  if (survey && (managed || survey.status !== 'draft')) {
    result.survey = await toSurveyResponse(survey, viewer, managed);
  }
  return result;
}

module.exports = { toEventResponse };
