const { SurveyResponse } = require('../db_schema');

async function toSurveyResponse(survey, viewer, managed) {
  const result = {
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
    result.responseCount = await SurveyResponse.countDocuments({ survey: survey._id });
  } else {
    result.completed = viewer.role === 'student' && Boolean(
      await SurveyResponse.exists({ survey: survey._id, student: viewer.id })
    );
  }
  return result;
}

module.exports = { toSurveyResponse };
