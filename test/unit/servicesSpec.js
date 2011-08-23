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
      busService = scope.$service("eventBus");
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
   
   it("add, trigger and then remove a listener", function(){
      var bus = busService(scope);
      var listener = jasmine.createSpy("Simple Callback Spy");
      bus.on(testEvent, listener);
      bus.remove(testEvent, listener);
      bus.emit(testEvent);
      expect(listener).not.toHaveBeenCalled();
   });
});