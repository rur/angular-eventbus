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

describe("KeyPadCtrl", function(){
   var calcSc, keysSc, bus, inputSpy; 
    
    beforeEach(function(){
        this.addMatchers({
            toEqualData: function(expected) {
                return angular.equals(this.actual, expected);
            }
        });
        calcSc = angular.scope();
        calcSc.expression = [];
        bus = calcSc.$service("$eventBus");
        keysSc = calcSc.$new(KeyPadCtrl);
        inputSpy = jasmine.createSpy("input spy");
        bus.on("input", inputSpy);
    }); 
    
    it("should emit input with all required params when input method is called", function(){
        calcSc.expression = ["1"];
        keysSc.input("3");
        expect(inputSpy).toHaveBeenCalledWith("3",["1"]);
    })
});

describe("HistoryCtrl", function(){
   var calcSc, histSc, bus, inputSpy; 
    
    beforeEach(function(){
        this.addMatchers({
            toEqualData: function(expected) {
                return angular.equals(this.actual, expected);
            }
        });
        
        calcSc = angular.scope();
        calcSc.expression = [];
        bus = calcSc.$service("$eventBus");
        histSc = calcSc.$new(HistoryCtrl);
        inputSpy = jasmine.createSpy("input spy");
        
        bus.on("input", inputSpy);
        bus.on("updateCalculator", function(exp){
           calcSc.expression = exp;
           calcSc.$eval();
        })
    });
    
    it("should log history items when input event is dispatched", function(){
        bus.emit("input","1", [], calcSc);
        expect(histSc.undos).toEqualData([{expression:[],input:"1"}]);
        expect(histSc.redos).toEqualData([]);
        bus.emit("input","4", ["1"], calcSc);
        expect(histSc.undos[1]).toEqualData({expression:["1"],input:"4"});
        expect(histSc.redos).toEqualData([]);
    });
    
    it("should undo and redo applying expression to the parent scope", function(){
        bus.emit("input","1", [], calcSc);
        bus.emit("input","4", ["1"], calcSc);
        bus.emit("input","+", ["14"], calcSc);
        bus.emit("input","1", ["14","+"], calcSc);
        histSc.undo();
        expect(calcSc.expression).toEqualData(["14","+"]);
        expect(histSc.redos[0]).toEqualData({expression:["14","+"], input:"1"});
        expect(histSc.undos.length).toEqual(3);
        histSc.undo();
        expect(calcSc.expression).toEqualData(["14"]);
        expect(histSc.redos).toEqualData([{expression:["14"], input:"+"},{expression:["14","+"], input:"1"}]);
        expect(histSc.undos).toEqualData([{expression:[], input:"1"},{expression:["1"], input:"4"}]);
        histSc.redo();
        expect(calcSc.expression).toEqualData(["14"]);
        expect(inputSpy).toHaveBeenCalledWith("+",["14"],calcSc);
        expect(histSc.redos).toEqualData([{expression:["14","+"], input:"1"}]);
        expect(histSc.undos).toEqualData([
            {expression:[], input:"1"},
            {expression:["1"], input:"4"},
            {expression:["14"], input:"+"}
        ]);
        histSc.redo();
        expect(calcSc.expression).toEqualData(["14","+"]);
        expect(inputSpy).toHaveBeenCalledWith("1",["14","+"],calcSc);
        expect(histSc.redos).toEqualData([]);
        expect(histSc.undos).toEqualData([
            {expression:[], input:"1"},
            {expression:["1"], input:"4"},
            {expression:["14"], input:"+"},
            {expression:["14","+"], input:"1"}
        ]);
    })
    
    it("should clear redos when a new input takes place", function(){
        bus.emit("input","1", [], calcSc);
        bus.emit("input","4", ["1"], calcSc);
        histSc.undo();
        bus.emit("input","5", ["1"], calcSc);
        expect(histSc.redos).toEqual([]);
    });
    
    it("should undo and redo when provided with indexes", function(){
        bus.emit("input","1", [], calcSc);
        bus.emit("input","4", ["1"], calcSc);
        bus.emit("input","+", ["14"], calcSc);
        bus.emit("input","1", ["14","+"], calcSc);
        
        histSc.undo(1);
        expect(calcSc.expression).toEqualData(["1"]);
        expect(histSc.undos).toEqualData([
            {expression:[], input:"1"}]
        );
        expect(histSc.redos).toEqualData([
            {expression:["1"], input:"4"},
            {expression:["14"], input:"+"},
            {expression:["14","+"], input:"1"}
        ]);
         histSc.redo(2);
        expect(calcSc.expression).toEqualData(["14","+"]);
        expect(inputSpy).toHaveBeenCalledWith("1",["14","+"]);
        expect(histSc.redos).toEqualData([]);
        expect(histSc.undos).toEqualData([
            {expression:[], input:"1"},
            {expression:["1"], input:"4"},
            {expression:["14"], input:"+"},
            {expression:["14","+"], input:"1"}
        ]);
    })
    
    it("should go to history step when goToStep is called with the log entry", function(){
        bus.emit("input","1", [], calcSc);
        bus.emit("input","4", ["1"], calcSc);
        bus.emit("input","+", ["14"], calcSc);
        bus.emit("input","1", ["14","+"], calcSc);
        
        histSc.goToStep(histSc.undos[1]);
        expect(calcSc.expression).toEqualData(["1"]);
        expect(histSc.undos).toEqualData([
            {expression:[], input:"1"}]
        );
        expect(histSc.redos).toEqualData([
            {expression:["1"], input:"4"},
            {expression:["14"], input:"+"},
            {expression:["14","+"], input:"1"}
        ]);
        
        histSc.goToStep(histSc.redos[2]);
        expect(calcSc.expression).toEqualData(["14","+"]);
        expect(inputSpy).toHaveBeenCalledWith("1",["14","+"]);
        expect(histSc.redos).toEqualData([]);
        expect(histSc.undos).toEqualData([
            {expression:[], input:"1"},
            {expression:["1"], input:"4"},
            {expression:["14"], input:"+"},
            {expression:["14","+"], input:"1"}
        ]);
    });
});