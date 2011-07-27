/* App Controllers */

/* 
 * Main App Controller
 * 
 */
function AppCntl($route, eventBus) {
    $route.parent(this);
   
    // initialize the model to something useful
    this.person = {
     name:'anonymous',
     contacts:[{type:'email', url:'anonymous@example.com'}]
    };
    
     var bus = eventBus(this);
    
    this.sayHello = function(toWho){
        bus.emit("sayHello", toWho);
    }
}
AppCntl.$inject = ['$route', 'eventBus']
   
/* 
 * Welcome Partial Controller 
 * 
 */
function WelcomeCntl( $log, eventBus ){
       var scope = this;
       var it = 1;
       
       var bus = eventBus(this);
       function sayHelloHandler( helloTo ){
           $log.log( "Welcome Says HELLO to " + helloTo + "!" );
       }
       
       bus.on("sayHello", sayHelloHandler );
}
WelcomeCntl.$inject = ['$log', 'eventBus']
WelcomeCntl.prototype = { 
    greet: function(){
        alert("Hello " + this.person.name);
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
WelcomeSubCntl.$inject = ['$log', 'eventBus']


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
SettingsCntl.$inject = ['$log', 'eventBus']
SettingsCntl.prototype = {
    cancel: function(){
         this.form = angular.copy(this.person);
    },

    save: function(){
        angular.copy(this.form, this.person);
        window.location.hash = "#";
    }
};
   
   
