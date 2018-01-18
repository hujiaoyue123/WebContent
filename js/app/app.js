/** 应用程序 */
var injectLibs = ["ionic","mediaplayer","ui.validate","toastr","monospaced.qrcode","monospaced.elastic","ngFileUpload","angular-svg-round-progress","angular-clipboard","oc.lazyLoad","ionic-datepicker","puElasticInput"];
if (!UPF.is('WEB')){
	injectLibs.push("mobile");
}
var app = angular.module("app",injectLibs);
	app.config(function($stateProvider,$urlRouterProvider,$ionicConfigProvider,$locationProvider,toastrConfig,ionicDatePickerProvider,$sceDelegateProvider,$httpProvider){
        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain. **.
            '**'
        ]);
		//ionic针对平台的配置
		var ionicConfig = {
			ios: {
			    views: {
			      maxCache: 10,
			      forwardCache: false,
			      transition: 'ios',
			      swipeBackEnabled: true,
			      swipeBackHitWidth: 45
			    },
			    navBar: {
			      alignTitle: 'center',
			      positionPrimaryButtons: 'left',
			      positionSecondaryButtons: 'right',
			      transition: 'view'
			    },
			    backButton: {
			      icon: 'ion-ios-arrow-back',
			      text: '返回',
			      previousTitleText: true
			    },
			    form: {
			      checkbox: 'circle',
			      toggle: 'large'
			    },
			    scrolling: {
			      jsScrolling: true
			    },
			    spinner: {
			      icon: 'ios'
			    },
			    tabs: {
			      style: 'standard',
			      position: 'bottom'
			    },
			    templates: {
			      maxPrefetch: 30
			    }
			  },
			android: {
			    views: {
			      transition: 'android',
			      swipeBackEnabled: false
			    },
			    navBar: {
			      alignTitle: 'center',
			      positionPrimaryButtons: 'right',
			      positionSecondaryButtons: 'right'
			    },
			    backButton: {
			      icon: 'ion-ios-arrow-back',//样式目前不改'ion-android-arrow-back',
			      text: '返回',
			      previousTitleText: true
			    },
			    form: {
			      checkbox: 'square',
			      toggle: 'small'
			    },
			    spinner: {
			      icon: 'android'
			    },
			    tabs: {
			      style: 'striped',
			      position: 'bottom'
			    },
			    scrolling: {
			      jsScrolling: true
			    }
			  }
		};
		var userConfig;
		if(UPF.is("android")){
			userConfig = ionicConfig.android
		}else{
			userConfig = ionicConfig.ios; //ionic默认pc,ios都采用这种样式
		}
		angular.forEach(userConfig,function(value,key){
			angular.forEach(value,function(v,k){
				$ionicConfigProvider[key][k](v);
			});
		});
		//路由配置
		var appConfig = 
        { 	
			"welcome": { //欢迎页
	       	 	"url": "/welcome",
	       	 	"templateUrl": "tpl/welcome.html",
                "controller": "welcome",
                "js": "js/controller/welcome.js"
        	},
        	// "loginPc": { //pc登录
        	// 	"url": "/loginPc",
        	// 	"templateUrl": "tpl/login.html",
        	// 	"controller": "loginCtrl",
        	// 	"js": "js/controller/loginCtrl.js"
        	// },
            "loginPc": { //pc登录
				"url": "/loginPc",
				"templateUrl": "tpl/login/loginpc.html",
				"controller": "loginCtrl",
				"js": "js/controller/loginCtrl.js"
            },
        	"loginMobile": { //mobile登录
        		"url": "/loginMobile",
        		"templateUrl": "tpl/loginMobile.html",
        		"controller": "loginCtrl",
        		"js": "js/controller/loginCtrl.js"
        	},
        	"tab": { //tab页
        		"url": "/tab",
        		"abstract": true,
        		"templateUrl": "tpl/tabs.html"
        	},
        	"tab.ppan": { //文件库
        		"url": "/ppan?id&title&belongid&rootid&domain",
        		"views": {
        			"tab-ppan": {
        				"templateUrl": "tpl/ppan.html",
                		"controller": "ppanCtrl"
        			}
        		},
        		"js": "js/controller/ppanCtrl.js"
        	},
        	"showPan": { //盘页面
        		"url": "/showPan?id&title&belongid&rootid&domain",
        		"templateUrl": "tpl/ppan.html",
        		"controller": "ppanCtrl",
        		"js": "js/controller/ppanCtrl.js"
        	},
        	"tab.departmentFolder": { //部门文件-tab场景
        		"url": '/departmentFolder?folderid&rootid&competence&domain',
        		"views": {
        			"tab-ppan": {
        				"templateUrl": "tpl/pan/departmentFolder.html",
        				"controller": "departmentFolder"
        			}
        		},
        		"js": "js/controller/pan/departmentFolder.js"
        	},
        	"departmentFolder": { //部门文件-非tab场景
        		"url": '/departmentFolder?folderid&rootid&competence&domain',
				"templateUrl": "tpl/pan/departmentFolder.html",
				"controller": "departmentFolder",
        		"js": "js/controller/pan/departmentFolder.js"
        	},
			"trash": { //回收站
        		"url": '/trash?id&domain',
				"templateUrl": "tpl/pan/trash.html",
				"controller": "trash",
				"js": "js/controller/pan/trash.js"
			},
        	"tab.message": { //消息
        		"url": "/message",
        		"views": {
        			"tab-message": {
        				"templateUrl": "tpl/message.html",
                		"controller": "message"
        			}
        		},
        		"js": "js/controller/message.js"
        	},
        	"tab.contact": { //联系人
        		"url": "/contact",
        		"views": {
        			"tab-contact": {
        				"templateUrl": "tpl/contact.html",
                		"controller": "contact"
        			}
        		},
        		"js": "js/controller/contact.js"
        	},
        	// "tab.about": { //关于我
        	// 	"url": "/about",
        	// 	"views": {
        	// 		"tab-about": {
        	// 			"templateUrl": "tpl/about.html",
             //    		"controller": "aboutCtrl"
        	// 		}
        	// 	},
        	// 	"js": "js/controller/aboutCtrl.js"
        	// },
			"tab.about": { //关于我
				"url": "/about",
				"views": {
					"tab-about": {
						"templateUrl": "tpl/about/about.html",
						"controller": "aboutCtrl"
					}
				},
				"js": "js/controller/aboutCtrl.js"
			},
			"bingSN": {
				"url": "/bingSN",
				"templateUrl": "tpl/about/bindSN.html",
				"controller": "bindSN",
				"js":"js/controller/about/bindSN.js"
			},
        	"guide":{
    			"url": "/guide?name",
        		"templateUrl": "tpl/about/guide.html",
        		"controller": "guide",
        		"js": "js/controller/about/guide.js"
        	},
        	"wizard":{
    			"url": "/wizard",
        		"templateUrl": "tpl/about/wizard.html"
        	},
        	"group": { //群组
        		"url": "/group?id&type",
        		"templateUrl": "tpl/group/group.html",
        		"controller": "group",
        		"js": "js/controller/group/group.js"
        	},
        	"contactOrg": { //部门/群组页面
        		"url": "/contactOrg?id&name&type",
        		"templateUrl": "tpl/contactOrg.html",
        		"controller": "contactOrg",
        		"js": "js/controller/contactOrg.js"
        	},
        	"newContact": { //新联系人
        		"url": "/newContact",
        		"templateUrl": "tpl/newContact.html",
        		"controller": "newContact",
        		"js": "js/controller/newContact.js"
        	},
        	"newFriend": { //添加联系人
        		"url": "/newFriend",
        		"templateUrl": "tpl/newFriend.html",
        		"controller": "newFriend",
        		"js": "js/controller/newFriend.js"
        	},
        	"searchContact": { //搜索-联系人
        		"url": "/searchContact?id&type",
        		"templateUrl": "tpl/contact/searchContact.html",
        		"controller": "searchContact",
        		"js": "js/controller/contact/searchContact.js"
        	},
        	"myInfo": { //我的资料
        		"url": "/myInfo",
        		"templateUrl": "tpl/myInfo.html",
        		"controller": "myInfo",
        		"js": "js/controller/myInfo.js"
        	},
        	"myAvatar": { //我的头像
        		"url": "/myAvatar?id&updatetime&photo",
        		"templateUrl": "tpl/user/myAvatar.html",
        		"controller": "myAvatar",
        		"js": "js/controller/user/myAvatar.js"
        	},
        	"setting": { //个人设置
        		"url": "/setting",
        		"templateUrl": "tpl/setting.html",
        		"controller": "setting",
        		"js": "js/controller/setting.js"
        	},
        	"aboutApp": { //关于掌文
        		"url": "/aboutApp",
        		"controller": "aboutApp",
        		"js": "js/controller/aboutApp.js",
        		"templateUrl": "tpl/aboutApp.html"
        	},
        	"features": { //关于掌文
        		"url": "/features",
        		"templateUrl": "tpl/features.html"
        	},
        	"help": { //帮助与反馈
        		"url": "/help?folderid&title",
        		"templateUrl": "tpl/about/help.html",
        		"controller": "helpCtrl",
        		"js": "js/controller/about/helpCtrl.js"
        	},
        	"fileDetail": { //文件详情
        		"url": "/fileDetail?id&folderid&rootid&isaudit&domain",
        		"templateUrl": "tpl/pan/fileDetail.html",
        		"controller": "fileDetail",
        		"js": "js/controller/pan/fileDetail.js"
        	},
        	"folderInfo": { //文件夹详情
        		"url": "/folderInfo?id&rootid&domain",
        		"templateUrl": "tpl/pan/folderInfo.html",
        		"controller": "folderInfo",
        		"js": "js/controller/pan/folderInfo.js"
        	},
        	"auditFile": { //待审核文件
        		"url": "/audioFile?domain",
        		"templateUrl": "tpl/pan/auditFile.html",
        		"controller": 'auditFile',
        		"js": "js/controller/pan/auditFile.js"
        	},
        	"ishared": { //我分享的
        		"url": "/ishared",
        		"templateUrl": "tpl/ishared.html",
        		"controller": "isharedCtrl",
        		"js": "js/controller/isharedCtrl.js"
        	},
        	"friendShared": { //好友分享给我的
        		"url": "/friendShared?friendid",
        		"templateUrl": "tpl/friendShared.html",
        		"controller": "friendSharedCtrl",
        		"js": "js/controller/friendSharedCtrl.js"
        	},
        	"share": { //收到的分享
        		"url": "/share",
        		"templateUrl": "tpl/share.html",
        		"controller": "shareCtrl",
        		"js": "js/controller/shareCtrl.js"
        	},
        	"showUser": { //通讯录-展示人员信息
        		"url": "/showUser?id&r",
        		"templateUrl": "tpl/showUser.html",
        		"controller": "showUserCtrl",
        		"js": "js/controller/showUserCtrl.js"
        	},
        	"showGroup": { //群组-详情
        		"url": "/showGroup?id&name&hxid&type&count",
        		"templateUrl": "tpl/showGroup.html",
        		"controller": "showGroupCtrl",
        		"js": "js/controller/showGroupCtrl.js"
        	},
        	"upgradeEnt": { //企业升级
        		"url": "/upgradeEnt?id",
        		"templateUrl": "tpl/group/upgradeEnt.html",
        		"controller": "upgradeEntCtrl",
        		"js": "js/controller/upgradeEntCtrl.js"
        	},
        	"importManage": { //企业批量导入
        		"url": "/importManage?id&name",
        		"templateUrl": "tpl/group/importManage.html",
        		"controller": "importManageCtrl",
        		"js": "js/controller/importManageCtrl.js"
        	},
        	"password": { //密码修改
        		"url": "/password?vc",
        		"templateUrl": "tpl/password.html",
        		"controller": "pwdCtrl",
        		"js": "js/controller/pwdCtrl.js"
        	},
        	"zxHelpTip": { //掌秀连接说明
        		"url": '/zxHelpTip?find',
        		"templateUrl": "tpl/zhangxiu/zxHelpTip.html",
        		"controller":'zxHelpTip',
        		"js": "js/controller/zhangxiu/zxHelpTip.js"
        	},
        	"zxScan": { //掌秀搜索
        		"url": '/zxScan',
        		"templateUrl": "tpl/zhangxiu/zxScan.html",
        		"controller": 'zxScan',
        		"js": "js/controller/zhangxiu/zxScan.js"
        	},
        	"reset": { //掌秀搜索
        		"url": '/reset',
        		"templateUrl": "tpl/zhangxiu/reset.html",
        		"controller": 'changeWifi',
        		"js": "js/controller/zhangxiu/changeWifi.js"
        	},
        	"zxSetting": { //掌秀设置
        		"url": '/zxSetting?name&address',
        		"templateUrl": "tpl/zhangxiu/zxSetting.html",
        		"controller": 'zxSetting',
        		"js": "js/controller/zhangxiu/zxSetting.js"
        	},
        	"nameChange": { //掌秀修改名称
        		"url": '/nameChange',
        		"templateUrl": "tpl/zhangxiu/nameChange.html",
        		"controller":"changeWifi",
        		"js":"js/controller/zhangxiu/changeWifi.js"
        	},
        	"changeFive": { //掌秀5G切换
        		"url": '/changeFive',
        		"templateUrl": "tpl/zhangxiu/changeFive.html",
        		"controller":"changeWifi",
        		"js":"js/controller/zhangxiu/changeWifi.js"
        	},
        	"hotPoint": { //掌秀5G切换
        		"url": '/hotPoint',
        		"templateUrl": "tpl/zhangxiu/hotPoint.html",
        		"controller":"changeWifi",
        		"js":"js/controller/zhangxiu/changeWifi.js"
        	},
        	"changeWifi": { //掌秀连接wifi
        		"url": '/changeWifi?dspName',
        		"templateUrl": "tpl/zhangxiu/changeWifi.html",
        		"controller":"changeWifi",
        		"js":"js/controller/zhangxiu/changeWifi.js"
        	},
        	"zxUpdate": { //掌秀连接wifi
        		"url": '/zxUpdate',
        		"templateUrl": "tpl/zhangxiu/zxUpdate.html",
        		"controller":"changeWifi",
        		"js":"js/controller/zhangxiu/changeWifi.js"
        	},
        	"wifi":{ //wifi列表
        		"url":"wifi?name&address&wifiSwitch",
        		"templateUrl":"tpl/zhangxiu/wifi.html",
        		"controller":"wifi",
        		"js":"js/controller/zhangxiu/wifi.js"
        	},
        	"zswifi":{
        		"url":"zswifi?wifi&ip",
        		"templateUrl":"tpl/zswifi.html",
        		"controller":"zsettingCtrl",
        		"js":"js/controller/zsettingCtrl.js"
        	},
        	"appdownload": { //下载页
        		"url": "/appdownload",
        		"templateUrl": "tpl/qrcode.html"
        	},
        	"chat": { //聊天
        		"url": "/chat?id&type&hxid",
        		"templateUrl": "tpl/chat.html",
        		"controller": "chat",
        		"js": "js/controller/chat.js"
        	},
        	"neworg": { //加入企业
        		"url": "/neworg?title",
        		"templateUrl": "tpl/neworg.html",
        		"controller": "neworg",
        		"js": "js/controller/neworg.js"
        	},
        	"showPage": { //显示页面*
        		"url": "/showPage?id&url&title",
        		"templateUrl": "tpl/showPage.html",
        		"controller": "showPage",
        		"js": "js/controller/showPage.js"
        	},
        	"preview": { //预览
        		"url": "/preview?model&id&fid&name&num&type&historyIndex&domain",
        		"templateUrl": "tpl/preview.html",
        		"controller": "previewCtrl",
        		"js": "js/controller/previewCtrl.js"
        	},
			"imagePreview": { //预览
				"url": "/imagePreview?model&id&fid&name&num&type&historyIndex&domain",
				"templateUrl": "tpl/preview/imagePreview.html",
				"controller": "imagePreview",
				"js": "js/controller/preview/imagePreview.js"
			},
        	"txtReader": { //文本阅读
        		"url": "/txtReader?id&folderid&filename&domain&shareid",
        		"templateUrl": "tpl/preview/txtReader.html",
        		"controller": "txtReader",
        		"js": "js/controller/preview/txtReader.js"
        	},
        	"searchPan": { //搜索-资源
        		"url": "/searchPan?folderid&competence&rootid&foldertype&domain",
        		"templateUrl": "tpl/pan/searchPan.html",
        		"controller": "searchPan",
        		"js": "js/controller/pan/searchPan.js"
        	},
        	"qrforward": { //二维码跳转
        		"url": "/qrforward?action&id",
        		"templateUrl": "tpl/qrforward.html",
        		"controller": "qrforward",
        		"js": "js/controller/qrforward.js"
        	},
        	"coming":{ //掌秀商城
        		"url":"/coming",
        		"templateUrl":"tpl/coming.html"
        	},
        	'zltFile': { //zlt文件编辑
        		'url': '/zltFile?folderid&resourceid&competence',
        		'templateUrl': 'tpl/zwFile/zltFile.html',
        		'controller': 'zltFile',
        		'js': 'js/controller/zwFile/zltFile.js'
        	},
        	'zltFileDetail': { //zlt文件详情
        		'url': '/zltFileDetail?contentid&folderid&resourceid',
        		'templateUrl': 'tpl/zwFile/zltFileDetail.html',
        		'controller': 'zltFileDetail',
        		'js': 'js/controller/zwFile/zltFileDetail.js'
        	},
        	'notice': { //公告
        		'url': '/notice?groupid&folderid&role&urlType',
        		'templateUrl': 'tpl/notice/notice.html',
        		'controller': 'notice',
        		'js': 'js/controller/notice/notice.js'
        	},
        	'noticeDetail': { //公告详情
        		'url': '/noticeDetail?groupid&noticeid&role&folderid',
        		'templateUrl': 'tpl/notice/noticeDetail.html',
        		'controller': 'noticeDetail',
        		'js': 'js/controller/notice/noticeDetail.js'
        	},
        	'noticeEdit': { //公告编辑
        		'url': '/noticeEdit?groupid&noticeid&role&folderid',
        		'templateUrl': 'tpl/notice/noticeEdit.html',
        		'controller': 'noticeEdit',
        		'js': 'js/controller/notice/noticeEdit.js'
        	},
        	'topRead': { //阅读排名
        		'url': '/topRead?groupid',
        		'templateUrl': 'tpl/topRead/topRead.html',
        		'controller': 'topRead',
        		'js': 'js/controller/topRead/topRead.js'
        	},
        	'moreTopRead': { //更多阅读排名
        		'url': '/moreTopRead?groupid&type&title',
        		'templateUrl': 'tpl/topRead/moreTopRead.html',
        		'controller': 'moreTopRead',
        		'js': 'js/controller/topRead/moreTopRead.js'
        	},
        	'setTags': { //设置标签
        		'url': '/setTags?id',
        		'templateUrl': 'tpl/user/setTags.html',
        		'controller': 'setTags',
        		'js': 'js/controller/user/setTags.js'
        	},
			'zxMedalInfo': { //掌秀勋章详情
				'url': '/zxMedalInfo?space',
				'templateUrl': 'tpl/about/zxMedalInfo.html',
				'controller':'zxMedalInfo',
				'js':'js/controller/about/zxMedalInfo.js'
			}
        	//上传列表
            // ,
            // 'uploadList': {
				// url: '/uploadList?folderid',
				// templateUrl: 'tpl/pan/uploadList.html',
				// controller: 'uploadList',
				// js: 'js/controller/pan/uploadList.js'
            // }
        };
		//组装路由
		angular.forEach(appConfig,function(config,key){
			//html文件
			if(config.templateUrl){
				var url = config.templateUrl;
				config.templateUrl = function(){
					return url;
				};
			}
			//嵌套view
			if(config.views){
				angular.forEach(config.views,function(view){
					if(view.templateUrl){
						var url = view.templateUrl;
						view.templateUrl = function(){
							return url;
						};
					}
				});
			}
			//js文件
			if(config.js){
				config.resolve = {
					load: function($ocLazyLoad){
						return $ocLazyLoad.load(config.js);
					}
				};
			}
			$stateProvider.state(key,config);
		});
		app.stateProvider = $stateProvider; //state注册器
		//toast提醒
		toastrConfig.positionClass = "toast-bottom-center"; //位置
		toastrConfig.timeOut = 2000;
		//配置选择日期插件
		var datePickerObj = {
			setLabel: '确定',
			todayLabel: '今天',
			closeLabel: '取消',
			mondayFirst: false,
			showTodayButton: true,
			dateFormat: 'yyyy-MM-dd',
			weeksList: ["日", "一", "二", "三", "四", "五", "六"],
			monthsList: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
		};
		ionicDatePickerProvider.configDatePicker(datePickerObj);
	});

	app.run(function(cfservice,service,dbservice,$rootScope,$$user,$$chat,$ionicPopup,$ionicModal,$injector,$ionicPlatform,$http,$sce){
		$rootScope.msgUnread=0;
        //商城提醒
		if(!localStorage.showJdTip){
			$rootScope.showJdTip = 1;
		}
		//本地用户
		var user = $$user.getLocalUser();
		if(user.loginname && user.id && user.token){
			user.photo = $$user.getUserPhoto(user.id,user.updatetime);
			$rootScope.USER= user;
		}
		//平台
		$rootScope.isHD = UPF.is("HD");
		$rootScope.isApp = UPF.is("APP");
		$rootScope.isWeb = UPF.is("WEB");
		$rootScope.isIos= UPF.is("ios");
		$rootScope.isAndroid = UPF.is("android");
		$rootScope.$ionicHistory = $injector.get('$ionicHistory');
		//当前视图是否可以回退
		$rootScope.enabledBack = function(){
			var $ionicHistory = $injector.get('$ionicHistory');
			var enabledBack = $ionicHistory.enabledBack($ionicHistory.currentView());
			return enabledBack;
		};
		/**@delay
		 * 自定义回退按钮图标
		if(UPF.is("android")){
			$rootScope.ionArrowBack = "ion-android-arrow-back";
		}else{
			$rootScope.ionArrowBack = "ion-ios-arrow-back";
		}
		*/
		var goLogin = function(){
			if ($rootScope.isHD){
				service.$state.go("loginPc");
			}else{
				service.$state.go("loginMobile");
			}
		};
		//路由
		var goRouter = function(){
			if(!$rootScope.USER){ //本地没存储过用户信息
				goLogin();
			}else{
			    setTimeout(function () {
                    service.$state.go("tab.ppan");
                });
			}
		};
		if(UPF.is("APP")){
            var fetchWelcome = function () {
                //检测welcome页面更新
                var url = $rootScope.CONFIG.itf.system.getWelcomeHtml+'/'+UPF.version;
                $http.get(url,{timeout: 3000})
                    .success(function (result) {
                        if(result.type && result.type != localStorage.version){ //最新版
                            for(var i=0;i<result.htmls.length;i++){
                                $sce.trustAsResourceUrl(result.htmls[i]);
                            }
                            $rootScope.welcomePages = result.htmls;
                            // $rootScope.welcomePages = ['welcome/page1.html','welcome/page2.html','welcome/page3.html'];
                            localStorage.version = result.type;
                            service.$state.go("welcome");
                        }else{
                            goRouter();
                        }
                    })
                    .error(function () {
                        goRouter();
                    });
            };
            var date = new Date();
            var lastUpdateWelcome = (date.getMonth()+1)+''+date.getDate();
            //一天只取一次
            if(localStorage.lastUpdateWelcome != lastUpdateWelcome){
                localStorage.lastUpdateWelcome = lastUpdateWelcome;
                fetchWelcome();
            }else{
                goRouter();
            }
			//获取$$mobile服务
			var $$mobile = $injector.get("$$mobile");
			/** 应用初始化*/
			$ionicPlatform.ready(function(){
				if (UPF.is("ios")){
					cordova.plugins.Keyboard.disableScroll(true); // ios 软键盘阻挡问题
					window.addEventListener('native.keyboardshow', function(){
						document.body.classList.add('keyboard-open-ios');
					});
					window.addEventListener('native.keyboardhide', function(){
						document.body.classList.remove('keyboard-open-ios');
					});
				}
				$$chat.init(); //初始化聊天
				service.hideSplashscreen(); //关闭闪屏
				//加载消息提醒文件
				$$mobile.audio.preload();
				$injector.get('media').preload();
				//外部打开app
				externalOpen();
				//检查app版本更新
				$$mobile.app.vsVersion(function(conflict,result){
					if($rootScope.updateVersion ==  1){  //有更新
						var skipversion = localStorage.skipVersion;
						var bool = false;
						if(skipversion != result.version){  //跳过的版本不相等
							bool = true;
						}else if (conflict){          		//强制更新
							bool = true;
						}
						if(bool){
							$ionicPopup.confirm({
				                title: '版本升级',
				                template: result.title, //从服务端获取更新的内容
				                cancelText: '取消',
				                okText: '升级'
				            }).then(function (res) {
				                if (res) {
				                	cordova.InAppBrowser.open($rootScope.CONFIG.itf.app.getApp, '_system');
				                }else{
				                	if(conflict){
				                		ionic.Platform.exitApp();
				                	}else{
				                		//将此版本号记录
				                		localStorage.skipVersion = result.version;
				                	}
				                }
				            });
						}
					}
				});
				//获取掌秀版本信息
				//$$mobile.app.getNewVersionInfo();
				//重写回退事件
				$$mobile.registerBackButtonAction();
			});
			/** 应用重新打开*/
			$ionicPlatform.on("resume",function(){
				externalOpen(true);
            });
			//外部打开app
			var externalOpen = function(resume){
                $$mobile.app.externalOpen(function(data){
                      if(data){
                    	  if(data.id){
	                          $rootScope.externalData = data;
	                          var scope = $rootScope.$new(true);
	                          scope.id = data.id;
	                          $ionicModal.fromTemplateUrl("tpl/modal/addLinkShare.html",{scope: scope})
	                          .then(function(modal){
	                                modal.show();
	                                $rootScope.modal = modal;
	                          });
                    	  }else if(data.url){
								var mobile = $injector.get("$$mobile");
								mobile.app.openUrl({service:service,url:data.url});
                    	  }else{
                    		  $rootScope.externalData = data;
                    		  if(service.$state.current.name.indexOf('ppan')>0){
                    			  var historyID = service.$ionicHistory.currentHistoryId();
                    			  service.$ionicHistory.goToHistoryRoot(historyID);
                    			  $rootScope.$broadcast("resume");
                    		  }else{
                    			  service.$state.go("tab.ppan");
                    		  }
	                      } 
                      }
                });
			};
			/** 程序被搁置后台
			 * 1.关闭正在播放的语音(发放通知)
			 * 2.预览解锁屏(发放通知)
			 */
			document.addEventListener('pause',function(){
				$rootScope.$broadcast('pause');
			});
			/**
			 * ios特有的,应用被临时挂起
			 */
			document.addEventListener('resign',function(){
				$rootScope.$broadcast('resign');
			});
		}
		//非移动设备
		else{
            goRouter();
            if($rootScope.CONFIG.internet){
                $$chat.init();
			}
		}
		/** 路由监控*/
		$rootScope.$on('$stateChangeSuccess',function(event, toState, toParams){
			//文件库特殊处理
			if(toState.name == 'tab.ppan' && !toParams.id){
				setTimeout(function(){
					$injector.get('$ionicHistory').clearHistory(); //清除历史记录
				});
			}
		});
		//监听screen变化
		window.addEventListener('resize',function(){
			$rootScope.$broadcast('resize');
		});
		//网络监听
		$rootScope.$on('$cordovaNetwork:online',function(e,state){
			//do nothing
		});
		$rootScope.$on('$cordovaNetwork:offline',function(e,state){
			//do nothing
		});
		//媒体请求播放
		$rootScope.requestPlay = function(cb){
			if(UPF.is('app') && $injector.get('$cordovaNetwork')){
				//判断是WIFI网络还是手机网络
				var network = $injector.get('$cordovaNetwork');
				if(network.isOnline()){ //联网状态
					if(network.getNetwork() == 'wifi'){
						typeof cb === 'function' && cb(true);
					}else{ //手机网络
						//判断本地手机网络开关
						if(!$rootScope.localConfig.allowPlayWithMobileNetwork){
							//提醒
							$injector.get('$$widget').POPUP.tipBeforePlay(function(isAllow){
								if(isAllow){
									//设置本地开关
									$rootScope.localConfig.allowPlayWithMobileNetwork = true;
									//执行回调
									typeof cb === 'function' && cb(true);
								}
							});
						}else{
							typeof cb === 'function' && cb(true);
						}
					}
				}else{ //网络不可用
					typeof cb === 'function' && cb(false);
				}
			}else{
				typeof cb === 'function' && cb(true);
			}
		};
		//视频播放，全屏旋转
		if(UPF.is('app')){
			//监听视频全屏
			$rootScope.$on('mediaplayer:requestFullscreen',function(){
				//旋转横屏
				screen.lockOrientation("landscape");
				//隐藏状态栏
				StatusBar.hide();
			});
			$rootScope.$on('mediaplayer:cancelFullscreen',function(){
				//切至竖屏
				screen.lockOrientation("portrait");
				//显示状态栏
				StatusBar.show();
			});
		}
		/**
		 * 进入内网
		 * @param domain
		 */
		$rootScope.enterInsideNetwork = function (domain) {
			var params = {
				id: $rootScope.USER.folderid,
				title: '文件库',//domain.name,
				domain: domain.id
			};
			$injector.get('$state').go('tab.ppan',params);
		};
		/**
		 * 获取制定的domain
		 * @param id
		 * @returns {*}
		 */
		$rootScope.getDomainById = function (id) {
			if(id){
				var domains = $rootScope.domains;
				for(var i=0;i<domains.length;i++){
					if(domains[i].id == id){
						return domains[i];
					}
				}
			}
			return null;
		};
		/**
		 * 获取当前视图携带的domain
		 * @description 用于视图携带参数
		 * @returns {*}
		 */
		$rootScope.getDomain = function () {
			var $stateParams = $injector.get('$stateParams');
			if($stateParams.domain){
				return $stateParams.domain;
			}else {
				return null;
			}
		};
		/**
		 * 获取当前视图携带的domain所对应的整个domain对象
		 * @returns {*}
		 */
		$rootScope.getCurrentDomain = function () {
			var domain = $rootScope.getDomain();
			if(domain){
				return $rootScope.getDomainById(domain);
			}else {
				return null;
			}
		};
		/**
		 * 获取当前domain的domain属性值
		 * @returns {*}
		 */
		$rootScope.getCurrentDomainAddress = function(){
			if($rootScope.getCurrentDomain()){
				return $rootScope.getCurrentDomain().domain;
			}else {
				return null;
			}
		};
		/**
		 * 获取用户内网服务器信息
		 */
		$rootScope.getUserDomain = function() {
			$injector.get('$$user').getUserDomain(function (result) {
				if(result.result == 1){
					//绑定至$rootScope
					$rootScope.domains = result.domains;
				}else if(result.result == 2){
					$injector.get('service').activeSessionProxy(function () {
						$rootScope.getUserDomain();
					});
				}
			});
		};
		//本地应用配置
		if(localStorage.localConfig){
			$rootScope.localConfig = JSON.parse(localStorage.localConfig);
		}else{
			$rootScope.localConfig = {
				allowPlayWithMobileNetwork: false, //是否允许手机网络播放媒体
				cacheImage: true, //缓存图片(缩略图/预览图/头像)
				sortResource: 'name' //资源排序方式
			};
			localStorage.localConfig = JSON.stringify($rootScope.localConfig);
		}
		//监视配置对象
		$rootScope.$watchCollection('localConfig',function (newConfig) {
			if(newConfig){
				localStorage.localConfig = JSON.stringify(newConfig);
			}
		});
        //监听翻页指令
        window.previewPage = function (type) {
            $rootScope.$broadcast('previewPage',type);
        };
	});
	
	function onProfilePicError(ele) {
		ele.src = config.defaultUserPhoto; // set a fallback
	}