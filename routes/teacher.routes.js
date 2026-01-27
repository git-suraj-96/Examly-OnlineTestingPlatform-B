const router = require('express').Router();
const {handleTeacherSetQuestion, signupNewInstitute, testDetails, testFinished} = require('../controllers/teacher.controllers');

router.post('/setquestion', handleTeacherSetQuestion);
router.post('/signup', signupNewInstitute);
router.post('/testdetails', testDetails);
router.post('/testfinished', testFinished);

module.exports = router;