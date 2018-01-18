/** 联系人*/
angular.module("app")
	.controller("group",function($rootScope,$scope,$$widget,service,$$user,$stateParams,$$contact,$$util,$window,$injector){
		/**
		 * $stateParams
		 * @param id
		 * @param type
		 * @param backText
		 */
		$scope.$stateParams = $stateParams;
		/**
		 * 获取群组列表
		 */
		$scope.getGroups = function(){
			var inParams = {
				id: $stateParams.id, //组织id
				type: $stateParams.type //组织类型
			};
			service.promiseProxy(function(promise){
				$$contact.getUserByDeptId(promise, inParams);
			},function(result){
				if(result.result == 1){ //查询成功
					//处理群组对象
					for (var i in result.groups){
						var g = result.groups[i];
						if(g.photo){
							g.photo = $$user.getPhoto(g.photo,g.updatetime);
						}else{
							for (var j in g.photos){
								g.photos[j] = $$user.getPhoto(g.photos[j],g.updatetime);
							}
						}
					}
					/** 获取并缓存群组头像*/
					if(UPF.is("app") && $rootScope.localConfig.cacheImage){
						var offline = $injector.get("$$mobile").offline;
						offline.loadLocalUserAvatar(result.groups);
					}
					//装载群组列表
					$scope.groups = result.groups;
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function(){
						$scope.getGroups();
					});
				}else{	//查询失败
					service.showMsg("error",result.description);
				}
			},null,function(){
				$scope.$broadcast("scroll.refreshComplete");
			});
		};
		/**
		 * 进入聊天
		 */
		$scope.enterChatPage = function(group){
			var inParams = {
				id: group.id,
				type: 'groupchat',
				hxid: group.hxid 
			};
			$injector.get('$state').go("chat",inParams);
		};
		/**
		 * 进入群组详情
		 * @param group 群组对象
		 * @param $event 事件
		 */
		$scope.enterGroupDetailPage = function(group,$event){
			if($event){ //阻止事件冒泡
				$event.stopPropagation();
			}
			var inParam = {
				id: group.id,
				backText: $injector.get('$ionicHistory').currentTitle()
			}
			$injector.get('$state').go("showGroup",inParam);
		};
		/**
		 * 创建群组之前
		 */
		$scope.beforeAddGroup = function(){
			var params = {
				title: "创建群组",
				excludes: [$rootScope.USER.id],
				userCheckbox: true
			};
			$$widget.MODAL.selectUser(params,function(data){
				var name = $rootScope.USER.username;
				var ids = "[";
				for(var i =0; i<data.length; i++){
					var u = data[i];
					if (u.id != $rootScope.USER.id){
						if(i<5){
							if(u.username == undefined){
								name += ","+u.name;
							}else{
								name += ","+u.username;
							}
						}else if (i == 5){
							name += "...";
						}
						ids += "'"+u.id+"',";
					}
				}
				ids = ids.substring(0,ids.length-1)+"]";
				//创建群组
				$scope.addGroup(0,name,ids);
			});
		};
		/**
		 * 创建群组
		 */
		$scope.addGroup = function(type,name,userids){
			var inParams = {
				url: $rootScope.CONFIG.itf.user.addGroup,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					type: type,
					name: name,
					userids: userids
				},
				successCallBack: function(result){
					if(result.result == 1){
						$scope.getGroups(); //刷新
						$injector.get('toastr').success(result.description);
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.addGroup(type,name,userids);
						});
					}else{
						$injector.get('toastr').error(result.description);
					}
				}
			};
			$injector.get('$$http').HTTP(inParams);
		};
		/**
		 * 查看群组详情
		 */
		$scope.groupDetail = function(){
			service.$state.go("showGroup",$scope.params);
		};
		/**
		 * 视图进入
		 */
		$scope.$on("$ionicView.enter",function(){
			service.validUser(function(){
				$scope.getGroups();
			});
		});
	});