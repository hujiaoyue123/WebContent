/**
 * 文档排名
 */
angular.module('app')
	.controller('moreTopRead',function($scope,$rootScope,$stateParams,$injector){
		$scope.$stateParams = $stateParams;
		//分页配置
		$scope.topReadPageConfig = {
			start: 0,
			pageSize: $rootScope.CONFIG.page.topRead.pageSize,
			hasMore: false,
			lastId: null
		};
		/**
		 * 获取文档排名数据
		 */
		$scope.getRanking = function(){
			var params = {
				url: $rootScope.CONFIG.itf.resource.readStats,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: $stateParams.groupid,
					type: $stateParams.type,
					start: 0,
					pagesize: $scope.topReadPageConfig.pageSize
				},
				successCallBack: function(result){
					if(result.result == 1){
						var $$data = $injector.get('$$data');
						//周-处理
						angular.forEach(result.data,function(resource){
							$$data.type(resource); //新增iontype
							getIcon(resource); //添加src
						});
						//删除多加载的最后一个资源，保留id
						if(result.data.length == ($scope.topReadPageConfig.pageSize + 1)){
							$scope.topReadPageConfig.lastId = result.data.pop().resourceid;
						}
						//重设start
						$scope.topReadPageConfig.start = $scope.topReadPageConfig.pageSize;
						//开启上拉刷新
						if(result.data.length == $scope.topReadPageConfig.pageSize){
							$scope.topReadPageConfig.hasMore = true;
						}
						//装载数据
						$scope.data = result.data;
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.getRanking();
						});
					}
					$scope.$broadcast('scroll.refreshComplete');
				}
			};
			$injector.get('$$http').HTTP(params);
		};
		/**
		 * 分页获取文档排名数据
		 */
		$scope.pagingForGetRanking = function(){
			var params = {
				url: $rootScope.CONFIG.itf.resource.readStats,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: $stateParams.groupid,
					type: $stateParams.type,
					start: $scope.topReadPageConfig.start,
					pagesize: $scope.topReadPageConfig.pageSize,
					resid: $scope.topReadPageConfig.lastId
				},
				successCallBack: function(result){
					if(result.result == 1){
						if(!$scope.data){
							$scope.data = [];
						}
						var $$data = $injector.get('$$data');
						//数据处理
						angular.forEach(result.data,function(resource){
							$$data.type(resource); //新增iontype
							getIcon(resource); //添加src
						});
						//获取的数据有冲突
						if(result.type == 1){
							//删除多加载的最后一个资源，保留id
							if(result.data.length == ($scope.topReadPageConfig.pageSize + $scope.topReadPageConfig.start + 1)){
								$scope.topReadPageConfig.lastId = result.data.pop().resourceid;
							}
							//装载数据
							$scope.data = result.data;
						}else{
							//删除多加载的最后一个资源，保留id
							if(result.data.length == ($scope.topReadPageConfig.pageSize + 1)){
								$scope.topReadPageConfig.lastId = result.data.pop().resourceid;
							}
							//非重复追加
							$injector.get('$$util').ARRAY.distinctPush($scope.data,result.data);
						}
						//取消上拉刷新
						if(result.data.length < $scope.topReadPageConfig.pageSize){
							$scope.topReadPageConfig.hasMore = false;
						}else{
							//重设下次的start
							$scope.topReadPageConfig.start += $scope.topReadPageConfig.pageSize;
						}
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.pagingForGetRanking();
						});
					}
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}
			};
			$injector.get('$$http').HTTP(params);
		};
		/**
		 * 获取资源显示图片
		 * @param resource 资源
		 */
		var getIcon = function(resource){
			if(resource.iontype == "image"){
				resource.src = $rootScope.CONFIG.itf.resource.imageMinPreview + "/" + resource.resourceid +"/" + $rootScope.USER.sessionid
			}else{
				resource.src = "img/filetype/" + resource.iontype + ".png";
			}
		};
		/** 切取排名图片*/
		$scope.getRankingImage = function($index){
			return {
				'background-position': "-"+ 21*$index +'px 21px'
			};
		};
		/** 更多
		 * @param {string} type week: 本周, all: 所有 
		 */
		$scope.moreRanking = function(type){
			
		};
		/** 视图进入*/
		$scope.$on('$ionicView.enter',function(){
			$scope.getRanking();
		});
	});