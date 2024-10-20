const RuleService = require('../services/ruleService');

// Create a new rule
exports.createRule = async (req, res) => {
    try {
        const { ruleString } = req.body;
        const newRule = await RuleService.createRule(ruleString);
        res.status(201).json({ rule: newRule });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Evaluate a rule against given data
exports.evaluateRule = async (req, res) => {
    try {
        const { ast, data } = req.body;
        const result = await RuleService.evaluateRule(ast, data);
        res.status(200).json({ result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Modify an existing rule
exports.modifyRule = async (req, res) => {
    try {
        const { ruleId } = req.params; // Get ruleId from URL parameters
        const { modification } = req.body; // Get modification from request body
        const modifiedRule = await RuleService.modifyRule(ruleId, modification);
        res.status(200).json({ rule: modifiedRule });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Combine multiple rules
exports.combineRules = async (req, res) => {
    try {
        const { ruleStrings } = req.body; // Expecting an array of rule strings
        const combinedAST = await RuleService.combineRules(ruleStrings);
        res.status(200).json({ combinedAST });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
