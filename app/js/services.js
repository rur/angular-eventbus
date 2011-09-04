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
 * @name $commandMap
 * @requres $eventBus
 *
 * @description
 * map events to command objects using the event bus
 *   
 */
angular.service("$commandMap", function($eventBus){
    var commands = {}, root = this;
    var map = {
        mapEvent:function(type, command, onceOnly){
            if(!(commands[type] instanceof Array)){
                commands[type] = [];
            }
            angular.forEach(commands[type],function(cmndDef){
               if(cmndDef.command === command ){
                   if(cmndDef.once || onceOnly) throw "Conflict with previusly mapped event involving a 'once only' command.";
                   // aleady mapped job done
                   return;
               }
            });
            commands[type].push({command:command, once:onceOnly});
        },
        unmapEvent:function(type,command){
            var cmnds = commands[type];
            if( !cmnds || cmnds.length < 1 ) return;
            var newCmnds = [];
            for (var i = 0; i < cmnds.length; i++) {
                if(command !== cmnds[i].command){
                    newCmnds.push(cmnds[i]);
                }
            }
            commands[type] = newCmnds;
        },
        unmapAllEvents:function(){
            commands = {};
        }
    }
    
    var busListener = function( type ){
        var cmnds = commands[type];
        
        if(!cmnds || cmnds.length < 1){
            return;
        } 
        var args = Array.prototype.slice.call(arguments, 1);
        angular.forEach(cmnds, function(cmndDef) {
            // create command as a scope to allow for DI
            // TODO: Find out if this has Memory implications.
            var cmnd = root.$new( cmndDef.command );
            if( typeof cmnd["execute"] != "function" ) throw "Command '"+cmnd+"' must have an execute method!";
            if (!args.length) cmnd.execute();
            else if (!args.length == 1) cmnd.execute(args[0]);
            else cmnd.execute.apply(null, args);
            
            if(cmndDef.once){
                map.unmapEvent(type, cmndDef.command);
            }
        });
    }
    
    $eventBus.on("*", busListener);
    return map;
}, {$inject:["$eventBus"]});



/**
 * @workInProgress
 * @name eventBus
 * @requres scopeWatcher
 *
 * @description
 * Dispatch and respond to events across application tiers.
 *
 *   
 */
 
angular.service('$eventBus', function( scopeWatcher ) {
    var listeners = {}, allRemovedEvent = "eventBusAllListenersRemoved";
    var mainBus = function(scope) {
        return new ChildBus(mainBus, scope);
    };

    mainBus.emit = function(type) {
        var args = Array.prototype.slice.call(arguments, 1);
        // optimize for calls with 1 or 0 arguments - "apply" is expensive
        angular.forEach(listeners[type], function(listener) {
            if (!args.length) listener();
            else if (!args.length == 1) listener(args[0]);
            else listener.apply(null, args);
        });
        // call listeners that subscribed to all events using wildcard '*' 
        if(type == "*") return;
        args = Array.prototype.slice.call(arguments);
        angular.forEach(listeners["*"], function(listener) {
            if (args.length == 1) listener( args[0] );
            else if (!args.length == 2) listener(args[0], args[1]);
            else listener.apply(null, args);
        });
    };

    mainBus.on = function(type, listener) {
        if(!(listeners[type] instanceof Array)){
            listeners[type] = [];
        }
        listeners[type].push(listener);
    };
    
    // TODO: Figure out how to remove a listener which was added using child bus
        // but was removed using the static remove method, definate issues there.
        // Maybe just prevent it from being done
    mainBus.remove = function(type, listener) {
        var lsnrs = listeners[type];
        var ind = lsnrs instanceof Array ? lsnrs.indexOf(listener) : -1;
        if(ind > -1){
            listeners[type].splice(ind,1);
        }
    };

    mainBus.removeAll = function(type) {
        if (typeof type == 'string') {
            listeners[type] = [];
        }
        else if(type instanceof Object) {
            //// let's do bit more magic to make it linear rather than quadratic...
            // the order of localListeners is the same as in listeners
            // see http://jsperf.com/remove-all-items-from-array
            angular.forEach(type, function( lsnrs, evttyp ){
                if( !listeners[evttyp] instanceof Array ) return;
                var rslt = [],
                lsnrsMain = listeners[evttyp],
                i = 0, j = 0;
                while (i < lsnrs.length) {
                    while (lsnrs[i] !== lsnrsMain[j]) {
                        rslt.push(lsnrsMain[j++]);
                    }
                    i++;
                    j++;
                }
                while (j < lsnrsMain.length) {
                    rslt.push(lsnrsMain[j++]);
                }
                
                listeners[evttyp] = rslt;
            })
        }
        else{
            listeners = {};
            // this will instruct all child bus objects to dump their ref to their listeners
            mainBus.emit(allRemovedEvent);
        } 
    };

    return mainBus;

    function ChildBus(main, scope) {
        var localListeners = {}, watcher, child = this;
        
        this.on = function(type, listener) {
            main.on(type, listener);
            
            if(!(localListeners[type] instanceof Array)){
                localListeners[type] = [];
            }
            localListeners[type].push(listener);
        };

        this.emit = main.emit;

        this.remove = function(type, listener) {
            main.remove(type, listener);
            
            var lsnrs = localListeners[type];
            var ind = lsnrs instanceof Array ? lsnrs.indexOf(listener) : -1;
            if(ind > -1){
                localListeners[type].splice(ind,1);
            }
        };

        this.removeAll = function(type) {
            main.removeAll(localListeners);
            
            localListeners = {};
        };
        
        function tidyUp(){
            localListeners = {};
        }
        
        function dispose(){
            child.removeAll();
            main.remove(allRemovedEvent, tidyUp);
            tidyUp()
        }
        
        main.on(allRemovedEvent, tidyUp);

        if (scope){
            watcher = scopeWatcher(scope);
            watcher.onRemoved( this.removeAll );
        }
    };
}, {$inject:["scopeWatcher"]});


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