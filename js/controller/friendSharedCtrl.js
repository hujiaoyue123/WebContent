/** 好友分享的*/
angular.module("app")
	.controller("friendSharedCtrl",function($scope,$rootScope,$state,service,$RESOURCE,$stateParams,$$share,$$data,$$preview,$$widget,$$util,$injector){
		/** @$stateParams
		 * friendid 用户id
		 */
		/** 操作
		 * type 操作类型
		 * share 资源分享信息
		 */
		$scope.operate = function(params){
			//禁止向上传播
			if(params.$event){
				params.$event.stopPropagation();
			}
			//关闭List侧滑按钮
			$injector.get("$ionicListDelegate").closeOptionButtons();
			/** 点击预览 */
			if(params.type == "clickResource"){
				if(params.resource.preview){//可预览文件
					var inParams = {
						resource: params.resource,
						id: $stateParams.friendid,
						type: "friendShared"
					};
					$$preview.prepare(inParams);
				}else{//不可预览
					$scope.operate({type: "fileDetail",resource: params.resource});
				};
			}
			/** 获取文件详情 */
			else if(params.type == "fileDetail"){
				var inParams = {
					id: params.resource.id,
					folderid: params.resource.folderid,
					rootid: $rootScope.USER.folderid
				};
				$state.go("fileDetail",inParams);
			}
			/** 点击下拉菜单*/
			else if(params.type == "toolMenu"){
				//关闭toolbar
				angular.forEach($scope.resources,function(resource){
					if(params.resource && resource.id == params.resource.id){
						params.resource.showTool = !params.resource.showTool;
					}else if(resource.showTool){
						resource.showTool = false;
					}
				});
			}
			/** 资源-删除
			 * params.resource
			 */
			else if(params.type == "deleteResource"){
				var options = {
					title: "提醒",
					template: "<center>确定删除该资源?</center>"
				};
				$$widget.POPUP.confirm(options)
					.then(function(result){
						if(result){
							$scope.RESOURCE.deleteResource(params.resource);
						}
					});
			}
			/** 资源-选择分享类型
			 * params.$event
			 * params.resource
			 */
			else if(params.type == "share"){
				$scope.showLinkPopup = true;   //显示分享入口
				$scope.showLinkPopupMlk = false; //不显示复制链接页
				$scope.showLinkPopupWxf = false; //不显示分享给微信好友
				$scope.tempResource = params.resource; //待分享资源
				//打开弹窗
				$$widget.POPUP.share.selectShare($scope);
			}
			/** 资源-生成链接*/
			else if(params.type == "makeLink"){
				$scope.showLinkPopup = false;  
				$scope.showLinkPopupMlk = true; //分享popup内容切换
				$scope.SHARE.addShare($scope.tempResource);
			}
			/** 资源-复制链接*/
			else if(params.type == "copyLink"){
				try {
					if(UPF.is("APP")){
						var mobile = $injector.get("$$mobile");
						mobile.copyLink($scope.shareLink);
					}else{
						clipboard.copyText($scope.shareLink);
					}
					service.showMsg("success","链接已复制");
				} catch (e) {
					service.showMsg("error","复制链接失败");
				}finally{
					$scope.showLinkPopupMlk = false;
					$$widget.POPUP.close(); //关闭Popup
				}
			}
			/** 资源-分享(微信朋友/圈)二维码
			 * params.resource
			 */
			else if(params.type == "wxfriend" ){
				$scope.showLinkPopup = false;
				$scope.showLinkPopupWxf = true;
				$scope.SHARE.addShare($scope.tempResource);
			}
			/** 资源-分享(掌文朋友)
			 * params.resource
			 */
			else if(params.type == "zwfriend"){
				$$widget.POPUP.close(); //关闭Popup
				var initParam = {
					excludes: $rootScope.USER.id,
					range: "all"
				};
				$$widget.MODAL.selectUser(initParam, function(data){
					var formString = [];
					angular.forEach(data,function(obj){
						//0 群组,1 企业，2 部门
						if(obj.type == 1 || obj.type == 0 || obj.type == 2){
							obj.type = "group";
						}else{
							obj.type = "user";
						}
						var newObj = {
							id: obj.id,
							sharetype: obj.type
						};
						formString.push(newObj);
					});
					var shareParam = {
						resourceid: $scope.tempResource.id,
						formString: JSON.stringify(formString),
						folderid: $scope.tempResource.folderid
					};
					$$share.addShare(shareParam,function(result){
						if(result.result == 1){
							service.showMsg("info",result.description);
						} else if(result.result == 2){
							service.activeSessionProxy(function(){
								$scope.operate(params);
							});
						} else {
							service.showMsg("error",result.description);
						}
					});
				});
			}
		};
		/** 获取好友分享的资源*/
		$scope.getFriendShare = function(){
			var params = {
				friendid: $stateParams.friendid
			};
			$$share.getFriendShare(params,function(result){
				if(result.result == 1){
					//处理资源数据
					$$data.oneDragonList(result.data);
					$scope.resources = result.data;
					$scope.$broadcast("scroll.refreshComplete");  //针对下拉式刷新
				}else if(result.result == 2){
					service.activeSessionProxy(function(){
						$scope.getFriendShare();
					});
				}else{
					service.showMsg("error",result.description);
				}
			});
		};
		/** 资源体*/
		$scope.RESOURCE = {
			/** 删除资源
			 * file
			 */
			deleteResource: function(resource){
				//封装参数
				var inParams = {
					deleteString: JSON.stringify([{id: resource.id,folderid: resource.folderid}])
				};
				//执行删除
				$RESOURCE.RESOURCE.deleteResource(inParams,function(result){
					if(result.result == 1){//删除成功
						$$util.ARRAY.remove($scope.resources, resource); //移除array里的对象
						//清除缓存
						var offline = $injector.get('$$mobile').offline;
						offline.clearSingleResourceCache(resource);
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.RESOURCE.deleteResource(resource);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			}
		};
		/** 分享体*/
		$scope.SHARE = {
			/** 添加分享获取分享id
			 * resource
			 * userList
			 */
			addShare: function(resource,userList){
				var inParams = {
					resourceid: resource.id,
					formString: JSON.stringify(userList || []),
					folderid: resource.folderid
				};
				$$share.addShare(inParams,function(result){
					if(result.result == 1){
						if(userList){
							service.showMsg("success",result.description);
						}else{
							$scope.shareLink = $$share.LINK.getLink(result.share.shareid);
						}
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.SHARE.addShare(resource,userList);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			}
		};
		/** 监听全局点击*/
		$scope.$on("click",function(){
			//关闭打开组
			//资源
			if($scope.resources){
				angular.forEach($scope.resources,function(resource){
					if(resource.showTool){
						resource.showTool = false;
					}
				});
				$scope.$digest();
			}
		});
		/** 视图进入*/
		$scope.$on("$ionicView.enter",function(){
			$scope.getFriendShare();
		});
	});