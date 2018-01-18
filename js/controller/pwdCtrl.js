/** 修改密码 */
angular.module("app")
	.controller("pwdCtrl",function($scope,service,$$util,$$user,$stateParams){
		$scope.validation = $stateParams.vc;
		var init = function(){
			$scope.form = {}; //密码表单
		};
		//密码修改
		$scope.updatePwd = function(){
			//还未添加验证
			var params = {
				newpass: $scope.form.pwd1
			};
			if (!$scope.form.pwd1 || !$$util.String.verifyPassword($scope.form.pwd1)){
				service.showMsg("error","密码中必须包含字母、数字，至少6个字符，最多12个字符。");
				return;
			}
			if($scope.form.pwd1 != $scope.form.pwd2){
				service.showMsg("error","请确认新密码输入一致！");
				return;
			}
			if($scope.validation){
				params.validation = $scope.validation;
			}else{
				params.oldpass = $scope.form.oldpwd;
			}
			//链式执行
			service.promiseProxy(function(promise){
				$$user.updatePwd(promise,params);
			},function(result){
				if(result.result == 1){//修改成功
					params.token = params.token;
					params.chatpwd = result.chatpwd;
					$$user.setLocalUser(null,params); //更新本地用户
					if($scope.validation){
						service.$state.go("tab.ppan");    //验证码登陆修改密码完成后跳转到首页
					}else{
						service.$ionicHistory.goBack();   //返回视图
					}
					service.showMsg("success",result.description);
				}else if(result.result == 2){ //session过期
					service.activeSessionProxy(function () {
						$scope.updatePwd();
					}); //激活session
				}else{
					service.showMsg("error",result.description);
				}
			});
		};
		/** 执行初始化*/
		service.validUser(init);
	});