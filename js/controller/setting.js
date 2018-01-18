/** 设置*/
angular.module("app")
	.controller("setting",function($scope,$$user,service,$$chat,$ionicPopup,$injector){
		$scope.isAPP =  UPF.is("App");
		service.validUser();
		$scope.logout = function(){
			//$$chat.close();
			$$user.logout();
//			service.goLogin();
			window.location.reload();
		};
		/** 清除本地文件*/
		$scope.clearLocalFile = function(){
			var offline = $injector.get("$$mobile").offline;
			var dirList = ["image","office","avatar"];
			var delCount = 0;
			var callback = function(){
				++delCount;
				if(delCount == dirList.length){
					service.loading("start","本地文件已清除",1000);
				}
			};
			var removeRecursively = function(dir){
				offline.removeRecursively(dir,callback,callback);
			};
			//执行
			for(var i=0;i<dirList.length;i++){
				removeRecursively(dirList[i]);
			}
			//ios清除系统缓存
			if(UPF.is('ios')){
                new window.DirectoryEntry().removeAllCachedResponses();
            }
		};
		/**
		 * 清除本地语音聊天文件
		 */
		$scope.clearVoiceCache = function(){
			var chat = $injector.get("$$chat");
			chat.clearVoiceCache();
			service.loading("start","本地聊天语音已清除",1000);
		};
		/** 清除本地文件-debug*/
		$scope.clearLocalFile2 = function(type){
			if(type){
				var offline = $injector.get("$$mobile").offline;
				var removeRecursively = function(dir){
					service.loading("start","正在删除"+dir);
					offline.removeRecursively(dir,function(){
						service.loading("start",dir+"删除成功",1000);
					},function(error){
						if(error.code == 1){ //NOT_FOUND_ERR
							service.loading("start",dir+"不存在",1000);
						}else{
							service.loading("start",dir+"删除失败",1000);
						}
					});
				};
				removeRecursively(type);
			}else{
				var imageBtn = '<button class="button button-block button-calm" ng-click="clearLocalFile(\'image\')">图片/缩略图</button>';
				var officeBtn = '<button class="button button-block button-calm" ng-click="clearLocalFile(\'office\')">office/pdf文件</button>';
				var avatarBtn = '<button class="button button-block button-calm" ng-click="clearLocalFile(\'avatar\')">通讯录头像</button>';
				var options = {
						title: "选择清除的类型",
						template: imageBtn + officeBtn + avatarBtn,
						scope: $scope,
						buttons: [{
							text: "关闭"
						}]
				};
				$ionicPopup.show(options);
			}
		};
	});