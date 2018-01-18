/** 关于掌文*/
angular.module("app")
.controller("aboutApp",function($scope,$rootScope,service,$injector,$ionicPopup){
	$scope.isApp = UPF.is("APP");
	$scope.isAndroid = UPF.is("Android");
	$scope.version = UPF.version;
	$scope.upVersion = $rootScope.updateVersion;
	/** 操作*/
	$scope.operate = function(param){
		//禁止向上传播
		if(param.$event){
			param.$event.stopPropagation();
		}
		//顶部按钮
		var action = param.action;
		//检查新版本
		if(action == "checkVersion"){
			$scope.updateVersions();
		} else if(action == "checkFeatures"){
			service.$state.go("features");
		}
	};
	$scope.updateVersions = function(){
		if(!UPF.is("APP")) return;
		var $$mobile = $injector.get("$$mobile");
		$$mobile.app.vsVersion(function(conflict,result){
			if($scope.upVersion == 1){
				$ionicPopup.confirm({
	                title: '版本升级',
	                template: result.title, //从服务端获取更新的内容
	                cancelText: '取消',
	                okText: '升级'
	            }).then(function (res) {
	                if (res) {
	                	cordova.InAppBrowser.open($rootScope.CONFIG.itf.app.getApp, '_system');
	                }
	            });
			}
			//已是最新
			else{
				$injector.get('toastr').info('已是最新版本');
			}
		});
	};
	/**
	 * 预览app二维码
	 */
	$scope.openQrcode = function(){
		$injector.get('$ionicModal').fromTemplateUrl('tpl/modal/appQrcode.html',{
			scope: $scope
		}).then(function(modal){
			modal.show();
			$scope.modal = modal;
		});
	};
	/**
	 * 复制链接
	 * @param link 复制的链接
	 */
	$scope.copyLink = function(link){
		try {
			if(UPF.is("APP")){
				$injector.get("$$mobile").copyLink(link);
			}else{
				$injector.get("clipboard").copyText(link);
			}
			service.showMsg("success","链接已复制");
		} catch (e) {
			service.showMsg("error","复制链接失败");
		}
	};
	/**
	 * 分享app
	 */
	$scope.shareApp = function(){
		
	};
});