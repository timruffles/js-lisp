var eval = require("./interpreter.js");
var assert = require("chai").assert;



describe("interpreter",function() {
  it("can evaluate ifs and primitives",function() {
    var program1 = [["if",[">",2,2],"hello","fooby"]];
    var result = eval(program1);
    assert.equal(result,"fooby");
  })

  context("primitives",function() {
    it("if",function() {
      var result = eval([["if",true,"yay","boo"]]);
      assert.equal(result,"yay");
    })
  })


  context("lambda",function() {
    var program = [
      [["lambda",["x"],[["*","x","x"]]],9]
    ];

    it("can run a lambda",function() {
      var result = eval(program);
      assert.equal(result,81);
    })

  });

  context("defining fns",function() {

    var program = [
      ["defn","square",["x"],[["*","x","x"]]],
      ["square",9]
    ];

    it("can run a defined fn",function() {
      var result = eval(program);
      assert.equal(result,81);
    })

  })


  context("defining fns",function() {

    var program = [
      ["defn","square",["x"],[["*","x","x"]]],
      ["if",[">",["square",9],80],
        ["print","yay!"],
        ["print","arithmetic broken"]]
    ];

    it("runs",function() {
      eval(program);
    })

  })
})
