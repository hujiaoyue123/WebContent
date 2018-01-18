/** 选择文件*/
angular.module("app")
	.controller("adminRegister",function($scope,$rootScope,service,$$user,$$data,$$widget,$$util){
		$scope.user = {};
		$scope.user.sex = false;
		$scope.user.groupid = $scope.groupid;
		$scope.validFome = function(val,type){
			if(type == "loginname"){
				return $$util.String.verifyMobile(val);
			} else if(type == "username"){
				if(!val || val==""){
					return false;
				}
			} else if(type == "phone"){
				if(val && val!=""){
					return $$util.String.verifyPhone(val);
				}
			} else if(type == "email"){
				if(val && val!=""){
					return $$util.String.verifyEmail(val);
				}
			}
			return true;
		};
		$scope.submitUser = function(user){
			$scope.fn(user);
		}
		$scope.remove = function(){
			$$widget.MODAL.remove();
		}
	});