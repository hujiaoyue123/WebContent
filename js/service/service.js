/** 服务 */
angular.module("app")
	.factory('$HTTP',function ($q,$http) {
		var http = function(deferred,params){
			var config = {};
			//请求地址
			if(params.url || params.method){
				config.url = params.url;
				params.method = angular.uppercase(params.method);
			}else{
				return;
			}
			config.method = params.method;
			//请求方式及参数
			if(params.method == "POST"){
				if(params.data){
					var form = new FormData();
					for(var key in params.data){
						form.append(key,params.data[key]);
					}
					config.data = form;
				}
				config.headers = {"Content-Type": undefined};
			}else if(params.method == "GET"){
				if(params.data){
					var form = {};
					for(var key in params.data){
						form[key] = params.data[key];
					}
					config.params = form;
				}
			}else{
				return;
			}
			//发起请求
			$http(config)
				.success(function(result){
					deferred.resolve(result);
				})
				.error(function(error){
					deferred.reject(error);
				});
		};

		return function (params,successCallback,errorCallback,finalCallback) {
			var deferred = $q.defer();
			http(deferred,params);

			var promise = deferred.promise;
			promise.then(function (result) {
				successCallback && successCallback(result);
			},function (error) {
				errorCallback && errorCallback(error);
			});
			promise.finally(function () {
				finalCallback && finalCallback();
			});
		}
	})

	.factory('$HTTPProxy',function ($rootScope,$HTTP) {
		return function (params,successCallback,errorCallback,finalCallback) {
			var domain;
			if(params.domain){ //入参式domain（优先级高）
				domain = $rootScope.getDomainById(params.domain);
			}else{
				domain = $rootScope.getCurrentDomain(); //$stateParams携带的domain
			}
			//代理url
			if(typeof params.url === 'function'){
				if(domain){
					params.url = params.url(domain.domain);
				}else{
					params.url = params.url(); //使用默认domain
				}
			}
			//代理处理userid,sessionid
			var user = $rootScope.USER;
			if(user){
				params.data.userid = user.id;
				//使用token激活session
				if(params.token){
					params.data.token = user.token;
				}else{
					params.data.sessionid = user.sessionid;
				}
			}
			//发起请求
			$HTTP(params,successCallback,errorCallback,finalCallback);
		}
	})
	/** 线程链*/
	.factory("pmservice",function($q){
		/**angular PROMISE*/
		/**值代理
		 * fn1 执行fn
		 * fn2 onFulfilled执行fn
		 * fn3 onRejected执行fn
		 * */
		var angularPromise = function(fn1,fn2,fn3,f4){
			var promise = $q(function(resolve,reject){
				var promise = {};
				promise.resolve = resolve;
				promise.reject = reject;
				//执行函数并传递promise
				fn1(promise);
			});
			promise.then(function(val){
				if(fn2){
					fn2(val);
				}
				},function(error){
					if(fn3){
						fn3(error);
					}
				});
			promise.finally(function(){
				if(f4){
					f4();
				}
			});
		};
		/** javascript PROMISE*/
		var javascriptPromise = function(fn1,fn2,fn3){
			new Promise(function(resolve,reject){
				var promise = {};
				promise.resolve = resolve;
				promise.reject = reject;
				//执行函数并传递promise
				fn1(promise);
			}).then(function(val){
					fn2(val);
				},function(error){
					if(fn3){
						fn3(error);
					}
				});
		};
		return {
			promiseProxy: angularPromise
		};
	})
	/** HTTP*/
	.factory("$$http",function($http){
		/** http请求
		 * params {promise,url,method,data,pkg:boolean}
		 */
		var HTTP = function(params){
			var config = {},form;
			//请求地址
			if(params.url || params.method){
				config.url = params.url;
				params.method = angular.uppercase(params.method);
			}else{
				return;
			}
			//请求方式及参数
			if(params.method == "POST"){
				config.method = params.method;
				if(params.pkg){
					config.data = params.data;
				}else if(params.data){
					form = new FormData();
					for(var key in params.data){
						form.append(key,params.data[key]);
					}
					config.data = form;
				}
				config.headers = {"Content-Type": undefined};
			}else if(params.method == "GET"){
				config.method = params.method;
				if(params.pkg){
					config.params = params.data;
				}if(params.data){
					form = {};
					for(var key in params.data){
						form[key] = params.data[key];
					}
					config.params = form;
				}
			}else{
				return;
			}
			//发起请求
			$http(config)
				.success(function(result){
					//旧写法
					if(params.promise && params.promise.resolve){
						params.promise.resolve(result);
					}
					//新写法
					params.successCallBack && params.successCallBack(result);
					params.successCallback && params.successCallback(result);
				})
				.error(function(error){
					//旧写法
					if(params.promise && params.promise.reject){
						params.promise.reject(error);
					}
					//新写法
					params.errorCallBack && params.errorCallBack(error);
					params.errorCallback && params.errorCallback(error);
				});
		};
		return {
			HTTP: HTTP
		};
	});

angular.module("app")
	.service("service",function($injector,$http,$$http,$q,$rootScope,pmservice,$$user,$timeout,$interval,$ionicHistory,$state,
		$stateParams,$ionicLoading,$ionicPopup,$ionicActionSheet,$ionicNavBarDelegate,$ionicModal,$ionicPopover,
		toastr,$ionicSlideBoxDelegate,$ionicScrollDelegate,$$chat,$$util,$$widget){
	var self = this;
	/** 服务代理 */
	this.$ionicHistory = $ionicHistory; //view历史
	this.$ionicSlideBoxDelegate = $ionicSlideBoxDelegate;
	this.$ionicScrollDelegate = $ionicScrollDelegate;
	this.$ionicNavBarDelegate = $ionicNavBarDelegate;
	this.$state = $state; 
	this.$timeout = $timeout;
	this.promiseProxy = _promiseProxy = pmservice.promiseProxy;
	this.$setting;
	/** 获取app二维码
	 */
	this.getQrcode = function(){
		var qrcodeList={};
		qrcodeList["pc"] = $rootScope.CONFIG.address;
		qrcodeList["ios"] = $rootScope.CONFIG.itf.app.getApp + "?mobile=ios";
		qrcodeList["android"] = $rootScope.CONFIG.itf.app.getApp;
		return qrcodeList;
	};
	this.goLogin = function(){
		if(IsPc()){
			$state.go("loginPc");
		}else{
			$state.go("loginMobile");
		}
	};
	var unlock = this.unlock = function(){
		if(UPF.is('app')){
			if(!this.settings){
				this.$setting = cordova.require("cordova-zhangwen-external-setting.Settings");
			}
			if(this.$setting){
				this.$setting.unlock();
			}
		}
	};
	var lock = this.lock = function(){
		if(UPF.is('app')){
			if(!this.settings){
				this.$setting = cordova.require("cordova-zhangwen-external-setting.Settings");
			}
			if(this.$setting){
				this.$setting.lock();
			}
		}
	};
	/** 验证用户 */
	this.validUser = function(fn){
		var user = $$user.getLocalUser();
		if(this.isEmpty(user)){
			if (IsPc()){
				$state.go("loginPc");
			}else{
				$state.go("loginMobile");
			}
		}else{
			if ($rootScope.CONFIG.internet && !$$chat.loginOK){
	            $$chat.login({
	                user : user.id,
	                pwd : user.chatpwd,
	                username:user.username
	            });
			}
			if(fn){
				fn();
			}
		}
	};
	/**
	 * 激活session
	 * @param params
	 * @param successCallback
	 * @param errorCallback
	 */
	this.activeSessionProxy = function (successCallback,errorCallback) {
		$$user.activeSession(function (result) {
            if (result.result == 1) { //验证成功
                $$user.setLocalUser(null, result.user); //更新本地用户

                //激活session频率小于10秒则不做再次调用
                var newTime = new Date().getTime();
                if ($rootScope.lastActiveSessionTime && ((newTime - $rootScope.lastActiveSessionTime) < (1000 * 5))) {
                    $rootScope.lastActiveSessionTime = newTime;
                    //app开启可能会多次
					if(!$rootScope.forgiveCount){
						$rootScope.forgiveCount = 0;
					}
                    $rootScope.forgiveCount++;
                    if ($rootScope.forgiveCount > 3) {
                        return;
                    }
                } else {
                    $rootScope.lastActiveSessionTime = newTime;
                }
                //再次调用
                successCallback && successCallback();
                // 登录聊天系统
                if (!$$chat.loginOK) {
                    $$chat.login({
                        user: result.user.id,
                        pwd: result.user.chatpwd,
                        username: result.user.username
                    });
                }
            } else if (errorCallback) {
                errorCallback();
            } else { //需要重新获取token
                if (IsPc()) {
                    $state.go("loginPc");
                } else {
                    $state.go("loginMobile");
                }
            }
		})
	};
	//激活sessionid
	this.activeSession = function(scope,action){ // 多的参数全部传递给action
		var params = Array.prototype.slice.call(arguments);
		params.shift();
		params.shift();
		pmservice.promiseProxy(function(promise){
			$$user.activeSession(promise);
		},function(result){
			if(result.result == 1){ //验证成功
				$$user.setLocalUser(null,result.user); //更新本地用户
				//激活session频率小于10秒则不做再次调用
				var newTime = new Date().getTime();
				if($rootScope.lastActiveSessionTime && ((newTime - $rootScope.lastActiveSessionTime) < (1000 * 5))){
					$rootScope.lastActiveSessionTime = newTime;
					//app开启可能会多次
					$rootScope.forgiveCount++;
					if($rootScope.forgiveCount > 3){
						return;
					}
				}else{
					$rootScope.lastActiveSessionTime = newTime;
				}
				//再次调用
				if(typeof action == "string"){
					scope[action](params);
				}else if(typeof action == "object"){
					scope[action[0]][action[1]](params);
				}else if(typeof action == "function"){
					action(params);
				}
				// 登录聊天系统
				if (!$$chat.loginOK){
	                $$chat.login({
	                    user : result.user.id,
	                    pwd : result.user.chatpwd,
	                    username: result.user.username
	                });
				}
			}else{
//				_showMsg("error",result.description);
				if(IsPc()){
					$state.go("loginPc");
				}else{
					$state.go("loginMobile");
				}
			}
		},function(){
			_showMsg("error","连接不上服务器！");
		});
	};
	/*全局搜索
	this.search = function(scope){
		var user = $$user.getLocalUser();
		var form = {};
		form.title = scope.title;
		form.userid = user.id;
		form.sessionid = user.sessionid;
		return $http.get(config.itf.ppan.searchResource,{params:form});
	};	*/	
	/** loading */
	this.loading = loading = function(order,context,milliseconds){
		if(order == "start"){
			var opts = {};
			if(!context){
				context = "";
			}
			if(milliseconds){
				opts.duration = milliseconds;
			}
			opts.template = "<ion-spinner icon='spiral'></ion-spinner><br/>"+context;
			$ionicLoading.show(opts);
		}else if(order == "end"){
			$ionicLoading.hide();
		}
	};
	//取消文件提醒
	this.remind = function(id,promise){
		var form = new FormData(),user = $$user.getLocalUser();
		//封装参数
		form.append("id",id);
		form.append("userid",user.id);
		form.append("sessionid",user.sessionid);
		//发起请求
		$http.post(config.itf.cpan.updateResRemind,form,{headers: {"Content-Type": undefined}})
			.success(function(result){
				promise.resolve(result);
			});
	};
	/****************ionic组件********************/		
	/** ionicPopup (新建文件夹/重命名/修改昵称/拍照选择)
	 *  popup 对象
	 */
	this.initPopup = function(popup){
		this.popupWindow = $ionicPopup.show(popup);
	};
	
	/** 全屏
	 * elem -- 1.Element id 2.DOM object
	 * 功能: 1.开启全屏 2.关闭全屏
	 */
	this.fullScreen = function(elem){
		if(typeof elem == "string"){
			elem = document.getElementById(elem);
		}
		if(!document.fullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement && !document.webkitFullscreenElement){
			if(elem.requestFullscreen){
				elem.requestFullscreen();
			}else if(elem.msRequestFullscreen){
				elem.msRequestFullscreen();
			}else if(elem.mozRequestFullScreen){
				elem.mozRequestFullScreen();
			}else if(elem.webkitRequestFullscreen){
				elem.webkitRequestFullscreen();
			}
		}else{ //关闭全屏
			if(document.exitFullscreen){
				document.exitFullscreen();
			}else if(document.msExitFullscreen){
				document.msExitFullscreen();
			}else if(document.mozFullScreen){
				document.mozExitFullScreen();
			}else if(document.webkitExitFullscreen){
				document.webkitExitFullscreen();
			}
		}
	};
	/** 消息提醒
	 */
	this.showMsg = _showMsg = function(type,text,title){
		if(type == "success"){
			toastr.success(text,title);
		}else if(type == "error"){
			toastr.error(text,title);
		}else if(type == "warning"){
			toastr.waring(text,title);
		}else{
			toastr.info(text,title);
		}
	};
	/** 完成复制*/
	this.onCopy = function(type,text){
		if(type == 1){
			if(!text){
				_showMsg("success","链接已复制");
			}else{
				_showMsg("success",text);
			}
		}else{
			if(!text){
				_showMsg("error","复制链接失败");
			}else{
				_showMsg("error",text);
			}
		}
	};
	/** 判断空对象 */
	this.isEmpty = function(obj){
		for(var o in obj){
			if(obj.hasOwnProperty(o)){
				return false;
			}
		}
		return true;
	};
	/** 状态栏*/
	this.StatusBar = _StatusBar = {
			show: function(){
				StatusBar.show();
			},
			hide: function(){
				StatusBar.hide();
			},
			toggle: function(){
				if(StatusBar.isVisible){
					_StatusBar.hide();
				}else{
					_StatusBar.show();
				}
			}
	};
	/** 屏幕旋转*/
//	this.screenOrientation = cordova.require("cordova-plugin-screen-orientation.screenorientation");
	
	this.screen = _screen = {
		landscape: function(successCallback){
			screen.lockOrientation("landscape",successCallback);
		},
		portrait: function(successCallback){
			screen.lockOrientation("portrait",successCallback);
		},
		toggle: function(){
			var type="";
			if(typeof screen.orientation == "object"){
				type = screen.orientation.type;
			}else if(typeof screen.orientation == "string"){
				type = screen.orientation;
			}else{
				return;
			}
			if (type.indexOf("portrait") != -1){
				_screen.landscape();
			}else{
				_screen.portrait();
			}
		}
	};
	/** 预览模式 */
	this.previewModel = {
		ready: function(){
			if(this.isApp){
				unlock();
				_StatusBar.hide();
				_screen.landscape();
			}
		},
		quit: function(){
			if(this.isApp){
				lock();
				_StatusBar.show();
				_screen.portrait();
			}
		}
	};
	
	this.previewModel.isApp = UPF.is("APP");
	
	/** 检测网络 */
	this.checkConnection = function(){
		var networkState = navigator.connection.type;
		var states = {};
	    states[Connection.UNKNOWN]  = 'Unknown';
	    states[Connection.ETHERNET] = 'Ethernet';
	    states[Connection.WIFI]     = 'WiFi';
	    states[Connection.CELL_2G]  = '2G';
	    states[Connection.CELL_3G]  = '3G';
	    states[Connection.CELL_4G]  = '4G';
	    states[Connection.CELL]     = 'generic';
	    states[Connection.NONE]     = 'None';
	//    alert('Connection type: ' + states[networkState]);
	};

	/** 比较app version
	 * promsie {resolve(),reject()}
	 */
	this.compareAppVersion = function(promise,version){
		var data = {};
		data.mobile = angular.lowercase(ionic.Platform.platform());
		$http.get($rootScope.CONFIG.itf.app.getAppNewVersion,{params: data})
			.success(function(result){
				promise.resolve(result);
			})
			.error(function(){
				promise.reject();
			});
	};
	/** 打开相机/相册
	 * promise {resolve(),reject()}
	 * type 拍照,相册
	 */
	this.openCamera = function(promise,type){
		var options = {},user = $$user.getLocalUser();
		//图片源
		if(type == "CAMERA"){
			options.quality = 50; //图片质量 0-100
			options.sourceType = Camera.PictureSourceType.CAMERA; 
			options.destinatonType = 1; //DATA_URL : 0,FILE_URI : 1,NATIVE_URI : 2
			options.saveToPhotoAlbum = false; //拍摄完保存到相册
		}else if(type == "PHOTOLIBRARY"){
			options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY; 
			options.destinatonType = 1; 
		}else if(type == "SAVEDPHOTOALBUM"){
			options.sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
		}
		//可编辑
		if (UPF.is("android")){
			options.allowEdit = true; //Allow simple editing of image before selection
		}
		if(UPF.is('ios')){
			StatusBar.hide();
		}
		//像素设置
		$injector.get('$cordovaCamera').getPicture(options)
			.then(function(uri){ //图片数据
				promise.resolve(uri);
				if(UPF.is('ios')){
					StatusBar.show();
				}
			},function () {
				if(UPF.is('ios')){
					StatusBar.show();
				}
			});
	};
	/** MOBILE文件上传
	 *  promise {resolve(),reject()}
	 *  params {server,filepath,params}
	 */
	this.mobileUpload = function(promise, params){
		var user = $$user.getLocalUser(),options = {};
		//参数
		options.params = params.params; //赋值
		options.params.userid = user.id;
		options.params.sessionid = user.sessionid;
		//执行上传
		loading("start");
		$injector.get('$cordovaFileTransfer').upload(params.server,params.filepath,options)
			.then(function(result){
				loading("end");
				promise.resolve(result);
			},function(error){
				loading("end");
				promise.reject();
			});
	};
	/** 获取文件名称
	 * filepath 文件路径
	 */
	this.getMobileFileName = function(filepath){
		var array = filepath.split("/");
		return array[array.length - 1];
	};
	//
	/** 打开手机文件系统
	 * promise {resolve(),reject()}
	 */
	this.fileChooser = function(promise){
		//选择文件
		window.plugins.mfilechooser.open([],function(uri){
			promise.resolve(uri);
		});
	};
	/** 粘贴板
	 * promise {resolve(),reject()}
	 * text 复制文本
	 */
	this.Mobileclipboard = function(promise,text){
		$injector.get('$cordovaClipboard')
			.copy(text)
			.then(function(){
				promise.resolve();
			},function(){
				promise.reject();
			});
	};
	/**
	 * 隐藏开机动画
	 */
	this.hideSplashscreen = function(){
		navigator.splashscreen.hide();
	};
	/** 判断设备
	 */
	this.IsPc = function(){  
//		var userAgentInfo = navigator.userAgent;  
//		var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
//		var flag = true;  
//		for (var v = 0; v < Agents.length; v++) {  
//		    if (userAgentInfo.indexOf(Agents[v]) > 0) { 
//		    	flag = false; 
//		    	break; 
//		    }  
//		}  
//		return flag;
		return UPF.is("WEB.HD");
	};
	this.isWeiXin = function isWeiXin(){ 
		var ua = window.navigator.userAgent.toLowerCase(); 
		if(ua.match(/MicroMessenger/i) == 'micromessenger'){ 
			return true; 
		}else{ 
			return false; 
		} 
	};
	
	/** 搜索
	 * promise
	 * params{type, txt}
	 */
	this.search = function(promise,params){
		var data = {
				userid: $rootScope.USER.id,
				sessionid: $rootScope.USER.sessionid,
				type : params.type,
				txt : params.txt
		};
		var reqParams = {
				promise: promise,
				url: $rootScope.CONFIG.itf.search.search,
				method: "post",
				data: data
		};
		//发起请求
		$$http.HTTP(reqParams);
	};
	
	this.selectUser = function(param, fn){
		this.selectCallBack = fn;
		$state.go("friend",{type:'share'});
	};
	
	this.selectUserResult = function(data){
		$state.go("tab.contact");
		this.selectCallBack(data);
	};
	
	this.getUser = function(){
		return $rootScope.USER;
	};
	//获取后台数据字典
	this.getDictionary = function(key,success,error){
		var form = new FormData();
		form.append("key",key);
		$http.post(
			$rootScope.dynamicITF.system.getDictionaryData(),
			form,
			{headers: {"Content-Type": undefined}}
		).success(function(result){
			if(typeof(success) ==="function"){
				success(result);
			}
		}).error(function(e){
			if(typeof(error) ==="function"){
				error(e);
			}
		});
	};
	this.scanQr = function(isSN){
		if (this.qrScaning){
			return;
		}
		this.qrScaning = true;
		var self = this;
        if(UPF.is('ios')){
            var orientation = screen.orientation;
            if(orientation.indexOf('portrait') == -1){
                screen.lockOrientation("portrait");
            }
        }
		window.plugins.barcodeScanner.scan(
				function(imageData) {
                    if(UPF.is('ios')){
                        screen.lockOrientation('unlocked');
                    }
					$$widget.POPOVER.hide();
					self.qrScaning = false;
					var url = imageData.text;
					var format = imageData.format;
					if (url){
						if(!isSN){
							if ($$util.String.verifyHttpUrl(url)){
								var p = $$util.String.getUrlParams(url);
								var action = p?p.action:"";
								if(action == "user"){
									$state.go("showUser",{id:p.id}); 
								}else if(action == "group"){
									// 加群
								}else if(action == "ent"){
									
								}else{ // 外链
									$injector.get('$$mobile').app.openUrl({service:self,url:url});
								}
							}
						}
						//ZXA101163100926
						if(url.indexOf("ZXA")>=0 && url.length == 15 && format == "CODE_128"){
							var form = new FormData();
							form.append("userid",$rootScope.USER.id);
							form.append("sessionid",$rootScope.USER.sessionid);
							form.append("zxnumber",url);
							
							var setUserMedal = function(){
								$http.post($rootScope.CONFIG.itf.user.setUserMedal,form,{headers: {"Content-Type": undefined}})
									.success(function(result){
										if(result.result == 1){
											/*$injector.get('$ionicPopup').alert({
												title: '系统提示',
												template: "恭喜用户将掌秀\""+url+"\"与您的掌文账号关联，成功获取掌文赠送的5G个人存储空间！",
												okText: '确定'
											 }).then(function() {
												 this.close();
												 self.$state.go("tab.about");
											 });*/
											self.$state.go('zxMedalInfo',{space: result.space});
										} else if(result.result == 2){
											self.activeSessionProxy(function(){
												setUserMedal();
											});
										} else {
											var html = "领取失败";
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
											//_showMsg("error",result.description);
										}
									}).error(function(e){
										_showMsg("error",e);
									});
							};
							
							$ionicPopup.confirm({
				                title: '请确认',
				                template: "请确认用此掌秀SN码：<br/>\""+url+"\"领取掌文云空间奖励！", //从服务端获取更新的内容
				                cancelText: '取消',
				                okText: '确认'
				            }).then(function (res) {
				            	if (res) {
				            		setUserMedal();
				            	}
				            });
						
						}else{
							if(isSN){
								_showMsg("error","非掌秀SN码，请重新扫描！");	
							}
						}
							
					}
				},function () {
                if(UPF.is('ios')){
                    screen.lockOrientation('unlocked');
                }
            }
			);
	};
	this.shareUrl = function(url){
		var turl = url;
		if(typeof(url) == 'string'){
			turl = JSON.parse(url);
		}
		if (!turl.url){
			return;
		}
		if(!turl.img){
			turl.img = "img/link.png";
		}
		if(!turl.digest){
			turl.digest = turl.title;
		}
		var initParam = {
			excludes: $rootScope.USER.id,
			showGroup: true,
			range: "all"
		};
		$$widget.MODAL.selectUser(initParam, function(data){
			if (data && data.length && data.length>0){
				var sendMessage = function(peer){
					peer.type = peer.type || 'user';
					if (peer.type == 'user'){
						peer.type = 'chat';
						peer.name = peer.username;
						peer.peerId = peer.id;
					}else{
						peer.type= 'groupchat';
						peer.peerId = peer.hxid;
					}
					var message = {
			    		to: peer.peerId,
			    		from:$rootScope.USER.id,
			    		msg:"[url]",
			    		msgType : "url",
			    		type:peer.type,
			    		ext:{ext:{
			    			url:turl.url,
			    			img:turl.img,
			    			title:turl.title,
			    			digest:turl.digest
			    		}}
			    	};
			    	$$chat.sendMsg(message);
			    	message.data = '[链接]'+turl.title;
			    	$$chat.addMsg(message);
				};
				//给所有选中的用户都发通知
				for(var i=0;i<data.length;i++){
					var peer = data[i];
					sendMessage(peer);
				}
				//提醒
				toastr.success('分享成功');
		    	return;
		    	//进入聊天页
		    	var param = {
		    		type:peer.type,
		    		name:peer.name
		    	};
		    	if (peer.type == 'chat'){
		    		param.id = peer.peerId;
		    	}else if(peer.type == 'groupchat'){
		    		param.hxid = peer.peerId;
		    	}
		    	$state.go("chat", param);
			}
		});
	};
	/**
	 * 检测文件夹是否需要审核
	 * @param params
	 * @param successCallback
	 * @param errorCallback
	 */
	self.checkFolderAudit = function(params,successCallback,errorCallback){
		//验证params
		if(!params){return;}
		//请求文件夹详情
		var requestSuccessCallback = function(result){
			if(result.result == 1){
				var createuserid = $rootScope.USER.id;
				var folder = result.data;
				//是否审核提醒
				//1.无权限 2.文件夹需要审核 3.文件夹属于企业/部门文件夹 4.自己不是文件夹创建人
				if(!folder.competence && folder.audit == 1 && (folder.foldertype == 'org' || folder.foldertype == 'dept') && folder.createuserid != createuserid){
					//文件需要审批-popup
					$injector.get('$$widget').POPUP.fileAuditTip(folder.username,successCallback);
				}else if(successCallback){
					successCallback();
				}
			}else if(result.result == 2){
				self.activeSessionProxy(function(){
					self.checkFolderAudit(params,successCallback,errorCallback);
				});
			}else if(errorCallback){
				errorCallback();
			}
		};
		$injector.get('$RESOURCE').FOLDER.getFolderInfo(params,requestSuccessCallback,errorCallback);
	};
	/**
	 * 下载
	 * @param url
	 */
	this.download = function (url) {
		if(UPF.is("WEB")){
			window.open(url,"_blank");
		}else{
			cordova.InAppBrowser.open(url, '_system');
		}
	};
	/**
	 * modal方式展示media
	 * @param params(id,folderid,type,name)
	 */
	this.showMediaModal = function (params) {
		var scope = $rootScope.$new();
		var videoSrc = $injector.get('$RESOURCE').RESOURCE.download(params);
		//媒体源
		scope.media = {
			src: videoSrc,
			type: params.type,
			name: params.name,
			autoplay: true
		};
		if(UPF.is('android')){ //因为android无法获取到元数据
			scope.media.poster = 'img/media/default-poster.png';
		}
		//展现Modal
		$injector.get('$ionicModal').fromTemplateUrl('tpl/modal/mediaplayer.html',{scope: scope})
			.then(function (modal) {
				scope.modal = modal;
				scope.modal.show();
			});
	}
});