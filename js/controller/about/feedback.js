/** 反馈控制器*/
angular.module("app")
	.controller("feedback",function($scope,$$widget){
		/** 操作*/
		$scope.operate = function(params){
			//新建反馈
			if(params.type == "newFeedBack"){
				$$widget.MODAL.newFeedBack();
			}
		}
	});