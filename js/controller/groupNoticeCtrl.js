/** 部门群组企业详情页面 */
angular.module("app")
	.controller("groupNoticeCtrl",function($rootScope,$scope,service,$stateParams,$$user,$$widget){
		$scope.cgroup = {}; // 当前群信息
		$scope.dept = {};
		$scope.org = {};
		$scope.params = params = {}; //url参数
		$scope.cgroup.id = $stateParams.groupid; //id
		
		$scope.$on("$ionicView.enter",function(){
			/** 初始化执行*/
			service.validUser($scope.init);
		});

		$scope.init = function(){
			$scope.loadNotices();
		};
		

		$scope.loadNotices = function(){
			var params={
					action:'getGroupNotice',
					method:"POST",
					groupid:$scope.cgroup.id
			};
			service.promiseProxy(function(promise){
				$$user.go(promise,params);
			},function(result){
				if(result.result == 1){ //查询成功
					$scope.notices = result.notices;
					$scope.role = result.role;
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function () {
						$scope.loadNotices(params);
					});
				}else{	//查询失败
					service.showMsg("error",result.description);
					//service.$cordovaToast.showShortBottom(result.description);
				}
			},null,function(){
				$scope.$broadcast("scroll.refreshComplete");
			});
		};
		
		$scope.goBack = goBack = function(){
    		service.$ionicHistory.goBack();
		};
		
		$scope.newNotice = function($event){
			service.$state.go("newNotice",{groupId:$scope.cgroup.id});
		};

		$scope.clickNotice = function(noticeId){
			service.$state.go("showNotice",{id:noticeId,groupId:$scope.cgroup.id});
		};
	});