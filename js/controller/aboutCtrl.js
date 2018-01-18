/** 关于我*/
angular.module("app")
	.controller("aboutCtrl",function($scope,service,$rootScope,$state,component,$$user,$$widget,$injector){
		//初始化
		$scope.version = UPF.version;
		$scope.isApp = UPF.is("app");
		$scope.isAndroid = UPF.is("android");
		$scope.init = function(){
			initIdentify();
			getUserInfo();
			$scope.form = {};
			$scope.$broadcast("scroll.refreshComplete");
			/**getAppVersion; //获取app版本*/
		};
		//控制器信息
		var initIdentify = function(){
			$scope.ctrlname = "aboutCtrl";
			$scope.app = {}; //app对象
		};
		//用户信息
		var getUserInfo = function(){
			$$user.getUserInfo(null,function(result){
				if(result.result == 1){
					var user = result.user; //登陆用户
					user.photo = $$user.getUserPhoto(user.id,user.updatetime);
					$$user.setLocalUser(null,user);
					//空间
					if(user.spacesize && (user.space || user.space == 0 )){
						var userTotalCloudSpace = parseInt(user.spacesize);//用户可用空间
						var userUsedCloudSpace = parseInt(user.space);
						//百分比
						$scope.spacePercent = userUsedCloudSpace/userTotalCloudSpace*100;
						var $$util = $injector.get('$$util');
						$scope.userUsedCloudSpace = $$util.bytesToSize(userUsedCloudSpace); //用户文件使用空间
						$scope.userTotalCloudSpace = $$util.bytesToSize(userTotalCloudSpace);
					}

				}else if(result.result == 2){
					service.activeSessionProxy(function(){
						getUserInfo();
					});
				}
			});
			
		};
		/** 操作*/
		$scope.operate = function(params){
			//二维码名片
			if(params.type == "qrcode"){
				$$widget.MODAL.qrcode($scope);
			// 掌文商城
			}else if(params.type == "store"){
				if(!UPF.is('app')){
					$scope.tbUrl = $rootScope.CONFIG.zhangShow.tbUrl;
				}
				if ($scope.tbUrl){
					var inParams = {
						title:'掌文商城',
						url:encodeURIComponent($scope.tbUrl)	
					};
					if(UPF.is('app')){
						$injector.get('$$mobile').app.openUrl({service: $injector.get('service'),url: $scope.tbUrl});
					}else{
						service.$state.go("showPage",inParams);
					}
				}else{
					service.$state.go("coming");
				}
				//取消商城提醒
				$rootScope.showJdTip = 0;
				localStorage.showJdTip = 2;
			}
		};
		//修改头像
		$scope.editImg = function(files){
			if(!files){ return;}
			else if(/\.(gif|jpg|jpeg|png)$/.test(angular.lowercase(files[0].name))){
				var params = {};
				params.type = "editImg"; //操作类型
				params.files = files; //图片文件集
				service.loading("start");
				//线程链
				service.promiseProxy(function(promise){
					service.userUpdate(params,promise); //修改图像
				},function(result){
					service.loading("end");
					if(result.result == 1){ //修改成功
						$scope.init(); //刷新
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function () {
							$scope.editImg(files);
						});
					}else{
						service.showMsg("error",result.description);
						//service.$cordovaToast.showShortBottom(result.description);
					}
				},function(){
					service.loading("end");
					service.showMsg("error","连接不上服务器！");
				});
			}else{
				service.showMsg("error","文件类型不正确!");
				//service.$cordovaToast.showShortBottom("文件类型不正确!");
			}
		};
		/** 打开相机/相册
		 * type 已选择获取图片方式
		 */
		$scope.openCamera = function(type){
			if(type){ //选择拍照/相册
				service.popupWindow.close();
				service.promiseProxy(function(promise){
					service.openCamera(promise,type); //打开相机
				},function(filepath){
					uploadImg(filepath); //上传
				});
			}else{
				service.initPopup(component.popup.camera($scope));
			}
		};
		/** 上传头像 */
		var uploadImg = function(filepath){
			service.loading("start");
			service.promiseProxy(function(promise){
				var params = {};
				params.server = service.getServer().itf.user.updateUser;
				params.filepath = filepath;
				params.params = {filename : service.getMobileFileName(filepath)};
				//执行上传
				service.mobileUpload(promise,params);
			},function(result){
				service.loading("end");
				$scope.init(); //刷新
			},function(){
				service.loading("end");
				service.showMsg("头像上传失败!");
			});
		};
		//获取app版本
		/*
		$scope.getAppVersion = getAppVersion = function(){
			service.promiseProxy(function(promise){
				service.getAppVersion(promise); //获取当前app版本
			},function(version){
				$scope.app.version = version;
				compareAppVersion(version); //与服务端版本比较
			});
		};
		//比较app版本
		var compareAppVersion = function(version){
			service.promiseProxy(function(promise){
				service.compareAppVersion(promise,version);
			},function(result){
				if(result.result == 1){
					if(result.version != version){ //新版本提醒
						$scope.app.upgrade = true;
					}else{
						$scope.app.upgrade = false;
					}
				}
			});
		};
		//版本更新
		$scope.upgrade = function(){
			service.promiseProxy(function(promise){
				service.compareAppVersion(promise,$scope.app.version); 
			},function(result){
				if(result.result == 1){
					if(result.version != $scope.app.version){ //新版本提醒
						service.initPopup(component.popup.appUpgrade($scope,result.title)); //弹窗更新
					}else{
						service.$cordovaToast.showShortBottom("当前已是最新版本!");
					}
				}else{
					service.$cordovaToast.showShortBottom("连接不上服务器!");
				}
			});
		};
		//app下载
		$scope.appdownload = function(){
			service.download({ctrlname: $scope.ctrlname});
		};
		*/
		/** 用户体*/
		$scope.USER = {
			//修改用户
			updateUser: function(user){
				service.promiseProxy(function(promise){
					$$user.updateUser(promise,user);
				},function(result){
					if(result.result == 1){ //修改成功
						$$user.setLocalUser(null,user);
						service.showMsg("success",result.description)
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.USER.updateUser(user);
						});
					}else{
						service.showMsg("error",result.description);
					}
				},function(error){
					
				});
			},
			//修改头像
			updatePhoto: function(files){
				var edituser = {
					files: files
				};
				service.promiseProxy(function(promise){
					$$user.updateUser(promise,edituser);
				},function(result){
					if(result.result == 1){ //修改成功
						var user = {
							photo: $rootScope.USER.photo.split("?")[0]+"?"+Math.random()
						};
						$$user.setLocalUser(null,user);
						service.showMsg("success",result.description);
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.USER.updatePhoto(files);
						});
					}else{
						service.showMsg("error",result.description);
					}
				},function(error){
					
				});
			},
			//退出登录
			exit: function(){
				$$user.logout();
				if(service.IsPc()){
					service.$state.go("loginPc");
				}else{
					service.$state.go("loginMobile");
				}
			},
			releaseHelp:function(){
				var inParams = {
					method:'POST',
					action:'releaseHelp'
				};
				$$user.callService(inParams,function(result){
					if(result.result == 1){
						service.showMsg("info",result.description);
					} else {
						service.showMsg("error",result.description);
					}
				});
			}
		};
		/**
		 * 获取个人文件已使用空间
		 */
		$scope.getUserCloudSpace = function(){
			var inParams = {
				url: $rootScope.CONFIG.itf.folder.getUserCloudSpace,
				method: 'POST',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid
				},
				successCallBack: function(result){
					if(result.result == 1){
						//用户可用空间
						var userTotalCloudSpace = 1024*1024*1024*5;
						var userUsedCloudSpace = result.data;
						//百分比
						$scope.spacePercent = Math.round(userUsedCloudSpace/userTotalCloudSpace*100);
						var $$util = $injector.get('$$util');
						$scope.userUsedCloudSpace = $$util.bytesToSize(userUsedCloudSpace); //用户文件使用空间
						$scope.userTotalCloudSpace = $$util.bytesToSize(userTotalCloudSpace);

					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.getUserCloudSpace();
						});
					}
				}
			};
			$injector.get('$$http').HTTP(inParams);
		};
		/**
		 * 显示掌秀勋章信息
		 */
		$scope.showMedalPopup = function () {
			$$widget.POPUP.showZXBadgeInfo();
		};
		/** 执行初始化*/
		$scope.$on("$ionicView.enter",function(){
			// $scope.getUserCloudSpace();
			service.validUser($scope.init);
		});
		// 从服务器获取商城连接
		service.getDictionary("tbUrl",function(r){
			if (r.result == "1" && r.tbUrl){
				$scope.tbUrl = r.tbUrl;
			}
		});
	});