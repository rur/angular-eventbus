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
    var watchers = [];
    function broadcast(){
        for(var i = 0; i<watchers.length;i++){
           watchers[i].apply(null, arguments);
       }
    }
    function watch( callback ){
        var ind = watchers.indexOf(callback);

       if(ind == -1){
           watchers.push(callback);
       }
    }
    function unwatch( callback ){
        var ind = watchers.indexOf(callback);

       if(ind > -1){
           watchers.splice(ind,1);
       }
    }

    return function( scope ){
        var listenerMap = {};
        var typeMap = {};

        function reciever( type ){
            var args = [].slice.apply(arguments);

            if(typeMap[type] instanceof Array){
                var lstnrs = typeMap[type];
                var args = args.length>1 ? args.slice(1) : [];
                for(var i = 0; i < lstnrs.length;i++){
                    lstnrs[i].apply(null,args);
                }
            }
        }

        function addListener( type, callback ){
            if( !(typeMap[type] instanceof Array)) {
                typeMap[type] = [];
            }
            if( !(listenerMap[callback] instanceof Array)) {
                listenerMap[callback] = [];
            }

            typeMap[type].push(callback);
            listenerMap[callback].push(type);
        }

        function removeListener(callback){
            var types = listenerMap[callback];
            if(types instanceof Array){
                for(var i = 0;i<types.length;i++){
                    var ind = typeMap[types[i]].indexOf(callback);
                    if(ind > -1){
                        typeMap[types[i]].splice(ind,1);
                    }
                }
            }

            delete listenerMap[callback];
        }

        function build(){
            watch(reciever);
        }

        function dispose(){
            unwatch(reciever);
            listenerMap = {};
        }

        var scopeWatch = scopeWatcher(scope);
        scopeWatch.onAdded( build );
        scopeWatch.onRemoved( dispose );

        return {
            on:function( type, callback ){
                addListener( type, callback )
            },
            remove:function( callback ){
                removeListener( callback );
            },
            removeAll:function(){
              listenerMap = {};
              typeMap = {};
            },
            emit:function(){
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
   var root;
   var rootCallbacks = [];
   
   // TODO: try figure out if there is a better way of
   ///      getting the root scope
   function addRoot(rootScope){
       if(!root){
           root = rootScope;
           root.$onEval(rootEval)
       }
   }

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
       // TODO: test if this really works
       if(scope.$root !== scope) addRoot(scope.$root);

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