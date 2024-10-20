function parseRuleString(ruleString) {
    // Basic validation of the rule string
    const operators = ['AND', 'OR'];
    const regex = /(\w+\s*(>=|<=|>|<|=)\s*['"]?\w+['"]?)/g;

    // Check for invalid characters or missing operators
    if (!ruleString.match(regex)) {
        throw new Error('Invalid rule string or format.');
    }

    // Use a stack to parse the rule string into an AST
    const stack = [];
    const output = [];
    const tokens = ruleString.match(/(\(|\)|AND|OR|[a-zA-Z0-9_]+(?:\s*[<>=!]+\s*[\'\"a-zA-Z0-9_]+)?)/g);
    
    tokens.forEach(token => {
        if (token === '(') {
            stack.push(token);
        } else if (token === ')') {
            while (stack.length && stack[stack.length - 1] !== '(') {
                output.push(stack.pop());
            }
            stack.pop(); // remove '(' from the stack
        } else if (operators.includes(token)) {
            while (stack.length && precedence(stack[stack.length - 1]) >= precedence(token)) {
                output.push(stack.pop());
            }
            stack.push(token);
        } else {
            output.push({ type: 'operand', value: token });
        }
    });

    while (stack.length) {
        output.push(stack.pop());
    }

    return buildAST(output);
}

function precedence(operator) {
    return operator === 'OR' ? 1 : 2; // AND has higher precedence than OR
}

function buildAST(output) {
    const stack = [];
    output.forEach(token => {
        if (typeof token === 'object') {
            stack.push(token); // operand
        } else {
            const right = stack.pop();
            const left = stack.pop();
            stack.push({
                type: 'operator',
                value: token,
                left: left,
                right: right
            });
        }
    });
    return stack[0]; // Return the root of the AST
}

function evaluateAST(ast, data) {
    // Error handling for missing attributes
    if (!data) throw new Error('Data for evaluation is required.');

    if (ast.type === 'operand') {
        const [key, operator, value] = ast.value.split(' ');
        const comparisonValue = value.replace(/['"]/g, ''); // Remove quotes
        if (!(key in data)) throw new Error(`Missing attribute: ${key}`);
        
        switch (operator) {
            case '>': return data[key] > comparisonValue;
            case '<': return data[key] < comparisonValue;
            case '=': return data[key] == comparisonValue;
            case '>=': return data[key] >= comparisonValue;
            case '<=': return data[key] <= comparisonValue;
            default: throw new Error(`Invalid operator: ${operator}`);
        }
    }

    if (ast.type === 'operator') {
        const left = evaluateAST(ast.left, data);
        const right = evaluateAST(ast.right, data);
        return ast.value === 'AND' ? left && right : left || right;
    }

    return false;
}

// Function to modify existing AST nodes
function modifyRuleAST(ast, modification) {
    if (modification.changeOperator) {
        // Change the operator of the root node
        ast.value = modification.changeOperator;
    }

    if (modification.updateValue) {
        // Example: change a specific operand value
        const targetKey = modification.updateValue.key;
        const newValue = modification.updateValue.value;

        const updateOperand = (node) => {
            if (node.type === 'operand' && node.value.includes(targetKey)) {
                node.value = node.value.replace(/(=\s*['"]?)(.*?)(['"]?)/, `$1${newValue}$3`);
            } else {
                if (node.left) updateOperand(node.left);
                if (node.right) updateOperand(node.right);
            }
        };

        updateOperand(ast);
    }

    return ast; // Return modified AST
}

// Function to combine multiple ASTs into a single AST
function combineASTs(asts) {
    if (asts.length === 0) return null;

    // Start combining from the first AST
    let combinedAST = asts[0];

    // Combine subsequent ASTs using 'OR' logic
    for (let i = 1; i < asts.length; i++) {
        combinedAST = {
            type: 'operator',
            value: 'OR',
            left: combinedAST,
            right: asts[i]
        };
    }

    return combinedAST; // Return the combined AST
}

module.exports = { parseRuleString, evaluateAST, modifyRuleAST, combineASTs };
