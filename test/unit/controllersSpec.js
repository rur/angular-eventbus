/* jasmine specs for controllers go here */

describe('AppCntl', function(){
  var scope, $route, eventbus, appCtrl, ctrlBus;

  beforeEach(function(){
    this.addMatchers({
        toEqualData:function(expected){
            return angular.equals(this.actual,expected);
        }
    })  
      
    scope = angular.scope();
    $route = scope.$service("$route");
    eventbus = scope.$service("eventBus");
      
    appCtrl = scope.$new(AppCntl);
    ctrlBus = appCtrl.bus;
  });


  it('should have a person object', function() {
    expect(appCtrl.person).toEqualData({
     name:'anonymous',
     contacts:[{type:'email', url:'anonymous@example.com'}]
    });
  });
  
  it('should have an event bus object', function(){
    expect(appCtrl.bus).toBeDefined();
    expect(ctrlBus).toBeDefined();
  });
  
  it("should dispatch sayHello event to EventBus", function(){
     spyOn(ctrlBus, "emit");
     appCtrl.sayHello("world");
     expect(ctrlBus.emit).toHaveBeenCalledWith("sayHello","world");
  });
});


describe('WelcomeCntl', function(){
  var $log, wCntl, bus, window;
  beforeEach(function(){
      var scope = angular.scope();
      $log = scope.$service("$log");
      bus = scope.$service("eventBus")(scope);
      window = scope.$service("$window");
      var appCntl = scope.$new(AppCntl);
      wCntl = appCntl.$new(WelcomeCntl);
  });
  
  it('should log an hello message when the sayHello event is emitted', function(){
     spyOn($log,"log");
     bus.emit("sayHello", "world");
     expect($log.log).toHaveBeenCalledWith("Welcome Says HELLO to world!");
  });
  it('should alert with the persons name when greet method is called', function(){
      spyOn(window,'alert');
      wCntl.greet();
      expect(window.alert).toHaveBeenCalledWith("Hello anonymous");
  });
});

describe('WelcomeSubCntl', function(){
  var $log, wCntl, bus;
  beforeEach(function(){
      var scope = angular.scope();
      $log = scope.$service("$log");
      bus = scope.$service("eventBus")(scope);
      wCntl = scope.$new(WelcomeSubCntl);
      
  });
  
  it('should log an hello message when the sayHello event is emitted', function(){
     spyOn($log,"log");
     bus.emit("sayHello", "world");
     expect($log.log).toHaveBeenCalledWith("WelcomeSubCntl Says HELLO to world!");
  });
});

describe('SettingsCntl', function(){
  var $log, appCntl, sCntl, bus;
  beforeEach(function(){
        this.addMatchers({
            toEqualData:function(expected){
                return angular.equals(this.actual,expected);
            }
        })  

      var scope = angular.scope();
      $log = scope.$service("$log");
      bus = scope.$service("eventBus")(scope);
      appCntl = scope.$new(AppCntl);
      sCntl = appCntl.$new(SettingsCntl);
      
  });
  
  it('should log an hello message when the sayHello event is emitted', function(){
     spyOn($log,"log");
     bus.emit("sayHello", "world");
     expect($log.log).toHaveBeenCalledWith("Settings Says HELLO to world!");
  });
  
  it('should have form which is a copy of the person object',function(){
     expect(sCntl.form).toEqualData(appCntl.person);
     sCntl.form = {test:"test"};
     sCntl.save();
     expect(sCntl.form).toEqualData(appCntl.person);
     sCntl.form = {test:"test2"};
     sCntl.cancel();
     expect(sCntl.form).toEqualData(appCntl.person);
     
  });
});