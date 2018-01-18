/** 添加好友 */
angular.module("app")
	.controller("newFriend",function($scope,$$widget,$$user,$rootScope,service,$ionicPopup,$$util){
		$scope.$on("$ionicView.beforeEnter",function(){
			$scope.search = {text : ''};
		});
		
		// 搜索
		$scope.searchUser = function(txt){

			if (txt && txt!=''){
				service.promiseProxy(function(promise){
					//封装参数
					var params = {
						type:'userByMobile',
						txt: txt
					};
					service.search(promise,params);
				},function(result){
					$scope.searchResult = result.result; 
					if (result.result == 1){
						$scope.users = result.data;
						for(var i in result.data){
							var u = result.data[i]; 
							if(u.photo){
								u.avatar = $$user.getUserPhoto(u.id,u.updatetime);
							}
						}
						if (result.data.length == 0){
							$scope.users[0] = {
								username: txt,
								loginname:txt,
								mobile:txt,
								avatar:$rootScope.CONFIG.defaultUserPhoto,
								newUser:true
							}
						}
						
					}else if(result.result == 2){ // session 过期
						service.activeSessionProxy(function () {
							$scope.searchUser(txt);
						});
					}
				});
			}else{
				$scope.users = [];
			}
		};
		
		/** 操作*/
		$scope.operate = function(param,$event){
			//顶部按钮
			var action = param.action;
			if(action == "clickuser"){
				if (param.userid){
					var inParams = {};
					inParams.id = param.userid; //userid
					service.$state.go("showUser",inParams);
				}
			}else if(action == "addFriend"){
				$scope.addFriend(param);
			}
		};
		
		$scope.verifyMobile = function(m){
			var x = $$util.String.verifyMobile(m); 
			return x;
		};
		
		$scope.addFriend = function(p){
			$$user.addFriend(p);
		};
	});