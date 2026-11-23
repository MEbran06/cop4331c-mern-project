const { Event, Survey, SurveyResponse } = require('../db_schema');
const { toSurveyResponse } = require('../utils/surveys');

const fail = (res, status, error) => res.status(status).json({ error });
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function parseFields(body, survey) {
  if (!object(body)) return { error: 'Request body must be an object' };
  const { title, status, questions } = body;
  if (status === 'closed') {
    return Object.keys(body).length === 1
      ? { fields: { status } }
      : { error: 'Closing a survey requires only status' };
  }
  if (!['draft', 'open'].includes(status) || typeof title !== 'string' || !Array.isArray(questions)) {
    return { error: 'Supply a draft or open status, a title, and a questions array' };
  }

  const fields = { status, title: title.trim(), questions: [] };

  const existingIds = new Set(survey?.questions.map(question => String(question._id)));
  for (const question of questions) {
    if (!object(question)) return { error: 'Each question must be an object' };
    const { id, text, type, options, required } = question;
    if (typeof text !== 'string' || typeof required !== 'boolean' ||
        !['text', 'single_choice', 'multiple_choice'].includes(type) ||
        !Array.isArray(options) || options.some(option => typeof option !== 'string')) {
      return { error: 'Each question must have a valid type, text, options and required flag' };
    }
    const fieldsForQuestion = {
      text: text.trim(),
      type,
      options: type === 'text' ? [] : options.map(option => option.trim()),
      required
    };
    if (id !== undefined) {
      if (!existingIds.delete(id)) return { error: 'Invalid or duplicate question id' };
      fieldsForQuestion._id = id;
    }
    fields.questions.push(fieldsForQuestion);
  }

  if (status === 'open' && fields.questions
    .some(question => question.options.some(option => !option) ||
      new Set(question.options).size !== question.options.length)) {
    return { error: 'Published choice options must be non-empty and distinct' };
  }
  return { fields };
}

function serialize(survey, req) {
  return toSurveyResponse(survey, { id: req.userId, role: req.userRole }, req.ownsSurveyEvent);
}

exports.loadEvent = async (req, res, next) => {
  const event = await Event.findById(req.params.eventId).select('club').lean();
  if (!event) return fail(res, 404, 'Event not found');
  req.surveyEventId = event._id;
  req.ownsSurveyEvent = req.userRole === 'club' && String(event.club) === req.userId;
  next();
};

exports.requireOwner = (req, res, next) => {
  if (!req.ownsSurveyEvent) return fail(res, 403, 'Only the owning club can manage this survey');
  next();
};

exports.getSurvey = async (req, res) => {
  const survey = await Survey.findOne({ event: req.surveyEventId }).lean();
  if (!survey || (survey.status === 'draft' && !req.ownsSurveyEvent)) {
    return fail(res, 404, 'Survey not found');
  }
  res.json(await serialize(survey, req));
};

exports.createSurvey = async (req, res) => {
  const input = parseFields(req.body);
  if (input.error) return fail(res, 400, input.error);
  if (input.fields.status === 'closed') return fail(res, 400, 'A new survey must be draft or open');
  const survey = await Survey.create({ ...input.fields, event: req.surveyEventId });
  res.status(201).location(`/api/events/${req.surveyEventId}/survey`).json(await serialize(survey, req));
};

exports.updateSurvey = async (req, res) => {
  const survey = await Survey.findOne({ event: req.surveyEventId });
  if (!survey) return fail(res, 404, 'Survey not found');

  if (!object(req.body)) return fail(res, 400, 'Request body must be an object');
  const closing = req.body.status === 'closed';
  if (survey.status !== (closing ? 'open' : 'draft')) {
    return fail(res, 409, 'Invalid survey change for its current status');
  }
  const input = parseFields(req.body, survey);
  if (input.error) return fail(res, 400, input.error);

  survey.set(input.fields);
  await survey.save();
  res.json(await serialize(survey, req));
};

exports.deleteSurvey = async (req, res) => {
  const survey = await Survey.findOne({ event: req.surveyEventId }).select('_id').lean();
  if (!survey) return fail(res, 404, 'Survey not found');
  await SurveyResponse.deleteMany({ survey: survey._id });
  await Survey.deleteOne({ _id: survey._id });
  res.status(204).end();
};

exports.submitResponse = async (req, res) => {
  if (req.userRole !== 'student') return fail(res, 403, 'Only students can submit responses');
  const survey = await Survey.findOne({ event: req.surveyEventId }).lean();
  if (!survey) return fail(res, 404, 'Survey not found');
  if (survey.status !== 'open') return fail(res, 409, 'Survey is not open');

  const { answers } = req.body ?? {};
  if (!Array.isArray(answers)) return fail(res, 400, 'answers must be an array');
  const questions = new Map(survey.questions.map(question => [String(question._id), question]));
  const answered = new Map();
  for (const answer of answers) {
    const question = questions.get(answer?.questionId);
    if (!question || answered.has(answer.questionId)) {
      return fail(res, 400, 'Each answer must reference a distinct question in this survey');
    }

    const { value } = answer;
    const options = question.options;
    const valid = question.type === 'multiple_choice'
      ? Array.isArray(value) && value.length > 0 && new Set(value).size === value.length &&
        value.every(option => options.includes(option))
      : typeof value === 'string' && (question.type === 'text' ? Boolean(value.trim()) : options.includes(value));
    if (!valid) return fail(res, 400, `Invalid answer for question ${answer.questionId}`);
    answered.set(answer.questionId, { questionId: answer.questionId, value });
  }

  if (survey.questions.some(question => question.required && !answered.has(String(question._id)))) {
    return fail(res, 400, 'All required questions must be answered');
  }

  await SurveyResponse.create({
    survey: survey._id,
    student: req.userId,
    answers: Array.from(answered.values())
  });
  res.status(204).end();
};

exports.getResults = async (req, res) => {
  const survey = await Survey.findOne({ event: req.surveyEventId, status: { $ne: 'draft' } }).lean();
  if (!survey) return fail(res, 404, 'Survey not found');

  const byQuestion = new Map(survey.questions.map(question => [String(question._id), {
    questionId: String(question._id),
    text: question.text,
    type: question.type,
    answeredCount: 0,
    ...(question.type === 'text'
      ? { answers: [] }
      : { counts: new Map(question.options.map(label => [label, 0])) })
  }]));
  let responseCount = 0;
  for await (const response of SurveyResponse.find({ survey: survey._id }).select('answers -_id').lean().cursor()) {
    responseCount++;
    const seen = new Set();
    for (const { questionId, value } of response.answers) {
      const result = byQuestion.get(String(questionId));
      if (!result || seen.has(result.questionId)) continue;
      seen.add(result.questionId);
      result.answeredCount++;
      if (result.type === 'text') {
        result.answers.push(value);
      } else {
        for (const label of new Set(Array.isArray(value) ? value : [value])) {
          if (result.counts.has(label)) result.counts.set(label, result.counts.get(label) + 1);
        }
      }
    }
  }

  const questions = Array.from(byQuestion.values(), ({ counts, ...result }) => counts
    ? { ...result, options: Array.from(counts, ([label, count]) => ({ label, count })) }
    : result);
  res.json({ id: String(survey._id), title: survey.title, status: survey.status, responseCount, questions });
};
