/**
 * wifi
 */
angular.module('app')
.controller('wifi',function($state,$scope,$rootScope,$injector,$stateParams,$http){
	/**
	 * $stateParams 参数
	 * @param name 设备名称
	 * @param address 设备的连接地址
	 * @param wifiSwitch 连接状态
	 */
	$scope.device = {
		name: $stateParams.name,
		address: $stateParams.address
	};
	$scope.status = {}; //状态对象
	$scope.settings = {
		address: $stateParams.address, //掌秀连接的ip
		wlanList: [], //wlan列表	
		wifiConnectBtn: true //wifi连接开关
	};
	/**
	 * 搜索可用wifi
	 */
	var getWifiInfo = function(){
		$scope.status.searchingWifi = true;
		var urlPer = "http://" + $scope.settings.address;
		//搜索可用wlan
		$http.get(urlPer + config.zhangShow.zsetting.getWlanApList,{})
			.success(function(result){
				$scope.status.searchingWifi = false;
				var apList = new String();
				var gSSIDArray = new Array();
				var gSecurityArray = new Array();
				var gApArray ; 
				var gApHyperLinkArray ;
				var apListSize;
				var tmpArray;
				apList = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
				
				gApArray = apList.split("\n");
				gApHyperLinkArray = apList.split("\n");
				apListSize = gApArray.length - 2;
				for (i = 0; i < apListSize; i++)
				{
					tmpArray = gApHyperLinkArray[2+i].split(":");
					gSSIDArray[i] = tmpArray[0];
					gSecurityArray[i] = tmpArray[1];
				}

				if (0 < gApArray[0])
				{
					showApList(gSSIDArray, gSecurityArray);
				}
				
				if($state.current.controller=="wifi"){
					var t = setTimeout(function(){
						getWifiInfo();
					},10000);
				}
			})
			.error(function(){
				$scope.status.searchingWifi = false;
			});		
	};
	
	/**
	 * wlan集合
	 */
	var showApList = function(SSIDArray, securityStringArray){
		var i = 0;
		var dspName;

		for (i = 0; i < SSIDArray.length; i++)
		{
			var f = false;
			dspName = $injector.get('$$zsetting').getSSIDDspStr(SSIDArray[i]);
			for(var t = 0;t <$scope.settings.wlanList.length;t++){
				if($scope.settings.wlanList[t].dspName == dspName){
					f = true;
				}
			}
			if(!f){
				$scope.settings.wlanList.push({idex:i,dspName:dspName});
			}
		}
	};
	/**
	 * 连接
	 * @param wlan 网络连接对象
	 */
	$scope.connect = function(wlan){
		var wifiList;
		//填充密码
		if(localStorage.wifiList){
			wifiList = JSON.parse(localStorage.wifiList); //存储的wifi列集合
			if(wifiList.length>0){
				for(var i=0;i<wifiList.length;i++){
					if(wlan.dspName == wifiList[i].name){
						wlan.password = wifiList[i].password;
						break;
					}
				}
			}
		}else{
			wifiList = [];
		}
		//弹框
		var options = {
			title: '连接网络',
			subTitle: '您将连接到:' + wlan.dspName,
			inputType: 'password',
			defaultText: wlan.password ? wlan.password : '',
			inputPlaceholder: '请输入密码',
			cancelText: '取消',
			okText: '连接'
		};
		$injector.get('$ionicPopup').prompt(options)
			.then(function(password){
				if(password){
					setWlan(password);
				}
			});
		//设置掌秀wlan
		var setWlan = function(password){
			$injector.get('service').loading('start'); //设置中
			var urlPer = "http://" + $scope.settings.address;
			if(!password){
				console.log("password:"+password);
			}
			var pwd = wlan.dspName +"|"+ wlan.dspName + "|2|none|" + password;
			$http.get(urlPer + config.zhangShow.zsetting.wlanConnectAp + pwd,{timeout: 8000})
				.success(function(result){
					$injector.get('service').loading('end'); //设置完毕
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					if(str == "OK"){
						var initparam = {
								dspName : wlan.dspName
						};
						$injector.get('$state').go("changeWifi",initparam);
					}
					//存储wlan密码
					if(wifiList.length>0){
                        for(var i=0;i<wifiList.length;i++){
                            if(wlan.dspName == wifiList[i].name){
                                wifiList[i].password = password;
                                break;
                            }
                        }
					}else{
						wifiList.push({name: wlan.dspName,password: password});
					}
                    localStorage.wifiList = JSON.stringify(wifiList);
				})
				.error(function(){
					$injector.get('service').loading('end'); //设置完毕
					$injector.get('toastr').error("连接失败，请重新连接！");
				});
		}
	};
	/**
	 * 获取WIFI列表
	 * @param 
	 */
	$scope.toggleWifiBtn = function(value){
		if(value){
			getWifiInfo();
		} else {
			$scope.settings.wlanList = [];
		}
	};
	
	/**
	 * 断掉wifi
	 */
	$scope.disConnectWifi = function(){
		$injector.get('service').loading('start');
		//断掉wifi
		var urlPer = "http://" + $scope.settings.address;
		$http.get(urlPer + config.zhangShow.zsetting.wlanDisconnect,{timeout: 8000})
			.success(function(result){
				$injector.get('service').loading('end');
				$injector.get('toastr').info("wifi连接关闭，请重新连接设备");
				//回退视图
				$rootScope.wifiChangedDeviceName = $scope.device.name; //改变网络的设备
				$injector.get('$ionicHistory').goBack();
			})
			.error(function(){
				$injector.get('service').loading('end');
				$injector.get('toastr').info("wifi连接关闭，请重新连接设备");
				$rootScope.wifiChangedDeviceName = $scope.device.name; //改变网络的设备
				$injector.get('$ionicHistory').goBack();
			});
	};
	/**
	 * 视图进入
	 */
	$scope.$on('$ionicView.enter',function(){
		if($stateParams.wifiSwitch == 'ON'){
			$scope.settings.wifiConnectBtn = true;
			getWifiInfo(); //搜索可用wifi
		}else{
			$scope.settings.wifiConnectBtn = false;
		}
	});
});