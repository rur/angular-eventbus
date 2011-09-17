/* http://docs.angularjs.org/#!angular.widget */

angular.directive("ng:unhide",function(exp, el){
    return function(lkEl){
        $(lkEl).find(".angular-unhide").each(function(){
            $(this).css("visibility","visible");
        })
    }
})