const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const RuleModel = require('../src/models/ruleModel');

describe('Rule Engine', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await RuleModel.deleteMany(); // Cleanup
        await mongoose.disconnect();
    });

    it('should create a rule and evaluate it', async () => {
        const ruleString = "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)";

        const createResponse = await request(app)
            .post('/api/rules/create-rule')
            .send({ ruleString });

        expect(createResponse.statusCode).toBe(201);
        expect(createResponse.body.rule).toHaveProperty('_id');

        const ruleId = createResponse.body.rule._id;

        const evaluateResponse = await request(app)
            .post('/api/rules/evaluate-rule')
            .send({
                ast: createResponse.body.rule.ast,
                data: { age: 31, department: 'Sales', salary: 60000, experience: 6 }
            });

        expect(evaluateResponse.statusCode).toBe(200);
        expect(evaluateResponse.body.result).toBe(true);
    });

    it('should modify an existing rule', async () => {
        const ruleString = "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)";
        
        const createResponse = await request(app)
            .post('/api/rules/create-rule')
            .send({ ruleString });

        const ruleId = createResponse.body.rule._id;

        const modification = {
            changeOperator: 'OR',
            updateValue: {
                key: 'salary',
                value: '70000'
            }
        };

        const modifyResponse = await request(app)
            .put(`/api/rules/modify-rule/${ruleId}`)
            .send({ modification });

        expect(modifyResponse.statusCode).toBe(200);
        expect(modifyResponse.body.rule.ast.value).toBe('OR');
    });
});
