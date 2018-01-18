/** 新联系人*/
var injects = ["$scope","$$widget","service","$rootScope","$$user","$injector"];
if (UPF.is("APP")){
	injects.push("$cordovaContacts");
}
var newContactDef = function($scope,$$widget,service,$rootScope,$$user,$injector,$cordovaContacts){
		$scope.pageConfig = {
			mcontacts: {
				start: 0,
				pageSize: $rootScope.CONFIG.page.mcontacts.pageSize, //查询数量
				hasMore: true, //是否还有
				lastId: null //验证id
			}
		};
		$scope.$on("$ionicView.enter",function(){
			/** 初始化执行*/
			service.validUser(function(){
				$scope.getInvitePage();
			});
		});

//		$scope.users = [];
//		$scope.mcontacts = [];
//		$scope.usersIndexOf = function(u){
//			var us = $scope.users;
//			for (var i=0; i<us.length;i++){
//				if (us[i].id  && us[i].id == u.id && us[i].type == u.type) return i;
//			}
//			return -1;
//		};
		/** 获取申请-初始化*/
		$scope.getInvitePage = function(){
			var params = {
				action: 'getInvitePage',
				method: 'post',
				data: {
					start: 0,
					pagesize: $scope.pageConfig.mcontacts.pageSize,
					loginname: $rootScope.USER.loginname
				},
				successCallback: function(result){
					if(result.result == 1){
						//处理申请
						for(var i in result.users){
							var u = result.users[i]; 
							if(u.id){
								u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
							}
						}
						$scope.users = result.users;
						//删除多加载的最后一个,保留id
						if(result.mcontacts.length == ($scope.pageConfig.mcontacts.pageSize+1)){
							$scope.pageConfig.mcontacts.lastId = result.mcontacts.pop().id;
						}
						//处理手机联系人
						for(var i in result.mcontacts){
							var u = result.mcontacts[i];
							if (u.id){
								u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
								u.reginfo = '(注册用户)';
							}else{
								u.avatar = config.defaultUserPhoto;
								u.reginfo = '(未注册)';
							}
						}
						/** 获取并缓存手机联系人头像*/
						if(UPF.is("app") && $rootScope.localConfig.cacheImage){
							var offline = $injector.get("$$mobile").offline;
							offline.loadLocalUserAvatar(result.mcontacts);
						}
						$scope.mcontacts = result.mcontacts;
						//重设start
						$scope.pageConfig.mcontacts.start = $scope.pageConfig.mcontacts.pageSize;
						//开启上拉刷新
						if(result.mcontacts.length == $scope.pageConfig.mcontacts.pageSize){
							$scope.pageConfig.mcontacts.hasMore = true;
							$scope.pagingForGetInvitePage();
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.getInvitePage();
						});
					}else{
						$scope.pageConfig.mcontacts.hasMore = false;
						$injector.get('toastr').error(result.description);
					}
					$scope.$broadcast('scroll.refreshComplete');
				},
				errorCallback: function(error){
					$scope.$broadcast('scroll.refreshComplete');
				}
			};
			$$user.action(params);
		};
		/** 获取申请-分页*/
		$scope.pagingForGetInvitePage = function(){
			var params = {
				action: 'getInvitePage',
				method: 'post',
				data: {
					start: $scope.pageConfig.mcontacts.start,
					pagesize: $scope.pageConfig.mcontacts.pageSize,
					loginname: $rootScope.USER.loginname
				},
				successCallback: function(result){
					if(result.result == 1){
						//表示有冲突
						if(result.type == 1){
							//删除多加载的最后一个,保留id
							if(result.mcontacts.length == ($scope.pageConfig.mcontacts.pageSize + $scope.pageConfig.mcontacts.start + 1)){
								$scope.pageConfig.mcontacts.lastId = result.mcontacts.pop().id;
							}
							$scope.mcontacts = result.mcontacts;
						}
						//顺序ok
						else{
							if(result.mcontacts && result.mcontacts.length>0){
								if(!$scope.mcontacts){
									$scope.mcontacts = [];
								}
								if(!$scope.users){
									//处理申请
									for(var i in result.users){
										var u = result.users[i]; 
										if(u.id){
											u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
										}
									}
									$scope.users = result.users;
								}
								//删除多加载的最后一个,保留id
								if(result.mcontacts.length == ($scope.pageConfig.mcontacts.pageSize+1)){
									$scope.pageConfig.mcontacts.lastId = result.mcontacts.pop().id;
								}
								//处理手机联系人
								for(var i in result.mcontacts){
									var u = result.mcontacts[i];
									if (u.id){
										u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
										u.reginfo = '(注册用户)';
									}else{
										u.avatar = config.defaultUserPhoto;
										u.reginfo = '(未注册)';
									}
								}
								//非重复追加
								var $$util = $injector.get('$$util');
								$$util.ARRAY.distinctPush($scope.mcontacts,result.mcontacts);
								/** 获取并缓存手机联系人头像*/
								if(UPF.is("app") && $rootScope.localConfig.cacheImage){
									var offline = $injector.get("$$mobile").offline;
									offline.loadLocalUserAvatar(result.mcontacts);
								}
							}
						}
						//取消上拉刷新
						if(result.mcontacts.length < $scope.pageConfig.mcontacts.pageSize){
							$scope.pageConfig.mcontacts.hasMore = false;
						}else{
							//重设下次的start
							$scope.pageConfig.mcontacts.start += $scope.pageConfig.mcontacts.pageSize;
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.pagingForGetInvitePage();
						});
					}else{
						$scope.pageConfig.mcontacts.hasMore = false;
					}
					$scope.$broadcast('scroll.infiniteScrollComplete');
				},
				errorCallback: function(error){
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}
			};
			$$user.action(params);
		};
		/**@deprecated
		 * 
		 */
		$scope.loadContact = function(){
			service.promiseProxy(function(promise){
				var param = {
					method:"POST",
					action:"getInvite",
					loginname:$rootScope.USER.loginname
				};
				$$user.go(promise,param);
			},function(result){
				if(result.result == 1){ //查询成功
					for(var i in result.users){
						var u = result.users[i]; 
						if(u.id){
							u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
//							var index = $scope.usersIndexOf(u); 
//							if (index>-1){
//								$scope.users[index] = u;
//							}else{
//								$scope.users.unshift(u);
//							}
						}
					}
					$scope.users = result.users;
					$scope.mcontacts = result.mcontacts;
					for(var i in result.mcontacts){
						var u = result.mcontacts[i];
						if (u.id){
							u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
							u.reginfo = '(注册用户)';
						}else{
							u.avatar = config.defaultUserPhoto;
							u.reginfo = '(未注册)';
						}
					}
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function () {
						$scope.loadContact();
					});
				}else{	//查询失败
					service.showMsg("error",result.description);
				}
			},undefined,function(){
				$scope.$broadcast("scroll.refreshComplete");  //针对下拉式刷新
			});
			
		};
		/**
		 * 同意申请
		 */
		$scope.acceptInvite = function(param){
			if(param.event){
				param.event.stopPropagation(); //阻止事件冒泡
			}
			service.promiseProxy(function(promise){
				var inParams = {
					friendid: param.user.id,
					inviteid: param.user.inviteid,
					groupid: param.user.groupid,
					type:param.user.type,
					method:'POST',
					action:'acceptInvite'
				};
				$$user.go(promise, inParams);
			},function(result){
				if(result.result == 1){ //成功
					param.user.state = 1;
					//通知
					$rootScope.$broadcast('zw.refreshContact');
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function(){
						$scope.acceptInvite(param);
					});
				}else{	//失败
					service.showMsg("error",result.description);
				}
			});
		};
		
		/** 操作*/
		$scope.operate = function(param){
			if(param.$event){
				param.$event.stopPropagation();
			}
			//顶部按钮
			var action = param.action;
			if(action == "topMenu"){
				$$widget.POPOVER.contactMenu($scope,"topMenu",$event);
			}
			//HD下拉按钮
			else if(action == 'toolMenu'){
				if($scope.users){
					angular.forEach($scope.users,function(user){
						if(param.user && param.user.inviteid == user.inviteid){
							user.showTool = !user.showTool;
						}else if(user.showTool){
							user.showTool = false;
						}
					});
				}
				if($scope.mcontacts){
					angular.forEach($scope.mcontacts,function(user){
						if(param.user && param.user.id == user.id){
							user.showTool = !user.showTool;
						}else if(user.showTool){
							user.showTool = false;
						}
					});
				}
			}
			//发送消息
			else if(action == 'sendMsg'){
				var inParams = {
					id:param.user.id,
					username:param.user.username,
					photo:param.user.avatar
				};
				service.$state.go("chat",inParams);
			}
			else if(action == "accept"){
				$scope.acceptInvite(param);
			}else if(action == "clickUser"){
				if(param.user.id){
					service.$state.go("showUser",{id:param.user.id});
				}
			}else if(action == "add"){
				param.event.stopPropagation(); //阻止事件冒泡
				var u = {
					type:4,
					loginname:param.user.mobile,
					username:param.user.mname
				}
				$$user.addFriend(u);
			}
			//移除申请
			else if(action == 'deleteInvite'){
				$scope.deleteInvite(param.user);
			}
			//移除联系人
			else if(action == 'deleteMcontact'){
				$scope.deleteMcontact(param.user);
			}
		};
		/** 删除申请
		 * type: 'invite'-删除申请
		 * type: other - 删除手机联系人
		 */
		$scope.deleteInvite = function(user,type){
			var params = {
				action: 'deleteInvite',
				method: 'post',
				data: {
					id: user.inviteid,
					type: 'invite'
				},
				successCallback: function(result){
					if(result.result == 1){
						var $$util = $injector.get('$$util');
						$$util.ARRAY.remove($scope.users, user); //移除array里的对象
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.deleteInvite(user);
						});
					}
				}
			};
			$$user.action(params);
		};
		/** 删除手机联系人*/
		$scope.deleteMcontact = function(user){
			var params = {
				action: 'deleteInvite',
				method: 'post',
				data: {
					id: user.friendid,
					type: 'mcontact'
				},
				successCallback: function(result){
					if(result.result == 1){
						var $$util = $injector.get('$$util');
						$$util.ARRAY.remove($scope.mcontacts, user); //移除array里的对象
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.deleteMcontact(user);
						});
					}
				}
			};
			$$user.action(params);
		};
		/** popover menu*/
		$scope.openPopover = function($event){
			var $ionicPopover = $injector.get('$ionicPopover');
			$ionicPopover.fromTemplateUrl('tpl/popover/newContact_popover.html',{scope: $scope})
				.then(function(popover){
					popover.show($event);
					$scope.popover = popover;
				});
		};
		/** 同步手机联系人*/
		$scope.uploadMobileContact = function(){
			if($scope.popover){$scope.popover.hide();}
			$$user.mobileContact.getContacts(function(contacts){
				var mc = $$user.mobileContact.formatContacts(contacts);
				var params = {
					action: 'saveMobileFriend',
					method: 'post',
					data: {
						jsonstring: JSON.stringify(mc)
					},
					successCallback: function(result){
						if(result.result == 1){
							localStorage.mobileContactRead = true;
							$scope.getInvitePage();
							service.showMsg('success',"成功读取"+result.count+"个联系人")
						}else if(result.result == 2){
							service.activeSessionProxy(function(){
								$$user.action(params);
							});
						}else{
							service.showMsg('error',result.description);
						}
					}
				};
				$$user.action(params);
			});
		};
		/** 监听全局点击*/
		$scope.$on("click",function(){
			if($scope.users){
				angular.forEach($scope.users,function(user){
					if(user.showTool){
						user.showTool = false;
					}
				});
				$scope.$digest();
			}
			if($scope.mcontacts){
				angular.forEach($scope.mcontacts,function(user){
					if(user.showTool){
						user.showTool = false;
					}
				});
				$scope.$digest();
			}
		});
	};
newContactDef.$inject = injects;
angular.module("app").controller("newContact", newContactDef);
