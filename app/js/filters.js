/* http://docs.angularjs.org/#!angular.filter */


/**
 * outputs the entity for aritmatic
 * string.  
 */
angular.filter("mathSymbol", function(text){
    var symbol = text;
    switch(text){
        case '+/-':
            symbol = "±";
            break;
        case '-':
            symbol = "−";
            break;
        case '*':
            symbol = "×";
            break;
        case '/':
            symbol = "÷";
            break;
    }
    
    return symbol;
});