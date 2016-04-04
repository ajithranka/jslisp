"use strict";

/********************
 * Parsing
 ********************/

function parse(program) {
    return read_from_tokens(tokenize(program))
}

function tokenize(chars) {
    return chars.replace(/\(/g, " ( ")      // pad opening parens
                .replace(/\)/g, " ) ")      // pad closing parens
                .trim()                     // trim trailing whitespace
                .split(/\s+/)               // split on one or more whitespace chars
}

function read_from_tokens(tokens) {
    if (tokens.length == 0)
        throw new Error("Unbalanced parenthesis")

    const token = tokens.shift()
    if (token == "(") {
        const list = []

        while (tokens[0] != ")") {
            list.push(read_from_tokens(tokens))
        }
        tokens.shift(); // pop off last closing paren
        
        return list;
    } else if (token == ")") {
        throw new Error("Unbalanced parenthesis")
    } else {
        return coerce(token)
    }
}

function coerce(token) {
    return isNaN(Number(token)) ? token : Number(token)
}

/********************
 * Environment
 ********************/

function Environment(scope, parent) {
    this.scope = scope
    this.parent = parent || null
}

Environment.prototype.getValue = function(identifier) {
    const scope = this.getScope(identifier)
    return scope ? scope[identifier] : undefined
}

Environment.prototype.getScope = function(identifier) {
    if (identifier in this.scope) 
        return this.scope
    if (this.parent)
        return this.parent.getScope(identifier)
    return null
}

Environment.prototype.setValue = function(identifier, value) {
    this.scope[identifier] = value
}

const globalEnvironment = {
    "+"  : (...args) => args.reduce((a, b) => a + b),
    "-"  : (...args) => args.reduce((a, b) => a - b),
    "*"  : (...args) => args.reduce((a, b) => a * b),
    "/"  : (...args) => args.reduce((a, b) => a / b),
    ">"  : (a, b) => a > b,
    "<"  : (a, b) => a < b,
    "="  : (a, b) => a == b,
    "<=" : (a, b) => a <= b,
    ">=" : (a, b) => a >= b
}

/********************
 * Special Forms
 ********************/

const specialForms = {
    "if": function(expr, env) {
        const [_, testExpr, thenExpr, elseExpr] = expr
        return evaluate(textExpr) ? evaluate(thenExpr) : evaluate(elseExpr)
    },

    "define": function(expr, env) {
        const [_, lhs, rhs] = expr
        const value = evaluate(rhs)
        env.setValue(lhs, value)
        return value
    },

    "quote": function(expr, env) {
        const [_, quoteExpr] = expr
        return quoteExpr
    },

    "let": function(expr, env) {
        const [_, bindings, letExpr] = expr
        const letScope = bindings.reduce(function(acc, arg, i) {
            acc[arg[0]] = evaluate(arg[1])
            return acc
        }, {})

        return evaluate(letExpr, new Environment(letScope, env));
    },

    "lambda": function(expr, env) {
        return function(...lambdaArguments) {
            const [_, params, lambdaExpr] = expr
            var lambdaScope = params.reduce(function(acc, arg, i) {
                acc[arg] = lambdaArguments[i]
                return acc
            }, {})
            return evaluate(lambdaExpr, new Environment(lambdaScope, env));
        }
    },
  
    "set!": function(expr, env) {
        const [_, lhs, rhs] = expr
        const scope = env.getScope(lhs)
        const value = evaluate(rhs)
        if (scope) scope[lhs] = value
        return value
    }
}

/********************
 * Evaluation
 ********************/

function evaluate(expr, env) {
    env = env || new Environment(globalEnvironment)

    // List expression
    if (expr instanceof Array)
        return evaluateList(expr, env)

    if (typeof expr == "string") {
        // String literal ("foo" => "foo")
        if (expr[0] == '"' && expr[expr.length - 1] == '"') return expr
        // Variable reference (x => 10)
        return env.getValue(expr)
    }

    // Constant literal (10 => 10)    
    if (typeof expr == "number")
        return expr
}

function evaluateList(expr, env) {
    // Empty list (() => ())
    if (expr.length == 0)
        return expr

    // Special form
    if (expr[0] in specialForms)
        return specialForms[expr[0]](expr, env)

    // Procedure call
    const tokens = expr.map(function(token) {
        return evaluate(token, env)
    })
    const [proc, ...args] = tokens
    return proc(...args)
}

/********************
 * Parse & evaluate
 ********************/

function run(input) {
    return evaluate(parse(input))
}

/********************
 * REPL
 ********************/

const readline = require('readline')

var repl = readline.createInterface(process.stdin, process.stdout)
repl.setPrompt('λ ')
repl.prompt()
repl.on('line', function (line) {
    if (line === "quit") repl.close()
    console.log(run(line))
    repl.prompt()
}).on('close', function () {
    process.exit(0)
})