/** 链接分享 
 *  $stateParams {rid(分享资源id)}
 * */
angular.module("app")
	.controller("linkCtrl",function($scope,$rootScope,service,$$share,$$user,$$data,$RESOURCE,$stateParams,$$preview,$injector){
		//控制器信息
		//显示模式--正确，异常(资源不存在，需要密码)
		$scope.shown = {}; 
		//装载二维码
		$scope.temp={}; //控制模态窗显示/关闭
		$scope.closeModal = function(){
			if($rootScope.modal){
				$rootScope.modal.remove();
			}
		};
		/** 操作*/
		$scope.operate = function(params){
			/** 保存*/
			if(params.type == "save"){
				var inParams = {
					id: $scope.id
				};
				$$share.addLinkShare(inParams,function(result){
					if(result.result == 1){
						service.showMsg("success",result.description);;
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.operate(params);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			}
			//下载
			if(params.type == "download"){
				service.download($$share.LINK.download($scope.id));
			}
			//预览
			else if(params.type == "preview"){
				if($scope.share.resource.preview){//可预览文件
					var resource = angular.copy($scope.share.resource);
					resource.id = $scope.share.id;
					LINK.previewResource(resource);
				};
			}
			/** 预览txt*/
			else if(params.type == 'previewText'){
                var inParams = {
                    filename: $scope.resource.filename,
                    shareid: $scope.share.id
                };
                $injector.get('$state').go('txtReader',inParams);
                //关闭modal
                $rootScope.modal.hide();
				//预览完毕执行
				if(!$rootScope.previewCallBack){
					$rootScope.previewCallBack = function(){
						$rootScope.modal.show();
					}
				}
			}
		};
		/** 分享体*/
		var LINK = {
			/** 查询分享
			 * id
			 */	
			getShare: function(id){
				var params = {
					id: id
				};
				$$share.LINK.getShare(params,function(result){
					if(result.result == 1){ //请求成功
						var share = result.share;
						var resource = share.resource;
						var user = share.user;
						//1:有资源 2.无法访问
						$scope.shown.state = 1;
						//分享时间处理
						share.createtime = $$data.DATE.humanize(share.createtime);
						//分享人头像
						user.src = $$user.getUserPhoto(user.id);
						//资源数据处理
						$$data.oneDragon(resource);
						//图片大图
						if(resource.preview == "image"){
							var inParams = {
								id: resource.id,
								filename: resource.filename
							};
							resource.photo = $RESOURCE.RESOURCE.imagePreviewResource(inParams);
						}
						//office
						else if(resource.preview == "pdf" || resource.preview == "office"){
							var inParams = {
								id: resource.id,
								num: 0
							};
							resource.photo = $RESOURCE.RESOURCE.officePreviewResource(inParams);
						}
						//video/audio
						else if(resource.preview == 'video' || resource.preview == 'audio'){
                            //获取地址
                            var videoSrc = $$share.LINK.download($scope.id);
							//视频列表
							$scope.media = {
								type: resource.minetype,
								src: videoSrc,
								name: resource.filename
							};
						}
						//txt
						else if(resource.preview == 'txt'){
							//文件二进制流
							var filepath = $$share.LINK.download($scope.id);
							$injector.get('$http').get(filepath)
								.success(function(text){
									$scope.txtContent = text; //文本内容
								});
						}
						//不可预览
						else{
							resource.photo = resource.src;
						}
						$scope.share = share; //装载数据
						$scope.resource = resource; //资源信息
						$scope.shareUser = user; //分享人信息
					}else{
						$scope.shown.state = 2;
						$scope.shown.des = result.description;
					}
				});
			},
			/** 预览*/
			previewResource: function(resource){
				var inParams = {
					resource: resource,
					type: "link"
				};
				$$preview.prepare(inParams,function(){
					$rootScope.modal.hide();
					//预览完毕执行
					if(!$rootScope.previewCallBack){
						$rootScope.previewCallBack = function(){
							$rootScope.modal.show();
						}
					}
				});
			}
		};
		/** 获取资源*/
		LINK.getShare($scope.id);
	});