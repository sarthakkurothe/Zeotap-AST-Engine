const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/ruleController');

router.post('/create-rule', ruleController.createRule);
router.post('/combine-rules', ruleController.combineRules);
router.post('/evaluate-rule', ruleController.evaluateRule);
router.post('/modify-rule/:ruleId', ruleController.modifyRule);


module.exports = router;
