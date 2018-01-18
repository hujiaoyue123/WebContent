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
.controller('zxConnection',function($scope,$rootScope,$http,$injector){
	$scope.hostIp = null;											//手机的IP
	$scope.zxIp = null;											    //掌秀的IP
	$scope.zxMac = null;											//掌秀的Mac
	$scope.searchDeviceList = []; 									//绑定设备时搜索到的设备列表
	$scope.deviceList = [];			 								//展示的设备列表
	$scope.findStatus = false;
	$scope.findDevice = [];
	$scope.findDevice.progress = 0;
	
	if(!localStorage.bindDeviceList){
		localStorage.bindDeviceList = "";
	}
	
	/**
	 * 加载设备
	 */
	$scope.loadDevice = function(){
		//加载本地缓存的绑定设备
		if(localStorage.bindDeviceList != "" ){
			$scope.deviceList = JSON.parse(localStorage.bindDeviceList);
		}
		//获取后台存储的绑定设备
		if(!($scope.deviceList.length > 0)){
			
		}
		//从绑定设备中找到选中的设备并加载数据
		var length = $scope.deviceList.length;
		if(length >0){
			for(var i = 0;i<length;i++){
				$scope.device = $scope.deviceList[i];
				if(length == 1 || $scope.device.selected){
					$scope.device.selected = true;
					$scope.showTipFlag = false;  //没有提示过
					$scope.checkAndGetInfoDevice($scope.device);
				}
			}
		}else{
			$scope.device.tip = "请选添加掌秀设备";
		}
	};
	/**
	 * 检查并获取设备信息
	 * @param device 设备
	 */
	$scope.checkAndGetInfoDevice = function(device){
		try{
			if(device.address){
				device.status = "connecting";//设备连接中
				var url = "http://"+device.address + config.zhangShow.zsetting.checkDevice;
				$http.get(url,{timeout : 5000})
				.success(function(result){
					device.status = "connected";//设备连接成功
					getDeviceInfo(device);
				})
				.error(function(){
					$scope.checkAndGetInfoDevice(device);
					if(!$scope.showTipFlag){
						$scope.showTipFlag = true;  //提示过
						//showTip("未连接上设备，请将手机连接到掌秀wifi或将手机与掌秀连到同一局域网！");
					}
				});
			}
		}catch (e) {
			console.log("checkDevice error");
		}
	}
	/**
	 * 选择设备
	 * @param device 设备
	 */
	$scope.chooseDevice = function(device){
		//标识已选择的设备
		for(var i=0;i<$scope.deviceList.length;i++){
			var d = $scope.deviceList[i];
			if(d.name == device.name){
				d.selected = true;
			}else{
				d.selected = false;
			}
		}
		$scope.device = device;
		//记录选择的设备
		$scope.dataCache();
		//获取设备信息
		$scope.showTipFlag = false;//没有提示过
		$scope.checkAndGetInfoDevice($scope.device);
	};
	/**
	 * 弹出绑定设备窗口
	 */
	$scope.bindDevice = function(){
		$scope.findDevice.progress = 0;
		//弹出搜索框
		var html = '<div ng-if="true" style="position: absolute; left: 0px; top: 3px; width: 100%; padding-left: 1px; padding-right: 1px;">';
		html += '<div  style="width: auto;height: 6px;background: rgb(76,184,243);overflow: hidden;">';
		html += '<div style="width: auto;height: 6px;position: relative;top: 0;background: #ddd;" ng-style="{\'left\': findDevice.progress+\'%\'}"></div>';
	    html += '</div></div>';
		var options = {
				title:"绑定设备",
				scope : $scope,
				subTitle: "<font color=\"rgb(76,184,243)\">手机与掌秀同在一个局域网可找到设备，</font><br><font color=\"rgb(76,184,243)\">找到设备后，请点击选择掌秀</font>",
	            template: html+"<div ng-repeat='item in searchDeviceList track by $index'><ion-radio ng-click=\"bind({{item}})\">{{item.name}}</ion-radio></div>", //从服务端获取更新的内容
	            buttons:[{
					text:"取消",
					onTap:function(e){
						$scope.findStatus = true;
						clearInterval(perfinddevice);
					}
				}]
	        };
		$scope.popupWindow = $injector.get('$ionicPopup').show(options);
		
		var perfinddevice = setInterval(function(){
			if($scope.findDevice.progress<100){
				$scope.findDevice.progress += 1;
				console.log($scope.findDevice.progress);
			}else{
				clearInterval(perfinddevice);
			}
			$scope.$apply();
		},200);
		
		//获取IP
		$injector.get('$$zsetting').getHostIp([],function(ip){
			$scope.hostIp = ip; 
			$scope.searchDevice();
		});
	}
	
	/**
	 * 解除绑定
	 */
	$scope.releaseBindDevice = function(dev){
		var obj = [];
		for(var i=0;i<$scope.deviceList.length;i++){
			if(dev.name == $scope.deviceList[i].name){
				$scope.deviceList.splice(i,1);
				if(dev.selected){
					$scope.device = null;
				}
				i--;
				break;
			}
		}
		//缓存数据
		$scope.dataCache();
		//关闭option button
		$injector.get('$ionicListDelegate').closeOptionButtons();
	}
	
	/**
	 * 重新连接
	 */
	$scope.reConnect = function(device,time){
		var t = setTimeout(function(){
			$scope.showTipFlag = false;  //没有提示过
			$scope.checkAndGetInfoDevice(device);
		},time);
	}
	
	/**
	 * 数据缓存
	 */
	$scope.dataCache = function(){
		var list = [];
		for(var i =0;i<$scope.deviceList.length;i++){
			list.push({name:$scope.deviceList[i].name,address:$scope.deviceList[i].address,selected:$scope.deviceList[i].selected,mac:$scope.deviceList[i].mac});
		}
		localStorage.bindDeviceList = JSON.stringify(list);
	}
	
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
	 * 绑定掌秀设备
	 */
	$scope.bind = function(item){
		if($scope.popupWindow){
			$scope.popupWindow.close();
		}
		$scope.findStatus = true;
		var mac = item.mac;
		if(!mac){
			$scope.getZXMac(item);
		}else{
			//调用后台服务器bind接口
			//展示bind的设备
			if(!$scope.isContain($scope.deviceList,item)){
				$scope.deviceList.push(item);
				$scope.chooseDevice(item);//选择设备
			}
		}
	}
	
	/**
	 * 获取掌秀的Mac地址
	 */
	$scope.getZXMac = function(item){
		try{
			if(item.address){
				//获取设备名称
				var urlPer = "http://" + item.address;
				$http.get(urlPer + config.zhangShow.zsetting.getMacAddress,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					if(str != "IMSAP"){
						item.mac = str;
					}
					if(!$scope.isContain($scope.deviceList,item)){
						$scope.deviceList.push(item);
						$scope.chooseDevice(item);//选择设备
					}
					console.log(str);
				})
				.error(function(){
					if(!$scope.isContain($scope.deviceList,item)){
						$scope.deviceList.push(item);
						$scope.chooseDevice(item);//选择设备
					}
					//return false;
				});
			}
		}catch (e) {
			console.log("getSystemDeviceName error");
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
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					//更新当前设备名称
					device.name = str;
				})
				.error(function(){
					return false;
				});
			//2 语言
			$http.get(urlPer + config.zhangShow.zsetting.getMenuLanguage,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					//更新当前语言状态
					device.language = str;
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
			//语言列表
			$http.get(urlPer + config.zhangShow.zsetting.getMenuLanguageList,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					//更新当前语言列表
					if(!device.languageList){
						device.languageList = [];
					}
					var items = str.split("\n");
					for(var i=0;i<items.length;i++){
						var tm = items[i].split(":");
						var flag = false;
						for(var n = 0;n<device.languageList.length;n++){
							if(tm[0] == device.languageList[n].idx){
								flag = true;
								break;
							}
						}
						if(!flag){
							if(tm[1] == "English" || tm[1] == "简体中文"){
								device.languageList.push({idx:tm[0],name:tm[1]});
							}
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
			if(name.length >= 11){
				$injector.get('toastr').error('设置名称过长,请不要超过10个字符！')
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
						//数据缓存
						$scope.dataCache();
						$scope.searchDeviceList = [];
						$injector.get('toastr').info('设备名称修改成功');
						//直连修改名称后会断网
						$scope.reConnect(device,2000);//2秒后重新连接
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
	 * 设置设备语言
	 * @param device 设备基础信息
	 * @param selectedLanguage 选择的语言
	 * @param popupWindow 选择框实例
	 */
	$scope.setDeviceLanguage = function(device,selectedLanguage,popupWindow){
		if(popupWindow){
			popupWindow.close();
		}
		var urlPer = "http://" + device.address;
		$http.get(urlPer + config.zhangShow.zsetting.setMenuLanguage + selectedLanguage.idx,{})
			.success(function(result){
				var str = new String();
				str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
				if(str == "OK"){
					//更新当前语言
					device.language = selectedLanguage.name;
					//重新加载数据
					getDeviceInfo(device);
					$injector.get('toastr').info('设置成功');
				}
			})
			.error(function(){
				$injector.get('toastr').error('设置失败，请重新操作！')
			});
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
		if(flag && tflg){
			$injector.get('$ionicPopup').confirm({
                title: '系统提示',
                template: "掌秀在连接wifi状态下无法进行2.4G与5G切换，请断开wifi再进行切换操作", //从服务端获取更新的内容
                cancelText: '关闭',
                okText: '知道了'
            }).then(function(res) {
        		device.fiveG = !device.fiveG;
            });
			return ;
		}else{
			//判断wifimode
			var onOff = "$[OFF]";
			if(device.fiveG){ //5G
				onOff = "$[ON]";
			}
			//force5G
			var urlPer = "http://" + device.address;
			$http.get(urlPer + config.zhangShow.zsetting.setForce5G + onOff,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					if(str == "OK"){
						$scope.reConnect(device,3000);//3秒后重新连接
						//切换wifi
						$http.get(urlPer + config.zhangShow.zsetting.switchWifiRadioBand,{})
							.success(function(){})
							.error(function(){});
					}
				})
				.error(function(){
					$injector.get('toastr').error("设置失败，请重新操作！");
				});
		}
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
		if(!device.newVersion){
			showTip("<center>未获取到最新版本信息，请检查网络是否正确！</center>");
			return;
		}
		//无需更新提醒
		if(!$scope.compareVersion(device.newVersion,device.version)){
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
		var device;
		for(var i=0;i<$scope.deviceList.length;i++){
			var d = $scope.deviceList[i];
			if(d.name == params.name){
				device = d;
				break;
			}
		}
		//验证设备
		if(!device){return};
		//更新升级状态
		if(params.type == 'download' || params.type == 'upload'){
			$scope.$apply(function(){
				device.status = params.type; //更新状态
				device.upgrade.progress = params.progress; //更新进度
			});
			//上传完成
			if(params.type == 'upload' && params.progress == 100){
				device.status = 'install'; //更新状态: 安装中
			}
		}
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
							$scope.reConnect(device,10000);//10秒后重新连接
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
		/**
		 * 搜索结果回调
		 */
		var resultCallback = function(msg){
			if(msg){
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
			if($scope.searchDeviceList.length == 0){
				if($scope.findStatus){
					return;
				}
				if($scope.popupWindow){
					$scope.popupWindow.close();
				}
				showTip("未搜索到掌秀设备，请确认手机与掌秀设备同在一个局域网下！");
			}else{
				if(!$scope.findStatus){  //未绑定，继续查找
					$injector.get('$$zsetting').findDevice(); //搜索设备
				}
			}
		};
		/**
		 * 搜索失败回调
		 */
		var errorCallback = function(msg){
			if($scope.findStatus){
				return;
			}
			if($scope.popupWindow){
				$scope.popupWindow.close();
			}
			showTip("未搜索到掌秀设备，请确认手机与掌秀设备同在一个局域网下！");
		};
		//注册回调
		$injector.get('$$zsetting').init(resultCallback,completeCallback,errorCallback);
		//注册onProgress
    	$injector.get('$$zsetting').deviceFinder.onProgress = onProgress;
	}
	/**
	 * 视图进入
	 */
	$scope.$on('$ionicView.enter',function(){
		
		//wifi切换-移除设备
		if($rootScope.wifiChangedDeviceName){
			var wifiChangedDeviceName = $rootScope.wifiChangedDeviceName; //刚修改过的wifi设备
			//展示设备列表
			for(var i=0;i<$scope.deviceList.length;i++){
				if($scope.deviceList[i].name == wifiChangedDeviceName){
					$scope.deviceList.splice(i,1); //移除
					$scope.device = null;
				}
			}
			$scope.dataCache();
			$scope.searchDeviceList = [];
			delete $rootScope.wifiChangedDeviceName;
		}else{
			//加载设备
			$scope.loadDevice();
		}
	});
	/**
	 * 视图离开
	 */
	$scope.$on('$ionicView.beforeLeave',function(){
		//清除定时搜索设备
		if(typeof searchTimeout == 'number'){
			clearTimeout(searchTimeout);
		}
		searchTimeout = ''; //设为字符串,用于区别是否已形成定时循环
	});
});