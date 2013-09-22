var eval;

var env;

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
function ptap(x) {
  pp(x); return x;
}
function pp() {
  console.log.apply(console,arguments);
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
function zip(xs,ys) {
  return xs.map(function(x,index) {
    return [x,ys[index]]
  });
}
function toMap(pairs) {
  return pairs.reduce(function(map,pair) {
    map[pair[0]] = pair[1];
    return map;
  },{});
}

function isTrue(expression) {
  return expression !== false
};
function isList(expression) {
  return expression instanceof Array;
}
function isSymbol(str) {
  return typeof str == "string";
}

var anIf = {
  id: "if",
  is: function(x) {
    return tagged("if",x);
  },
  eval: function(ifPhrase) {
    return spread(ifPhrase,function(keyword,test,ifExpr,elseExpr) {
      return isTrue(eval(test)) ? eval(ifExpr) : eval(elseExpr);
    })
  }
};


var number = {
  id: "number",
  is: function(x) {
    return typeof x == "number"
  },
  eval: function(x) {
    return x;
  }
};
var string = {
  id: "string",
  is: function(x) {
    return typeof x == "string"
  },
  eval: function(x) {
    return x
  }
};
var bool = {
  id: "boolean",
  is: function(x) {
    return typeof x == "boolean"
  },
  eval: function(x) {
    return x
  }
};
var call = {
  id: "call",
  is: function(x) {
    return tap(isList(x) && (isSymbol(first(x)) || tagged("lambda",first(x))),function(was) {
      //console.log(was,x)
    })
  },
  eval: function(x) {
    var fnSymbol = first(x);
    var args = rest(x);

    if(tagged("lambda",fnSymbol)) return applyLambda(fnSymbol,args);

    var fn = get(fnSymbol);
    if(!fn) symbolNotFound(fnSymbol)

    if(isNative(fn)) return fn.apply(null,args.map(eval));
    if(tagged("lambda",fn)) return applyLambda(fn,args);
    cantCall(fn);
  }
};

function cantCall(fn) {
  throw new Error("Can't call '" + fn + "'");
}

var defn = {
  id: "defn",
  is: function(x) {
    return tagged("defn",x);
  },
  eval: function(defn) {
    return spread(defn,function(sym,name,args,body) {
      set(name,["lambda",args,body])
    })
  }
};
var begin = {
  id: "begin",
  is: isList,
  eval: function(xs) {
    if(xs.length == 0) return;
    var last = xs.pop();
    xs.forEach(eval);
    return eval(last);
  }
}

function tagged(tag,list) {
  return isList(list) && first(list) == tag;
}

function symbolNotFound(symbol) {
  throw new Error("Could not find symbol '" + symbol + "'");
}


function isNative(x) {
  return typeof x == "function"
}

function applyLambda(lambda,args) {
  return spread(lambda,function(tag,params,body) {
    if(args.length != params.length) {
      throw new Error("Args mismatch, expected " + params.length + " got " + args.length);
    }
    var argVals = toMap(zip(params,args.map(eval)));
    var toEval = replaceArguments(body,argVals);
    return begin.eval(toEval);
  })
};

function replaceArguments(body,args) {
  var replaceArg = function(x) {
    if(isSymbol(x) && args[x] != null) return args[x];
    if(isList(x)) return x.map(replaceArg);
    return x;
  }
  return replaceArg(body,args);
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

function set(key,val) {
  return env[":" + key] = val;
}
function get(key) {
  return env[":" + key];
}


function baseEnvironment() {
  set(">",function(a,b) { return a > b; });
  set("<",function(a,b) { return a < b; });
  set(">=",function(a,b) { return a >= b; });
  set("<=",function(a,b) { return a <= b; });
  set("=",function(a,b) { return a === b; });
  set("+",function(a,b) { return a + b; });
  set("*",function(a,b) { return a * b; });
  set("/",function(a,b) { return a / b; });
  set("-",function(a,b) { return a - b; });
  set("%",function(a,b) { return a % b; });
  set("print",function(a) { return console.log(a) });
}

var forms = [
  anIf,
  number,
  string,
  bool,
  defn,
  call,
  begin
]

env = {}
baseEnvironment()

module.exports = eval = function(expression) {
  var evaluator = find(forms,function(form) {
    return form.is(expression)
  });  
  if(!evaluator) throw new Error("Expression '" + JSON.stringify(expression) + "' couldn't be evaluated");
  return evaluator.eval(expression);
}


