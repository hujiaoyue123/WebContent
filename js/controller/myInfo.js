/** */
angular.module("app")
	.controller("myInfo",function($scope,$rootScope,service,$$widget,$$user,$injector,$ionicPopup){
		$scope.isApp = UPF.is("app");
		$scope.signShow = false;
		
		/**
		 * 获取当前用户信息
		 */
		$scope.getUserInfo = function(){
			var inParams = {
				url: $rootScope.CONFIG.itf.user.getUserInfo,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					id: $rootScope.USER.id
				},
				successCallBack: function(result){
					if(result.result == 1){
						var user = result.user; //登陆用户
						//用户头像处理
						user.photo = $$user.getUserPhoto(user.id,user.updatetime);
						//标签处理
						if(user.tags && user.tags.length>0){
							var description = "";
							for(var i=0;i<user.tags.length;i++){
								var tag = user.tags[i];
								description += tag.tag;
								if(i < user.tags.length - 1){
									description += ', ';
								}
							}
							if(description){
								user.tagDescription = description;
							}
						}
						//装载数据
						$scope.user = user;
						//本地存储
						$$user.setLocalUser(null,user);
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.getUserInfo();
						});
					}else{
						$injector.get('toastr').error(result.description);
					}
				}
			};
			$injector.get('$$http').HTTP(inParams);
		};
		/** 操作*/
		$scope.operate = function(params){
			//修改头像
			if(params.type == "avatar"){
				$scope.signShow = false;
				$$widget.POPUP.updateAvatar($scope);
			}
			//修改昵称
			else if(params.type == "updateUserName"){
				$scope.signShow = false;
				var options = {
					title: "修改名字",
					subTitle: "请使用您的真实姓名",
					maxLength: 20,
					defaultText: $scope.user.username
				};
				$$widget.POPUP.prompt(options)
					.then(function(result){
						if(result != undefined){ //确定
							if(result){ //有值
								var user = {
									username: result
								};
								$scope.USER.updateUser(user);
							}
						}
					});
			}
			//二维码名片
			else if(params.type == "qrcode"){
				$scope.signShow = false;
				$$widget.MODAL.qrcode($scope);
			}
			//性别
			else if(params.type == "sex"){
				$scope.signShow = false;
				$$widget.POPUP.updateUserSex($scope);
			}
			//用户签名
			else if(params.type == "sign"){
				$$widget.POPUP.updateUserSign($scope,function(user){
					$scope.USER.updateUser(user);
				});
			}
			//邮箱
			else if(params.type == "email"){
				$scope.form = {
					email: $scope.user.email
				};
				var options = {
					title: '修改邮箱',
					subTitle: "多个邮箱用英文分号隔开.",
					template: '<textarea style="min-height: 60px;" ng-model="form.email"></textarea>',
					scope: $scope,
					buttons: [{
						text: "取消"
					},{
						text: "确定",
						type: "button-positive",
						onTap: function(){ //修改邮箱
							var updateUserEmail = function(email){
								var inParams = {
									action: "updateUser",
									method: 'POST',
									updateString: JSON.stringify({email: email})
								};
								$$user.callService(inParams,function(result){
									if(result.result == 1){
										$scope.getUserInfo();
									}else if(result.result == 2){
										service.activeSessionProxy(function(){
											updateUserEmail(email);
										});
									}else{
										service.showMsg("error",result.description)
									}
								});
							}
							//执行
							updateUserEmail($scope.form.email);
						}
					}]
				};
				$ionicPopup.show(options);
			}
			//个人标签
			else if(params.type == 'tags'){
				var options = {
					title: "个人标签",
					subTitle: "贴切的标签,可以更好的让人识别",
					maxLength: 20
				};
				$$widget.POPUP.prompt(options)
					.then(function(result){
						if(result != undefined){ //确定
							if(result){ //有值
								var user = {
									tags: result
								};
								$scope.USER.updateUser(user);
							}
						}
					});
			}
			//职务
			else if(params.type == 'jobs'){
				var options = {
					title: "设置职务",
					subTitle: "准确的职位,能更好的让别人找到你",
					defaultText: $scope.user.jobs
				};
				$$widget.POPUP.prompt(options)
					.then(function(result){
						if(result != undefined){ //确定
							if(result){ //有值
								var user = {
									jobs: result
								};
								$scope.USER.updateUser(user);
							}
						}
					});
			}
		};
		/**
		 * 进入头像页
		 * @param user用户对象
		*/
		$scope.enterMyAvatar = function(user){
			var inParams = {
				id: user.id,
				updatetime: user.updatetime,
				photo: user.photo
			};
			$injector.get('$state').go('myAvatar',inParams);
		};
		/**
		 * 进入标签页
		 */
		$scope.enterTagsPage = function(){
			var inParams = {
				id: $scope.user.id
			};
			$injector.get('$state').go('setTags',inParams);
		};
		/** 用户体*/
		$scope.USER = {
			/** 修改用户*/
			updateUser: function(user){
				if($$widget.POPUP.popupWindow){
					$$widget.POPUP.close();
				}
				service.promiseProxy(function(promise){
					$$user.updateUser(promise,user);
				},function(result){
					if(result.result == 1){ //修改成功
						$scope.getUserInfo(); //刷新
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.USER.updateUser(user);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			},
			/** 修改用户头像*/
			updateUserPhoto: function(files){
				if(files.length == 0){
					$injector.get('toastr').info('请选择图片文件！');
					return;
				}
				if($$widget.POPUP.popupWindow){
					$$widget.POPUP.close();
				}
				var inParams = {
					files: files
				};
				service.loading("start");
				service.promiseProxy(function(promise){
					$$user.updateUserPhoto(promise,inParams);
				},function(result){
					if(result.result == 1){ //修改成功
						$scope.getUserInfo();
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.USER.updateUserPhoto(files);
						});
					}else{
						service.showMsg("error",result.description);
					}
				},null,function(){
					service.loading("end");
				});
			},
			/** 修改用户头像-mobile*/
			updateUserPhotoOnMobile: function(type){
				$$widget.POPUP.close();
				try {
					var $$mobile = $injector.get("$$mobile");
					var options = {
						type: type,
						allowEdit: true
					};
					//上传头像
					var upload = function(server,uri,options){
						var array = uri.split("/");
						var filename = array[array.length-1];
						if(filename){
							options.params.filename = filename;
						}
						$$mobile.$cordovaFileTransfer.upload(server,uri,options)
							.then(function(res){
								var result = JSON.parse(res.response);
								if(result.result == 1){
									$scope.getUserInfo();
								}else if(result.result == 2){
									service.activeSessionProxy(function(){
										upload(server,uri,options);
									});
								}
							});
					}
					//打开相机/相册
					$$mobile.openCamera(options,function(uri){
						//TODO server接口未实现
						var server = $rootScope.CONFIG.itf.user.updateUserPhoto;
						var options = {
							params: {
								userid: $rootScope.USER.id,
								sessionid: $rootScope.USER.sessionid
							}
						};
						upload(server,uri,options)
					});
					
				} catch (e) {
					// TODO: handle exception
				}
			}
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
				standbySrc: user.photo,
				name: user.id + ".jpg",
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
				});
		};
		/**
		 * 显示掌秀勋章信息
		 */
		$scope.showMedalPopup = function () {
			$$widget.POPUP.showZXBadgeInfo();
		};
		/**
		 * 视图进入
		 */
		$scope.$on('$ionicView.enter',function(){
			$scope.getUserInfo();
		});
	})