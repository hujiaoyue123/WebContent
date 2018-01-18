/** 升级企业页面 */
angular.module("app")
	.controller("upgradeEntCtrl",function($rootScope,$scope,service,$stateParams,$$user,Upload,$$util){
		$scope.auth = {};
		var init = function(){
			$scope.loadUpgradeEnt();
		};
		
		$scope.loadUpgradeEnt = function(){
			var params={
				action:'getUpgradeEnt',
				method:"GET",
				groupid:$stateParams.id
			};
			service.promiseProxy(function(promise){
				$$user.go(promise,params);
			},function(result){
				if(result.result == 1){ //查询成功
					if(result.data != null){
						$scope.auth = result.data;
						$scope.auth.reg = parseInt(result.data.reg);
						if(!result.data.licenseimg){
							$scope.auth.licenseimg = "img/waitUpload.png";
						} else {
							$scope.auth.licenseimg = $rootScope.CONFIG.itf.user["getLicenseOrCard"] + "/" + result.data.licenseimg + "?"+Math.random();
						}
						if(!result.data.cardimg){
							$scope.auth.cardimg = "img/waitUpload.png";
						} else {
							$scope.auth.cardimg = $rootScope.CONFIG.itf.user["getLicenseOrCard"] + "/" + result.data.cardimg + "?"+Math.random();
						}
					}
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function () {
						$scope.loadUpgradeEnt();
					});
				}else{	//查询失败
					service.showMsg("error",result.description);
					//service.$cordovaToast.showShortBottom(result.description);
				}
			});
		};
		/** 提交/保存*/
		$scope.submitAuth = function(auth,type){
			if(auth.licenseimg == "img/waitUpload.png"){
				service.showMsg("error","请上传企业营业执照！");
				return;
			} else if(auth.cardimg == "img/waitUpload.png"){
				service.showMsg("error","请上传本人正面身份证！");
				return;
			}
			var params={
				action:'saveUpgradeEnt',
				method:"POST",
				id:auth.id,
				reg:auth.reg,
				type:type,
				address:auth.address,
				site:auth.site,
				email:auth.email
			};
			service.promiseProxy(function(promise){
				$$user.go(promise,params);
			},function(result){
				if(result.result == 1){ //查询成功
					$scope.auth.type = type;
					service.showMsg("info",result.description);
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function(){
						$scope.submitAuth(auth,type);
					});
				}else{	//查询失败
					service.showMsg("error",result.description);
					//service.$cordovaToast.showShortBottom(result.description);
				}
			});
		};
		/** 上传图片*/
		$scope.upload = function(files,type){
			if(files.length == 0){
				service.showMsg("error","请选择图片文件！");
				return;
			}
			var params = {
				file : files[0],
				type : type
			};
			$scope.uploadService(params);
		};
		/** 上传*/
		$scope.uploadService = function(params){
			Upload.upload({
	            url: $rootScope.CONFIG.itf.user["uploadUpgrade"],
	            data: {
	            	userid: $rootScope.USER.id,
	            	sessionid: $rootScope.USER.sessionid,
	            	id: $scope.auth.id,
	            	type: params.type,
	            	file: params.file,
	            	filename: params.file.name,
	            	filesize: params.file.size
	            }
	        }).then(function (resp) { //resp:{config,data,headers}
	        	if(resp.data.result == 1){
	        		if(params.type == "license"){
	        			$scope.auth.licenseimg = $rootScope.CONFIG.itf.user["getLicenseOrCard"] + "/" + resp.data.img + "?"+Math.random();
	        		} else {
	        			$scope.auth.cardimg = $rootScope.CONFIG.itf.user["getLicenseOrCard"] + "/" + resp.data.img + "?"+Math.random();
	        		}
	        		service.showMsg("info",resp.data.description);
	        	}else if(resp.data.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function(){
						$scope.uploadService(params);
					});
				}else{	//查询失败
					service.showMsg("error",resp.data.description);
				}
	        });
		};
		$scope.validFome = function(val,type){
			if(!val || val==""){
				return false;
			}
			if(type == "site"){
				return $$util.String.verifyHttpUrl(val);
			} else if(type == "email"){
				return $$util.String.verifyEmail(val);
			}
			return true;
		};
		/** VIEW enter*/
		$scope.$on("$ionicView.enter",function(){
			/** 初始化执行*/
			service.validUser(init);
		});
	});