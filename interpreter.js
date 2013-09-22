var eval;

function first(xs) {
  return xs[0]
}
function rest(xs) {
  return xs.slice(1);
}
function spread(xs,fn) {
  return fn.apply(null,xs);
}
function tap(x,fn) {
  fn(x); return x;
}
function find(xs,fn) {
  var value;
  xs.some(function(x) {
    var found = fn(x);
    if(found) value = x;
    return found;
  })
  return value;
}

function isTrue(expression) {
  return expression !== false
};
function isList(expression) {
  return expression instanceof Array;
}
function isSymbol(str) {
  return typeof str == "string" && str[0] == ":";
}

var anIf = {
  is: function(x) {
    return isList(x) && first(x) == "if"
  },
  eval: function(ifPhrase) {
    return spread(ifPhrase,function(keyword,test,ifExpr,elseExpr) {
      return isTrue(test) ? eval(ifExpr) : eval(elseExpr);
    })
  }
};


var number = {
  is: function(x) {
    return typeof x == "number"
  },
  eval: function(x) {
    return x;
  }
};
var string = {
  is: function(x) {
    return typeof x == "string"
  },
  eval: function(x) {
    return x
  }
};
var call = {
  is: function(x) {
    return isList(x);
  },
  eval: function(x) {
    var fnSymbol = first(x);
    var args = rest(x).map(eval)
    var fn = get(env,fnSymbol);
  }
}

function replaceArguments(body,args) {
  var replaceArg = function(x) {
    if(isSymbol(x) && args[x.slice(1)] != null) return args[x.slice(1)];
    if(isList(x)) return replaceArgs(x);
    return x;
  }
  var replaceArgs = function(expression) {
    return expression.map(replaceArg);
  }
  return replaceArgs(body,args);
}

function apply(proc,args) {
  var body = replaceArguments(proc,args);
  return eval(body);
}

function undefinedFunction(name) {
  throw new Error("Missing function " + name);
}

function makeEnvironment() {
  return {};
}
function binaryOperation(op,a,b) {
  switch(op) {
  }
  undefinedFunction(op);
}

function baseEnvironment() {
  // TODO - make binary ops special forms, or can they be real fns?
  var env = makeEnvironment();
  set(env,">",function(a,b) { a > b; });
  set(env,"<",function(a,b) { a < b; });
  set(env,">=",function(a,b) { a >= b; });
  set(env,"<=",function(a,b) { a <= b; });
  set(env,"=",function(a,b) { a === b; });
}

var forms = [
  anIf,
  number,
  string
]


module.exports = eval = function(expression) {
  var evaluator = find(forms,function(form) {
    return form.is(expression)
  });  
  if(!evaluator) throw new Error("Expression '" + JSON.stringify(expression) + "' couldn't be evaluated");
  return evaluator.eval(expression);
}


eval.apply = apply;
