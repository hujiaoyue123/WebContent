/**
 * 掌秀连接
 * device全字段说明
 * name: '', //设备名称
 * address: '', //设备连接地址
 * language: '', //设备语言
 * languageList: [], //语言列表
 * wifiSwitch: 'OFF', //局域网开关
 * display: '', //显示比例
 * displayList: [], //显示比例列表
 * fiveG: false, //5G优先
 * version: '', //版本信息
 * newVersion: '', //最新版本信息
 * upgrade: { //更新
 *		newVersion: false, //是否有新更新
 *		upgrading: false, //正在更新
 *		status: '', //更新状态：download/upload/install/over
 *		progress: 0
 *	}
 */
angular.module('app')
.controller('zxScan',function($scope,$rootScope,$http,$injector){
	$scope.hostIp = null;											//手机的IP
	$scope.zxIp = null;											    //掌秀的IP
	$scope.searchDeviceList = []; 									//绑定设备时搜索到的设备列表
	$scope.findStatus = false;
	$scope.findDevice = [];
	
	$scope.findDevice.fond = false;
	$scope.perfinddevice = null;
	
	/**
	 * 搜索设备
	 */
	$scope.searchDevice = function(){
		//根据IP地址搜索设备
		//在投屏或直连的情况下,直接获取掌秀信息
		if($scope.hostIp.indexOf("192.168.59")==0 || $scope.hostIp.indexOf("172.30.1")== 0 || $scope.hostIp.indexOf("192.168.49")== 0){
			if($scope.hostIp.indexOf("192.168.59")==0 ){
				$scope.zxIp = "192.168.59.254";
			}else if($scope.hostIp.indexOf("172.30.1")==0){
				$scope.zxIp = "172.30.1.1";
			}else if($scope.hostIp.indexOf("192.168.49")==0){
				$scope.zxIp = "192.168.49.213";
			}
			try{
				if($scope.zxIp){
					//获取设备名称
					var urlPer = "http://" + $scope.zxIp;
					$http.get(urlPer + config.zhangShow.zsetting.getSystemDeviceName,{})
					.success(function(result){
						$scope.findDevice.fond = true;
						var str = new String();
						str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
						var opt = {name : str,address: $scope.zxIp,selected:false,mac:''};
						if(!$scope.isContain($scope.searchDeviceList,opt)){
							$scope.searchDeviceList.push(opt);
						}
					})
					.error(function(){
						return false;
					});
				}
			}catch (e) {
				console.log("getSystemDeviceName error");
			}
		}else{
			$scope.findStatus = false;
			$injector.get('$$zsetting').findDevice(); //搜索设备
		}
	}
	
	
	/**
	 * 判断某列表中是否包含某掌秀设备
	 */
	$scope.isContain = function(list,opt){
		for(var i = 0;i<list.length;i++){
			var name = list[i].name;
			var address = list[i].address;
			var mac = list[i].mac;
			if(mac != "" && mac == opt.mac){
				return true;
			}else if(name == opt.name){
				return true;
			}
		}
		return false;
	}
	
	
	/**
	 * 执行一次
	 */
	if(UPF.is('app')){
		/**
		 * 搜索结果回调
		 */
		var resultCallback = function(msg){
			if(msg){
				$scope.findDevice.fond = true;
				var opt = {name:msg.fname,address:msg.lsn,selected:false,mac:''};
				if(!$scope.isContain($scope.searchDeviceList,opt)){
					$scope.searchDeviceList.push(opt);
					$scope.$apply();
				}
			}
		};
		/**
		 * 搜索完毕回调
		 */ 
		var completeCallback = function(msg){
			/*if($scope.searchDeviceList.length == 0){
				if($scope.findStatus){
					return;
				}
				//showTip("未搜索到掌秀设备，请确认手机与掌秀设备同在一个局域网下！");
			}else{
				if(!$scope.findStatus){  //未绑定，继续查找
					$injector.get('$$zsetting').findDevice(); //搜索设备
				}
			}*/
		};
		/**
		 * 搜索失败回调
		 */
		var errorCallback = function(msg){
			/*if($scope.findStatus){
				return;
			}
			if($scope.popupWindow){
				$scope.popupWindow.close();
			}
			showTip("未搜索到掌秀设备，请确认手机与掌秀设备同在一个局域网下！");*/
		};
		//注册回调
		$injector.get('$$zsetting').init(resultCallback,completeCallback,errorCallback);
	}
	/**
	 * 找不到掌秀，跳转至说明页
	 */
	$scope.scanNotFind = function($event){
		if($event){
			$event.stopPropagation();
		}
		//todo 清除一些操作如：关掉设备搜索
		//跳转至说明页
		$injector.get('$state').go("zxHelpTip");
	};
	
	$scope.goSetting = function(param,$event){
		if($event){
			$event.stopPropagation();
		}
		var initParam = {
				name:param.name,
				address:param.address
		};
		$injector.get('$state').go("zxSetting",initParam);
	}
	
	/**
	 * 停止搜索
	 */
	$scope.stopScanDevice = function(){
		//TODO停止搜索设备
		clearInterval($scope.perfinddevice);
	}
	
	/**
	 * 搜索设备
	 */
	$scope.scanDevice = function(){
		$scope.perfinddevice = setInterval(function(){
			$injector.get('$$zsetting').getHostIp([],function(ip){
				$scope.hostIp = ip; 
				$scope.searchDevice();
			});
		},4000);
	}
	
	
	/**
	 * 返回我的界面
	 */
	$scope.goBackToMe = function(){
		$injector.get('$state').go("tab.about");
	}
	
	/**
	 * 视图进入
	 */
	$scope.$on('$ionicView.enter',function(){
		//扫描设备
		$scope.findDevice.fond = false;
		$scope.searchDeviceList = [];
		$scope.scanDevice();
	});
	/**
	 * 视图离开
	 */
	$scope.$on('$ionicView.beforeLeave',function(){
		//停止搜索
		$scope.stopScanDevice();
		$scope.searchDeviceList = [];
		$scope.findDevice.fond = false;
	});
});