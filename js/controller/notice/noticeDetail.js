/**
 * 公告详情
 */
angular.module('app')
	.controller('noticeDetail',function($scope,$rootScope,$stateParams,$injector){
		/** $stateParams
		 * @param noticeid
		 * @param role
		 */
		//编辑权限(从url入口)
		$scope.role = $stateParams.role;
		/**下拉刷新*/
		$scope.onRefresh = function(){
			$scope.getNoticeDetail();
		};
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
									notice.imageFile = file; //源文件,预览使用
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
					$scope.$broadcast('scroll.refreshComplete');
				},errorCallBack: function(){
					$scope.$broadcast('scroll.refreshComplete');
				}
			};
			$$http.HTTP(params);
		};
		/**
		 * 打开附件
		 */
		$scope.openAnnex = function(file){
			if(file.preview){ //可预览
				//图片文件
				if(file.preview == 'image'){
					var $RESOURCE = $injector.get('$RESOURCE');
					var $$widget = $injector.get('$$widget');
					var src = $RESOURCE.RESOURCE.imagePreviewResource(file);
					$$widget.showSingleImage(src);
				}
				//可预览
				else if(file.preview == 'office' || file.preview == 'pdf'){
					var $$preview = $injector.get('$$preview');
					$$preview.prepare({resource: file});
				}
				//zlt文件
				else if(file.preview == 'zlt'){
					var $state = $injector.get('$state');
					var params = {
						resourceid: file.id,
						folderid: $stateParams.folderid
					};
					$state.go('zltFile',params);
				}
				//文本
				else if(file.preview == 'txt'){
					var params = {
						id: file.id,
						folderid: file.folderid,
						filename: file.filename
					};
					$injector.get('$state').go('txtReader',params);
				}
				//媒体
				else if(file.preview == 'audio' || file.preview == 'video'){
					var inParams = {
						id: file.id,
						folderid: file.folderid,
						name: file.filename,
						type: file.minetype
					};
					$injector.get('service').showMediaModal(inParams);
				}
			}else{ //不可预览
				var inParams = {
					domain: $scope.getDomain(),
					id: file.id,
					folderid: file.folderid,
					rootid: file.rootid
				};
				$injector.get('$state').go('fileDetail',inParams);
			}
		};
		/**
		 * 进入编辑
		 */
		$scope.editNotice = function(){
			var params = {
				groupid: $stateParams.groupid,
				noticeid: $stateParams.noticeid,
				role: $stateParams.role,
				folderid: $stateParams.folderid	
			};
			$injector.get('$state').go('noticeEdit',params);
		};
		/**
		 * 删除公告提醒
		 */
		$scope.alertRemoveNotice = function(){
			var $ionicPopup = $injector.get('$ionicPopup');
			var options = {
				title: '提醒',
				template: '<center>确定要删除该公告?</center>',
				cancelText: '取消',
				okText: '确定',
				okType: 'button-positive'
			};
			$ionicPopup.confirm(options)
				.then(function(r){
					if(r){
						$scope.removeNotice();
					}
				});
		};
		/**
		 * 删除公告
		 */
		$scope.removeNotice = function(){
			var $$http = $injector.get('$$http');
			var toastr = $injector.get('toastr');
			var params = {
				url: $rootScope.CONFIG.itf.user.deleteGroupAnnounce,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					id: $stateParams.noticeid
				},
				successCallBack: function(result){
					if(result.result == 1){
						$rootScope.refreshNoticeList = true; //删除需要刷新
						$injector.get('$ionicHistory').goBack();
					}else if(result.result == 2){
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.removeNotice();
						});
					}else{
						toastr.error(result.description);
					}
				}
			};
			$$http.HTTP(params);
		};

		/**
		 * 视图进入
		 */
		$scope.$on('$ionicView.enter',function(){
			$scope.getNoticeDetail();
		});
	});