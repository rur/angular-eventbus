/* 
 * Jasmine specs for commands go here
 */




describe( "Input Command", function(){
   var bus, scope, map;
   
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
   });
   
   it("should update the operand in a blank expression", function()
   {
       scope.expression = []
       bus.emit( "input", 1, scope.expression, scope );
       expect(scope.expression).toEqualData(["1"]);
       bus.emit( "input", 0, scope.expression, scope );
       expect(scope.expression).toEqualData(["10"]);
       bus.emit( "input", ".", scope.expression, scope );
       expect(scope.expression).toEqualData(["10."]);
       bus.emit( "input", ".", scope.expression, scope );
       expect(scope.expression).toEqualData(["10."]);
       bus.emit( "input", 5, scope.expression, scope );
       expect(scope.expression).toEqualData(["10.5"]);
       bus.emit( "input", ".", scope.expression, scope );
       expect(scope.expression).toEqualData(["10.5"]);
   });
   
   it("should update the operand in a complex expression", function()
   {
       scope.expression = ["12.43","+"];
       bus.emit( "input", 1, scope.expression, scope );
       expect(scope.expression).toEqualData(["12.43","+","1"]);
       bus.emit( "input", 0, scope.expression, scope );
       expect(scope.expression).toEqualData(["12.43","+","10"]);
       bus.emit( "input", ".", scope.expression, scope );
       expect(scope.expression).toEqualData(["12.43","+","10."]);
       bus.emit( "input", ".", scope.expression, scope );
       expect(scope.expression).toEqualData(["12.43","+","10."]);
       bus.emit( "input", 5, scope.expression, scope );
       expect(scope.expression).toEqualData(["12.43","+","10.5"]);
       bus.emit( "input", ".", scope.expression, scope );
       expect(scope.expression).toEqualData(["12.43","+","10.5"]);
   });
   
   it("should add an operator", function(){
       scope.expression = ["2"];
       
       bus.emit( "input", "+", scope.expression, scope );
   });
});
   