const { Club, Membership, Survey, SurveyResponse } = require('../db_schema');

// Explicit response objects keep MongoDB internals and password hashes out of
// the API. Do not send populated model documents directly to the frontend.
async function toEventResponse(event, viewer, managed = false) {
  const club = await Club.findById(event.club).select('name description').lean();
  if (!club) throw new Error('Event references a missing club');

  const [followers, following, survey] = await Promise.all([
    Membership.countDocuments({ club: club._id }),
    viewer.role === 'student'
      ? Membership.exists({ club: club._id, student: viewer.id })
      : Promise.resolve(null),
    Survey.findOne({ event: event._id }).lean()
  ]);

  const result = {
    id: String(event._id),
    title: event.title,
    club: {
      id: String(club._id),
      name: club.name,
      followers,
      isFollowing: Boolean(following),
      description: club.description || ''
    },
    startsAt: new Date(event.startsAt).toISOString(),
    endsAt: new Date(event.endsAt).toISOString(),
    location: event.location || '',
    description: event.description || ''
  };

  // Public event routes hide draft surveys, even from club accounts. Only an
  // ownership-checked management route may request the managed response shape.
  if (survey && (managed || survey.status !== 'draft')) {
    result.survey = {
      id: String(survey._id),
      title: survey.title || '',
      status: survey.status,
      questions: survey.questions.map(question => ({
        id: String(question._id),
        text: question.text || '',
        type: question.type,
        options: question.options || [],
        required: Boolean(question.required)
      }))
    };
    if (managed) {
      result.survey.responseCount = await SurveyResponse.countDocuments({ survey: survey._id });
    } else {
      result.survey.completed = viewer.role === 'student' && Boolean(
        await SurveyResponse.exists({ survey: survey._id, student: viewer.id })
      );
    }
  }
  return result;
}

module.exports = { toEventResponse };
