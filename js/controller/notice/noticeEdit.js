/**
 * 公告详情
 */
angular.module('app')
	.controller('noticeEdit',function($scope,$rootScope,$stateParams,$injector){
		/** $stateParams
		 * @param noticeid
		 * @param role
		 * @param folderid
		 */
		/**
		 * 获取公告详情
		 */
		$scope.getNoticeDetail = function(){
			var $$http = $injector.get('$$http');
			var params = {
				url: $rootScope.CONFIG.itf.user.getGroupAnnounce,
				method: 'get',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					id: $stateParams.noticeid
				},
				successCallBack: function(result){
					if(result.result == 1){
						var notice = result.data;
						//处理数据
						var $$data = $injector.get('$$data');
						var $$user = $injector.get('$$user');
						//处理时间
						notice.updateTime = $$data.DATE.humanize(notice.updatetime); 
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
						//装载数据
						$scope.notice = notice;
					}else if(result.result == 2){
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.getNoticeDetail();
						});
					}
				}
			};
			$$http.HTTP(params);
		};
		/**
		 * 选择文件
		 */
		$scope.selectFile = function(){
			var $$widget = $injector.get('$$widget');
			var dataPackage = {
				title: "选择文件",
				org: "org", //额外获取企业文件,
				rootid: $stateParams.folderid,//$scope.USER.folderid,
				callback: function(data){
					if(data.resource){
						if(!$scope.notice.files){
							$scope.notice.files = [];
							$scope.notice.files.push(data.resource);
						}else{ //非重复
							var hasMatch = false;
							angular.forEach($scope.notice.files,function(file){
								if(file.id == data.resource.id){
									hasMatch = true;
								}
							});
							if(!hasMatch){
								$scope.notice.files.push(data.resource);
							}
						}
					}
				}
			};
			$$widget.MODAL.fileSelect($scope,dataPackage);
		};
		/**
		 * 移除文件
		 */
		$scope.removeFile = function(resource){
			for(var i=0;i<$scope.notice.files.length;i++){
				var res = $scope.notice.files[i];
				if(resource == res){
					$scope.notice.files.splice(i,1);
				};
			}
		};
		/**
		 * 发布
		 * @param executeType 'save': 保存 || 'publish': 发布
		 */
		$scope.publish = function(executeType){
			var toastr = $injector.get('toastr');
			//内容验证
			if(!$scope.notice.title){ //标题
				toastr.warning('标题不能为空');
				return;
			}else if(!$scope.notice.content){ //内容
				toastr.warning('内容不能为空');
				return;
			}
			//处理资源
			var attachment = '';
			if($scope.notice.files){
				angular.forEach($scope.notice.files,function(file){
					if(file.rtfid){
						attachment += file.rtfid + ',';
					}
				});
			}
			//准备发布
			var $ionicLoading = $injector.get('$ionicLoading');
			$ionicLoading.show();
			var $$http = $injector.get('$$http');
			var params = {
				url: $rootScope.CONFIG.itf.user.addGroupAnnounce,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: $stateParams.groupid,
					type: executeType,
					title: $scope.notice.title,
					content: $scope.notice.content,
					attachment: attachment,
					id: $scope.notice.id || ''
				},
				successCallBack: function(result){
					if(result.result == 1){ //发布成功
						toastr.success(result.description);
						$rootScope.refreshNoticeList = true; //编辑需要刷新
						$injector.get('$ionicHistory').goBack();
					}else if(result.result == 2){ //激活session
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.publish(executeType);
						});
					}else{
						toastr.error(result.description);
					}
					$ionicLoading.hide();
				},
				errorCallBack: function(){
					$ionicLoading.hide();
				}
			};
			$$http.HTTP(params);
		};
		/**
		 * 视图进入
		 */
		$scope.$on('$ionicView.enter',function(){
			if($stateParams.noticeid){ //修改
				$scope.getNoticeDetail();
			}else{ //新建
				$scope.notice = {
					type: 'save'
				};
			}
		});
	});