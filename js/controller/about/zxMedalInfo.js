angular.module("app")
	.controller("zxMedalInfo",function($scope,$rootScope,service,$stateParams){
		$scope.space=$stateParams.space+"G";
		/** 操作*/
		$scope.goBackToAbout = function(){
			service.$state.go("tab.about");
		}
});