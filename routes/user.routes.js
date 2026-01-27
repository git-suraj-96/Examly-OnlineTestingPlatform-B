const router = require('express').Router();
const {handleOnLogin, allInstitutes} = require('../controllers/user.controllers');

router.post('/login', handleOnLogin);
router.get('/allinstitutes', allInstitutes);

module.exports = router;