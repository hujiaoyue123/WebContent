/**
 * 掌秀连接说明
 */
angular.module('app')
.controller('changeWifi',function($scope,$rootScope,$injector,$stateParams){
	
	$scope.dev = [];
	$scope.dev.dspName = $stateParams.dspName;
	$scope.dev.newName = "";
	$scope.perfindssid = null;
	/**
	 * 跳转至wifi设置界面
	 */
	$scope.gotowifi = function(){
		$injector.get('$$zsetting').goToWifiSetting();
	};
	$scope.jumpToScan = function(){
		$injector.get('$state').go("zxScan");
	};
	/**
	 * 视图进入
	 */
	$scope.$on('$ionicView.enter',function(){
		$scope.perfindssid = setInterval(function(){
				$injector.get('$$zsetting').getSSID({},function(result){
						$scope.dev.newName = result.substring(1,result.length-1);
						$scope.$apply();
					},function(error){
					});
		},2000);
	});
	/**
	 * 视图离开
	 */
	$scope.$on('$ionicView.beforeLeave',function(){
		clearInterval($scope.perfindssid);
	});
});