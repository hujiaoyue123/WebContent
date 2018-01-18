/** 登录*/
angular.module("app")
	.controller("loginCtrl",function($scope,$rootScope,service,$interval,$$user,$$util,$$chat,$ocLazyLoad,$timeout,$injector){
		$scope.isApp = UPF.is("app");
		var timeLimit = 60; //验证码获取时间
		var interval = new Object();
		$scope.regButton = false;
		$scope.onCopy = function(type){
			var text = "";
			if(type == 1){
				text = "QQ已复制";
			}else{
				text = "QQ复制失败";
			}
			service.onCopy(type,text);
		};
		//初始化
		$scope.init = function(){
			$scope.operate = "login"; //默认登陆
			$scope.ctrlname = "loginCtrl"; //控制器信息
			//获取本地用户信息
			if(!$$util.isEmptyObject($$user.getLocalUser())){ //当前已缓存
				$scope.user = $$user.getLocalUser();
			}else if(!$$util.isEmptyObject($$user.getLastUser())){ //上次已缓存
				$scope.user = $$user.getLastUser();
			}else{
				$scope.user = {};
			}
			$scope.register = {
				enable: true
			};
			$scope.verify = {
				enable: true	
			};
//			initVerify(); //初始化验证
			if(UPF.is("WEB")){
				//装载二维码
				initQrcode();
			}
		};
		
		//初始化动作页面
		$scope.initPage=function(){
			jQuery('#login-button').click(function(){
				jQuery('#login-button').fadeOut("slow",function(){
					jQuery("#container").fadeIn();
					TweenMax.from("#container", .4, { scale: 0, ease:Sine.easeInOut});
					TweenMax.to("#container", .4, { scale: 1, ease:Sine.easeInOut});
				});
			});
			
			jQuery(".close-btn").click(function(){
			  TweenMax.from("#container", .4, { scale: 1, ease:Sine.easeInOut});
			  TweenMax.to("#container", .4, { left:"0px", scale: 0, ease:Sine.easeInOut});
			  jQuery("#container, #register-container").fadeOut(800, function(){
			    jQuery("#login-button").fadeIn(800);
			  });
			   jQuery("#container, #codeLogin-container").fadeOut(800, function(){
			    jQuery("#login-button").fadeIn(800);
			  });
			});

			/*pwdlogin*/
			jQuery('#pwdlogin').click(function(){
				jQuery("#codeLogin-container").fadeOut(function(){
					jQuery('#container').fadeIn();
				});
			});

			/* register */
			jQuery('#register').click(function(){
			  jQuery("#container").fadeOut(function(){
			    jQuery("#register-container").fadeIn();
			  });
			});
			jQuery('#register1').click(function(){
			  jQuery("#codeLogin-container").fadeOut(function(){
			    jQuery("#register-container").fadeIn();
			  });
			});

			/*codeLogin*/
			jQuery('#codeLogin').click(function(){
				jQuery('#container').fadeOut(function(){
					jQuery('#codeLogin-container').fadeIn();
				});
			});
		};
		
		//装载二维码
		var initQrcode = function(){
			service.$timeout(function(){
				$scope.qrcodeList = service.getQrcode();
			},100);
		};
		//初始验证
		var initVerify = function(){
			var verify = {};
			if($scope.user){
				verify.loginname = $scope.user.loginname;
			}else{
				verify.loginname = "";
			}
			verify.validation = "";
			verify.enable = true;
			verify.time = timeLimit;
			verify.type = 0; //0.手机 1邮箱
			$scope.verify = verify;
		};
		
		//验证手机号码
		$scope.verifyMobile = function(mobile){
			return $$util.String.verifyMobile(mobile);
		};
		//验证密码
		$scope.verifyPassword = function(password){
			return $$util.String.verifyPassword(password);
		};
		/** 定时器
		 * action 'verify'/'register'
		 */
		var initInterval = function(action){
			interval[action] = $interval(function(){
				if($scope[action].time > 0){
					$scope[action].time--;
				}else{
					$scope[action].enable = true;
					$scope[action].time = timeLimit;
					$interval.cancel(interval[action]);
				}
			},1000);
		};
		$scope.goTab = function(type){
			if (type == 'policy'){
				$scope.policy = config.policy;
			}else if(type == 'privacy'){
				$scope.privacy = config.privacy;
			}
			if (type == 'register'){
				$ocLazyLoad.load('js/policy.js');
			}
			$scope.operate = type;
		};
		//ngstyle-滑动表单
		$scope.slideForm = function(){
			var transform = "";
			if($scope.operate == "login"){
				transform = "translateX(-33%)";
			}else if($scope.operate == "valid"){
				transform = "translateX(0)";
			}else if($scope.operate == "register"){
				transform = "translateX(-66%)";
			}
			return {
				"width": "300%",
				"transform": transform,
				"-webkit-transform": transform,
				"-moz-transform": transform,
				"-ms-transform": transform,
				"transition": '0.6s transform ease',
				"-webkit-transition": '0.6s transform ease',
				"-moz-transition": '0.6s transform ease',
				"-ms-transition": '0.6s transform ease'
			};
		};
		/**
		 * 下载
		 */
		$scope.download = function(){
			var path = $rootScope.CONFIG.itf.app.getApp;
			if(window.cordova){
				cordova.InAppBrowser.open(path, '_system');
			}else{
				window.open(path,"_blank");
			}
		};
		//首页
		$scope.goHome = function(){
			window.open($rootScope.CONFIG.address,"_blank");
		};
		/** 用户体*/
		$scope.USER = {
			/** 登陆*/
			login: function(){
				var toastr = $injector.get('toastr');
				var params = {};
				if(service.isEmpty($scope.user)){
					service.showMsg("error","请输入手机号或密码!");
					return;
				}
				//验证手机号
				if(!$scope.user.loginname || !$scope.verifyMobile($scope.user.loginname)){
					toastr.warning('请输入正确的手机号码');;
					return;
				}
				//密码不能为空
				if(!$scope.user.password){
					toastr.warning('密码不能为空');
					return;
				}
				params.loginname = $scope.user.loginname;
				params.password = $scope.user.password;
				service.loading('start');
				$$user.login(params,function(result){
						if(result.result == 1){ //登陆成功
							//如果登陆用户和本地不一致则更新user
							var user = result.user; //登陆用户
							user.photo = $$user.getUserPhoto(user.id,user.updatetime);
							//更新user
							var localuser = $$user.getLocalUser(); //本地用户
							if(!service.isEmpty(localuser) && user.id != localuser.id){
								$$user.rmLocalUser();
							}
							$$user.setLocalUser(null,user);
							//进入云盘
						 	service.$state.go("tab.ppan");
						 	//登录环信chat
			                $$chat.login({
		                        user : user.id,
		                        pwd : user.chatpwd,
		                        username:user.username
			                });
						 }else{ //登陆失败
							 service.showMsg("error",result.description);
						 }
					},function(){
						$injector.get('toastr').error('连接不上服务器！');
					},function(){
						service.loading('end');
					}
				);
			},
			/** 注册*/
			register: function(){
				var params = $scope.register;
				params.loginname = $scope.user.loginname;
				//验证手机号
				if(!params.loginname || !$scope.verifyMobile(params.loginname)){
					service.showMsg("error","请输入正确的手机号码");
					return;
				}
				if(!params.validation || (params.validation+"").length!=6){
					service.showMsg("error","请输入正确的验证码");
					return;
				}
				//姓名
				if(!params.nickname){
					service.showMsg("error","请输入姓名");
					return;
				}
				if (!params.password || !$scope.verifyPassword(params.password)){
					service.showMsg("error","密码中必须包含字母、数字，至少6个字符，最多12个字符。");
					return;
				}
				if (params.password != params.rePassword){
					service.showMsg("error","两次输入密码不同！");
					return;
				}
				//线程链
				service.promiseProxy(function(promise){
					$scope.regButton = true;
					$$user.register(promise,params);
				},function(result){
					if(result.result == 1){ //登陆成功
						//如果登陆用户和本地不一致则更新user
						var user = result.user; //登陆用户
						user.photo = $$user.getUserPhoto(user.id,user.updatetime);
						//更新user
						var localuser = $$user.getLocalUser(); //本地用户
						if(!service.isEmpty(localuser) && user.id != localuser.id){
							$$user.rmLocalUser();
						}
						$$user.setLocalUser(null,user);
						//进入云盘
					 	service.$state.go("tab.ppan");
					 }else{ //登陆失败
						 $scope.regButton = false;
						 service.showMsg("error",result.description);
					 }
				},function(error){
					$scope.regButton = false;
					service.showMsg("error","系统异常！");
				});
			},
			/** 验证登陆*/
			verifyLogin: function(){
				var params = {};
				params.loginname = $scope.user.loginname;
				params.validation = $scope.verify.validation;
				//验证
				var toastr = $injector.get('toastr');
				//手机号
				if(!params.loginname || !$scope.verifyMobile(params.loginname)){
					toastr.warning('请输入正确的手机号码');
					return;
				}
				//验证码
				if(!params.validation){
					toastr.warning('验证码不能为空');
					return;
				}else if(params.validation.length != 6){
					toastr.warning('请输入正确的验证码');
					return;
				}
				//执行链式操作
				service.promiseProxy(function(promise){
					$$user.verifyLogin(promise,params); 
				},function(result){
					if(result.result == 1){ //成功
						//如果登陆用户和本地不一致则更新user
						var user = result.user; //登陆用户
						user.photo = $$user.getUserPhoto(user.id,user.updatetime);
						//更新user
						var localuser = $$user.getLocalUser(); //本地用户
						if(!service.isEmpty(localuser) && user.id != localuser.id){
							$$user.rmLocalUser();
						}
						$$user.setLocalUser(null, user);
						//进入修改密码
					 	service.$state.go("password",{vc:params.validation});
					}else{
						service.showMsg("error",result.description);
					}
				});
			},
			/** 获取验证码
			 * action 'verify'-验证登陆 'register'-注册
			 */
			getVerifyCode: function(action){
				if(!$scope.user.loginname || !$scope.verifyMobile($scope.user.loginname)){
					$injector.get('toastr').warning('请输入正确的手机号码');
					return;
				}
				var params = {};
				params.loginname = $scope.user.loginname;
				$scope[action].enable = false;
				$scope[action].time = timeLimit;
				if (action == 'verify'){ //验证获取
					params.type  = 0;
				}else if (action == 'register'){ //注册获取
					params.type = 1;
				}else{
					service.showMsg("error","type error");
				}
				//执行链式操作
				service.promiseProxy(function(promise){
					$$user.verifyCode(promise,params);
				},function(result){
					if(result.result == 1){ //发送成功
						//开启定时器
						initInterval(action); 
						service.showMsg("success",result.description);
					}else{ //发送错误
						$scope[action].enable = true;
						service.showMsg("error",result.description);
					}
				},function(){
					$scope[action].enable = true;
				});
			}
		};
		/** 执行初始化 */
		$scope.$on("$ionicView.enter",function(){
			$scope.init();
			$scope.initPage();
		});
		var loginpcAnimation = function () {
			//特效
			var canvas = document.getElementById('canvas');
			if(!canvas) return;
			var ctx = canvas.getContext('2d'),
				w = canvas.width = window.innerWidth,
				h = canvas.height = window.innerHeight,

				hue = 217,
				stars = [],
				count = 0,
				maxStars = 1200;

			var canvas2 = document.createElement('canvas'),
				ctx2 = canvas2.getContext('2d');
			canvas2.width = 100;
			canvas2.height = 100;
			var half = canvas2.width / 2,
				gradient2 = ctx2.createRadialGradient(half, half, 0, half, half, half);
			gradient2.addColorStop(0.025, '#fff');
			gradient2.addColorStop(0.1, 'hsl(' + hue + ', 61%, 33%)');
			gradient2.addColorStop(0.25, 'hsl(' + hue + ', 64%, 6%)');
			gradient2.addColorStop(1, 'transparent');

			ctx2.fillStyle = gradient2;
			ctx2.beginPath();
			ctx2.arc(half, half, half, 0, Math.PI * 2);
			ctx2.fill();

// End cache

			function random(min, max) {
				if (arguments.length < 2) {
					max = min;
					min = 0;
				}

				if (min > max) {
					var hold = max;
					max = min;
					min = hold;
				}

				return Math.floor(Math.random() * (max - min + 1)) + min;
			}

			function maxOrbit(x, y) {
				var max = Math.max(x, y),
					diameter = Math.round(Math.sqrt(max * max + max * max));
				return diameter / 2;
			}

			var Star = function() {

				this.orbitRadius = random(maxOrbit(w, h));
				this.radius = random(60, this.orbitRadius) / 12;
				this.orbitX = w / 2;
				this.orbitY = h / 2;
				this.timePassed = random(0, maxStars);
				// this.speed = random(this.orbitRadius) / 900000;
				this.speed = random(this.orbitRadius) / 600000;
				this.alpha = random(2, 10) / 10;


				count++;
				stars[count] = this;
			}

			Star.prototype.draw = function() {
				var x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX,
					y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY,
					twinkle = random(10);

				if (twinkle === 1 && this.alpha > 0) {
					this.alpha -= 0.05;
				} else if (twinkle === 2 && this.alpha < 1) {
					this.alpha += 0.05;
				}

				ctx.globalAlpha = this.alpha;
				ctx.drawImage(canvas2, x - this.radius / 2, y - this.radius / 2, this.radius, this.radius);
				this.timePassed += this.speed;
			}

			for (var i = 0; i < maxStars; i++) {
				new Star();
			}

			function animation() {
				ctx.globalCompositeOperation = 'source-over';
				ctx.globalAlpha = 0.8;
				ctx.fillStyle = 'hsla(' + hue + ', 64%, 6%, 1)';
				ctx.fillRect(0, 0, w, h)

				ctx.globalCompositeOperation = 'lighter';
				for (var i = 1, l = stars.length; i < l; i++) {
					stars[i].draw();
				};

				window.requestAnimationFrame(animation);
			}

			animation();
		};
		if(UPF.is('web')){
			loginpcAnimation();
		}
		$scope.$on('resize',function () {
            if(UPF.is('web')){
                loginpcAnimation();
            }
        })
	});