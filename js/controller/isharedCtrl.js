/** 我分享的*/
angular.module("app")
	.controller("isharedCtrl",function($scope,service,component,$$widget,$$share,$$user,$$data,$$util){
		/** 操作
		 * params{share,$event}
		 */
		$scope.operate = function(params){
			//禁止向上传播
			if(params.$event){
				params.$event.stopPropagation();
			}
			var action = params.action;
			/** 下拉菜单*/
			if(action == "toolMenu"){
				//关闭其他人员
				angular.forEach($scope.shareList,function(share){
					if(params.share && share.shareid == params.share.shareid){
						params.share.showTool = !params.share.showTool;
					}else if(share.showTool){
						share.showTool = false;
					}
				});
			}
			//选择分享类型
			if(action == "share"){
				$$widget.POPUP.share.selectShare($scope);
			}
			//删除分享提醒
			else if(action == "remove"){ 
				$$widget.POPUP.share.deleteShare(function(){
					$scope.SHARE.remove(params.share);
				});
			}
			//选择：分享好友
			else if(action == "zwfriend"){ 
				service.popupWindow.close(); //关闭Popup
				var params = {
					type: "share",
					rid: share.resource.id,
					ctrl: share.ctrl
				};
				service.$state.go("friend",params);
			}
			//链接
			else if(action == "link"){
				service.popupWindow.close(); //关闭Popup
				var status = share; //拷贝状态
				service.onCopy(status);
			}
			//微信朋友/朋友圈
			else if(action == "wxfriend" || action == "wxtimeline"){
				//处理与分享
				wxservice.shareExecute($scope,file,type);
			}
		};
		/** 分享*/
		$scope.SHARE = {
			/** 查询分享*/
			getShareMeTo: function(){
				$$share.getShareMeTo(function(result){
					if(result.result == 1){
						for(var i=0;i<result.sub.length;i++){
							$$data.type(result.sub[i].resource); //文件格式
							$$data.icon(result.sub[i].resource); //文件显示图标
							result.sub[i].resource.createtime = $$data.DATE.humanize(result.sub[i].resource.createtime); //创建日期处理
						}
						$scope.shareList = result.sub;
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.SHARE.getShareMeTo();
						});
					}
				},null,function(){
					$scope.$broadcast("scroll.refreshComplete");
				});
			},
			/** 删除分享*/
			remove: function(share){
				var inParams = {
					id: share.id,
					type: "me"
				};
				$$share.delShare(inParams,function(result){
					if(result.result == 1){
						$$util.ARRAY.remove($scope.shareList,share); //移除array里的对象
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.SHARE.remove(share);
						});
					}
				});
			}
		};
		/** 初始化执行*/
		$scope.$on("$ionicView.enter",function(){
			/** 初始化执行*/
			service.validUser(function(){
				$scope.SHARE.getShareMeTo();
			});
		});
		/** 监听全局点击*/
		$scope.$on("click",function(){
			if($scope.shareList){
				//关闭其他人员
				angular.forEach($scope.shareList,function(share){
					if(share.showTool){
						share.showTool = false;
					}
				});
				$scope.$digest();
			}
		});
	});