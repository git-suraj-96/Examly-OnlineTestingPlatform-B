const router = require('express').Router();
const {handleTeacherSetQuestion, signupNewInstitute, testDetails, testFinished, createOrder, verifyPayment} = require('../controllers/teacher.controllers');

router.post('/setquestion', handleTeacherSetQuestion);
router.post('/signup', signupNewInstitute);
router.post('/testdetails', testDetails);
router.post('/testfinished', testFinished);
router.post('/createorder', createOrder)
router.post('/verifypayment', verifyPayment);

module.exports = router;