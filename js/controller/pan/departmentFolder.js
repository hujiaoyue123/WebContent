/**
 * 部门文件
 */
angular.module('app')
.controller('departmentFolder',function($scope,$rootScope,$RESOURCE,$stateParams,$injector){
	var service = $injector.get('service');
	var $state = $injector.get('$state');
	var $$data = $injector.get('$$data');
	/**
	 * 搜索
	 */
	$scope.search = function(){
		var inParams = {
			domain: $scope.getDomain(),
			folderid: $stateParams.folderid,
			competence: $stateParams.competence,
			rootid: $stateParams.rootid
		};
		$state.go("searchPan",inParams);
	}
	/**
	 * 进入部门文件夹
	 */
	$scope.enterFolder = function(folder){
		var inParams = {
			domain: $scope.getDomain(),
			id: folder.id,
			title: folder.name,
			rootid: folder.rootid
		};
		//departmentFolder就进入showPan
		//tab.departmentFolder就进入tab.ppan
		var currentStateName = $injector.get('$ionicHistory').currentView().stateName;
		var stateName;
		if(currentStateName.indexOf('tab.') > -1){
			stateName = 'tab.ppan';
		}else{
			stateName = 'showPan';
		}
		$state.go(stateName,inParams);
	};
	/**
	 * 进入文件审核列表
	 */
	$scope.enterAuditFile = function () {
		var inParams = {
			domain: $scope.getDomain()
		};
		$injector.get('$state').go('auditFile',inParams);
	};
	/**
	 * 获取
	 */
	$scope.getDeptFolder = function(){
		var inParams = {
			folderid: $stateParams.folderid
		};
		//发起请求
		$RESOURCE.FOLDER.getDeptFolder(inParams,function(result){
			if(result.result == 1){
				var folders = result.sub.folders; //部门文件夹列表
				//处理时间
				for(var i=0;i<folders.length;i++){
					var folder = folders[i];
					folder.updatetime = $$data.DATE.format(new Date(parseInt(folder.updatetime)),"yyyy-MM-dd");
				}
				//装载
				$scope.folders = folders;
			}else if(result.result == 2){ //session过期
				service.activeSessionProxy(function(){
					$scope.getDeptFolder();
				});
			}else{ //发生错误
				$injector.get('toastr').error(result.description);
			}
		});
	};
	/** 视图进入*/
	$scope.$on('$ionicView.enter',function(){
		$scope.getDeptFolder();
	});	
});