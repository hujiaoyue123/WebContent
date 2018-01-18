angular.module("app")
	.controller("bindSN",function($scope,$$widget,service,toastr,$rootScope,$injector,$http,$ionicPopup){
		$scope.bind={};
		/** 操作*/
		$scope.operate = function(params){
			//新建反馈
			if(params.type == "scanToBind"){
				service.scanQr(true);
			}else if(params.type == "inputToBind"){
				if(!$scope.bind.SN){
					toastr.error("SN码不正确！");
					return;
				}
				var form = new FormData();
				form.append("userid",$rootScope.USER.id);
				form.append("sessionid",$rootScope.USER.sessionid);
				form.append("zxnumber",$scope.bind.SN);
				var setUserMedal = function(){
					$http.post($rootScope.CONFIG.itf.user.setUserMedal,form,{headers: {"Content-Type": undefined}})
					.success(function(result){
						if(result.result == 1){
							//var space = result.space;
							//self.get('$state').go('zxMedalInfo',{space: result.space});
							service.$state.go('zxMedalInfo',{space: result.space});
							/*$ionicPopup.alert({
								title: '系统提示',
								template: "恭喜用户将掌秀\""+$scope.bind.SN+"\"与您的掌文账号关联，成功获取掌文赠送的5G个人存储空间！",
								okText: '确定'
							 }).then(function() {
								 this.close();
							 });*/
						} else if(result.result == 2){
							service.activeSessionProxy(function(){
								setUserMedal();
							});
						} else {
							var html = "";
							if(result.description.indexOf("绑定过")>0){
								html = "本活动规定：每个用户只能领取一次奖励，多次领取无效！";
							}else if(result.description.indexOf("已被绑定")){
								html = "本活动规定：每台掌秀设备只能领取一次奖励，多次领取无效！";
							}
							$ionicPopup.alert({
								title: '系统提示',
								template: html,
								okText: '确定'
							 });
							//toastr.error(result.description);
						}
					}).error(function(e){
						toastr.error(e);
					});
				}
				
				setUserMedal();
			
			}
		}
});