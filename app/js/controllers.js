/* App Controllers */

function CalculatorCtrl(){
    this.expression = [];
}


function DisplayCtrl(){
    // watch the parent expression and update the currently displayed
    // value & operation
    var self = this;
    self.digits = "0";
    self.operator = "";
    self.$parent.$watch( "expression", function(newV,oldV){
        //var newV = self.$parent.expression;
         self.digits = newV[newV.length - ((newV.length%2)?1:2)] || "0";
         self.operator = newV[newV.length - ((newV.length%2)?2:1)] || "";
    });
}

function KeyPadCtrl( $eventBus ){
    var self = this, bus = $eventBus(this);
    self.input = function(val){
        bus.emit("input", val, self.$parent.expression, self.$parent);
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
            self.redos.unshift(log);
        }
    }
    self.redo = function(){
        var log = self.redos.shift();
        if(log){
            self.$parent.expression = log.expression;
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
