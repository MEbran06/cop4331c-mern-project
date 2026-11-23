const express = require('express');
const surveys = require('../controllers/surveysController');

const router = express.Router({ mergeParams: true });

router.use(surveys.loadEvent);
router.get('/', surveys.getSurvey);
router.get('/results', surveys.requireOwner, surveys.getResults);
router.post('/responses', surveys.submitResponse);
router.post('/', surveys.requireOwner, surveys.createSurvey);
router.patch('/', surveys.requireOwner, surveys.updateSurvey);
router.delete('/', surveys.requireOwner, surveys.deleteSurvey);

module.exports = router;
