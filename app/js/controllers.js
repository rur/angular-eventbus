/* App Controllers */

/* 
 * Main App Controller
 * 
 */
function AppCntl($route, eventBus) {
    var self = this;
    
    $route.parent(this);
   
    // initialize the model to something useful
    this.person = {
     name:'anonymous',
     contacts:[{type:'email', url:'anonymous@example.com'}]
    };
    
     this.bus = eventBus(this);
    
    this.sayHello = function(toWho){
        self.bus.emit("sayHello", toWho);
    }
}
AppCntl.$inject = ['$route', '$eventBus']
   
/* 
 * Welcome Partial Controller 
 * 
 */
function WelcomeCntl( $log, eventBus, $window ){
       var scope = this;
       var it = 1;
       
       scope.window = $window;
       
       var bus = eventBus(this);
       function sayHelloHandler( helloTo ){
           $log.log( "Welcome Says HELLO to " + helloTo + "!" );
       }
       
       bus.on("sayHello", sayHelloHandler );
}
WelcomeCntl.$inject = ['$log', '$eventBus','$window']
WelcomeCntl.prototype = { 
    greet: function(){
        this.window.alert("Hello " + this.person.name);
    }
};


/* 
 * WelcomeSub Controller
 * This is a within the Welcome Partial
 * 
 */
function WelcomeSubCntl( $log, eventBus ){
   var scope = this;

   var bus = eventBus(this);
   function sayHelloHandler( helloTo ){
       $log.log( "WelcomeSubCntl Says HELLO to " + helloTo + "!" );
   }

   bus.on("sayHello", sayHelloHandler );
}
WelcomeSubCntl.$inject = ['$log', '$eventBus']


/* 
 * Settings Partial Controller
 * 
 */
function SettingsCntl( $log, eventBus){
   var scope = this;

   var bus = eventBus(this);
   function sayHelloHandler( helloTo ){
       $log.log( "Settings Says HELLO to " + helloTo + "!" );
   }

   bus.on("sayHello", sayHelloHandler );

   this.cancel();
}
SettingsCntl.$inject = ['$log', '$eventBus']
SettingsCntl.prototype = {
    cancel: function(){
         this.form = angular.copy(this.person);
    },

    save: function(){
        angular.copy(this.form, this.person);
        window.location.hash = "#";
    }
};
   
   
