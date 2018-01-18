/** 搜索*/
angular.module("app")
	.controller("searchContact",function($scope,$rootScope,service,$stateParams,$$user,$RESOURCE,$$widget,$$contact,$$util,$injector){
		$scope.params = {
			id: $stateParams.id,
			type: $stateParams.type
		};
		$scope.isPc = service.IsPc();
		$scope.isManager = function(){
			var userid = $rootScope.USER.id;
			if ($scope.search.creator.id == userid){
				return true;
			}
			for (var i=0; i<$scope.search.managers.length; i++){
				if (userid == $scope.search.managers[i]){
					return true;
				}
			}
			return false;
		};
		$scope.search = {}; //搜索资源
		/** 分页配置*/
		$scope.pageConfig = {
			search: {
				start: 0, //查询开始
				pageSize: $rootScope.CONFIG.page.search.pageSize, //查询数量
				hasMore: false, //是否还有
				lastId: null //验证id
			}
		};
		/** 操作
		 * params {
		 *	 type 操作类型
		 * 	 file 操作对象
		 * 	 $event 点击事件
		 * }
		 */
		$scope.operate = function(params){
			var action = params.action;
			/** 点击用户*/
			if(action == "clickuser"){
				var inParams = {
					id: params.user.id	
				};
				service.$state.go("showUser",inParams);
			}
			/** 删除用户*/
			else if(action == "deleteFriend"){
				$$widget.POPUP.contact.deleteUser(params.user,function(){
					$scope.CONTACT.deleteFriend(params.user);
				});
			}
			
			else if(action == "removeAUserFromGroup"){
				$scope.CONTACT.removeAUserFromGroup(params);
			}
		};
		/** 视图进入*/
		$scope.$on("$ionicView.enter",function(){
			if ($scope.autofocus){
				$scope.autofocus();
			}
		});
		
		/** 通讯录*/
		$scope.CONTACT = {
			/** 删除联系人
			 * user
			 */
			deleteFriend: function(user){
				var inParams={
					friendids: user.id//删除多个用户请用<,>隔开
				};
				service.promiseProxy(function(promise){
					$$contact.deleteFriend(promise,inParams);
				},function(result){
					if(result.result == 1){ //查询成功
						// 数组删除元素
						$scope.search.users = $$util.ARRAY.remove($scope.search.users, user);
					}else if(result.result == 2){	//session过期，自动激活
						service.activeSessionProxy(function(){
							$scope.CONTACT.deleteFriend(user);
						});
					}else{	//查询失败
						service.showMsg("error",result.description);
					}
				});
			}
		};
		/** 搜索体*/
		$scope.SEARCH = {
			/** 搜索用户
			 * text 搜索内容 $scope.search.text
			 */
			searchUser: function(text){
				if(!text){
					//scroll复位
					$injector.get('$ionicScrollDelegate').$getByHandle('searchContactScrollDelegate').scrollTop();
					return;
				}
				var inParams = {
					start: 0,
					pagesize: $scope.pageConfig.search.pageSize,
					txt: text,
					type: "user",
					parentid: $scope.params.id?$scope.params.id:""
				};
				$RESOURCE.SEARCH.search(inParams,function(result){
					if(result.result == 1){
						//scroll复位
						$injector.get('$ionicScrollDelegate').$getByHandle('searchContactScrollDelegate').scrollTop();
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
						//用户
						$scope.search.users = result.data.users;
						//重置start
						$scope.pageConfig.search.start = $scope.pageConfig.search.pageSize;
						//开启上拉刷新
						if($scope.search.users.length > 0 && $scope.search.users.length == $scope.pageConfig.search.pageSize){
							$scope.pageConfig.search.hasMore = true;
						}
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
					$scope.$broadcast("scroll.infiniteScrollComplete");  //针对上拉式刷新
					return;
				}
				var inParams = {
					start: $scope.pageConfig.search.start,
					pagesize: $scope.pageConfig.search.pageSize,
					uid: $scope.pageConfig.search.lastId,
					txt: $scope.search.text,
					type: "user",
					parentid: $scope.params.id?$scope.params.id:""
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
						//删除多加载的最后一个用户，保留id
						if(result.data.users.length == ($scope.pageConfig.search.pageSize + 1)){
							$scope.pageConfig.search.lastId = result.data.users.pop().id;
						}
						//表示有冲突
						if(result.type == 1){
							$scope.search.users = result.data.users;
						}else{
							//用户
							if(result.data.users && result.data.users.length>0){
								if(!$scope.search.users){
									$scope.search.users = [];
								}
								//非重复追加
								$$util.ARRAY.distinctPush($scope.search.users,result.data.users);
							}
						}
						//取消上拉刷新
						if(result.data.users.length < $scope.pageConfig.search.pageSize){
							$scope.pageConfig.search.hasMore = false;
						}else{
							//重设下次的start
							$scope.pageConfig.search.start += $scope.pageConfig.search.pageSize;
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
		/* 去除字符串末尾斜杠*/
		$scope.removeSprit = function(string){
			if(string.substring(string.length-1,string.length) == '/'){
				return string = string.slice(0,string.length-1);
			}
			return string;
		};
	});