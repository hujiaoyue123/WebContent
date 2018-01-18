/** 移动文件*/
angular.module("app")
	.controller("selectUser",function($scope,$rootScope,service,$$user,$$data,$$widget,$ionicScrollDelegate,$timeout,$RESOURCE,$$util,$$contact,$injector){
		/**
		 * 参数 selectParam 说明：
		 * range: all表示全部可选，user表示仅用户可选(目前不传值默认仅用户可选)
		 *  
		 * checkbox: true|false, 如果range=‘all’， checkbox强制为true
		 * 
		 * rootId: 表示根id，如果为空则从根开始选，包括机构，群组和好友
		 *  
		 * type: user, 仅查询rootId下面的用户，不查询下级部门，0:仅查询群组, 1:仅查询企业，2:仅查询部门
		 * 
		 * depth:选择深度，不设值或值为0时，深度不限，否则只选择到该深度
		 * 
		 * excludes: 数组，需要排除的机构/部门的id
		 * 
		 * title: 选择框标题，默认为"选择用户"
		 * 
		 * selected: 数组，默认已选择的用户数组
		 * 
		 * excludeCondition: 条件判断，满足时，排除
		 * 
		 * selectedCondition: 条件判断， 满足时，自动添加
		 * 
		 * selectMax: 最多能选择多少个
		 * 
		 * selectMin: 最少选择多少，默认是1
		 * 
		 * userCheckbox: true|false,仅控制user的复选框
		 * 
		 * showGroup: true|false,是否显示群组项
		 */
		$scope.fn = $scope.$parent.fn;
		$scope.modal = $scope.$parent.selectUser;
		$scope.title = $scope.selectParam.title || "选择用户";
		$scope.users = $scope.selectParam.selected || [];
		$scope.selectMin = $scope.selectParam.selectMin;
		if ($scope.selectMin == undefined){
			$scope.selectMin = 1;
		}
		$scope.excludes = $scope.selectParam.excludes;
		$scope.excludeCondition = $scope.selectParam.excludeCondition;
		$scope.selectedCondition = $scope.selectParam.selectedCondition;
		$scope.parent = [];
		
		for(var i=0; i<$scope.users.length; i++){
			$scope.users[i].checked = true;
		}
		$scope.search = {}; //搜索
		//是否显示选择checkbox
		if ($scope.selectParam.range == 'all'){
			$scope.selectParam.checkbox = true;
		}
		/** 分页配置*/
		$scope.pageConfig = {
			contact: {
				start: 0, //查询开始
				pageSize: $rootScope.CONFIG.page.contact.pageSize, //查询数量
				hasMore: true, //是否还有
				lastId: null //验证id
			},
			search: {
				start: 0, //查询开始
				pageSize: $rootScope.CONFIG.page.search.pageSize, //查询数量
				hasMore: false, //是否还有
				lastId: null //验证id
			}
		};
		/** 操作*/
		$scope.operate = function(param){
			if(param.type == "beforeDelete"){
				if(!UPF.is('ios') && $scope.users.length > 0){
					var lastItem = $scope.users[$scope.users.length - 1];
					if(lastItem.delmark){ // 执行删除
						lastItem.checked = false;
						lastItem.delmark = false;
						$scope.users.pop();
					}else{ //标记
						for(var i in $scope.users){
							$scope.users[i].delmark = false;
						}
						lastItem.delmark = true;
					}
				}
			}else if(param.type == "back"){
				if($scope.parent.length>0){
					$scope.parent.pop();
					var org = $scope.parent[$scope.parent.length-1];
					$scope.CONTACT.getUserByDeptId(org);
				}else{
					$$widget.MODAL.remove();
				}
			}
		};
		$scope.newGroupProxy = {
			/** 选人 */
			select: function(user, event){
				if (event){
					event.stopPropagation();
				}
				if (!user.checked && $scope.selectParam.selectMax && $scope.users.length >= $scope.selectParam.selectMax){
					service.showMsg("info","只能选择"+$scope.selectParam.selectMax+"个");
					return;
				}
				user.checked = !user.checked;
				if (user.checked){
					var repeat = false;
					for(var i in $scope.users){
						$scope.users[i].delmark = false;
						if($scope.users[i].id == user.id){
							repeat = true;
							break;
						}
					}
					if(!repeat){
						$scope.users.push(user);
						$ionicScrollDelegate.$getByHandle("zwSelectImages").scrollBottom();
					}
				}else{
					$scope.newGroupProxy.deleteUser(user);
				}
			},
			deleteUser: function(user){
				var index = -1;
				for (var i = 0; i < $scope.users.length; i++) {
					$scope.users[i].delmark = false;
					if ($scope.users[i].id == user.id) {
						index = i;
					}
				}
				if (index > -1) {
					var objs = $scope.users.splice(index, 1);
					objs[0].checked = false;
					$ionicScrollDelegate.$getByHandle("zwSelectImages").scrollBottom();
				}
			},
			deleteUserKeyup: function(e){
				var keycode = window.event?e.keyCode:e.which;
	            if(keycode == 8){
	            	
					var u = $scope.users.pop();
					if (u){ u.checked = false;}
	            }
			},
			showTips: function(user){
				if (!user.delmark){
					for(var i in $scope.users){
						$scope.users[i].delmark = false;
					}
					user.delmark = true;
					$scope.selectUserTip = (user.name || user.username)+" (再次点击删除)";
					$scope.showTip = true;
					$timeout(function(){$scope.showTip = false;},1000);
				}else{
					$scope.newGroupProxy.deleteUser(user);
					user.delmark = false;
				}
			},
			/** 保存*/
			save: function(){
//				if($scope.users.length > 0){
					$scope.fn($scope.users);
					$$widget.MODAL.remove();
//				} else {
//					service.showMsg("error","最少要添加一个成员！");
//				}
			},
			/** 关闭 */
			remove: function(){
				$scope.users = [];
				$$widget.MODAL.remove();
			}
		};
		/** 通讯录*/
		$scope.CONTACT = {
			/** 获取通讯录*/
			getUserByDeptId: function(org){
				var inParams = {
					start: 0,
					pagesize: $scope.pageConfig.contact.pageSize
				};
				if(org && (org.id || org.id == 0)){
					if($scope.parent[$scope.parent.length-1].id != org.id){
						$scope.parent.push(org);
					}
					inParams.id = org.id; //组织id
				}else if($scope.selectParam.rootId && $scope.selectParam.rootId!="root"){
					inParams.id = $scope.selectParam.rootId;
				}
				//组织类型
				if(org && (org.type || org.type == 0)){
					inParams.type = org.type;
				}else if($scope.selectParam.type){
					inParams.type = $scope.selectParam.type;
				}
				//是否显示群组列表
				if(inParams.type == 0){
					$scope.showGroup = true;
				}else{
					$scope.showGroup = false;
				}
				//深度
				if ($scope.selectParam.depth){
					if ($scope.parent.length >= $scope.selectParam.depth){
						inParams.type = 'user';
					}
				}
				
				var execute = function(){
					service.promiseProxy(function(promise){
						$$contact.getUserByDeptId(promise, inParams);
					},function(result){
						if(result.result == 1){
							if($scope.newGroup){
								$scope.newGroup.orgs = [];
								$scope.newGroup.users = [];
							}else{
								$scope.newGroup = {};
							}
							if($scope.excludes || $scope.excludeCondition || $scope.selectedCondition){
								if(result.groups){
									for(var i=result.groups.length-1; i>-1;i--){
										if (($scope.excludeCondition && $scope.excludeCondition(result.groups[i])) || ($scope.excludes && ($scope.excludes.indexOf(result.groups[i].id) >-1))){
											result.groups.splice(i,1);
										}else if($scope.selectedCondition && $scope.selectedCondition(result.groups[i])){
											if ($scope.users && ($scope.users.indexOf(result.groups[i]) < 0)){
												$scope.users.push(result.groups[i]);
											}
										}
									}
								}
								if(result.users){
									for(var i=result.users.length-1; i>-1;i--){
										if (($scope.excludeCondition && $scope.excludeCondition(result.users[i])) || ($scope.excludes && ($scope.excludes.indexOf(result.users[i].id) >-1))){
											result.users.splice(i,1);
										}else if($scope.selectedCondition && $scope.selectedCondition(result.users[i])) {
											if ($scope.users && ($scope.users.indexOf(result.users[i]) < 0)){
												$scope.users.push(result.users[i]);
											}
										}
									}
								}
							}
							//群组
							if (result.orgtype == 0){
								for(var i in result.groups){
									var g = result.groups[i];
									if(g.photo){
										g.photo = $$user.getPhoto(g.photo,g.updatetime);
										g.avatar = g.photo;
									}else{
										for(var p in g.photos){
											g.photos[p] = $$user.getPhoto(g.photos[p],g.updatetime);
										}
									}
								}
								$scope.newGroup.groups = result.groups;
							}else{ //企业
								for(var i in result.groups){
									var org = result.groups[i]; 
									if(org.photo){
										org.avatar = $$user.getPhoto(org.photo,org.updatetime);
									}else{
										if(org.type == 1){
											org.avatar = $rootScope.CONFIG.defaultOrgPhoto;
										}else{
											org.avatar = $rootScope.CONFIG.defaultDeptPhoto;
										}
									}
								}
								$scope.newGroup.orgs = result.groups;
							}
							//用户
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
								$scope.newGroup.users = result.users; //加载用户
								//开启上拉刷新
								if(result.users.length == $scope.pageConfig.contact.pageSize){
									$scope.pageConfig.contact.hasMore = true;
								}
								//重置start
								$scope.pageConfig.contact.start = $scope.pageConfig.contact.pageSize;
							}
							//针对checkbox
							if(($scope.selectParam.checkbox || $scope.selectParam.userCheckbox) && $scope.users.length>0){
								angular.forEach($scope.users,function(obj){
									//处理企业
									angular.forEach($scope.newGroup.orgs,function(org){
										if(obj.id == org.id){
											org.checked = true;
										}
									});
									//处理用户
									angular.forEach($scope.newGroup.users,function(user){
										if(obj.id == user.id){
											user.checked = true;
										}
									});
								});
							}
							//scroll到顶部
							$injector.get('$ionicScrollDelegate').$getByHandle('selectUserScrollDelegate').scrollTop();
						}else if(result.result == 2){	//session过期，自动激活
							service.activeSessionProxy(function(){
//								$scope.CONTACT.getUserByDeptId(org);
								execute();
							});
						}else{	//查询失败
							service.showMsg("error",result.description);
						}
					},null,function(){
						$scope.$broadcast("scroll.refreshComplete");
					});
				};
				execute();
			},
			/** 分页获取通讯录*/
			pagingForGetUserByDeptId: function(){
				var inParams = {
					start: $scope.pageConfig.contact.start,
					pagesize: $scope.pageConfig.contact.pageSize,
					uid: $scope.pageConfig.contact.lastId
				};
				//组织类型
				if($scope.parent.length > 0 && ($scope.parent[$scope.parent.length-1].type || $scope.parent[$scope.parent.length-1].type==0)){
					if($scope.parent[$scope.parent.length-1].type==0){
						$scope.pageConfig.contact.hasMore = false;
						return;
					}
					inParams.type = $scope.parent[$scope.parent.length-1].type;
				}else if($scope.selectParam.type){
					inParams.type = $scope.selectParam.type;
				}
				//深度
				if ($scope.selectParam.depth){
					if ($scope.parent.length >= $scope.selectParam.depth){
						inParams.type = 'user';
					}
				}
				//根据parent来确定当前位置
				if($scope.parent.length>0){
					var obj = $scope.parent[$scope.parent.length-1];
					if(obj.id){
						inParams.id = obj.id;
					}
				}else if($scope.selectParam.rootId){
					inParams.id = $scope.selectParam.rootId;
					$scope.parent.push({id: $scope.selectParam.rootId});
				}else if(!$scope.selectParam.rootId){
					$scope.parent.push("root");
				}
				var execute = function(){
					service.promiseProxy(function(promise){
						$$contact.getUserByDeptId(promise, inParams);
					},function(result){
						if(result.result == 1){ //查询成功
							if(!$scope.newGroup){
								$scope.newGroup = {};
							}
							if($scope.excludes || $scope.excludeCondition || $scope.selectedCondition){
								if(result.groups){
									for(var i=result.groups.length-1; i>-1;i--){
										if (($scope.excludeCondition && $scope.excludeCondition(result.groups[i])) || ($scope.excludes && ($scope.excludes.indexOf(result.groups[i].id) >-1))){
											result.groups.splice(i,1);
										}else if($scope.selectedCondition && $scope.selectedCondition(result.groups[i])){
											if ($scope.users && ($scope.users.indexOf(result.groups[i]) < 0)){
												$scope.users.push(result.groups[i]);
											}
										}
									}
								}
								if(result.users){
									for(var i=result.users.length-1; i>-1;i--){
										if (($scope.excludeCondition && $scope.excludeCondition(result.users[i])) || ($scope.excludes && ($scope.excludes.indexOf(result.users[i].id) >-1))){
											result.users.splice(i,1);
										}else if($scope.selectedCondition && $scope.selectedCondition(result.users[i])) {
											if ($scope.users && ($scope.users.indexOf(result.users[i]) < 0)){
												$scope.users.push(result.users[i]);
											}
										}
									}
								}
							}
							//群组
							if (result.orgtype == 0 && !$scope.newGroup.groups){
								for(var i in result.groups){
									var g = result.groups[i];
									if(g.photo){
										g.photo = $$user.getPhoto(g.photo,g.updatetime);
									}else{
										for(var p in g.photos){
											g.photos[p] = $$user.getPhoto(g.photos[p],g.updatetime);
										}
									}
								}
								$scope.newGroup.groups = result.groups;
							}else if(!$scope.newGroup.orgs){ //企业
								for(var i in result.groups){
									var org = result.groups[i]; 
									if(org.photo){
										org.avatar = $$user.getPhoto(org.photo,org.updatetime);
									}else{
										if(org.type == 1){
											org.avatar = $rootScope.CONFIG.defaultOrgPhoto;
										}else{
											org.avatar = $rootScope.CONFIG.defaultDeptPhoto;
										}
									}
								}
								$scope.newGroup.orgs = result.groups;
							}
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
								$scope.newGroup.users = result.users;
							}else{
								//用户
								if(result.users && result.users.length>0){
									if(!$scope.newGroup.users){
										$scope.newGroup.users = [];
									}
									//非重复追加
									$$util.ARRAY.distinctPush($scope.newGroup.users,result.users);
								}
							}
							//针对checkbox
							if(($scope.selectParam.checkbox || $scope.selectParam.userCheckbox) && $scope.users.length>0){
								angular.forEach($scope.users,function(obj){
									//处理企业
									angular.forEach($scope.newGroup.orgs,function(org){
										if(obj.id == org.id){
											org.checked = true;
										}
									});
									//处理用户
									angular.forEach($scope.newGroup.users,function(user){
										if(obj.id == user.id){
											user.checked = true;
										}
									});
								});
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
//								$scope.CONTACT.pagingForGetUserByDeptId();
								execute();
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
				};
				execute();
			}
		};
		/** 搜索体*/
		$scope.SEARCH = {
			/** 搜索用户
			 * text 搜索内容 $scope.search.text
			 */
			searchUser: function(text){
				if(!text){
					//scroll到顶部
					$injector.get('$ionicScrollDelegate').$getByHandle('selectUserScrollDelegate').scrollTop();
					return;
				}
				var inParams = {
					start: 0,
					pagesize: $scope.pageConfig.search.pageSize,
					txt: text,
					type: "user",
					parentid: $scope.getCurrentParentId()
				};
				$RESOURCE.SEARCH.search(inParams,function(result){
					if(result.result == 1){
						//针对输入法拼音
						if(text != $scope.search.text){
							return;
						}
						if(!$scope.search){
							$scope.search = {};
						}
						//用户头像处理
						for(var i=0;i<result.data.users.length;i++){
							var u = result.data.users[i];
							u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
						}
						//删除多加载的最后一个用户，保留id
						if(result.data.users.length == ($scope.pageConfig.search.pageSize + 1)){
							$scope.pageConfig.search.lastId = result.data.users.pop().id;
						}
						//搜索排除已有成员
						if($scope.excludes || $scope.excludeCondition || $scope.selectedCondition){
							if(result.data.users){
								for(var i=result.data.users.length-1; i>-1;i--){
									if (($scope.excludeCondition && $scope.excludeCondition(result.data.users[i])) || ($scope.excludes && ($scope.excludes.indexOf(result.data.users[i].id) >-1))){
										result.data.users.splice(i,1);
									}else if($scope.selectedCondition && $scope.selectedCondition(result.data.users[i])) {
										if ($scope.users && ($scope.users.indexOf(result.data.users[i]) < 0)){
											$scope.users.push(result.data.users[i]);
										}
									}
								}
							}
						}
						//用户
						$scope.search.users = result.data.users;
						//针对checkbox
						if(($scope.selectParam.checkbox || $scope.selectParam.userCheckbox) && $scope.users.length>0){
							angular.forEach($scope.users,function(obj){
								//处理用户
								angular.forEach($scope.search.users,function(user){
									if(obj.id == user.id){
										user.checked = true;
									}
								});
							});
						}
						//重置start
						$scope.pageConfig.search.start = $scope.pageConfig.search.pageSize;
						//开启上拉刷新
						if($scope.search.users.length > 0 && $scope.search.users.length == $scope.pageConfig.search.pageSize){
							$scope.pageConfig.search.hasMore = true;
						}
						//scroll到顶部
						$injector.get('$ionicScrollDelegate').$getByHandle('selectUserScrollDelegate').scrollTop();
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.SEARCH.searchUser(text);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			},
			/** 分页搜索*/
			pagingForSearchUser: function(){
				if(!$scope.search.text){
					$scope.$broadcast("scroll.infiniteScrollComplete"); //针对下拉式刷新
					return;
				}
				var inParams = {
					start: $scope.pageConfig.search.start,
					pagesize: $scope.pageConfig.search.pageSize,
					uid: $scope.pageConfig.search.lastId,
					txt: $scope.search.text,
					type: "user",
					parentid: $scope.getCurrentParentId()
				};
				$RESOURCE.SEARCH.search(inParams,function(result){
					if(result.result == 1){
						if(!$scope.search){
							$scope.search = {};
						}
						//用户头像处理
						for(var i=0;i<result.data.users.length;i++){
							var u = result.data.users[i];
							u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
						}
						//表示有冲突
						if(result.type == 1){
							//删除多加载的最后一个用户，保留id
							if(result.data.users.length == ($scope.pageConfig.search.pageSize + 1)){
								$scope.pageConfig.search.lastId = result.data.users.pop().id;
							}
							//搜索排除已有成员
							if($scope.excludes || $scope.excludeCondition || $scope.selectedCondition){
								if(result.data.users){
									for(var i=result.data.users.length-1; i>-1;i--){
										if (($scope.excludeCondition && $scope.excludeCondition(result.data.users[i])) || ($scope.excludes && ($scope.excludes.indexOf(result.data.users[i].id) >-1))){
											result.data.users.splice(i,1);
										}else if($scope.selectedCondition && $scope.selectedCondition(result.data.users[i])) {
											if ($scope.users && ($scope.users.indexOf(result.data.users[i]) < 0)){
												$scope.users.push(result.data.users[i]);
											}
										}
									}
								}
							}
							$scope.search.users = result.data.users;
							//重设下次的start
							$scope.pageConfig.search.start += $scope.pageConfig.search.pageSize;
						}else{
							//用户
							if(result.data.users && result.data.users.length>0){
								if(!$scope.search.users){
									$scope.search.users = [];
								}
								//删除多加载的最后一个用户，保留id
								if(result.data.users.length == ($scope.pageConfig.search.pageSize + 1)){
									$scope.pageConfig.search.lastId = result.data.users.pop().id;
								}
								//搜索排除已有成员
								if($scope.excludes || $scope.excludeCondition || $scope.selectedCondition){
									if(result.data.users){
										for(var i=result.data.users.length-1; i>-1;i--){
											if (($scope.excludeCondition && $scope.excludeCondition(result.data.users[i])) || ($scope.excludes && ($scope.excludes.indexOf(result.data.users[i].id) >-1))){
												result.data.users.splice(i,1);
											}else if($scope.selectedCondition && $scope.selectedCondition(result.data.users[i])) {
												if ($scope.users && ($scope.users.indexOf(result.data.users[i]) < 0)){
													$scope.users.push(result.data.users[i]);
												}
											}
										}
									}
								}
								//非重复追加
								$$util.ARRAY.distinctPush($scope.search.users, result.data.users);
							}
							//取消上拉刷新
							if(result.data.users.length == 0 || result.data.users.length < $scope.pageConfig.search.pageSize){
								$scope.pageConfig.search.hasMore = false;
							}else{
								//重设下次的start
								$scope.pageConfig.search.start += $scope.pageConfig.search.pageSize;
							}
						}
						//针对checkbox
						if(($scope.selectParam.checkbox || $scope.selectParam.userCheckbox) && $scope.users.length>0){
							angular.forEach($scope.users,function(obj){
								//处理用户
								angular.forEach($scope.search.users,function(user){
									if(obj.id == user.id){
										user.checked = true;
									}
								});
							});
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.SEARCH.pagingForSearchUser();
						});
					}else{
						$scope.pageConfig.search.hasMore = false;
						service.showMsg("error",result.description);
					}
				},function(){
					$scope.pageConfig.search.hasMore = false;
				},function(){
					$scope.$broadcast("scroll.infiniteScrollComplete");  //针对上拉式刷新
				});				
			}
		};
		/**
		 * 显示人员详情之前
		 */
		$scope.beforeShowUserDetail = function(userid){
			if(userid){
				var inParams = {
					url: $rootScope.CONFIG.itf.user.getUserInfo,
					method: 'post',
					data: {
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid,
						id: userid
					},
					successCallBack: function(result){
						if(result.result == 1){ //查询成功
							var scope = $rootScope.$new(true);
							//用户头像
							result.user.avatar = $$user.getUserPhoto(result.user.id,result.user.updatetime);
							//处理企业
							if(result.orgs){
								//处理企业头像
								for(var i=0;i<result.orgs.length;i++){
									var org = result.orgs[i];
									if(org.photo){
										org.avatar = $$user.getPhoto(org.photo,org.updatetime);
									}else{
										org.avatar = $rootScope.CONFIG.defaultOrgPhoto;
									}
								}
								//加载用户企业信息
								scope.orgs = result.orgs;
							}
							//处理标签
							if(result.user.tags && result.user.tags.length>0){
								var description = "";
								for(var i=0;i<result.user.tags.length;i++){
									var tag = result.user.tags[i];
									description += tag.tag;
									if(i < result.user.tags.length - 1){
										description += ', ';
									}
								}
								if(description){
									result.user.tagDescription = description;
								}
							}
							//加载用户信息
							scope.user = result.user;
							//显示modal
							$scope.showUserDetail(scope)
						}else if(result.result == 2){	//session过期，自动激活
							$injector.get('service').activeSessionProxy(function(){
								$scope.beforeShowUserDetail(userid);
							});
						}else{	//查询失败
							$injector.get('toastr').error(result.description);
						}
					}
				};
				$injector.get('$$http').HTTP(inParams);
			};
		};
		/**
		 * 显示人员详情
		 */
		$scope.showUserDetail = function(scope){
			scope.removeModal = function(){
				if(scope.modal){
					scope.modal.remove();
				}
			};
			$injector.get('$ionicModal').fromTemplateUrl('tpl/modal/showUserDetailModal.html',{scope: scope,animation: 'none'})
				.then(function(modal){
					scope.modal = modal;
					modal.show();
				});
		};
		/** 获取当前组织id*/
		$scope.getCurrentParentId = function(){
			if($scope.parent.length > 1){
				return $scope.parent[$scope.parent.length - 1].id;
			}else{
				return "";
			}
		};
		/** 监听搜索内容
		 * 一旦搜索 关闭资源分页
		 * 搜索内容为空 关闭搜索分页 
		 */
		$scope.$watch("search.text",function(newVal){
			if(!newVal){
				$scope.pageConfig.search.hasMore = false;
				$scope.pageConfig.contact.hasMore = true;
			}else{
				$scope.pageConfig.search.hasMore = true;
				$scope.pageConfig.contact.hasMore = false;
			}
		});
	});