/**
 * 文档排名
 */
angular.module('app')
	.controller('topRead',function($scope,$rootScope,$stateParams,$injector){
		$scope.onrefresh = function(){
			$scope.getWeekRanking();
			$scope.getAllRanking();
		};
		/**
		 * 获取本周文档排名数据
		 */
		$scope.getWeekRanking = function(){
			var params = {
				url: $rootScope.CONFIG.itf.resource.readStats,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: $stateParams.groupid,
					type: 'week',
					start: 0,
					pagesize: 4
				},
				successCallBack: function(result){
					if(result.result == 1){
						var $$data = $injector.get('$$data');
						//数据处理
						angular.forEach(result.data,function(resource){
							$$data.type(resource); //新增iontype
							getIcon(resource); //添加src
						});
						$scope.weeks = result.data;
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.getWeekRanking();
						});
					}
					$scope.$broadcast('scroll.refreshComplete');
				}
			};
			$injector.get('$$http').HTTP(params);
		};
		/**
		 * 获取所有文档排名数据
		 */
		$scope.getAllRanking = function(){
			var params = {
				url: $rootScope.CONFIG.itf.resource.readStats,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: $stateParams.groupid,
					type: 'all',
					start: 0,
					pagesize: 9
				},
				successCallBack: function(result){
					if(result.result == 1){
						var $$data = $injector.get('$$data');
						//数据处理
						angular.forEach(result.data,function(resource){
							$$data.type(resource); //新增iontype
							getIcon(resource); //添加src
						});
						
						$scope.all = result.data;
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.getAllRanking();
						});
					}
					$scope.$broadcast('scroll.refreshComplete');
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
			
			var params = {
				groupid: $stateParams.groupid,
				type: type,
				title: type == 'week' ? '本周排名' : '累计排名'
			};
			$injector.get('$state').go('moreTopRead',params);
		};
		/** 视图进入*/
		$scope.$on('$ionicView.enter',function(){
			$scope.onrefresh();
		});
	});