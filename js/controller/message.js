/** 消息控制器*/
angular.module("app")
	.controller("message",function($scope,$$widget,service,$$user,$rootScope,$$chat,$injector){
		/**
		 * 获取最新公告
		 */
		$scope.getNewestGA = function(){
			var $$http = $injector.get('$$http');
			var params = {
				url: $rootScope.CONFIG.itf.user.getNewestGA,
				method: 'get',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid
				},
				successCallBack: function(result){
					if(result.result == 1){
						if(!$injector.get('$$util').isEmptyObject(result.data)){
							$scope.notice = result.data;
						}
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.getNewestGA();
						});
					}
				}
			};
			$$http.HTTP(params);
		};
		/**
		 * 下拉刷新
		 */
		$scope.onRefresh = function(){
			$scope.loadMsgList();
			$scope.getNewestGA();
		};
		//企业公告
		$scope.noticeMessage = function(){
			var params = {
				urlType: 'all'
			};
			$injector.get('$state').go('notice',params);
		};
		
		$scope.messages = new Array();
		$scope.chatState = {state:'opening'};
		if ($$chat.loginOK){
			$scope.chatState.state = "loginOK";
		}
		/** 操作*/
		$scope.operate = function(param,$event){
			var action = param.action;
			if(param.$event){ //停止事件冒泡
				param.$event.stopPropagation();
			}
			/** 右上角菜单*/
			if(action == "topMenu"){
				$$widget.POPOVER.msgMenu($scope,"topMenu",param.event);
			}
			/** 点击下拉菜单*/
			else if(action == "toolMenu"){
				//关闭其他
				//资源
				angular.forEach($scope.messages,function(message){
					if(param.msg && message.id == param.msg.id){
						param.msg.showTool = !param.msg.showTool;
					}else if(message.showTool){
						message.showTool = false;
					}
				});
			}
			/** 删除消息*/
			else if(action == "deleteMsg"){
				$$chat.deleteCoversation(param.msg.id);
			}
		};
		/** 加载消息*/
		$scope.loadMsgList = function(){
			if($$chat.initOK){
				 $$chat.getMsgs({callback:function(msgs){
					 $scope.messages = msgs; 
					 $scope.$broadcast("scroll.refreshComplete");
				}});
				return;
			}
		};
		/** 聊天*/
		$scope.chat = function(param){
			var p = {id:param.id,type:param.type,hxid:param.hxid}
			if (param.type == "groupchat"){
				p.id = param.groupid || param.groupId;
				p.hxid = param.hxid || param.peerId;
			}
			service.$state.go("chat",p);
		};
		
		$scope.$on("chatMsg",function(e, d){
			$scope.chatState.state = d.msg;
			if(d.msg == "gotMsg"){
				//$scope.loadMsgList();
			}
			try{
				$scope.$digest();
			}catch(e){
				
			}
		});
		/** 监听全局点击*/
		$scope.$on("click",function(){
			//关闭打开组
			//消息
			if(UPF.is("HD") && $scope.messages){
				angular.forEach($scope.messages,function(message){
					if(message.showTool){
						message.showTool = false;
					}
				});
				$scope.$digest();
			}
		});
		/** 视图进入*/
		$scope.$on("$ionicView.enter",function(){
			/** 初始化执行*/
			service.validUser();
			$scope.getNewestGA();
			$scope.loadMsgList();
		});
	});