/** 用户主页信息*/
angular.module("app")
	.controller("showUserCtrl",function($scope,$state,service,$stateParams,$$user,$rootScope,$$widget,$window,$$chat,$injector){
		/** @$stateParams
		 * id 用户id
		 * r 关系
		 */
		$scope.isPc = service.IsPc();
		$scope.suser = {}; //用户信息
		$scope.orgs = {}; //用户的企业信息
		/** 加载单个用户信息*/
		$scope.loadUser = function(){
			service.promiseProxy(function(promise){
				$$user.getUserById(promise, {id:$stateParams.id});
			},function(result){
				if(result.result == 1){ //查询成功
					//加载用户信息
					$scope.suser = result.user;
					/** 获取并缓存用户头像*/
					if(UPF.is("app") && $rootScope.localConfig.cacheImage){
						var offline = $injector.get("$$mobile").offline;
						offline.loadLocalUserAvatar([$scope.suser]);
					}else{
						$scope.suser.avatar = $$user.getUserPhoto(result.user.id,result.user.updatetime);
					}
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
						$scope.orgs = result.orgs;
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
							$scope.suser.tagDescription = description;
						}
					}
					$scope.$broadcast("scroll.refreshComplete");  //针对下拉式刷新
					//更新用户聊天头像
					$injector.get('$$chat').updateUserAvatar(result.user);
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function(){
						$scope.loadUser();
					});
				}else{	//查询失败
					service.showMsg("error",result.description);
				}
			});
		};
		/** 进入用户企业*/
		$scope.clickGroup = function(p){
			service.$state.go("showGroup",{id:p.id});
		};
		/** 发起用户聊天*/
		$scope.chat = function(){
			var inParams = {
				id: $scope.suser.id,
				username: $scope.suser.username,
				photo: $scope.suser.avatar
			};
			$state.go("chat",inParams);
		};
		/** 用户分享的文件*/
		$scope.friendShare = function(friendid){
			var inParams = {
				friendid: friendid
			};
			$state.go("friendShared",inParams);
		};
		/** 打电话给用户*/
		$scope.callPhone = function(phoneNum){
			$window.location.href = "tel:"+phoneNum;
		};
		/** 添加好友*/
		$scope.addFriend = function(){
			var options = {
				title:'填写申请信息',
				defaultText:'我是 ' + $rootScope.USER.username
			};
			$$widget.POPUP.prompt(options).then(function(r){
				if (r){
					var sendInvite = function(){
						var param = {
							type: 4,
							msg: r,
							loginname: $scope.suser.loginname,
							username: $scope.suser.username	
						};
						service.promiseProxy(function(promise){
							$$user.newInvite(promise,param);
						},function(result){
							if(result.result == 1){ //成功
								// 通过chatservice发送通知
//							if ($stateParams.id){
//								var msg={
//									to: $scope.suser.id,
//									msg: "[sys]newInvite",
//									type: "chat",
//									from: $rootScope.USER.id,
//									msgType: "txt"
//								};
//								$$chat.sendMsg(msg);
//							}
								service.showMsg("success","已发送请求");
							}else if(result.result == 2){	//session过期，自动激活
								service.activeSessionProxy(function(){
									sendInvite();
								});
							}else{	//失败
								service.showMsg("error",result.description);
							}
						});
					};
					sendInvite();
				}
			});
		};
		/** popover menu*/
		$scope.openPopoverMenu = function($event){
			var $ionicPopover = $injector.get('$ionicPopover');
			if($ionicPopover){
				$ionicPopover.fromTemplateUrl('tpl/popover/showUser.html',{scope: $scope})
					.then(function(popover){
						popover.show($event);
						$scope.popover = popover;
					});
			}
		};
		/** 选择复制用户的信息-popup*/
		$scope.showCopyPopup = function(){
			if($scope.popover){
				$scope.popover.remove();
			}
			var $ionicPopup = $injector.get('$ionicPopup');
			if($ionicPopup){
				$scope.tempUser = angular.copy($scope.suser);
				if($scope.tempUser.mobile){
					$scope.tempUser.mobile_checked = true;
				}
				if($scope.tempUser.email){
					$scope.tempUser.email_checked = true;
				}
				var options = {
					templateUrl: 'tpl/popup/selectUserInfo.html',
					scope: $scope,
					buttons: [{
						text: '取消'
					},{
						text: '确定',
						type: 'button-positive',
						onTap: function(){
							var copyText = '';
							if($scope.tempUser){
								if($scope.tempUser.username){
									copyText += '姓名: ' + $scope.tempUser.username;
								}
								if($scope.tempUser.mobile_checked){
									copyText += ' 电话: ' + $scope.tempUser.mobile;
								}
								if($scope.tempUser.email_checked){
									copyText += ' 邮箱: ' + $scope.tempUser.email;
								}
								if(copyText){
									try {
										if(UPF.is("APP")){
											var $cordovaClipboard = $injector.get("$cordovaClipboard");
											$cordovaClipboard.copy(copyText);
										}else{
											var clipboard = $injector.get('clipboard');
											clipboard.copyText(copyText);
										}
										service.showMsg("success","信息已复制");
									} catch (e) {
										service.showMsg("error","复制信息失败");
									}
								}
							};
						}
					}]
				};
				$ionicPopup.show(options);
			}
		};
		/**
		 * 设置标签
		 */
		$scope.setTags = function(){
			var inParams = {
				id: $scope.suser.id
			};
			$injector.get('$state').go('setTags',inParams);
		};
		/**
		 * 预览头像
		 * @param user 用户对象
		 */
		$scope.showImage = function(user){
			var imgSrc = $injector.get('$$user').getUserPreviewPhoto(user.id,user.updatetime); //头像预览图
			//使用modal方式
			var scope = $rootScope.$new(true);
			scope.image = {
				src: imgSrc,
				standbySrc: user.avatar, //备用图片
				name: user.photo,
				competence: {
					saveToMobile: true //保存到手机
				}
			};
			var options = {
				scope: scope,
				animation: 'none'
			};
			$injector.get('$ionicModal').fromTemplateUrl("tpl/modal/showImage.html",options)
				.then(function(modal){
					modal.show();
					scope.modal = modal;
				})
		};
		/** 视图进入前*/
		$scope.$on("$ionicView.enter",function(){
			service.validUser(function(){
				$scope.loadUser();
			});
		});
	});