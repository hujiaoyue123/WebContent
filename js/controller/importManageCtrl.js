/** 企业员工导入页面 */
angular.module("app")
	.controller("importManageCtrl",function($rootScope,$scope,service,$stateParams,$$user){
		$scope.org = {};
		$scope.org.id = $stateParams.id; //id
		$scope.org.name = $stateParams.name; // 名称
		$scope.download = function(){
			if(UPF.is("WEB")){
				window.open($$user.getImportTemplet(),"_blank");
			}else{
				cordova.InAppBrowser.open($$user.getImportTemplet(), '_system');
			}
		}
		$scope.upload = function(files){
			if(files.length == 0){
				service.showMsg("error","请选择与模板文件类型一致的文件！");
				return;
			}
			loading("start");
			$scope.messages = [];
			var params = {
				id: $scope.org.id,
				files: files
			};
			service.promiseProxy(function(promise){
				$$user.uploadImportExecl(promise,params);
			},function(result){
				loading("end");
				if(result.result == 1){ //查询成功
					service.showMsg("info",result.description);
				}else if(result.result == 3){
					$scope.messages = result.data;
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function () {
						$scope.upload(files);
					});
				}else{	//查询失败
					service.showMsg("error",result.description);
				}
			},function(errer){
				loading("end");
				service.showMsg("error","服务器错误!");
			});
		}
	});