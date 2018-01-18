/**
 * 企业、部门、群组公告列表
 */
angular.module('app')
	.controller('notice',function($scope,$rootScope,$stateParams,$injector){
		//编辑权限(从url入口)
		$scope.$stateParams = $stateParams;
		$scope.role = $stateParams.role;
		//选择请求接口
		var url = "";
		if($stateParams.urlType == 'list'){
			url = $rootScope.CONFIG.itf.user.getListGroupAnnounce;
		}else if($stateParams.urlType == 'all'){
			url = $rootScope.CONFIG.itf.user.getAllGroupAnnounce;
		}
		//分页配置
		$scope.noticePageConfig = {
			start: 0,
			pageSize: $rootScope.CONFIG.page.notice.pageSize,
			hasMore: false,
			lastId: null
		};
		/**下拉刷新*/
		$scope.onRefresh = function(){
			$scope.getNoticeList();
		};
		//数据请求请求:
		$scope.request = {
			status: 10  //10:请求中 
		};
		/**
		 * @description 获取公告
		 */
		$scope.getNoticeList = function(){
			var $$http = $injector.get('$$http');
			var params = {
				url: url,
				method: 'get',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: $stateParams.groupid,
					start: 0,
					pagesize: $scope.noticePageConfig.pageSize
				},
				successCallBack: function(result){
					$scope.request.status = result.result; //数据状态
					if(result.result == 1){
						//处理数据
						var $$data = $injector.get('$$data');
						var $$user = $injector.get('$$user');
						angular.forEach(result.data,function(notice){
							//处理时间
							notice.updateTime = $$data.DATE.format(new Date(parseInt(notice.updatetime)),"yyyy-MM-dd");
							//处理文件
							if(notice.atta){
								notice.files = notice.atta;
								$$data.oneDragonList(notice.files);
								//提取第一个图片
								for(var i=0;i<notice.files.length;i++){
									var file = notice.files[i];
									if(file.iontype == 'image'){
										notice.image = $rootScope.CONFIG.itf.resource.previewResource + "/"+ file.id + "/" + file.filename;
										break;
									}
								}
							}
						});
						//删除多加载的最后一个，保留id
						if(result.data.length == ($scope.noticePageConfig.pageSize + 1)){
							$scope.noticePageConfig.lastId = result.data.pop().id;
						}
						//装载数据
						$scope.noticeList = result.data;
						//重设start
						$scope.noticePageConfig.start = $scope.noticePageConfig.pageSize;
						//开启上拉刷新
						if(result.data.length == $scope.noticePageConfig.pageSize){
							$scope.noticePageConfig.hasMore = true;
						}
					}else if(result.result == 2){
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.getNoticeList();
						});
					}else{
						$scope.noticePageConfig.hasMore = false;
						$injector.get('toastr').error(result.description);
					}
					$scope.$broadcast('scroll.refreshComplete');
				},
				errorCallBack: function(){
					$scope.$broadcast('scroll.refreshComplete');
				}
			};
			$$http.HTTP(params);
		};
		/**
		 * @description 分页获取公告
		 */
		$scope.pageingForGetNoticeList = function(){
			//初始化执行-避免重复查询
			if(!$scope.conflictSearch){
				$scope.conflictSearch = true;
				var position = $injector.get('$ionicScrollDelegate').getScrollPosition();
				if(position.top < 100){
					$scope.$broadcast('scroll.infiniteScrollComplete');
					return;
				}
			}
			//业务处理
			var $$http = $injector.get('$$http');
			var params = {
				url: url,
				method: 'get',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: $stateParams.groupid,
					start: $scope.noticePageConfig.start,
					pagesize: $scope.noticePageConfig.pageSize,
					aid: $scope.noticePageConfig.lastId
				},
				successCallBack: function(result){
					if(result.result == 1){
						//处理数据
						var $$data = $injector.get('$$data');
						var $$user = $injector.get('$$user');
						angular.forEach(result.data,function(notice){
							//处理时间
							notice.updateTime = $$data.DATE.format(new Date(parseInt(notice.updatetime)),"yyyy-MM-dd");
							//处理文件
							if(notice.atta){
								notice.files = notice.atta;
								$$data.oneDragonList(notice.files);
								//提取第一个图片
								for(var i=0;i<notice.files.length;i++){
									var file = notice.files[i];
									if(file.iontype == 'image'){
										notice.image = $rootScope.CONFIG.itf.resource.previewResource + "/"+ file.id + "/" + file.filename;
										break;
									}
								}
							}
						});
						//查询冲突
						if(result.type == 1){
							//删除多加载的最后一个，保留id
							if(result.data.length == ($scope.noticePageConfig.pageSize + $scope.noticePageConfig.start + 1)){
								$scope.noticePageConfig.lastId = result.data.pop().id;
							}
							//装载数据
							$scope.noticeList = result.data;
						}
						//追加
						else{
							if(result.data && result.data.length>0){
								if(!$scope.noticeList){
									$scope.noticeList = [];
								}
								//删除多加载的最后一个，保留id
								if(result.data.length == ($scope.noticePageConfig.pageSize + 1)){
									$scope.noticePageConfig.lastId = result.data.pop().id;
								}
								//非重复追加
								$injector.get('$$util').ARRAY.distinctPush($scope.noticeList,result.data);
							}
						}
						
						//取消上拉刷新
						if(result.data.length < $scope.noticePageConfig.pageSize){
							$scope.noticePageConfig.hasMore = false;
						}else{
							//重设下次的start
							$scope.noticePageConfig.start += $scope.noticePageConfig.pageSize;
						}
					}else if(result.result == 2){
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.pageingForGetNoticeList();
						});
					}else{
						$scope.noticePageConfig.hasMore = false;
					}
					$scope.$broadcast('scroll.infiniteScrollComplete');
				},
				errorCallBack: function(){
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}
			};
			$$http.HTTP(params);
		};
		/**
		 * 公告详情
		 */
		$scope.openNoticeDetail = function(notice){
			var params = {
				groupid: $stateParams.groupid,
				noticeid: notice.id,
				role: $stateParams.role,
				folderid: $stateParams.folderid
			};
			$injector.get('$state').go('noticeDetail',params);
		};
		
		/**
		 * 编辑公告
		 * 打开公告modal
		 */
		$scope.editNotice = function(notice){
			var params = {
				groupid: $stateParams.groupid,
				role: $stateParams.role,
				folderid: $stateParams.folderid	
			};
			$injector.get('$state').go('noticeEdit',params);
		};
		
		/**
		 * 视图进入
		 */
		$scope.$on('$ionicView.enter',function(){
			if(!$scope.noticeList || $rootScope.refreshNoticeList){
				$scope.getNoticeList();
				if($rootScope.refreshNoticeList){
					$rootScope.refreshNoticeList = false;
				}
			}
		});
	});