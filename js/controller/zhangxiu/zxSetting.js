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
.controller('zxSetting',function($scope,$rootScope,$http,$injector,$stateParams,$$mobile){
	$scope.hostIp = null;											//手机的IP
	$scope.zxIp = null;											    //掌秀的IP
	$scope.zxMac = null;											//掌秀的Mac
	$scope.findStatus = false;
	$scope.findDevice = [];
	$scope.device  = [];
	$scope.findDevice.progress = 0;
	
	$scope.title = $stateParams.name;
	$scope.device.name = $stateParams.name;
	$scope.device.address = $stateParams.address;
	$scope.device.fiveG = false;									//默认为2.4G切5G
	
	
	/**
	 * 加载设备
	 */
	$scope.loadDevice = function(){
		//从绑定设备中找到选中的设备并加载数据
		getDeviceInfo($scope.device);
	};
	
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
	 * 提示弹窗
	 */
	var showTip = function(msg){
		$injector.get('$ionicPopup').alert({
            title: '系统提示',
            template: msg, 
            okText: '知道了'
        }).then(function(res) {
    		this.close();
        });
	}
	
	/**
	 * 获取设备信息
	 * @param device 设备基础信息对象
	 */
	var getDeviceInfo = function(device){
		//请求
		try{
			var urlPer = "http://" + device.address;
			//1 设备名称
			$http.get(urlPer + config.zhangShow.zsetting.getSystemDeviceName,{})
				.success(function(result){
					$scope.device.status = "connected";
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					//更新当前设备名称
					device.name = str;
				})
				.error(function(){
					return false;
				});
			//无线状态
			$http.get(urlPer+config.zhangShow.zsetting.getCurrWlan0AP,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					str = str.substring(2,str.length-1);
					//更新当前wifi开关
					device.wifiSwitch = str;
					return;
					//暂无用处
					if(str == "ON"){
						$scope.settings.wifiConnectbut = true;
					}else{
						$scope.settings.wifiConnectbut = false;
					}
				})
				.error(function(){
					return false;
				});
			//5G优先
			$http.get(urlPer + config.zhangShow.zsetting.getWifiRadioBand,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					str = str.substring(2,str.length-1);
					//更新当前是否5G
					if(str == "WIFI_FREQ_24G"){
						device.fiveG = false;
					}else{
						device.fiveG = true;
					}
				})
				.error(function(){
					return false;
				});
			//版本信息
			$http.get(urlPer + config.zhangShow.zsetting.getFWVersion,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					var version = str.substr(str.indexOf(":")+1,str.length-1);
					//更新当前设备版本信息
					device.version = version;
					//比较版本
					device.newVersion = $rootScope.ZXVersion; //最新ROM版本
					//是否需要更新
					if(device.version && $rootScope.ZXVersion){
						if($scope.compareVersion(device.newVersion,device.version)){
							device.upgrade = {
								newVersion: true
							};
						}else{
							device.upgrade = {
								newVersion: false
							};
						}
					}
				})
				.error(function(){
					return false;
				});
		}catch(e){
			console.log(e);
		}
	};
	/**
	 * 比较掌秀版本
	 * @param v1 新版本
	 * @param v2 当前版本
	 * @return true即为需要更新
	 */
	$scope.compareVersion = function(v1,v2){
		var n1 = v1.split(".");
		var n2 = v2.split(".");
		var len = n1.length>n2.length?n1.length:n2.length;
		for(var i=0;i<len;i++){
			var v1 = n1[i] || 0;
			var v2 = n2[i] || 0;
			if(v1>v2){
				return true;
			}else if(v1<v2){
				return false;
			}
		}
		return false;
	};
	/**
	 * 设置无线网络
	 * @param device 设备基础信息
	 */
	$scope.setWifiConnection = function(device){
		if(device.upgrade && device.upgrade.upgrading){
			$injector.get('toastr').info("掌秀升级中，请稍后...");
			return;
		}
		if(device.status != "connected"){
			$injector.get('toastr').info("掌秀未连接成功，请稍后...");
			return;
		}
		var inParams={
			name: device.name,
			address: device.address,
			wifiSwitch: device.wifiSwitch
	    };
		$injector.get('$state').go("wifi",inParams);
	};
	/**
	 * 修改设备名称
	 * @param device 设备基础信息
	 */
	$scope.changeDeviceName = function(device){
		if(device.upgrade && device.upgrade.upgrading){
			$injector.get('toastr').info("掌秀升级中，请稍后...");
			return;
		}
		var tempScope = $scope.$new(true);
		tempScope.device = {
			name: device.name
		};
		//
		var options = {
			title: "修改设备名称",
			subTitle: "您将修改的设备:" + tempScope.device.name,
			template: '<input type="text" placeholder="设备名称 " ng-model="device.name" autofocus>',
			scope: tempScope,
			buttons:[{
				text: "取消",
				type: "button-default",
			},{
				text: "确定",
				type: "button-positive",
				onTap: function(e){
					if(!tempScope.device.name){
						e.preventDefault();
					}else{
						setDeviceName(tempScope.device.name);
					}
				}
			}]
		};
		//弹窗
		$injector.get('$ionicPopup').show(options);
		//修改设备名称
		var setDeviceName = function(name){
			if(!name) return;
			if(name.length >= 13){
				$injector.get('toastr').error('设置名称过长,请不要超过12个字符！')
				return;
			}
			var urlPer = "http://" + device.address;
			$http.get(urlPer + config.zhangShow.zsetting.setSystemDeviceName + name,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					if(str == "OK"){
						//修改设备名称
						device.name = name;
						$scope.title = name;
						$injector.get('$state').go("nameChange");
					}
				})
				.error(function(){
					$injector.get('toastr').error('连接失败，请重新连接！');
				});
		};
	};
	/**
	 * 选择设备语言
	 * @param device 设备基础信息
	 */
	$scope.chooseDeviceLanguage = function(device){
		if(device.languageList.length>0){
			$scope.currentDevice = device; //当前选择的设备
			var options = {
				title: "选择语言",
				template : '<div ng-repeat="language in currentDevice.languageList track by $index"><ion-radio ng-value="{{language.inx}}" ng-click="setDeviceLanguage(currentDevice,language,popupWindow)">{{language.name}}</ion-radio></div>',
				scope: $scope,
				buttons:[{
					text:"取消"
				}]
			};
			//弹窗
			$scope.popupWindow = $injector.get('$ionicPopup').show(options);
		}
	};
	/**
	 * 选择显示比例
	 * @param device 设备基础信息
	 */
	$scope.chooseDeviceDisplay = function(device){
		$scope.currentDevice = device; //当前选择的设备
		var options = {
			title: "选择显示比例",
			template: '<div ng-repeat="display in currentDevice.displayList track by $index"><ion-radio ng-click="setDeviceDisplay(currentDevice,display,popupWindow)">{{display.name}}</ion-radio></div>',
			scope: $scope,
			buttons: [{
				text: "取消"
			}]
		};
		$scope.popupWindow = $injector.get('$ionicPopup').show(options);
	};
	/**
	 * 设置显示比例
	 * @param device 设备基础信息
	 * @param display 显示屏对象
	 * @param popupWindow 弹框实例
	 */
	$scope.setDeviceDisplay = function(device,display,popupWindow){
		if(popupWindow){
			popupWindow.close();
		}
		var urlPer = "http://" + device.address;
		$http.get(urlPer + config.zhangShow.zsetting.setVideoAspectRatio + display.idx,{})
			.success(function(result){
				var str = new String();
				str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
				if(str == "OK"){
					device.display = display.name;
					$injector.get('toastr').info("设置成功！");
				}
			})
			.error(function(){
				$injector.get('toastr').error("设置失败，请重新操作！");
			});
	};
	/**
	 * 切换5G
	 * @param device 设备基础信息
	 */
	$scope.setWifiMode = function(device){
		if(device.upgrade && device.upgrade.upgrading){
			$injector.get('toastr').info("掌秀升级中，请稍后...");
			return;
		}
		//检测wifi是否连接，连接了提示关掉
		var flag = device.address !== "192.168.59.254";
		var tflg = device.address !== "172.30.1.1";
		//判断wifimode
		var onOff = "$[OFF]";
		if(!device.fiveG){ //5G
			onOff = "$[ON]";
		}
		var urlPer = "http://" + device.address;
		$http.get(urlPer + config.zhangShow.zsetting.setForce5G + onOff,{})
			.success(function(result){
				var str = new String();
				str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
				if(str == "OK"){
					//$scope.reConnect(device,3000);//3秒后重新连接
					//切换wifi
					$http.get(urlPer + config.zhangShow.zsetting.switchWifiRadioBand,{})
						.success(function(){})
						.error(function(){});
					$injector.get('$state').go("changeFive");
				}
			})
			.error(function(){
				$injector.get('toastr').error("设置失败，请重新操作！");
			});
	};
	
	/**
	 * 系统升级
	 * @param device 设备基础信息
	 */
	$scope.systemUpgrade = function(device){
		//正在升级中
		if(device.upgrade && device.upgrade.upgrading){
			$injector.get('toastr').info('正在升级,请稍等');
			return;
		}
		if(!$rootScope.ZXVersion){
			showTip("<center>未获取到最新版本信息，请将掌秀连接到无线网络,再进行升级操作！</center>");
			$$mobile.app.getNewVersionInfo();
			return;
		}
		//无需更新提醒
		if(!$scope.compareVersion($rootScope.ZXVersion,device.version)){
			var options = {
				title: '提醒',
				template: '<center>已是最新版本,是否重新升级?</center>',
				cancelText: '取消',
	            okText: '确定'
			};
			$injector.get('$ionicPopup').confirm(options)
				.then(function(res){
					if(res){
						upgrade(device); //开始升级
					}
				});
		}
		//更新提醒
		else{
			var options = {
	            title: '系统升级',
	            template: "<center>系统将进行在线升级，请确认手机连接网络！</center><center>升级过程，请耐心等待！</center>", //从服务端获取更新的内容
	            cancelText: '取消',
	            okText: '确定'
	        };
			$injector.get('$ionicPopup').confirm(options)
				.then(function(res){
					if(res){
						upgrade(device); //开始升级
					}
				});
		}
		//开始升级
		var upgrade = function(device){
			//标识:开始升级
    		device.upgrade.upgrading = true;
    		//请求升级
        	var params = {
        		url: "http://" + device.address + config.zhangShow.zsetting.updateSystem,
        		name: device.name
        	};
			$injector.get('$$zsetting').updateDevice(params,function(msg){
				if(msg == 'success'){
					$injector.get('toastr').info("系统开始升级！");
					$scope.reConnect(device,10000);//10秒后重新连接
				}else{
					$injector.get('toastr').info(msg);
				}
				device.upgrade.upgrading = false;
				device.status = 'over';
			},function(msg){
				device.status = 'over';
				device.upgrade.upgrading = false;
				$injector.get('toastr').error(msg);
			});
		};
	};
	/**
	 * 掌秀rom包上传下载进度
	 * @param params {total: 当前传输字节,contentLength: 数据总字节,progress: 当前传输进度百分比}
	 */
	var onProgress = function(params){
		//验证参数
		if(!params || !params.name){
			return;
		}
		//获取指定设备
		/*var device;
		for(var i=0;i<$scope.deviceList.length;i++){
			var d = $scope.deviceList[i];
			if(d.name == params.name){
				device = d;
				break;
			}
		}*/
		//验证设备
		if(!$scope.device){return};
		//更新升级状态
		if(params.type == 'download' || params.type == 'upload'){
			$scope.$apply(function(){
				$scope.device.status = params.type; //更新状态
				$scope.device.upgrade.progress = params.progress; //更新进度
			});
			//上传完成
			if(params.type == 'upload' && params.progress == 100){
				$scope.device.status = 'install'; //更新状态: 安装中
				$injector.get('$state').go("zxUpdate");
			}
		}
	};
	/**
	 * 断掉wifi
	 */
	$scope.disConnectWifi = function(){
		//$injector.get('service').loading('start');
		//断掉wifi
		var urlPer = "http://" + $scope.device.address;
		$http.get(urlPer + config.zhangShow.zsetting.wlanDisconnect,{timeout: 8000})
			.success(function(result){
				$injector.get('$state').go("hotPoint");
			})
			.error(function(){
			});
	};
	/**
	 * 恢复出厂设置
	 * @param device 设备基础信息
	 */
	$scope.resetFactorySettings = function(device){
		if(device.upgrade && device.upgrade.upgrading){
			$injector.get('toastr').info("掌秀升级中，请稍后...");
			return;
		}
		$injector.get('$ionicPopup').confirm({
            title: '恢复出厂设置',
            template: "<center>确定要将掌秀恢复至出厂设置?</center>", //从服务端获取更新的内容
            cancelText: '取消',
            okText: '确定'
        }).then(function (res) {
            if (res) {
            	var urlPer = "http://" + device.address;
				$http.get(urlPer + config.zhangShow.zsetting.resetToDefault,{})
					.success(function(result){
						var str = new String();
						str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
						if(str == "OK"){
							$injector.get('toastr').info("设置成功");
							$injector.get('$state').go("reset");
						}
					})
					.error(function(){
						$injector.get('toastr').error("设置失败，请重新操作！");
					});
            }
        });
	};
	/**
	 * 集合是否包含元素
	 */
	var arrayContainItem = function(array,item,key){
		for(var i=0;i<array.length;i++){
			if(item[key] == array[i][key]){ //匹配
				return true;
			}
		}
		return false;
	};
	/**
	 * 执行一次
	 */
	if(UPF.is('app')){
    	$injector.get('$$zsetting').deviceFinder.onProgress = onProgress;
	}
	/**
	 * 视图进入
	 */
	$scope.$on('$ionicView.enter',function(){
		$rootScope.ZXVersion = null;
		$$mobile.app.getNewVersionInfo();
		$scope.loadDevice();
	});
	/**
	 * 视图离开
	 */
	$scope.$on('$ionicView.beforeLeave',function(){
		//清除定时搜索设备
	});
});