/** 联系人*/
angular.module("app")
	.controller("contactOrg",function($rootScope,$scope,$$widget,service,$$user,$stateParams,$$contact,$$util,$window,$injector){
		$scope.isPc = UPF.is("HD");
		/**
		 * $stateParams
		 * @param id 组织id
		 * @param name 组织名称
		 * @param type 组织类型
		 * @param
		 */
		$scope.$stateParams = $stateParams;
		//url参数
		$scope.params = {
			id: $stateParams.id, // orgid
			name: $stateParams.name, // orgname
			type: $stateParams.type
		}; 
		$injector.get('$ionicHistory').currentTitle($scope.params.name); //顶部标题
		//视图信息
		$scope.view = {
			name: "contactOrg",
			state: "contactOrg"
		};
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
			var action = param.action;
			// 发送消息操作
			if(action == "sendMsg"){
				var inParams = {
					id:param.usr.id,
					username:param.usr.username,
					photo:param.usr.avatar
				};
				service.$state.go("chat",inParams);
			}
			/** 顶部按钮 -- @deprecated*/
			else if(action == "topMenu"){
				$$widget.POPOVER.contactOrgMenu($scope,"topMenu",$event);
			}
			/** 下拉菜单*/
			else if(action == "toolMenu"){
				//关闭其他人员
				angular.forEach($scope.contact.users,function(user){
					if(param.user && user.id == param.user.id){
						param.user.showTool = !param.user.showTool;
					}else if(user.showTool){
						user.showTool = false;
					}
				});
			}
			// 点击个人
			else if(action == "clickuser"){
				var inParams = {};
				inParams.id = param.userid; //userid
				service.$state.go("showUser",inParams);
			}else if(action == "neworg"){
				service.$state.go("neworg");
			}else if(action == "search"){
				service.$state.go("searchContact",param);
			}
			//群组详情 --@deprecated
			else if(action == "groupDetial"){
				var inParam = {
					id: param.group.id,
					hxid: param.group.hxid,
					type: 0,
					name: param.group.name
				}
				service.$state.go("showGroup",inParam);
			}
		};
		/** 联系人*/
		$scope.CONTACT = {
			/** 获取通讯录*/
			getUserByDeptId: function(){
				var inParams = {
					start: 0,
					pagesize: $scope.pageConfig.contact.pageSize,
					id: $stateParams.id, //组织id
					type: $stateParams.type //组织类型
				};
				service.promiseProxy(function(promise){
					$$contact.getUserByDeptId(promise, inParams);
				},function(result){
					if(result.result == 1){ //查询成功
						$scope.isMember = result.isMember>-1; //当前用户属性-1不是当前群组成员，0普通成员，1群主，2管理员
						$scope.contact = {};
						//企业信息
						$scope.cgroup = result.cgroup;
						if ($scope.cgroup && ($scope.cgroup.id == $scope.params.id)){
							$scope.params = $scope.cgroup;
						}
						//部门头像
						for (var i in result.groups){
							var g = result.groups[i];
							if(g.photo){
								g.photo = $$user.getPhoto(g.photo,g.updatetime);
							}else{
								if(g.type == 1){
									g.photo = $rootScope.CONFIG.defaultOrgPhoto;
								}else{
									g.photo = $rootScope.CONFIG.defaultDeptPhoto;
								}
							}
						}
						/** 获取并缓存企业、部门头像*/
						if(UPF.is("app") && $rootScope.localConfig.cacheImage){
							var offline = $injector.get("$$mobile").offline;
							offline.loadLocalUserAvatar(result.groups);
						}
						$scope.contact.orgs = result.groups; //部门
						/** 分页处理开始...*/
						if(result.users){
							$scope.contact.managers = []; //管理员
							//用户头像
							for(var i in result.users){
								var u = result.users[i]; 
								u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
								//身份
								if (u.role == 2){ // || u.role == 1){
									$scope.contact.creator = u; //创建者
								}else if (u.role == 1){
									$scope.contact.managers.push(u.id); //管理员
								}
							}
							//删除多加载的最后一个用户，保留id
							if(result.users.length == ($scope.pageConfig.contact.pageSize + 1)){
								$scope.pageConfig.contact.lastId = result.users.pop().id;
							}
							/** 获取并缓存用户头像*/
							if(UPF.is("app") && $rootScope.localConfig.cacheImage){
								var offline = $injector.get("$$mobile").offline;
								offline.loadLocalUserAvatar(result.users);
							}
							$scope.contact.users = result.users; //常用联系人
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
			/** 分页获取*/
			pagingForGetUserByDeptId: function(){
				var inParams = {
					start: $scope.pageConfig.contact.start,
					pagesize: $scope.pageConfig.contact.pageSize,
					uid: $scope.pageConfig.contact.lastId,
					id: $stateParams.id, //组织id
					type: $stateParams.type //组织类型
				};
				service.promiseProxy(function(promise){
					$$contact.getUserByDeptId(promise, inParams);
				},function(result){
					if(result.result == 1){ //查询成功
						$scope.isMember = result.isMember>-1; //当前用户属性-1不是当前群组成员，0普通成员，1群主，2管理员
						if(!$scope.contact){
							$scope.contact = {};
						}
						//企业
						if(!$scope.cgroup){
							//企业信息
							$scope.cgroup = result.cgroup;
							if ($scope.cgroup && ($scope.cgroup.id == $scope.params.id)){
								$scope.params = $scope.cgroup;
							}
						}
						//部门、群组
						if(!$scope.contact.orgs){
							//部门头像
							for (var i in result.groups){
								var g = result.groups[i];
								if(g.photo){
									g.photo = $$user.getPhoto(g.photo,g.updatetime);
								}else{
									if(g.type == 1){
										g.photo = $rootScope.CONFIG.defaultOrgPhoto;
									}else{
										g.photo = $rootScope.CONFIG.defaultDeptPhoto;
									}
								}
							}
							/** 获取并缓存企业、部门头像*/
							if(UPF.is("app") && $rootScope.localConfig.cacheImage){
								var offline = $injector.get("$$mobile").offline;
								offline.loadLocalUserAvatar(result.groups);
							}
							$scope.contact.orgs = result.groups; //部门
						}
						if(!$scope.contact.managers){
							$scope.contact.managers = [];
						}
						/** 分页处理开始...*/
						if(result.users){
							//用户头像
							for(var i in result.users){
								var u = result.users[i]; 
								u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
								//身份
								if (u.role == 2){ // || u.role == 1){
									$scope.contact.creator = u; //创建者
								}else if (u.role == 1){
									$scope.contact.managers.push(u.id); //管理员
								}
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
							//取消上拉刷新
							if(result.users.length < $scope.pageConfig.contact.pageSize){
								$scope.pageConfig.contact.hasMore = false;
							}else{
								//重设下次的start
								$scope.pageConfig.contact.start += $scope.pageConfig.contact.pageSize;
							}
						}else{
							$scope.pageConfig.contact.hasMore = false;
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
		 * 判断是否显示“添加成员”的菜单项
		 * @description 1.企业/部门(role>0) 2.群组(id不为0)
		 */
		$scope.showAddUserMenu = function(){
			var t = $scope.params.type;
			var id = $scope.params.id;
			//群组
			if (t == 0 && id != 0){
				return true;
			}else if (t==0 && id==0){
				return false;
			}
			return $scope.isManager();
		};
		/**
		 * 判断是否显示“创建部门”的菜单项
		 * @description 企业/部门并且是成员
		 */
		$scope.showCreateDeptMenu = function(){
			if ($scope.params.type >0  && $scope.isMember){
				return true;
			}else{
				return false;
			}
		};
		/**
		 * @deprecated
		 * @description 判断是否显示“退出”的菜单项
		 */
		$scope.showQuitMenu = function(){
			var t = $scope.params.type;
			var id = $scope.params.id;
			if (t == 0 && id ==0){
				return false;
			}
			return $scope.isMember;
		};
		/**
		 * @description 菜单操作
		 */
		$scope.menuClick = function(param, $event){
			$scope.topMenu.hide();
			var action = param.action;
			//添加成员
			if (action == "addUserToDept"){
				$scope.addUserToDept();
			}
			//创建部门
			else if (action == "newDept"){
				$scope.newDept();
			}
			//创建群组
			else if(action == "newGroup"){
				$$user.newGroup({fn:function(r){
					if (r){
						$scope.CONTACT.getUserByDeptId();
					}
				}});
			}
			//退出组织
			else if(action == "quitGroup"){
				//$scope.quitGroup();
				$$widget.POPUP.quitGroupWin($scope);
			}
			//进入详情
			else if(action == "groupDetail"){
				var inParams = {
					id: $scope.cgroup.id || $stateParams.id
				};
				$injector.get('$state').go('showGroup',inParams);
			}
		};
		/**
		 * @description 创建部门
		 */
		$scope.newDept = function(){
			$$widget.POPUP.prompt({title:'新部门名称'}).then(function(s){
				if (s != undefined && s!=''){
					var addGroup = function(){
						var param = {
							parentid: $scope.params.id,
							type: 2,
							name: s,
							method: "POST",
							action: "addGroup"
						};
						service.promiseProxy(function(promise){
							$$user.go(promise,param);
						},function(result){
							if (result.result == 1){
								service.showMsg("success",result.description);
								$scope.CONTACT.getUserByDeptId();
							}else if(result.result == 2){ // session 过期
								service.activeSessionProxy(function(){
									addGroup();
								});
							}else if(result.result == 3){
								service.showMsg("success",result.description);
							}else{
								service.showMsg("error",result.description);
							}
						});
					};
					addGroup();
				}
			});
			
		};
		/**
		 * @description 是否有身份之人
		 */
		$scope.isManager = function(){
			var userid = $rootScope.USER.id;
			//判断是否创建人
			if ($scope.contact.creator && $scope.contact.creator.id == userid){
				return true;
			}
			//判断是否管理员
			for (var i=0; i<$scope.contact.managers.length; i++){
				if (userid == $scope.contact.managers[i]){
					return true;
				}
			}
			return false;
		};
		/**
		 * @description 查询群组所有成员id
		 */
		$scope.getAllUserIdByDeptId = function(id,successCallback,errorCallback){
			//查询该群组下所
			$$contact.getAllUserIdByDeptId(id,function(result){
				if(result.result == 1){
					if(successCallback){successCallback(result);}
				}else if(result.result == 2){
					service.activeSessionProxy(function(){
						$scope.getAllUserIdByDeptId(id,successCallback,errorCallback);
					});
				}else{
					if(errorCallback){ errorCallback();}
				}
			},function(){
				if(errorCallback){ errorCallback();}
			});
		};
		/**
		 * @description 添加成员
		 */
		$scope.addUserToDept = function(){
			var param = {};
			if ($scope.cgroup.type == 1){ // 给企业添加人员，仅选取非企业人员
//				param.type = 'user';
			}else if ($scope.cgroup.type == 0){ 
			}else{ //部门
				param = {// 部门加人，仅选取上级部门人员
					rootId:$scope.cgroup.parentid
				};
			}
			param.userCheckbox = true;
			//排除现有成员
			$scope.getAllUserIdByDeptId($stateParams.id,function(result){
				if(result.data && result.data.length>0){
					param.excludes = [];
					angular.forEach(result.data,function(value){
						param.excludes.push(value.id);
					});
				}
				openModal();
			},function(){
				openModal();
			});
			var openModal = function(){
				$$widget.MODAL.selectUser(param, function(data){
					var addUserToGroup = function(data){
						var ids = "[";
						for(var i =0; i<data.length; i++){
							var u = data[i];
							ids += "'"+u.id+"',";
						}
						ids = ids.substring(0,ids.length-1)+"]";
						var param = {
								groupid:$scope.params.id,
								grouptype: $scope.params.type,
								userids:ids,
								method:"POST",
								action:"addUserToGroup"
						};
						service.promiseProxy(function(promise){
							$$user.go(promise,param);
						},function(result){
							if (result.result == 1){
								service.showMsg("success","添加成功");
								$scope.CONTACT.getUserByDeptId();
								$rootScope.USER.orguser = '1';
							}else if(result.result == 2){ // session 过期
								service.activeSessionProxy(function(){
									addUserToGroup(data);
								});
							}else if(result.result == 3){
								service.showMsg("success","申请已提交，请等待审批");
							}else{
								service.showMsg("error",result.description);
							}
						});
					};
					addUserToGroup(data);
				});
			}
		};
		/**
		 * @description 退出组织
		 */
		$scope.quitGroup = function(){
			if ($scope.contact.creator && $scope.contact.creator.id == $rootScope.USER.id){
				var msg = '<center>您目前是创建人，请先转让再退出</center>';
				if ($scope.cgroup.type == 0){
					msg += '<br>如果您要解散群，请到群管理界面中操作';
				}
				$$widget.POPUP.alert({title:'您无法退出',template:msg});
			}else{
				var userids = "['"+$rootScope.USER.id+"']";
				$scope.deleteUserToGroup(userids, function(){
					if ($scope.params.type == 0 || $scope.params.type ==1){ //群组||企业
						service.$state.go("tab.contact");
						service.activeSessionProxy();
						//通知
						$rootScope.$broadcast('zw.refreshResource');
						$rootScope.$broadcast('zw.refreshContact');
					}else{
						var users = $scope.contact.users;
						for (var i=0; i<users.length;i++){
							if (users[i].id == $rootScope.USER.id){
								users.splice(i,1);
								break;
							}
						}
						$injector.get('$ionicHistory').goBack(); //回退
					}
				})
			}
		};
		/**
		 * @description 移除成员
		 */
		$scope.removeAUserFromGroup = function(params){
			if(params.$event){
				params.$event.stopPropagation(); //禁止向上传播
			}
			var userid = params.id;
			var userids = "['"+userid+"']";
			$scope.deleteUserToGroup(userids, function(){
				var users = $scope.contact.users;
				for (var i=0; i<users.length;i++){
					if (users[i].id == userid){
						users.splice(i,1);
						return;
					}
				}
			});
		};
		/**
		 * @description 移除成员
		 */
		$scope.deleteUserToGroup = function(userids, fn){
			var param = {
				groupid:$scope.params.id,
				type:$scope.params.type,
				userids:userids,
				method:"POST",
				action:"deleteUserToGroup"
			};
			service.promiseProxy(function(promise){
				$$user.go(promise,param);
			},function(result){
				if (result.result == 1){
//					service.showMsg("success","成功");
					if (fn){fn(userids);}
				}else if(result.result == 2){ // session 过期
					service.activeSessionProxy(function(){
						$scope.deleteUserToGroup(userids, fn);
					});
				}else if(result.result == 3){
					var msg = '';
					for(var i=0;i<result.data.length;i++){
						var a = result.data[i];
						msg += a.user.username+"(";
						for(var j=0;j<a.groups.length;j++){
							msg+= a.groups[j].name+",";
						}
						msg = msg.slice(0,msg.length-1);
						msg += ")<br>";
					}
					//service.showMsg("info",msg);
					$$widget.POPUP.alert({title:'用户是部门领导，无法删除',template:msg});
				}else{
					service.showMsg("error",result.description);
				}
			});
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
		$rootScope.$on('zw.refreshContactOrg',function(){
			$scope.CONTACT.getUserByDeptId();
		});
		/**
		 * 视图进入之间
		 */
		$scope.$on('$ionicView.enter',function(){
			//当前视图没有使用view-title会导致history没有title,所有设置下
			$injector.get('$ionicHistory').currentTitle($scope.params.name); //顶部标题
		});
	});