/**
 * 个人头像
 */
angular.module('app')
.controller('myAvatar',function($scope,$rootScope,$stateParams,$injector){
	/** $stateParams
	 * @param id 用户id
	 */
	$scope.user = {
		id: $stateParams.id,
		photo: $stateParams.photo,
		updatetime: $stateParams.updatetime,
		previewPhoto: $injector.get('$$user').getUserPreviewPhoto($stateParams.id,$stateParams.updatetime)
	};
	/**
	 * 长按图片动作菜单
	 */
	$scope.onHoldActionSheet = function(){
		//暂不开放
		return;
		//显示动作菜单
		var options = {
			buttons: [{
				text: '保存图片'
			}],
			cancelText: '取消',
			buttonClicked: function(index){
				switch(index){
					case 0: //保存图片
						$scope.saveImageToMobile();
						break;
				};
				return true;
			}
		};
		$injector.get('$ionicActionSheet').show(options);
	};
	/**
	 * 右上角动作菜单
	 */
	$scope.showActionSheet = function(){
		//检测是否正常
		//显示动作菜单
		var options = {
			buttons: [{
				text: '拍照'
			},{
				text: '从相册中选择'
			}
//			,{
//				text: '保存图片'
//			}
			],
			cancelText: '取消',
			buttonClicked: function(index){
				switch(index){
					case 0: //拍照 
						$scope.openCamera('CAMERA');
						break;
					case 1: //从相册中选择
						$scope.openCamera('PHOTOLIBRARY');
						break;
					case 2: //保存图片
						$scope.saveImageToMobile();
						break;
				};
				return true;
			}
		};
		$injector.get('$ionicActionSheet').show(options);
	};
	/**
	 * 拍照/从相册中选择
	 * @param type CAMERA: 拍照/PHOTOLIBRARY: 相册
	 */
	$scope.openCamera = function(type){
		var $$mobile = $injector.get('$$mobile');
		//配置参数
		var options = {
			type: type,
			allowEdit: true
		};
		if(UPF.is('ios')){
			StatusBar.hide();
		}
		//打开相机/相册
		$$mobile.openCamera(options,function(uri){
			var server = $rootScope.CONFIG.itf.user.updateUserPhoto;
			var options = {
				params: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid
				}
			};
			if(!$injector.get('$$mobile').isNativePath(uri)){
				$injector.get('$$mobile').resolveNativePath(uri,function (filepath) {
					upload(server,filepath,options);
				})
			}else{
				upload(server,uri,options)
			}
			if(UPF.is('ios')){
				StatusBar.show();
			}
		},function () {
			if(UPF.is('ios')){
				StatusBar.show();
			}
		});
		//上传头像
		var upload = function(server,uri,options){
			var array = uri.split("/");
			var filename = array[array.length-1];
			if(filename){
				options.params.filename = filename;
			}
			$$mobile.$cordovaFileTransfer.upload(server,uri,options)
				.then(function(res){
					console.log(res);
					var result = JSON.parse(res.response);
					if(result.result == 1){ //上传成功
						var getServerUserInfo = function(user){
							//更新用户预览图
							$scope.user.updatetime = user.updatetime;
							$scope.user.previewPhoto = $injector.get('$$user').getUserPreviewPhoto(user.id,user.updatetime);
						};
						//获取服务端用户信息
						$scope.getUserInfo(getServerUserInfo);
					}else if(result.result == 2){ //激活session
						$injector.get('service').activeSessionProxy(function(){
							upload(server,uri,options);
						});
					}else{
						//TODO 错误处理
//						$injector.get('toastr').error('');
					}
				});
		};
	};
	/**
	 * 获取当前用户信息
	 * @param successCallback
	 */
	$scope.getUserInfo = function(successCallback){
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
					if(successCallback){
						successCallback(result.user);
					}
				}else if(result.result == 2){
					$injector.get('service').activeSessionProxy(function(){
						$scope.getUserInfo(successCallback);
					});
				}else{
					$injector.get('toastr').error(result.description);
				}
			}
		};
		$injector.get('$$http').HTTP(inParams);
	};
	/**
	 * 保存到手机
	 */
	$scope.saveImageToMobile = function(){
		//图片源
		var imageSourceUrl = $scope.user.previewPhoto;
		//保存的图片名称
		var savedImageName = $scope.user.photo;
		//保存成功回调
		var successCallback = function(){
			$injector.get('toastr').success('图片保存成功');
		};
		//保存失败回调
		var errorCallback = function(){
			$injector.get('toastr').error('图片保存失败');
		};
		$injector.get('$$mobile').saveImageToMobile(imageSourceUrl,savedImageName,successCallback,errorCallback);
	};

});