/* App Controllers */

function AppCtrl( $eventBus ){
    $eventBus.emit("startup");
}
AppCtrl.$inject = ["$eventBus"];

function CalculatorCtrl(){
    this.expression = [];
}


function DisplayCtrl( $log ){
    // watch the parent expression and update the currently displayed
    // value & operation
    var self = this;
    self.digits = "0";
    self.operator = "";
    self.$onEval(function(){
        var newV = self.$parent.expression;
         self.digits = newV[newV.length - ((newV.length%2)?1:2)] || "0";
         self.operator = newV[newV.length - ((newV.length%2)?2:1)] || "";
    });
}

function KeyPadCtrl( $eventBus ){
    var self = this, bus = $eventBus(this);
    self.input = function(val){
        bus.emit("input", val, self.$parent.expression.concat(), self.$parent);
    }
}

KeyPadCtrl.$inject = ["$eventBus"];

function HistoryCtrl( $eventBus ){
    var bus = $eventBus(this), lock = false, self = this;
    self.undos = [];
    self.redos = [];
    self.undo = function(){
        // roll-back the expression
        var log = self.undos.pop();
        if(log){
            self.$parent.expression = log.expression;
            self.$parent.$eval();
            self.redos.unshift(log);
        }
    }
    self.redo = function(){
        var log = self.redos.shift();
        if(log){
            self.$parent.expression = log.expression;
            self.$parent.$eval();
            lock = true;
            bus.emit("input", log.input, self.$parent.expression, self.$parent);
            self.undos.push(log); 
        }
    }
    bus.on("input", function(input,curExpr,scope){
        if(lock){
            lock = false;
            // a history action is taking place so don't log it
            return
        }
        
        // Log a new history item into undo and clear redos
        self.redos = [];
        self.undos.push({expression:curExpr,input:input});
    } )
}

HistoryCtrl.$inject = ["$eventBus"];
