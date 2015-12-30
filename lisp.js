// Parse

function parse(program) {
  return read_from_tokens(tokenize(program));
}

function tokenize(chars) {
  return chars.replace(/\(/g, " ( ")
              .replace(/\)/g, " ) ")
              .trim()
              .split(/\s+/);
}

function read_from_tokens(tokens) {
  if (tokens.length == 0)
    throw new Error("Unbalanced parenthesis");
  var token = tokens.shift();
  if (token == "(") {
    var list = [];
    while (tokens[0] != ")")
      list.push(read_from_tokens(tokens));
    tokens.shift();
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

// Environments

function Environment(scope, parent) {
  this.scope = scope;
  this.parent = parent || null;
}

Environment.prototype.getValue = function(identifier) {
  var scope = this.getScope(identifier);
  return (scope)? scope[identifier] : undefined;
}

Environment.prototype.getScope = function(identifier) {
  if (identifier in this.scope)
    return this.scope
  if (this.parent)
    return this.parent.getScope(identifier);
}

Environment.prototype.setValue = function(identifier, value) {
  this.scope[identifier] = value;
}

var global = {
  "+" : reduce(function(a, b) { return a + b; }),
  "-" : reduce(function(a, b) { return a - b; }),
  "*" : reduce(function(a, b) { return a * b; }),
  "/" : reduce(function(a, b) { return a / b; }),
  ">" : function(a, b) { return a > b;  },
  "<" : function(a, b) { return a < b;  },
  "=" : function(a, b) { return a == b; },
  "<=": function(a, b) { return a <= b; },
  ">=": function(a, b) { return a >= b; }  
};

var special = {
  "if": function(expr, env) {
    // [if [test] then else]
    return evaluate(expr[1]) ? evaluate(expr[2]) : evaluate(expr[3]);
  },
  "define": function(expr, env) {
    // [define var exp]
    var value = evaluate(expr[2]);
    env.setValue(expr[1], value);
    return value;
  },
  "quote": function(expr, env) {
    // [quote exp]
    return expr[1];
  },
  "let": function(expr, env) {
    // [let [[arg val], ...] exp]
    var letScope = expr[1].reduce(function(acc, arg, i) {
      acc[arg[0]] = evaluate(arg[1]);
      return acc;
    }, {});
    return evaluate(expr[2], new Environment(letScope, env));
  },
  "lambda": function(expr, env) {
    return function() {
      // [lambda [args, ...] exp]
      var lambdaArguments = arguments;
      var lambdaScope = expr[1].reduce(function(acc, arg, i) {
        acc[arg] = lambdaArguments[i];
        return acc;
      }, {});
      return evaluate(expr[2], new Environment(lambdaScope, env));
    }
  },
  "set!": function(expr, env) {
    // [set! var exp]
    var scope = env.getScope(expr[1]);
    var value = evaluate(expr[2]);
    scope[value];
    return value;
  }
};

// Evaluate

function evaluate(expr, env) {
  env = env || new Environment(global);

  if (expr instanceof Array) {             // List expression
    return evaluateList(expr, env);
  } else if (typeof expr == "string") {    
    if (expr[0] == '"' && expr[expr.length - 1] == '"')  
      return expr;                         // String literal ("foo" => "foo")
    else
      return env.getValue(expr);           // Variable reference (x => 10)
  } else if (typeof expr == "number") {    // Constant literal (10 => 10)
    return expr;
  }
}

function evaluateList(expr, env) {
  if (expr.length == 0) {                  // Empty list (() => ())
    return expr;
  } else if (expr[0] in special) {         // Special form
    return special[expr[0]](expr, env);
  } else {                                 // Procedure call
    var tokens = expr.map(function(token) { 
      return evaluate(token, env);
    });
    var proc = tokens.shift();
    return proc.apply(undefined, tokens);    
  }
}

// Parse and evaluate

function run(input) {
  return evaluate(parse(input));
}

// Utils

function toArray(args) {
  return Array.prototype.slice.call(args);
}

function reduce(fn) {
  return function() {
    var args = toArray(arguments);
    return args.reduce(fn);
  }
}

// REPL

var readline = require('readline');

var repl = readline.createInterface(process.stdin, process.stdout);
repl.setPrompt('jslisp> ');
repl.prompt();
repl.on('line', function(line) {
    if (line === "quit") repl.close();
    console.log(run(line));
    repl.prompt();
}).on('close', function(){
    process.exit(0);
});