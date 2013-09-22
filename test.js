var eval = require("./interpreter.js");
var assert = require("chai").assert;

describe("interpreter",function() {
  it("can evaluate ifs and primitives",function() {
    var program1 = ["if",[">",2,2],"hello","fooby"]
    var result = eval(program1);
    assert.equal(result,"fooby");
  })

  context("apply",function() {
    it("applies args to fn body and evaluates",function() {
      var result = eval.apply(["if",true,":a",":b"],{a: "yay",b: "boo"});
      assert.equal(result,"yay");
    })
  })
})
