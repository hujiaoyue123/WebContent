/** 掌秀设置 */
angular.module("app")
	.controller("zsettingCtrl",function($scope,$rootScope,service,$$widget,$$zsetting,$http,$stateParams,$ionicPopup){
		$scope.scan = {};
		$scope.scan.loading = false;
		window.zsAddresslist = new Array();
		$scope.zsettingItems = {
			zsAddresslist : window.zsAddresslist,
			zsAddress : "",
			wifiConnect : "OFF",
			wifiConnectbut:false,
			fiveG:false,   //5G
			zsDeviceName:'',
			deviceName : "未知",
			deviceVersion:"未知",
			deviceLanguage:"未知",
			deviceShowZoom:"0",
			deviceShowZoomList:[],
			deviceLanguageList:[],
			wlanApList:[],
			byui : "OFF",
 			videoAspectRatio:"未知",
			videoAspectRatioList:[],
			version:'1.23',
			updateVersion:0,
			wifimode:false
		};
		$scope.zsettingItems.zsAddress = $stateParams.ip;
		$scope.wifi = $stateParams.wifi;
		$scope.updating = false;
		var ishowdevice = false;
	
		
		//deviceFinder 正常回调
		var refn = function(msg){
			var address = msg.lsn;
			var dvname = msg.fname;
			var t = {address:address,name:dvname};
			if(!containAddress(t)){
				window.zsAddresslist.push(t);
			}
			if(!ishowdevice){
				//service.showMsg("info","请稍等，正在为您获取设备信息");
				$$widget.POPUP.updateConnectDevice($scope);
			} 
			ishowdevice = true;
		};
		//deviceFinder 错误回调
		var erfn = function(msg){
			$scope.scan.loading = false;
			console.log("erfn");
			checkTouShow();
			service.showMsg("error","未扫描到掌秀设备");
		};
		//deviceFinder 完成回调
		var comfn = function(msg){
			ishowdevice = false;
			$scope.scan.loading = false;
			var localZsetting = null;
			try{
				localZsetting = localStorage.zsetting ? JSON.parse(localStorage.zsetting) : null; //本地zsetting
			}catch(e){
				console.log(e);
			}
			if(localZsetting != null){
				if(window.zsAddresslist.length>0){
					var flag = false;
					for(var i= 0;i<window.zsAddresslist.length;i++){
						if(window.zsAddresslist[i].name == localZsetting.name && window.zsAddresslist[i].name == localZsetting.address){
							$scope.zsettingItems.zsDeviceName = window.zsAddresslist[i].name;
							$scope.zsettingItems.zsAddress = window.zsAddresslist[i].address;
							localStorage.zsetting.name = window.zsAddresslist[i].name;
							localStorage.zsetting.address = window.zsAddresslist[i].address;
							flag = true;
							break;
						}
					}
					if(flag == true){
						getDeviceInfo();
						return;
					}
				}
			 }
			
			if($scope.zsettingItems.zsAddresslist.length <= 0 ){
				checkTouShow();
				//service.showMsg("error","未扫描到掌秀设备");
			}
		};
		var checkTouShow = function(){
			$scope.scan.loading = true;
			var url = "http://172.30.1.1"+ config.zhangShow.zsetting.checkDevice;
			$http.get(url,{timeout : 1500})
			.success(function(result){
				var str = new String();
				str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
				if(str == "WfdDisplayAP"){
					$scope.scan.loading = false;
					$scope.zsettingItems.zsDeviceName = "投影中的掌秀";
					$scope.zsettingItems.zsAddress = "172.30.1.1";
					getDeviceInfo();
				}
			})
			.error(function(){
				$scope.scan.loading = false;
				zsinit();
			});
		};
		//判断掌秀地址是否存在
		var containAddress = function(ad){
			for(var i=0;i<window.zsAddresslist.length;i++){
				if(ad.name == window.zsAddresslist[i].name)
				return true;
			}
			return false;
		};
		var compareVersion = function(v1,v2){
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
		/**获取设备信息*/
		var getDeviceInfo = function(){
			try{
				var urlPer = "http://"+$scope.zsettingItems.zsAddress;
				//1 设备名称
				$http.get(urlPer+config.zhangShow.zsetting.getSystemDeviceName,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					$scope.zsettingItems.deviceName = str;
					$scope.zsettingItems.zsDeviceName = str;
				})
				.error(function(){
					return false;
				});
				//2 语言
				$http.get(urlPer+config.zhangShow.zsetting.getMenuLanguage,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					var item = str.split(":");
					$scope.zsettingItems.deviceLanguage = str;
				})
				.error(function(){
					return false;
				});
				//显示设置
				$http.get(urlPer+config.zhangShow.zsetting.getVideoAspectRatio,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					$scope.zsettingItems.videoAspectRatio = str;
				})
				.error(function(){
					return false;
				});
				//5G
				$http.get(urlPer+config.zhangShow.zsetting.getForce5G,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					str = str.substring(2,str.length-1);
					if(str == "ON"){
						$scope.zsettingItems.fiveG = true;
					}else{
						$scope.zsettingItems.fiveG = false;
					}
				})
				.error(function(){
					return false;
				});
				//版本信息
				$http.get(urlPer+config.zhangShow.zsetting.getFWVersion,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					$scope.zsettingItems.deviceVersion = str;
					var version = str.substr(str.indexOf(":")+1,str.length-1);
					if($scope.zsettingItems.version){
						if(compareVersion($scope.zsettingItems.version,version)){
							$scope.zsettingItems.updateVersion = 1;
						}
					}
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
					$scope.zsettingItems.wifiConnect = str;
					if(str == "ON"){
						$scope.zsettingItems.wifiConnectbut = true;
					}else{
						$scope.zsettingItems.wifiConnectbut = false;
					}
				})
				.error(function(){
					return false;
				});
				//语言列表
				$http.get(urlPer+config.zhangShow.zsetting.getMenuLanguageList,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					var items = str.split("\n");
					for(var i=0;i<items.length;i++){
						var tm = items[i].split(":");
						var flag = false;
						for(var n = 0;n<$scope.zsettingItems.deviceLanguageList.length;n++){
							if(tm[0] == $scope.zsettingItems.deviceLanguageList[n].idx){
								flag = true;
								break;
							}
						}
						if(!flag){
							if(tm[1] == "English" || tm[1] == "简体中文"){
								$scope.zsettingItems.deviceLanguageList.push({idx:tm[0],name:tm[1]});
							}
						}
					}
				})
				.error(function(){
					return false;
				});
				//显示设置列表
				$http.get(urlPer+config.zhangShow.zsetting.getVideoAspectRatioList,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					var items = str.split("\n");
					for(var i=0;i<items.length;i++){
						var tm = items[i].split("|");
						var flag = false;
						for(var n = 0;n<$scope.zsettingItems.videoAspectRatioList.length;n++){
							if(tm[0] == $scope.zsettingItems.videoAspectRatioList[n].idx){
								flag = true;
								break;
							}
						}
						if(!flag){
							$scope.zsettingItems.videoAspectRatioList.push({idx:tm[0],name:tm[1]});
						}
					}
				})
				.error(function(){
					return false;
				});
				//显示wifimode
				$http.get(urlPer+config.zhangShow.zsetting.getWifiRadioBand,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					str = str.substring(2,str.length-1);
					if(str == "WIFI_FREQ_24G"){
						$scope.zsettingItems.wifimode = false;
					}else{
						$scope.zsettingItems.wifimode = true;
					}
				})
				.error(function(){
					return false;
				});
				
			}catch(e){
				console.log(error);
			}
		};
		/**
		 * 获取wifi信息
		 */
		var getWifiInfo = function(){
			try{
					service.showMsg("info","请稍等，正在拼命搜索可用wifi");
					
					var urlPer = "http://"+$scope.zsettingItems.zsAddress;
					$http.get(urlPer+config.zhangShow.zsetting.getCurrWlan0AP,{})
					.success(function(result){
						var str = new String();
						str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
						str = str.substring(2,str.length-1);
						$scope.zsettingItems.wifiConnect = str;
						if(str == "ON"){
							$scope.zsettingItems.wifiConnectbut = true;
						}else{
							$scope.zsettingItems.wifiConnectbut = false;
						}
					})
					.error(function(){
					});
					$http.get(urlPer+config.zhangShow.zsetting.getWlanApList,{})
					.success(function(result){
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
					})
					.error(function(){
					});		
			}catch(e){
							
			}
		};
		
		var showApList = function(SSIDArray, securityStringArray)
		{
			var i = 0;
			var dspName;

			for (i = 0; i < SSIDArray.length; i++)
			{
				var f = false;
				dspName = $$zsetting.getSSIDDspStr(SSIDArray[i]);
				for(var t = 0;t <$scope.zsettingItems.wlanApList.length;t++){
					if($scope.zsettingItems.wlanApList[t].dspName == dspName){
						f = true;
					}
				}
				if(!f){
					$scope.zsettingItems.wlanApList.push({idex:i,dspName:dspName});
				}
				
			}
		};
		
		
		/**页面动作处理*/
		$scope.operate = function(params){
			//选择连接设备
			if(params.type == "connDevice"){
				$scope.scan.loading = false;
				if($scope.zsettingItems.zsAddresslist.length<=0){
					zsinit();
				}else{
					$$widget.POPUP.updateConnectDevice($scope);
				}
				
			//连接一个设备	
			}else if (params.type == "changeDevice"){
				localStorage.zsetting = params.item;
				var node = JSON.parse(params.item);
				$scope.zsettingItems.zsDeviceName = node.name;
				$scope.zsettingItems.zsAddress = node.address;
				if($$widget.POPUP.popupWindow){
					$$widget.POPUP.close();
				}
				$scope.scan.loading = false;
				getDeviceInfo();
				
				
			//wifi开关切换	
			}else if(params.type == "offConnDevice"){
				//重新处理业务逻辑
				if(!$scope.zsettingItems.wifiConnectbut){
					//关闭wifi
					var urlPer = "http://"+$scope.zsettingItems.zsAddress;
					$http.get(urlPer+config.zhangShow.zsetting.wlanDisconnect,{})
					.success(function(result){
						var str = new String();
						str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
						if("OK"==str){
							service.showMsg("info","wifi连接关闭，请重新连接设备");
						};
					})
					.error(function(){
						service.showMsg("error","操作失败，请重新操作！");
					});
				}else{
					getWifiInfo();
				}
			
			//连接一下wifi	
			}else if (params.type == "connectOneWifi"){
				$$widget.POPUP.connectWifiWin($scope,function(m){
					var urlPer = "http://"+$scope.zsettingItems.zsAddress;
					var pwd = params.item.dspName+"|"+params.item.dspName+"|2|none|"+m;
					$http.get(urlPer+config.zhangShow.zsetting.wlanConnectAp+pwd,{})
					.success(function(result){
						var str = new String();
						str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
						if(str == "OK"){
							service.showMsg("info","wifi连接中，请重新连接设备！");
						}
					})
					.error(function(){
						service.showMsg("error","连接失败，请重新连接！");
					});
				},params.item);
				return ;
				
			//判断是否连接了选择	
			}else if ($scope.zsettingItems.zsAddress == "" || $scope.zsettingItems.zsAddress == undefined){
				service.showMsg("error","请先连接设备");
			
			//进入wifi连接界面	
			}else if (params.type == "wifiConnect") {  		
				if(!$scope.zsettingItems.wifiConnectbut){
					return;
				}
				inParams={
					wifi:3,
					ip:$scope.zsettingItems.zsAddress
			    };
				service.$state.go("zswifi",inParams);
				
			//弹出修改设备名称窗口	
			}else if(params.type == "changeDeviceName"){
				$$widget.POPUP.changeDeviceNameWin($scope,function(m){
					if(!m) return;
					var urlPer = "http://"+$scope.zsettingItems.zsAddress;
					$http.get(urlPer+config.zhangShow.zsetting.setSystemDeviceName+m,{})
					.success(function(result){
						var str = new String();
						str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
						if(str == "OK"){
							service.showMsg("info","设备名称修改成功");
							$scope.zsettingItems.zsDeviceName = m;
							$scope.zsettingItems.deviceName = m;
							var localZsetting = localStorage.zsetting ? JSON.parse(localStorage.zsetting) : null; //本地zsetting
							if(localZsetting != null){
								localZsetting.name = m;
								localStorage.zsetting = localZsetting;
							}
						}
					})
					.error(function(){
						service.showMsg("error","连接失败，请重新连接！");
					});
				});
				
			
			//弹出语言选择
			}else if (params.type == "changeDeviceLanguage"){     
				if($scope.zsettingItems.deviceLanguageList.length>0){
					$$widget.POPUP.updateDeviceLanguage($scope);
				}
			
			//选择语言
			}else if (params.type == "changeLanguage"){
				if($$widget.POPUP.popupWindow){
					$$widget.POPUP.close();
				}
				var urlPer = "http://"+$scope.zsettingItems.zsAddress;
				var node = JSON.parse(params.item)
				var no = node.idx;
				var name = node.name;
				$http.get(urlPer+config.zhangShow.zsetting.setMenuLanguage+no,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					if(str == "OK"){
						$scope.zsettingItems.deviceLanguage = name;
						getDeviceInfo();
						service.showMsg("info","设置成功");
					}
				})
				.error(function(){
					service.showMsg("error","设置失败，请重新操作！");
				});
			
			//弹出显示比例选择	
			}else if (params.type == "changeDeviceShowZoom"){   
				$$widget.POPUP.changeDeviceShowZoom($scope);
			
			//选择显示比例	
			}else if (params.type == "changeShowZoom"){        
				if($$widget.POPUP.popupWindow){
					$$widget.POPUP.close();
				}
				var urlPer = "http://"+$scope.zsettingItems.zsAddress;
				var items = JSON.parse(params.item);
				$http.get(urlPer+config.zhangShow.zsetting.setVideoAspectRatio+items.idx,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					if(str == "OK"){
						$scope.zsettingItems.videoAspectRatio = items.name;
						service.showMsg("info","设置成功！");
					}
				})
				.error(function(){
					service.showMsg("error","设置失败，请重新操作！");
				});
			
			//弹出屏幕设置	
			}else if (params.type == "changeDeviceByUi"){
				$$widget.POPUP.changeDeviceByUi($scope);
			
			//设置屏幕信息
			}else if (params.type == "changeByUi"){
				if($$widget.POPUP.popupWindow){
					$$widget.POPUP.close();
				}
				var onoff = "$["+params.item+"]";
				var urlPer = "http://"+$scope.zsettingItems.zsAddress;
				$http.get(urlPer+config.zhangShow.zsetting.set4by3UI+onoff,{})
				.success(function(result){
					var str = new String();
					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
					if(str == "OK"){
						$scope.zsettingItems.byui = params.item;
						service.showMsg("info","设置成功，将重启掌秀！");
					}
				})
				.error(function(){
					service.showMsg("error","设置失败，请重新操作！");
				});
			//恢复出场设置	
			}else if (params.type=="changeDeviceRecovery"){
				$ionicPopup.confirm({
	                title: '恢复出厂设置',
	                template: "请确认将掌秀恢复至出厂设置", //从服务端获取更新的内容
	                cancelText: '取消',
	                okText: '确定'
	            }).then(function (res) {
	                if (res) {
	                	var urlPer = "http://"+$scope.zsettingItems.zsAddress;
	    				$http.get(urlPer+config.zhangShow.zsetting.resetToDefault,{})
	    				.success(function(result){
	    					var str = new String();
	    					str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
	    					if(str == "OK"){
	    						service.showMsg("info","设置成功");
	    					}
	    				})
	    				.error(function(){
	    					service.showMsg("error","设置失败，请重新操作！");
	    				});
	                }
	            });
			//系統升級	
			}else if(params.type=="changeDeviceUpdate"){
				var params = {};
				params.url = "http://"+$scope.zsettingItems.zsAddress+config.zhangShow.zsetting.updateSystem;
				$ionicPopup.confirm({
	                title: '系统升级',
	                template: "提示：系统将进行在线升级，请确认手机连接网络！升级过程，请耐心等待！", //从服务端获取更新的内容
	                cancelText: '取消',
	                okText: '确定'
	            }).then(function (res) {
	                if (res) {
	                	$scope.updating = true;
	    				$$zsetting.updateDevice(params,function(msg){
	    					if(msg == 'success'){
	    						service.showMsg("info","系统开始升级！");
	    						$scope.updating = false;
	    					}else{
	    						service.showMsg("info",msg);
	    					}
	    				},function(msg){
	    					service.showMsg("error",msg);
	    					$scope.updating = false;
	    				});
	    				
	    				return true;
	                }
	            });
				
			//切换wifi	
			}else if(params.type == "changeWifiMode"){
				//检测wifi是否连接，连接了提示关掉
				var flag = $scope.zsettingItems.zsAddress !== "192.168.59.254";
				var tflg = $scope.zsettingItems.zsAddress !== "172.30.1.1";
				if(flag && tflg){
					$ionicPopup.confirm({
		                title: '系统提示',
		                template: "掌秀在连接wifi状态下无法进行2.4G与5G切换，请断开wifi再进行切换操作", //从服务端获取更新的内容
		                cancelText: '关闭',
		                okText: '知道了'
		            }).then(function(res) {
		            	$scope.zsettingItems.wifimode = !$scope.zsettingItems.wifimode;
		            	return true;
		            });
					return ;
				}else{
					//判断wifimode
					var onOff = "$[OFF]";
					if($scope.zsettingItems.wifimode){//5G
						onOff = "$[ON]";
					}
					//force5G
					var urlPer = "http://"+$scope.zsettingItems.zsAddress;
					$http.get(urlPer+config.zhangShow.zsetting.setForce5G+onOff,{})
					.success(function(result){
						var str = new String();
						str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
						if(str == "OK"){
							//切换wifi
							try{
								$http.get(urlPer+config.zhangShow.zsetting.switchWifiRadioBand,{})
								.success()
								.error(function(){
									service.showMsg("error","设置失败，请重新操作！");
								});
							}catch(e){
								
							}
						}
					})
					.error(function(){
						service.showMsg("error","设置失败，请重新操作！");
					});
				}
			}
		};
		
		/**
		 * 设备搜索提示
		 */
		var zsinit = function(){
			if(!$rootScope.zxFindPopup){
				$rootScope.zxFindPopup = $ionicPopup.confirm({
					title: '系统提示',
					template: "请确认掌秀设备开启并与掌文处在同一个网络节点，掌文将对其进行扫描", //从服务端获取更新的内容
					cancelText: '取消',
					okText: '确定'
				});
				$rootScope.zxFindPopup.then(function (res) {
					if (res) {
						$scope.scan.loading = true;
						$$zsetting.findDevice();
					}
					delete $rootScope.zxFindPopup;
				});
			}
		};
		/**
		 * 检查存储的设备是否可以连接
		 */
		var checkDevice = function(){
			$$zsetting.init(refn,comfn,erfn);
			var localZsetting = null;
			try{
				localZsetting = localStorage.zsetting ? JSON.parse(localStorage.zsetting) : null; //本地zsetting
				
				if(localZsetting != null){
					$scope.scan.loading = true;
					var url = "http://"+localZsetting.address + config.zhangShow.zsetting.checkDevice;
					$http.get(url,{timeout : 1500})
					.success(function(result){
						var str = new String();
						str = result.substring(result.search("Response:: ")+11, result.search("\r\n</Context>\r\n"));
						if(str =="IMSAP"){
							$scope.scan.loading = false;
							//$scope.zsettingItems.zsDeviceName = localZsetting.name;
							$scope.zsettingItems.zsAddress = localZsetting.address;
							getDeviceInfo();
						}
					})
					.error(function(){
						$scope.scan.loading = false;
						zsinit();
					});
				}else{
					zsinit();
				}
			}catch(e){
				
			}
			
		};
		var zsVersion = function(){
			$http.get($rootScope.CONFIG.itf.app.getZsNewVersion)
			.success(function(result){
				var conflict = false;
				if(result.result == 1){
					$scope.zsettingItems.version = result.version;
				}
			})
			.error(function(error){
			});
		};
		/** VIEW enter*/
		$scope.$on("$ionicView.enter",function(){
			if($scope.wifi != 3){
				zsVersion();
				checkDevice();
			}else{
				getWifiInfo();
			}
		});
		$scope.$on("$ionicView.beforeLeave",function(){
			$scope.scan.loading = false;
		});
});