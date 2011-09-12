/* 
 * Command Objects for angular application
 */


function StartUpCommand( $commandMap ){
    // this could take a config object if needed
    this.execute = function(){
        // map commands here
        // input
        // evaluate
    }
}
StartUpCommand.$inject = ['$commandMap'];

function InputCommand( $eventBus, calculator ){
    this.execute = function( input, expression, scope ){
        var inp = String(input), 
        newval, 
        expr = expression.slice(),
        operators = ["+","-","/","*","="];
        if( inp.match(/^\d{1}$/) ||
            inp == "."           ||
            inp == "+/-" )
        {
            newval = "";    
            if(expr.length % 2 == 1){
                newval = expr.splice(expr.length-1,1)[0];
            }
            if(inp.match(/^\d{1}$/)){
                newval = newval + inp;
            } else if(inp == "." ){
                if(!newval.match(/\d+\.\d*$/)){
                    newval = newval + inp;
                }
            } else if(inp == "+/-"){
                newval = String(newval * -1);
            }
            expr.push( newval );
            scope.expression = expr;
        } //else if(angular.Array.count(operators, inp) > 0) {
            // evaluate the existing expression
            
        //}
    }
}
InputCommand.$inject = ["$eventBus", "calculator"];

