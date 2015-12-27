////////// Parsing: parse, tokenize and readFromTokens

// Read a Scheme expression from a string and return an AST
function parse(program) {
  return readFrom(tokenize(program));
}

// Converts an expression from string to a sequence of tokens
// @example tokenize("(* 2 x)") => ["(", "*", "2", "x", ")"]
function tokenize(chars) {
  return chars.replace(/\(/g, " ( ")
              .replace(/\)/g, " ) ")
              .trim()
              .split(/\s+/);
}

// Read an expression as a sequence of tokens and convert it to an AST
// @example readFrom(["(", "*", "2", "x", ")"]) => ["(", "*", 2, "x", ")"]
function readFrom(tokens) {
  if (tokens.length === 0)
    throw new Error("Error: unexpected end of file");
  var token = tokens.shift();
  if (token == "(") {
    var list = [];
    while (tokens[0] != ")")
      list.push(readFrom(tokens));
    tokens.shift();  // Pop off ")"
    return list;
  } else if (token == ")") {
    throw new Error("Syntax error: unexpected ')'");
  } else {
    return atom(token);
  }
}

// Parse a token as a number or symbol
// @example atom("2") => 2
// @example atom("x") => "x"
function atom(token) {
  if (!isNaN(Number(token)))
    return Number(token);
  else
    return token;
}