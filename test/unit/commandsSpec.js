/* 
 * Jasmine specs for commands go here
 */

describe( "Input Command", function(){
   var bus, scope, map, input;
   
   beforeEach(function(){
       this.addMatchers({
            toEqualData: function(expected) {
                return angular.equals(this.actual, expected);
            }
       });
       scope = angular.scope();
       bus = scope.$service("$eventBus");
       map = scope.$service("$commandMap");
       map.mapEvent("input", InputCommand);
       input = function(inp){
           bus.emit( "input", inp, scope.expression );
       }
       bus.on("updateCalculator", function(exp){
           scope.expression = exp;
           scope.$eval();
       })
   });
   
   it("should update the operand in a blank expression", function()
   {
       scope.expression = []
       input(1);
       expect(scope.expression).toEqualData(["1"]);
       input(0);
       expect(scope.expression).toEqualData(["10"]);
       input(".");
       expect(scope.expression).toEqualData(["10."]);
       input(".");
       expect(scope.expression).toEqualData(["10."]);
       input(5);
       expect(scope.expression).toEqualData(["10.5"]);
       input(".");
       expect(scope.expression).toEqualData(["10.5"]);
   });
   
   it("should update the operand in a more complex expression", function()
   {
        scope.expression = ["12.43","+"];
        input(0);
        expect(scope.expression).toEqualData(["12.43","+","0"]);
        input("0");
        expect(scope.expression).toEqualData(["12.43","+","0"]);
        input(0);
        expect(scope.expression).toEqualData(["12.43","+","0"]);
        input(1);
        expect(scope.expression).toEqualData(["12.43","+","1"]);
        input(0);
        expect(scope.expression).toEqualData(["12.43","+","10"]);
        input(".");
        expect(scope.expression).toEqualData(["12.43","+","10."]);
        input(".");
        expect(scope.expression).toEqualData(["12.43","+","10."]);
        input("5");
        expect(scope.expression).toEqualData(["12.43","+","10.5"]);
        input(".");
        expect(scope.expression).toEqualData(["12.43","+","10.5"]);
        input(0);
        expect(scope.expression).toEqualData(["12.43","+","10.50"]);
        input("0");
        expect(scope.expression).toEqualData(["12.43","+","10.500"]);
        input(0);
        expect(scope.expression).toEqualData(["12.43","+","10.5000"]);
   });
   
   it("should apply operand modifier correctly", function(){
        scope.expression = [];
        input(".");
        expect(scope.expression).toEqualData(["0."]);
        input("+/-");
        expect(scope.expression).toEqualData(["-0."]);
        input("C");
        expect(scope.expression).toEqualData([]);
        input("2");
        expect(scope.expression).toEqualData(["2"]);
        input("+");
        expect(scope.expression).toEqualData(["2","+"]);
        input("2");
        expect(scope.expression).toEqualData(["2","+", "2"]);
        input("+/-");
        expect(scope.expression).toEqualData(["2","+", "-2"]);
        input(".");
        expect(scope.expression).toEqualData(["2","+", "-2."]);
        input("0");
        expect(scope.expression).toEqualData(["2","+", "-2.0"]);
        input("+/-");
        expect(scope.expression).toEqualData(["2","+", "2.0"]);
   });
   
   it("should add an operator, evaluating the expression", function(){
        scope.expression = ["2"];
        input("+");
        expect(scope.expression).toEqualData(["2","+"]);
        input("2");
        expect(scope.expression).toEqualData(["2","+", "2"]);
        input("+");
        expect(scope.expression).toEqualData(["4","+"]);
        input("-");
        expect(scope.expression).toEqualData(["4","-"]);
        input("6");
        expect(scope.expression).toEqualData(["4","-", "6"]);
   });
   
   it("should handle equals correctly", function(){
        scope.expression = [] ;
        input("2");
        expect(scope.expression).toEqualData(["2"]);
        input("+");
        expect(scope.expression).toEqualData(["2","+"]);
        input("2");
        expect(scope.expression).toEqualData(["2","+", "2"]);
        input("=");
        expect(scope.expression).toEqualData(["4","="]);
        input("-");
        expect(scope.expression).toEqualData(["4","-"]);
        input("6");
        expect(scope.expression).toEqualData(["4","-","6"]);
        input("=");
        expect(scope.expression).toEqualData(["-2","="]);
        input("4");
        expect(scope.expression).toEqualData(["4"]);
        input("=");
        expect(scope.expression).toEqualData(["4","="]);
        input("=");
        expect(scope.expression).toEqualData(["4"]);
        input("C");
        expect(scope.expression).toEqualData([]);
        input("+");
        expect(scope.expression).toEqualData(["0", "+"]);
        input("4");
        expect(scope.expression).toEqualData(["0", "+", "4"]);
        input("=");
        expect(scope.expression).toEqualData(["4", "="]);
        
   });
});
   