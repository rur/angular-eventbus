/* App Controllers */

function AppCtrl( $eventBus ){
    $eventBus.emit("startup");
}
AppCtrl.$inject = ["$eventBus"];

function CalculatorCtrl( $eventBus ){
    var self = this;
    self.expression = [];
    
    // ideally this would be a command with this 
    // scope injected in!
    var bus = $eventBus(this);
    bus.on("updateCalculator", function(expr){
        self.expression = expr;
        self.$eval();
    })
}
CalculatorCtrl.$inject = ["$eventBus"];

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
        bus.emit("input", val, self.$parent.expression.concat());
    }
}

KeyPadCtrl.$inject = ["$eventBus"];

function HistoryCtrl( $eventBus ){
    var bus = $eventBus(this), lock = false, self = this;
    self.undos = [];
    self.redos = [];
    self.undo = function(ind){
        ind = ( typeof ind == "number" && ind > -1) ? ind : self.undos.length -1;
        var entries = self.undos.splice(ind);
        var log = entries[0];
        if(log){
            bus.emit("updateCalculator", log.expression);
            self.redos = entries.concat(self.redos);
        }
    }
    self.redo = function(ind){ 
        ind = ( typeof ind == "number" && ind > -1) ? ind : 0;
        var entries = self.redos.splice(0, ind + 1);
        var log = entries[entries.length-1];
        if(log){
            bus.emit("updateCalculator", log.expression);
            lock = true;
            bus.emit("input", log.input, log.expression);
            self.undos = self.undos.concat(entries); 
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
    self.goToStep = function(entry){
        var ind = self.undos.indexOf(entry);
        if( ind > -1 ){
            self.undo(ind+1);
            return;
        }
        var ind = self.redos.indexOf(entry);
        if( ind > -1 ){
            self.redo(ind);
            return;
        }
    }
}
HistoryCtrl.$inject = ["$eventBus"];
