/** 设置*/
angular.module("app")
	.controller("qrforward",function($scope,$$user,service,$stateParams){
		service.validUser();
		$scope.params = {
				id: $stateParams.id, 
				action: $stateParams.action
			}; 
		$scope.init = function(){
			var action = $scope.params.action;
			var id = $scope.params.id;
			if(action == "user"){
				service.$state.go("showUser",{id:id}); 
			}else if(action == "group"){
				// 加群
			}else if(action == "ent"){
				
			}
		};

		$scope.init();
	});