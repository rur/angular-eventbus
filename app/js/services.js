/* http://docs.angularjs.org/#!angular.service */

/**
 * App service which is responsible for the main configuration of the app.
 */
angular.service('myAngularApp', function($route) {

    // define routes
    $route.when("",          {template:'partials/welcome.html',  controller:WelcomeCntl});
    $route.when("/settings", {template:'partials/settings.html', controller:SettingsCntl});

}, {$inject:['$route'], $eager: true});



/**
 * @workInProgress
 * @name eventBus
 * @requres scopeWatcher
 *
 * @property {Object} current scope.
 *
 * @description
 * Dispatch and respond to events across application tiers.
 *
 *   
 */
 
angular.service("eventBus", function( scopeWatcher ){
    var eventMap = {};
    function broadcast( eventType ){
        var args = [].slice.call(arguments,1);
        var listeners = eventMap[eventType] || [];
        
        for(var i=0,len=listeners.length;i<len;i++){
            listeners[i].apply(null,args);
        }
    }

    function addListener(type, listener){
        if(!(eventMap[type] instanceof Array)){
            eventMap[type] = [];
        }
        eventMap[type].push(listener);
    }

    function removeListener(type, listener){
        var listeners = eventMap[type] || [];
        var ind = listeners.indexOf(listener);
        if(ind>-1){
            listeners.splice(ind,1);
        }
    }

    function removeAll( removemap ){
        var garbage, listeners, type;
        for(type in removemap){
            garbage = removemap[type] || [];
            listeners = eventMap[type] || [];

            for(var i=listeners.length-1,j=garbage.length-1;i>-1;i--){
                if(j == -1) break;
                if( listeners[i] == garbage[j] ){
                    listeners.splice(i,1);
                    j--;
                }
            }
        }
    }

    return function( scope ){
        var localEventMap = {};

        function dispose(){
            removeAll(localEventMap);
            localEventMap = {};
        }
        
        if(scope){
            var scopeWatch = scopeWatcher(scope);
            scopeWatch.onRemoved( dispose );
        }

        return {
            on:function( type, listener ) {
                addListener(type, listener);
                if(!(localEventMap[type] instanceof Array)){
                    localEventMap[type] = [];
                }
                localEventMap[type].push(listener);
            },
            remove:function( type, listener ){
                removeListener(type,listener);
                var listeners = localEventMap[type] || [];
                var ind = listeners.indexOf(listener);
                    if(ind>-1){
                    listeners.splice(ind,1);
                }
            },
            removeAll:function() {
                removeAll(localEventMap);
                localEventMap = {};
            },
            emit:function() {
                if( arguments.length > 0 && typeof arguments[0] == "string" ){
                    broadcast.apply( null, arguments ); 
                }
                else {
                    throw { message:"Cannot emit event, incorrect arguments", arguments:arguments };
                }
            }
        }
    }

}, {$inject:["scopeWatcher"]})


/**
 * @workInProgress
 * @name scopeWatcer
 *
 * @property {Object} scope to watch.
 *
 * @description
 * Notifies you when a scope is removed. It does this by
 * watching eval on the scope and on the root scope. If the 
 * root scope evaluates and the watched scope doesn't it is deemed to be removed.
 *
 *   
 */

angular.service( "scopeWatcher", function(){
   var root = this;
   var rootCallbacks = [];
   
    function rootEval(){
       for(var i = 0; i<rootCallbacks.length;i++){
           rootCallbacks[i]();
       }
   }

   function addRootCallback( callback ){
       var ind = rootCallbacks.indexOf(callback);

       if(ind == -1){
           rootCallbacks.push(callback);
       }
   }

   function removeRootCallback( callback ){
       var ind = rootCallbacks.indexOf(callback);

       if(ind != -1){
           rootCallbacks.splice(ind,1);
       }
   }
   
   root.$onEval(rootEval);

   return function(scope){
       var scopeEval = false;
       var isActive = false;
       var added = [];
       var removed = [];

       function onRootEval(){
           if(scopeEval){
               scopeEval = false;
           } else if( isActive ){
               isActive = false;
               // dispatch removed
               for( var i=0;i<removed.length;i++ ){
                   removed[i]();
               }
               removeRootCallback(onRootEval);
           }
       }

       function onScopeEval(){
           scopeEval = true;
           if(!isActive){
               isActive = true;
               // dispatch added
               for( var i=0;i<added.length;i++ ){
                   added[i]();
               }
               addRootCallback(onRootEval);
           }
       }

       scope.$onEval(onScopeEval);

       return {
           onAdded:function(cb){
               var ind = added.indexOf(cb);
               if(ind == -1){
                   added.push(cb);
               }
           },
           onRemoved:function(cb){
               var ind = removed.indexOf(cb);
               if(ind == -1){
                   removed.push(cb);
               }
           }
       }
   }
});  