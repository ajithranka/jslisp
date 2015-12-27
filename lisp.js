////////// Parsing: parse, tokenize and read from tokens

// Read a Scheme expression as a string and return an AST
function parse(program) {
  return read(tokenize(program));
}

// Convert an expression from string to a sequence of tokens
// @example tokenize("(* 2 x)") => ["(", "*", "2", "x", ")"]
function tokenize(chars) {
  return chars.replace(/\(/g, " ( ")
              .replace(/\)/g, " ) ")
              .trim()
              .split(/\s+/);
}

// Read an expression as a sequence of tokens and convert it to an AST
// @example read(tokenize("(* 3.14 (* r r))")) => ["*", 3.14, ["*", "r", "r"]]
function read(tokens) {
  if (tokens.length === 0)
    throw new Error("Error: unexpected end of file");
  var token = tokens.shift();
  if (token == "(") {
    var list = [];
    while (tokens[0] != ")")
      list.push(read(tokens));
    tokens.shift();  // Pop off ")"
    return list;
  } else if (token == ")") {
    throw new Error("Syntax error: unexpected ')'");
  } else {
    return atom(token);
  }
}

// Parse a token as either a number or a symbol
// @example atom("2") => 2
// @example atom("x") => "x"
function atom(token) {
  if (!isNaN(Number(token)))
    return Number(token);
  else
    return token;
}

////////// Environments

function standardEnv() {
  return {
    "+": function(a, b) { return a + b; },
    "-": function(a, b) { return a - b; },
    "*": function(a, b) { return a * b; },
    "/": function(a, b) { return a / b; },
    ">": function(a, b) { return a > b; },
    "<": function(a, b) { return a < b; },
    "=": function(a, b) { return a == b; }
  };
}

var globalEnv = standardEnv();

///////// Eval

// Evaluate an expression in an environment
function evaluate(expr, env) {
  env = env || globalEnv;
  
  if (expr in env) {
    // Variable reference (x => 10)
    return env[expr];
  } else if (!isNaN(expr)) {
    // Constant literal (10 => 10)
    return expr;
  } else if (expr[0] == "quote") {
    // Quotation ((quote (1 2 3)) => (1 2 3))
    return expr[1];
  } else if (expr[0] == "if") {
    // Conditional (if (> 5 10) x y)
    var result = (evaluate(expr[1], env)) ? expr[2] : expr[3];
    return evaluate(result, env);
  } else if (expr[0] == "define") {
    // Definition (define x 10)
    env[expr[1]] = evaluate(expr[2], env);
    return expr[1];
  } else {
    // Procedure call (proc arg ...)
    var exps = [];
    for (var i = 0; i < expr.length; i++) {
      var exp = evaluate(expr[i], env);
      exps.push(exp);
    }
    var proc = exps.shift();
    return proc.apply(env, exps);
  }
}