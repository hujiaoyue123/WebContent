/**
 * 审核文件
 */
angular.module('app')
.controller('auditFile',function($scope,$rootScope,$RESOURCE,$injector){
	/** 分页配置*/
	$scope.pageConfig = {
		start: 0,
		pageSize: $rootScope.CONFIG.page.auditFile.pageSize,
		hasMore: false,
		lastId: null
	};
	/**
	 * 进入文件夹/文件详情
	 * @param resource 文件资源对象
	 */
	$scope.enterFileDetail = function(resource){
		var inParams = {
			domain: $scope.getDomain(),
			id: resource.resourceid,
			rootid: resource.rootid,
			folderid: resource.folderid,
			isaudit: resource.isaudit
		};
		var $state = $injector.get('$state');
		if(resource.type == 'folder'){
			$state.go('folderInfo',inParams);
		}else if(resource.type == 'resource'){
			$injector.get('$state').go('fileDetail',inParams);
		}
	};
	/**
	 *  获取待审核文件
	 */
	$scope.getResourceAudits = function(){
		var inParams = {
			start: 0,
			pagesize: $scope.pageConfig.pageSize
		};
		var successCallback = function(result){
			if(result.result == 1){
				var resources = result.audits;
				//没有待审列表
//				if(!resources || resources.length == 0){
//					$injector.get('$ionicHistory').goBack();
//					return;
//				};
				//数据处理
				if(resources){
					var $$data = $injector.get('$$data');
					for(var i=0;i<resources.length;i++){
						var resource = resources[i];
						//文件格式
						$$data.FILE.type(resource);
						//文件大小
						$$data.FILE.size(resource);
						//文件时间
						$$data.FILE.date(resource);
						//文件夹
						if(resource.type == 'folder'){
							if(resource.rootid != $rootScope.USER.folderid){ //组织文件夹
								resource.src = 'img/filetype/folder-org.png';
							}else{
								resource.src = 'img/filetype/folder-user.png';
							}
						}else if(resource.type == 'resource'){
							//图标
							if(resource.iontype == 'image'){
								resource.src = $RESOURCE.RESOURCE.imageMinPreview(resource.resourceid);
							}else{
								resource.src = $RESOURCE.RESOURCE.getFileIcon(resource.iontype);
							}
						}
					}
				}
				//分页处理
				if(resources.length == ($scope.pageConfig.pageSize + 1)){
					//保留最后一id
					$scope.pageConfig.lastId = resources.pop().id;
					//开启下拉刷新
					$scope.pageConfig.hasMore = true;
					//重设start
					$scope.pageConfig.start = $scope.pageConfig.pageSize;
				}
				//装载数据
				$scope.resources = resources;
			}else if(result.result == 2){
				$injector.get('service').activeSessionProxy(function(){
					$scope.getResourceAudits();
				});
			}else{
				$injector.get('toastr').error(result.description);
			}
			$scope.$broadcast('scroll.refreshComplete');
		};
		$RESOURCE.RESOURCE.getResourceAudits(inParams,successCallback);
	};
	/**
	 *  分页
	 */
	$scope.pagingForGetResourceAudits = function(){
		var inParams = {
			start: $scope.pageConfig.start,
			pagesize: $scope.pageConfig.pageSize,
			resid: $scope.pageConfig.lastId
		};
		var successCallback = function(result){
			if(result.result == 1){
				//数据处理
				var resources = result.audits;
				//数据处理
				if(resources){
					var $$data = $injector.get('$$data');
					for(var i=0;i<resources.length;i++){
						var resource = resources[i];
						//文件格式
						$$data.FILE.type(resource);
						//文件大小
						$$data.FILE.size(resource);
						//文件时间
						$$data.FILE.date(resource);
						//图标
						if(resource.iontype == 'image'){
							resource.src = $RESOURCE.RESOURCE.imageMinPreview(resource.resourceid);
						}else{
							resource.src = $RESOURCE.RESOURCE.getFileIcon(resource.iontype);
						}
					}
				}
				//查询冲突
				if(result.type == 1){ //冲突重新装载数据
					if(resources.length == ($scope.pageConfig.pageSize + $scope.pageConfig.start + 1)){
						$scope.pageConfig.lastId = resources.pop().id;
					}
					//装载数据
					$scope.resources = resources;
				}else{ //追加数据
					if(resources && resources.length>0){
						if(!$scope.resources){
							$scope.resources = [];
						}
						//分页处理
						if(resources.length == ($scope.pageConfig.pageSize + 1)){
							//删除最后一个元素,保留id
							$scope.pageConfig.lastId = resources.pop().id;
							//重设start
							$scope.pageConfig.start += $scope.pageConfig.pageSize;
						}else{
							//关闭下拉刷新
							$scope.pageConfig.hasMore = false;
						}
						//非重复追加
						$injector.get('$$util').ARRAY.distinctPush($scope.resources,resources);
					}
				}
			}else if(result.result == 2){
				$injector.get('service').activeSessionProxy(function(){
					$scope.pagingForGetResourceAudits();
				});
			}else{
				$injector.get('toastr').error(result.description);
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		};
		$RESOURCE.RESOURCE.getResourceAudits(inParams,successCallback);
	};
	
	/** 视图进入*/
	$scope.$on('$ionicView.enter',function(){
		$scope.getResourceAudits();
	});
});