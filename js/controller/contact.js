/** 联系人*/
angular.module("app")
	.controller("contact",function($rootScope,$scope,$$widget,service,$$user,component,$$util,$$contact,$window,$stateParams,$ionicPopup,$injector){
		$scope.isMobile = UPF.is("APP");
		/** 分页配置*/
		$scope.pageConfig = {
			contact: {
				start: 0, //查询开始
				pageSize: $rootScope.CONFIG.page.contact.pageSize, //查询数量
				hasMore: true, //是否还有
				lastId: null //验证id
			}
		};
		
		/**打电话**/
		$scope.callphone = function(params){
			//禁止向上传播
			if(params.$event){
				params.$event.stopPropagation();
			}
			var phoneNo = params.phoneNo;
			if(phoneNo) $window.location.href="tel:"+phoneNo; 
		};
		/** 操作*/
		$scope.operate = function(param,$event){
			//禁止向上传播
			if(param.$event){
				param.$event.stopPropagation();
			}
			//顶部按钮
			var action = param.action;
			/** 搜索*/
			if(action == "search"){
				service.$state.go("searchContact");
			}
			else if(action == "sendMsg"){
				var inParams = {
					id:param.usr.id,
					username:param.usr.username,
					photo:param.usr.avatar
				};
				service.$state.go("chat",inParams);
			}
			/** 标题菜单*/
			else if(action == "topMenu"){
				$$widget.POPOVER.contactMenu($scope,"topMenu",$event);
			}
			/** 下拉菜单*/
			else if(action == "toolMenu"){
				//关闭其他人员
				angular.forEach($scope.contact.users,function(user){
					if(param.friend && user.id == param.friend.id){
						param.friend.showTool = !param.friend.showTool;
					}else if(user.showTool){
						user.showTool = false;
					}
				});
			}
			//点击企业进入企业详情
			else if(action == "clickorg"){
				var inParams = {};
				inParams.id = param.org.id; //orgid
				inParams.name = $injector.get('$ionicHistory').currentTitle();
				service.$state.go("showGroup",inParams);
			}else if(action == "clickNewContact"){
				$rootScope.newInvite = 0;
				localStorage['newInviteNo'+$rootScope.USER.id] = 0;
				service.$state.go("newContact");
			}else if(action == "clickuser"){
				var inParams = {};
				inParams.id = param.userid; //userid
				service.$state.go("showUser",inParams);
			}else if(action == "neworg"){
				service.$state.go("neworg",{title: '联系人'});
			}else if(action == "deleteFriend"){
//				service.initPopup(component.popup.remove($scope,param,"deleteFriend")); //删除弹窗
				var options = {
					title: "提醒",
					template: "<center>确定删除该好友?</center>",
					cancelText: "取消",
					okText: "确定"
				}
				$ionicPopup.confirm(options)
					.then(function(r){
						if(r){
							$scope.deleteFriend(param);
						}
					})
			}
		};
		/**
		 * 进入企业详情页面
		 * @param org 组织对象
		 */
		$scope.enterOrgDetailPage = function(org){
			var inParams = {
				id: org.id,
				backText: $injector.get('$ionicHistory').currentTitle()
			};
			$injector.get('$state').go("showGroup",inParams);
		};
		/**
		 * 进入企业成员列表
		 * @org 组织对象
		 */
		$scope.enterOrgMember = function(org){
			var inParams = {
				id: org.id,
				name: org.name,
				type: org.type
			};
			$injector.get('$state').go('contactOrg',inParams);
		};
		/**
		 * 进入群组页面
		 */
		$scope.enterGroupPage = function(){
			var inParams = {
				id: 0,
				type: 0
			};
			$injector.get('$state').go('group',inParams);
		};
		/**
		 * popover菜单项
		 */
		$scope.menuClick = function(param){
			if(param.event){
				param.event.stopPropagation();
				param.event.stopImmediatePropagation();
			}
			if (param.action == "newFriend"){
				$$widget.POPOVER.hide();
				service.$state.go("newFriend");
			}else if(param.action == "newOrg"){
				$$widget.POPOVER.hide();
				$scope.newOrg();
			}else if(param.action == "newGroup"){
				$$widget.POPOVER.hide();
				$$user.newGroup();
			}else if(param.action == "qrScan"){
				service.scanQr();
			}
		};
		/**
		 * 删除好友
		 */
		$scope.deleteFriend = function(param){
			var params={
				action:param.action,
				method:"POST",
				friendids:param.friend.id//删除多个用户请用<,>隔开
			};
			service.promiseProxy(function(promise){
				$$user.go(promise,params);
			},function(result){
				if(result.result == 1){ //查询成功
					// 数组删除元素
					$scope.contact.users = $$util.ARRAY.remove($scope.contact.users,param.friend);
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function(){
						$scope.deleteFriend(param);
					});
				}else{	//查询失败
					service.showMsg("error",result.description);
				}
			});
		};
		$scope.newOrg = function(){
			/** 关闭VIP
			var user = $rootScope.USER;
			if (user.orguser == 1 && user.userlevel == 0){
				service.showMsg("information","您目前只能属于一个企业，需要多个企业请升级为VIP用户");
			}else{
				service.$state.go("neworg");
			}
			*/
			service.$state.go("neworg",{title: '联系人'});
		};
		/** 通讯录*/
		$scope.CONTACT = {
			/** 获取通讯录*/
			getUserByDeptId: function(){
				var inParams = {
					type: 1,
					start: 0,
					pagesize: $scope.pageConfig.contact.pageSize
				};
				service.promiseProxy(function(promise){
					$$contact.getUserByDeptId(promise, inParams);
				},function(result){
					if(result.result == 1){
						$scope.contact = {};
						//企业
						if(result.groups){
							for(var i=0;i<result.groups.length;i++){
								var g = result.groups[i];
								if (g.photo){
									g.avatar = $$user.getPhoto(g.photo,g.updatetime);
								}else{
									if(g.type == 1){
										g.avatar = $rootScope.CONFIG.defaultOrgPhoto;
									}else{
										g.avatar = $rootScope.CONFIG.defaultDeptPhoto;
									}
								}
							}
							/** 获取并缓存企业、部门、群组头像*/
							if(UPF.is("app") && $rootScope.localConfig.cacheImage){
								var offline = $injector.get("$$mobile").offline;
								offline.loadLocalUserAvatar(result.groups);
							}
							$scope.contact.orgs = result.groups; //加载企业
						}
						//新的邀请
						if(result.newInvite){
							$rootScope.newInvite  = parseInt(result.newInvite);
							localStorage['newInviteNo'+$rootScope.USER.id] = $rootScope.newInvite;
						}
						//更新用户企业信息
						if(result.orguser){
							var user = {
								orguser: result.orguser
							};
							$$user.setLocalUser(null,user);
						}
						//加载联系人
						if(result.users){
							//删除多加载的最后一个用户，保留id
							if(result.users.length == ($scope.pageConfig.contact.pageSize + 1)){
								$scope.pageConfig.contact.lastId = result.users.pop().id;
							}
							//用户头像处理
							for(var i=0;i<result.users.length;i++){
								var u = result.users[i];
								u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
							}
							/** 获取并缓存用户头像*/
							if(UPF.is("app") && $rootScope.localConfig.cacheImage){
								var offline = $injector.get("$$mobile").offline;
								offline.loadLocalUserAvatar(result.users);
							}
							$scope.contact.users = result.users; //加载用户
							//开启上拉刷新
							if(result.users.length == $scope.pageConfig.contact.pageSize){
								$scope.pageConfig.contact.hasMore = true;
							}
							//重置start
							$scope.pageConfig.contact.start = $scope.pageConfig.contact.pageSize;
						}
					}else if(result.result == 2){	//session过期，自动激活
						service.activeSessionProxy(function(){
							$scope.CONTACT.getUserByDeptId();
						});
					}else{	//查询失败
						service.showMsg("error",result.description);
					}
				},null,function(){
					$scope.$broadcast("scroll.refreshComplete");
				});
			},
			/** 分页获取通讯录*/
			pagingForGetUserByDeptId: function(){
				var inParams = {
					type: 1,
					start: $scope.pageConfig.contact.start,
					pagesize: $scope.pageConfig.contact.pageSize,
					uid: $scope.pageConfig.contact.lastId
				};
				service.promiseProxy(function(promise){
					$$contact.getUserByDeptId(promise, inParams);
				},function(result){
					if(result.result == 1){ //查询成功
						if(!$scope.contact){
							$scope.contact = {};
						}
						//企业
						if(!$scope.contact.orgs){
							if(result.groups){
								for(var i=0;i<result.groups.length;i++){
									var g = result.groups[i];
									if (g.photo){
										g.avatar = $$user.getPhoto(g.photo,g.updatetime);
									}else{
										if(g.type == 1){
											g.avatar = $rootScope.CONFIG.defaultOrgPhoto;
										}else{
											g.avatar = $rootScope.CONFIG.defaultDeptPhoto;
										}
									}
								}
								/** 获取并缓存企业、部门、群组头像*/
								if(UPF.is("app") && $rootScope.localConfig.cacheImage){
									var offline = $injector.get("$$mobile").offline;
									offline.loadLocalUserAvatar(result.groups);
								}
								$scope.contact.orgs = result.groups; //加载企业
							}
						}
						//新的邀请
						$rootScope.newInvite = parseInt(result.newInvite);
						localStorage['newInviteNo'+$rootScope.USER.id] = $rootScope.newInvite;
						//用户头像处理
						for(var i=0;i<result.users.length;i++){
							var u = result.users[i];
							u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
						}
						//删除多加载的最后一个用户，保留id
						if(result.users.length == ($scope.pageConfig.contact.pageSize + 1)){
							$scope.pageConfig.contact.lastId = result.users.pop().id;
						}
						//表示有冲突
						if(result.type == 1){
							/** 获取并缓存用户头像*/
							if(UPF.is("app") && $rootScope.localConfig.cacheImage){
								var offline = $injector.get("$$mobile").offline;
								offline.loadLocalUserAvatar(result.users);
							}
							$scope.contact.users = result.users;
						}else{
							//用户
							if(result.users && result.users.length>0){
								if(!$scope.contact.users){
									$scope.contact.users = [];
								}
								/** 获取并缓存用户头像*/
								if(UPF.is("app") && $rootScope.localConfig.cacheImage){
									var offline = $injector.get("$$mobile").offline;
									offline.loadLocalUserAvatar(result.users);
								}
								//非重复追加
								$$util.ARRAY.distinctPush($scope.contact.users,result.users);
							}
						}
						//取消上拉刷新
						if(result.users.length < $scope.pageConfig.contact.pageSize){
							$scope.pageConfig.contact.hasMore = false;
						}else{
							//重设下次的start
							$scope.pageConfig.contact.start += $scope.pageConfig.contact.pageSize;
						}
					}else if(result.result == 2){	//session过期，自动激活
						service.activeSessionProxy(function(){
							$scope.CONTACT.pagingForGetUserByDeptId();
						});
					}else{	//查询失败
						$scope.pageConfig.contact.hasMore = false;
						service.showMsg("error",result.description);
					}
				},function(){
					$scope.pageConfig.contact.hasMore = false;
				},function(){
					$scope.$broadcast("scroll.infiniteScrollComplete");  //针对上拉式刷新
				});
			}
		};
		/** 监听全局点击*/
		$scope.$on("click",function(){
			if($scope.contact){
				//关闭其他人员
				angular.forEach($scope.contact.users,function(user){
					if(user.showTool){
						user.showTool = false;
					}
				});
				$scope.$digest();
			}
		});
		/**
		 * 监听刷新通知
		 */
		$rootScope.$on('zw.refreshContact',function(){
			$scope.CONTACT.getUserByDeptId();
		});
	});