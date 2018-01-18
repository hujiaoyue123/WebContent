///** 设置服务*/
var zsettingserviceDef = function($$widget){
	var settingService = {
		deviceFinder : cordova.plugins.ZWDeviceFinder,
		initParam : {
			onResultDevice : function(msg){},
			onCompleteDevice : function(){},
			onErrorDevice : function(msg){}
		},
		init : function(fn1,fn2,fn3){
			settingService.initParam.onResultDevice = fn1;
			settingService.initParam.onCompleteDevice = fn2;
			settingService.initParam.onErrorDevice = fn3;
			settingService.deviceFinder.init(settingService.initParam);
		},
		/**
		 * 更新掌秀ROM
		 */
		updateDevice:function(p,fn,fe){
			settingService.deviceFinder.updateDevice(p,fn,fe);
		},
		/**
		 * 搜索设备
		 */
		findDevice:function(){
			settingService.deviceFinder.findDevice();
		},
		/**
		 * 获取手机本地IP
		 */
		getHostIp:function(p,fn,fe){
			settingService.deviceFinder.getHostIp(p,fn,fe);
		},
		/**
		 * 获取掌秀MAC地址
		 */
		getZXMac:function(p,fn,fe){
			settingService.deviceFinder.getZXMac(p,fn,fe);
		},
		/**
		 * 跳转至wifi设置界面
		 */
		goToWifiSetting : function(){
			settingService.deviceFinder.goToWifiSetting();
		},
		/**
		 * 获取wifi名称
		 */
		getSSID:function(p,fn,fe){
			settingService.deviceFinder.getSSID(p,fn,fe);
		},
		
		h2d : function(h) {
			return parseInt(h, 16);
		},
		hexStrToByteArray : function(hexStr) {
			var i = 0, j = 0;
			var intArray = new Array();
			intArray[0] = 0;
			var oneC;

			while (i < hexStr.length) {
				oneC = hexStr[i] + hexStr[i+1];
				intArray[j] = settingService.h2d(oneC);
				j++;
				i += 2;
			}
			return intArray;
		},
		ssidStrToUtf8 : function(hexStr) {
			var byteArray = settingService.hexStrToByteArray(hexStr);
			return String.fromCharCode.apply(String, byteArray);
		},
		getSSIDDspStr : function(hexStr) {
			var ssidStr = settingService.ssidStrToUtf8(hexStr);
			try {
				var ssidEsc = escape(ssidStr);
				ssidStr = decodeURI(ssidEsc);
			} catch (err) {
				console.log("unable to decode uri, err=" + err + " for hexStr=" + hexStr);
			}
			return ssidStr;
		}
	};
	return settingService;
};

angular.module("app").factory("$$zsetting",zsettingserviceDef);	