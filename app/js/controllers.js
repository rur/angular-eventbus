/* App Controllers */

function CalculatorCtrl(){
    this.expression = [];
}


function DisplayCtrl(){
    // watch the parent expression and update the currently displayed
    // value & operation
}

function KeyPadCtrl( $eventBus ){
    var self = this, bus = $eventBus(this);
    self.input = function(val){
        bus.dispatch("input", val, self.$parent.expression, self.$parent);
    }
}

KeyPadCtrl.$inject = ["$eventBus"];

function HistoryCtrl( $eventBus ){
    var bus = $eventBus(this), lock = false, self = this;
    self.undos = [];
    self.redos = [];
    self.undo = function(){
        // roll-back the expression
    }
    self.redo = function(){
        // dispatch input again
        lock = true;
        //bus.dispatch("input", val, self.$parent.expression, self.$parent);
    }
    bus.on("input", function(input,curExpr,scope){
        // Need a lock to prevent this from being done when 
        // an undo/redo is being performed
        if(lock){
            lock = false;
            return;
        }
        // Log a new history item into undo and clear redos
        self.redos = [];
        self.undos.push({expression:curExpr,input:input});
    } )
}

HistoryCtrl.$inject = ["$eventBus"];
