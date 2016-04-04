"use strict";

/********************
 * Parsing
 ********************/

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function parse(program) {
    return read_from_tokens(tokenize(program));
}

function tokenize(chars) {
    return chars.replace(/\(/g, " ( ") // pad opening parens
    .replace(/\)/g, " ) ") // pad closing parens
    .trim() // trim trailing whitespace
    .split(/\s+/); // split on one or more whitespace chars
}

function read_from_tokens(tokens) {
    if (tokens.length == 0) throw new Error("Unbalanced parenthesis");

    var token = tokens.shift();
    if (token == "(") {
        var list = [];

        while (tokens[0] != ")") {
            list.push(read_from_tokens(tokens));
        }
        tokens.shift(); // pop off last closing paren

        return list;
    } else if (token == ")") {
        throw new Error("Unbalanced parenthesis");
    } else {
        return coerce(token);
    }
}

function coerce(token) {
    return isNaN(Number(token)) ? token : Number(token);
}

/********************
 * Environment
 ********************/

function Environment(scope, parent) {
    this.scope = scope;
    this.parent = parent || null;
}

Environment.prototype.getValue = function (identifier) {
    var scope = this.getScope(identifier);
    return scope ? scope[identifier] : undefined;
};

Environment.prototype.getScope = function (identifier) {
    if (identifier in this.scope) return this.scope;
    if (this.parent) return this.parent.getScope(identifier);
    return null;
};

Environment.prototype.setValue = function (identifier, value) {
    this.scope[identifier] = value;
};

var globalEnvironment = {
    "+": function _() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return args.reduce(function (a, b) {
            return a + b;
        });
    },
    "-": function _() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return args.reduce(function (a, b) {
            return a - b;
        });
    },
    "*": function _() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        return args.reduce(function (a, b) {
            return a * b;
        });
    },
    "/": function _() {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        return args.reduce(function (a, b) {
            return a / b;
        });
    },
    ">": function _(a, b) {
        return a > b;
    },
    "<": function _(a, b) {
        return a < b;
    },
    "=": function _(a, b) {
        return a == b;
    },
    "<=": function _(a, b) {
        return a <= b;
    },
    ">=": function _(a, b) {
        return a >= b;
    }
};

/********************
 * Special Forms
 ********************/

var specialForms = {
    "if": function _if(expr, env) {
        var _expr = _slicedToArray(expr, 4);

        var _ = _expr[0];
        var testExpr = _expr[1];
        var thenExpr = _expr[2];
        var elseExpr = _expr[3];

        return evaluate(textExpr) ? evaluate(thenExpr) : evaluate(elseExpr);
    },

    "define": function define(expr, env) {
        var _expr2 = _slicedToArray(expr, 3);

        var _ = _expr2[0];
        var lhs = _expr2[1];
        var rhs = _expr2[2];

        var value = evaluate(rhs);
        env.setValue(lhs, value);
        return value;
    },

    "quote": function quote(expr, env) {
        var _expr3 = _slicedToArray(expr, 2);

        var _ = _expr3[0];
        var quoteExpr = _expr3[1];

        return quoteExpr;
    },

    "let": function _let(expr, env) {
        var _expr4 = _slicedToArray(expr, 3);

        var _ = _expr4[0];
        var bindings = _expr4[1];
        var letExpr = _expr4[2];

        var letScope = bindings.reduce(function (acc, arg, i) {
            acc[arg[0]] = evaluate(arg[1]);
            return acc;
        }, {});

        return evaluate(letExpr, new Environment(letScope, env));
    },

    "lambda": function lambda(expr, env) {
        return function () {
            for (var _len5 = arguments.length, lambdaArguments = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                lambdaArguments[_key5] = arguments[_key5];
            }

            var _expr5 = _slicedToArray(expr, 3);

            var _ = _expr5[0];
            var params = _expr5[1];
            var lambdaExpr = _expr5[2];

            var lambdaScope = params.reduce(function (acc, arg, i) {
                acc[arg] = lambdaArguments[i];
                return acc;
            }, {});
            return evaluate(lambdaExpr, new Environment(lambdaScope, env));
        };
    },

    "set!": function set(expr, env) {
        var _expr6 = _slicedToArray(expr, 3);

        var _ = _expr6[0];
        var lhs = _expr6[1];
        var rhs = _expr6[2];

        var scope = env.getScope(lhs);
        var value = evaluate(rhs);
        if (scope) scope[lhs] = value;
        return value;
    }
};

/********************
 * Evaluation
 ********************/

function evaluate(expr, env) {
    env = env || new Environment(globalEnvironment);

    // List expression
    if (expr instanceof Array) return evaluateList(expr, env);

    if (typeof expr == "string") {
        // String literal ("foo" => "foo")
        if (expr[0] == '"' && expr[expr.length - 1] == '"') return expr;
        // Variable reference (x => 10)
        return env.getValue(expr);
    }

    // Constant literal (10 => 10)   
    if (typeof expr == "number") return expr;
}

function evaluateList(expr, env) {
    // Empty list (() => ())
    if (expr.length == 0) return expr;

    // Special form
    if (expr[0] in specialForms) return specialForms[expr[0]](expr, env);

    // Procedure call
    var tokens = expr.map(function (token) {
        return evaluate(token, env);
    });

    var _tokens = _toArray(tokens);

    var proc = _tokens[0];

    var args = _tokens.slice(1);

    return proc.apply(undefined, _toConsumableArray(args));
}

/********************
 * Parse & evaluate
 ********************/

function run(input) {
    return evaluate(parse(input));
}

/********************
 * REPL
 ********************/

var readline = require('readline');

var repl = readline.createInterface(process.stdin, process.stdout);
repl.setPrompt('λ ');
repl.prompt();
repl.on('line', function (line) {
    if (line === "quit") repl.close();
    console.log(run(line));
    repl.prompt();
}).on('close', function () {
    process.exit(0);
});
