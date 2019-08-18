var Expresspay = require("nativescript-expresspay").Expresspay;
var expresspay = new Expresspay();

describe("greet function", function() {
    it("exists", function() {
        expect(expresspay.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(expresspay.greet()).toEqual("Hello, NS");
    });
});