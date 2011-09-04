/* jasmine specs for services go here */


describe( "ScopeWatcher Service", function(){
   var scope, child, childConst, wService, watcher;
   var addedCallback;
   var removedCallback;
   
   beforeEach(function(){
       scope = angular.scope();
       wService = scope.$service("scopeWatcher");
   });
   
   it("Should call added not removed", function()
   {   
       child = scope.$new();
       watcher = wService(child);
       addedCallback = jasmine.createSpy("addded callback spy");
       watcher.onAdded(addedCallback);
       removedCallback = jasmine.createSpy("removed callback spy");
       watcher.onRemoved(removedCallback);
       scope.$eval();
       expect(addedCallback).toHaveBeenCalled();
       expect(removedCallback).not.toHaveBeenCalled();
   });
   
   it("Should call added and removed", function(){
       var newSc = angular.scope();
       watcher = wService(newSc);
       addedCallback = jasmine.createSpy("addded callback spy");
       watcher.onAdded(addedCallback);
       removedCallback = jasmine.createSpy("removed callback spy");
       watcher.onRemoved(removedCallback);
       newSc.$eval();
       expect(addedCallback).toHaveBeenCalled();
       expect(removedCallback).not.toHaveBeenCalled();
       scope.$eval();
       scope.$eval();
       expect(removedCallback).toHaveBeenCalled();
   });
});

describe("EventBus Service", function(){
   var scope, scope2, busService, testEvent;
   
   beforeEach( function(){
      scope = angular.scope();
      scope2 = angular.scope();
      busService = scope.$service("$eventBus");
      testEvent = "testEvent";
   });
   
   it("should add and trigger a listener within the same scope", function(){
      var bus = busService(scope);
      var listener = jasmine.createSpy("Simple Callback Spy");
      bus.on(testEvent, listener);
      expect(listener).not.toHaveBeenCalled();
      bus.emit(testEvent);
      expect(listener).toHaveBeenCalled();
   });
   
   it("should trigger a listener in an unrelated scope", function(){
       var bus = busService(scope);
       var bus2 = busService(scope2);
       var listener = jasmine.createSpy("Cross Scope Event Callback Spy");
       bus2.on(testEvent, listener);
       bus.emit(testEvent);
       expect(listener).toHaveBeenCalled();
   });
   
   it("should send three params to a handler across scopes", function(){
       var bus = busService(scope);
       var bus2 = busService(scope2);
       var arr = ["hello","world"]
       var listener = jasmine.createSpy("Cross Scope Event Complex Callback Spy");
       bus2.on(testEvent, listener);
       bus.emit(testEvent, 1, arr, "test" );
       expect(listener).toHaveBeenCalledWith(1,arr,"test");
   });
   
   it("should add, trigger and then remove a listener", function(){
      var bus = busService(scope);
      var listener = jasmine.createSpy("Simple Callback Spy");
      bus.on(testEvent, listener);
      bus.emit( testEvent, 1 );
      expect(listener).toHaveBeenCalledWith(1);
      bus.remove(testEvent, listener);
      bus.emit(testEvent, 2);
      expect(listener).not.toHaveBeenCalledWith(2);
   });
   
   it("should remove all listeners in a given scope", function(){
       var bus = busService(scope);
       var lsnrs = [], lsnrCount = 10, i = 0, lsnr;
       while( i++ < lsnrCount ){
           lsnr = jasmine.createSpy("Simple spy " + (i+1));
           lsnrs.push(lsnr);
           bus.on(testEvent, lsnr);
       }
       
       bus.emit(testEvent, 1);
       i = 0;
       while( i < lsnrCount ){
           lsnr = lsnrs[i];
           expect(lsnr).toHaveBeenCalledWith(1);
           i++;
       }
       
       bus.removeAll();
       bus.emit(testEvent, 2);
       i = 0;
       while( i < lsnrCount ){
           lsnr = lsnrs[i];
           expect(lsnr).not.toHaveBeenCalledWith(2);
           i++
       }
   });
   
   it("should remove all listeners when the scope is removed", function(){
      var bus = busService(scope2);
      var listener = jasmine.createSpy("testCallback");
      bus.on(testEvent,listener);
      bus.emit(testEvent);
      expect(listener).toHaveBeenCalled();
      scope2.$eval(); // added will dispatch... necessary for removed to be triggered
      scope.$eval(); 
      scope.$eval(); // should trigger removed on scope 2 since it was not evaluated
      bus.emit(testEvent,1);
      expect(listener).not.toHaveBeenCalledWith(1);
   });
   
   it("should add, trigger and remove listeners on static and child buses from static emit call to event bus", function(){
      var bus = busService(scope);
      var listener = jasmine.createSpy("child bus listener");
      var stListener = jasmine.createSpy("observer on static event bus 'on'");
      bus.on(testEvent, listener);
      busService.on(testEvent, stListener);
      
      busService.emit(testEvent, 1);
      expect(listener).toHaveBeenCalledWith(1);
      expect(stListener).toHaveBeenCalledWith(1);
      
      busService.remove(testEvent, stListener);
      bus.remove(testEvent, listener);
      
      busService.emit(testEvent, 2);
      expect(listener).not.toHaveBeenCalledWith(2);
      expect(stListener).not.toHaveBeenCalledWith(2);
   });
   
   it("should call wildcard listener when any event is emitted", function(){
       var wildcardLsnr = jasmine.createSpy("Wildcard listener");
       busService.on("*",wildcardLsnr);
       busService.emit("testEvent");
       expect(wildcardLsnr).toHaveBeenCalledWith("testEvent");
       busService.emit("testEvent",1,2,3);
       expect(wildcardLsnr).toHaveBeenCalledWith("testEvent",1,2,3);
       busService.remove("*",wildcardLsnr);
       busService.emit("testEvent","test_param");
       expect(wildcardLsnr).not.toHaveBeenCalledWith("testEvent", "test_param");
   })
});

/*
describe("CommandMap Service",function(){
    var comMap, map, eventBus, listener;

    beforeEach(function(){
        var Command = function( $eventBus ){
            this.execute = function(){
                var args = ["myEventResponse"];
                args = args.concat(Array.prototype.slice.call(arguments));
                $eventBus.emit.apply( null, args );
            }
        }
        Command.$inject = ["$eventBus"];
        eventBus = angular.service("$eventBus");
        comMap = angular.service("$commandMap");
        comMap.mapEvent("myEvent", Command);
        listener = jasmine.createSpy();
    })

    //$commandMap.mapEvent("myEvent",MyEventCommand,false);
    ///// spec /////
    // it should respond with myEventResponse when myEvent is dispatched.
    
    it("should respond with myEventResponse when myEvent is dispatched.", function(){
        eventBus.on("myEventResponse", listener);
        eventBus.emit("myEvent");
        expect(listener).toHaveBeenCalled();
        var ar = [3];
        eventBus.emit("myEvent", 1,"2",ar);
        expect(listener).toHaveBeenCalledWith(1,"2",ar);
    })
    // It should execute the command once only
    // it should throw an error when the same event -> command combo is mapped twice


    //$commandMap.unmapEvent("myEvent",MyEventCommand);

    ///// spec /////
    // it should unmap the specified event -> command combination
    // it should not complain if no match is found

    //$commandMap.unmapEvents();

    ///// spec /////
    // it should unmap all events
    // it should unmap events that were added with once only
   
})
*/