/**
 * 文档排名
 */
angular.module('app')
	.controller('topRead',function($scope,$rootScope,$stateParams,$injector){
		/**
		 * 获取文档排名数据
		 */
		$scope.getRanking = function(){
			var params = {
				url: $rootScope.CONFIG.itf.resource.readStats,
				method: 'get',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: $stateParams.groupid
				},
				successCallBack: function(result){
					if(result.result == 1){
						var $$data = $injector.get('$$data');
						//周-处理
						angular.forEach(result.data.weeks,function(resource){
							$$data.type(resource); //新增iontype
							getIcon(resource); //添加src
						});
						//所有处理
						angular.forEach(result.data.all,function(resource){
							$$data.type(resource); //新增iontype
							getIcon(resource); //添加src
						});
						$scope.all = result.data.all;
						$scope.weeks = result.data.weeks;
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