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