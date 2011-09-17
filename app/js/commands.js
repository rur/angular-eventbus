/* 
 * Command Objects for angular application
 */


function StartUpCommand( $commandMap ){
    // this could take a config object if needed
    this.execute = function(){
        $commandMap.mapEvent("input", InputCommand);
    }
}
StartUpCommand.$inject = ['$commandMap'];

/**
 * Input Command is responsible for 
 * applying a calculator input to the 
 * current calculator expression
 * <p/>
 * Actual arithmatic is delegated to the calculator service
 * <p/>
 * It has three operations it employs depending on the input:   <br/>
 * - addDigit - adds a numeric digit to the expression          <br/>
 * - modifyOperand - transforms the active operand              <br/>
 * - evaluateExpression - evaluates the current expression array
 *      in the infix style, recursively as far as it can 
 */
function InputCommand( $eventBus, calculator, $log ){
    var self = this;
    this.calculator = calculator;
    this.log = $log;
    
    /**
     *  execute get called by the commmand map with the
     *  params of the 'emit' event bus call
     */
    this.execute = function( input, expression){
       input = String(input);
       var newexp = (expression) ? expression.slice() : [], 
       digitInd = newexp.length - ( newexp.length % 2 ),
       lastDigitInd = newexp.length - ((newexp.length%2)?1:2),
       operators = ["+", "-", "*", "/"],
       modifiers = ["+/-", "."],
       equalsState = (newexp[digitInd-1] == "="); 
       
       if( input.match(/^\d|00$/)){
           // add a digit
           // if the last operator is '=', reset
           if(equalsState){
               newexp = [self.addDigit(input)];
           } else {
               newexp[digitInd] = self.addDigit(input, newexp[digitInd]);
           }
       } else if(modifiers.indexOf(input) > -1 ){
           // if the last operator is '=', reset
           if(equalsState){
               newexp = [self.modifyOperand(input)];
           } else {
               newexp[digitInd] = self.modifyOperand(input, newexp[digitInd]);
           }
           
       } else if( operators.indexOf(input)> -1 ){
           // add operator, evaluating first!
           newexp = self.evaluateExpression(newexp);
           if(!newexp[0])newexp[0] = "0"; 
           newexp[1] = input;
       } else if( input == "=" ){
           if(equalsState){
               newexp.splice(newexp.indexOf("="));
           }else {
               newexp = [self.evaluateExpression(newexp)[0]];
               newexp[1] = "=";
           }
       } else if( input == "C" ){
           // clear expression
           newexp = [];
       }
       
       $eventBus.emit("updateCalculator", newexp);
    }
}
InputCommand.prototype = {
    addDigit:function( digit, operand ){
        digit = String(digit);
        if(!digit.match(/^00|[\d\.]$/)) return operand;
        operand = operand || "";
        operand = operand + digit;
        // get rid of unnecessary 0's at the start
        operand = operand.replace( /^(-?)0+(0\.|[1-9]|0)/, "$1$2" );
        return operand;
    },
    modifyOperand:function(input,operand){
        operand = operand || "";
        operand = String(operand); // cast as string
        switch(input){
            case "+/-":
                if(operand.charAt(0) == "-"){
                 return operand.substr(1);
                } else {
                    return "-"+ ((operand.length > 0) ? operand : "0");
                }
                break;
            case ".":
                if(!operand.match(/\d+\.\d*$/)){
                    operand = operand + ".";
                    return operand.replace(/(^|[^\d])\./,"$10.");
                }
                break;
            // add PIE, LOG, SINE, SQRT etc.. here
        }
        return operand;
    },
    evaluateExpression:function(expr){
        var res = expr ? expr.slice() : [], 
	operand1 = res[0] * 1, 
	operator = res[1],
	operand2 = res[2] * 1,
	ans;
        
	if( !isNaN( operand1 ) && operator && !isNaN( operand2 )){
            switch(operator){
                case "+":
                    ans = [this.calculator.add(operand1,operand2)];
                    break;
                case "-":
                    ans = [ this.calculator.subtract(operand1,operand2) ];
                    break;
                case "*":
                    ans = [this.calculator.multiply(operand1,operand2) ];
                    break;
                case "/":
                    ans =  [this.calculator.divide(operand1,operand2)];
                    break;
            }
            if( ans ){
                // provides recursion
                res = this.evaluateExpression(ans.concat(res.slice(3)));
            }
	}
	return res;
    }
}

InputCommand.$inject = ["$eventBus", "calculator", "$log"];
