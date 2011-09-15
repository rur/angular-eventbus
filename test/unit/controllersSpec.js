/* jasmine specs for controllers go here */

describe("Display Control", function(){
    var calcSc, displaySc
    
    beforeEach(function(){
        calcSc = angular.scope();
        calcSc.expression = [];
        displaySc = calcSc.$new(DisplayCtrl);
    });
    
    it("should display the correct digits based on the expression", function(){
        expect(displaySc.digits).toEqual("0");
        calcSc.expression = ["45"];
        calcSc.$eval();
        expect(displaySc.digits).toEqual("45");
        calcSc.expression = ["-45"];
        calcSc.$eval();
        expect(displaySc.digits).toEqual("-45");
        calcSc.expression = ["-45.45"];
        calcSc.$eval();
        expect(displaySc.digits).toEqual("-45.45");
        calcSc.expression = ["-45.45", "+"];
        calcSc.$eval();
        expect(displaySc.digits).toEqual("-45.45");
        calcSc.expression = ["-45.45", "+", "0"];
        calcSc.$eval();
        expect(displaySc.digits).toEqual("0");
        calcSc.expression = ["-45.45", "+", "-0.0"];
        calcSc.$eval();
        expect(displaySc.digits).toEqual("-0.0");
        calcSc.expression = ["-45.45", "+", "-0.05"];
        calcSc.$eval();
        expect(displaySc.digits).toEqual("-0.05");
        calcSc.expression = ["-0.5342", "="];
        calcSc.$eval();
        expect(displaySc.digits).toEqual("-0.5342");
        calcSc.expression = [];
        calcSc.$eval();
        expect(displaySc.digits).toEqual("0");
    })
    
    it("should display the correct state", function(){
        expect(displaySc.operator).toEqual("");
        calcSc.expression = ["45"];
        calcSc.$eval();
        expect(displaySc.operator).toEqual("");
        calcSc.expression = ["-45"];
        calcSc.$eval();
        expect(displaySc.operator).toEqual("");
        calcSc.expression = ["-45.45"];
        calcSc.$eval();
        expect(displaySc.operator).toEqual("");
        calcSc.expression = ["-45.45", "+"];
        calcSc.$eval();
        expect(displaySc.operator).toEqual("+");
        calcSc.expression = ["-45.45", "+", "0"];
        calcSc.$eval();
        expect(displaySc.operator).toEqual("+");
        calcSc.expression = ["-45.45", "+", "-0.0"];
        calcSc.$eval();
        expect(displaySc.operator).toEqual("+");
        calcSc.expression = ["-45.45", "+", "-0.05"];
        calcSc.$eval();
        expect(displaySc.operator).toEqual("+");
        calcSc.expression = ["-0.5342", "="];
        calcSc.$eval();
        expect(displaySc.operator).toEqual("=");
        calcSc.expression = [];
        calcSc.$eval();
        expect(displaySc.operator).toEqual("");
    });
    
});