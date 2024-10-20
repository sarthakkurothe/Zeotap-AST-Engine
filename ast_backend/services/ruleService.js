const RuleModel = require('../models/ruleModel');
const { parseRuleString, evaluateAST, modifyRuleAST, combineASTs } = require('../utils/astParser');

class RuleService {
    // Create a new rule and parse the rule string into an AST
    async createRule(ruleString) {
        const ast = parseRuleString(ruleString);
        const newRule = await RuleModel.create({ ruleString, ast });
        return newRule;
    }

    // Evaluate the rule AST against provided data
    async evaluateRule(ast, data) {
        return evaluateAST(ast, data);
    }

    // Modify an existing rule based on provided modifications
    async modifyRule(ruleId, modification) {
        const rule = await RuleModel.findById(ruleId);
        if (!rule) {
            throw new Error('Rule not found');
        }

        // Modify the existing AST based on the provided modification
        const modifiedAST = modifyRuleAST(rule.ast, modification);
        rule.ast = modifiedAST;
        await rule.save();
        return rule;
    }

    // Combine multiple rules into a single AST
    async combineRules(ruleStrings) {
        const asts = ruleStrings.map(parseRuleString);
        const combinedAST = combineASTs(asts); // Assuming you have a combineASTs function
        return combinedAST;
    }
}

// Export an instance of the RuleService class
module.exports = new RuleService();
