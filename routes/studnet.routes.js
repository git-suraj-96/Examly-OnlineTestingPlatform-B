const router = require('express').Router();
const {signupStudent, getOtp, finishedTest} = require("../controllers/student.controllers");

router.post('/signup', signupStudent);
router.post('/getOtp', getOtp);
router.post('/finishedtest', finishedTest)

module.exports = router;