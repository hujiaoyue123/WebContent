/** */
angular.module("app",["ionic","mediaplayer"])
	.config(function($stateProvider){
		$stateProvider
			.state("link",{
				url: "/:id",
				templateUrl: "tpl/link.html",
				controller: "link"
			})
			.state("preview", { //预览
        		"url": "/preview?model&id&fid&name&num&type",
        		"templateUrl": "tpl/preview.html",
        		"controller": "previewCtrl"
        	})
			.state("txtReader", { //文本预览
				"url": "/txtReader?id&filename",
				"templateUrl": "tpl/txtReader.html",
				"controller": "txtReader"
			});
	})
	.run(function($state,$rootScope,$ionicLoading,$injector){
		var debug = false,server,client;
		if(debug){
			server = "https://dev.zhangwin.com/api/rest";
			client = "https://dev.zhangwin.com/web";
		}else{
			server = "https://api.zhangwin.com/WSS_1/rest";
			client = "https://web.zhangwin.com";
		}
		//本地
		// if(true){
		// 	// server = "https://dev.zhangwin.com/api/rest";
		// 	server = "https://api.zhangwin.com/WSS_1/rest";
		// 	client = "http://192.168.1.43:8080/zhangwen_web";
		// }
		$rootScope.client = client;
		$rootScope.$ionicHistory = $injector.get('$ionicHistory');
		/** 数据接口*/
		$rootScope.itf = {
			previewResource: server + "/ResourceService/previewResource",
			getApp: server + "/Down/getApp",
			share: {
				getShare: server + "/ShareService/getShare",
				download: server + "/ShareService/download",
				previewResource: server + "/ShareService/previewResource"
			}
		};
		/** 分享*/
		$rootScope.share = {
			itf: {
				getShare: server + "/ShareService/getShare",
				download: server + "/ShareService/download",
				previewResource: server + "/ShareService/previewResource",
				getTicket: server + "/ShareService/getTicket",
				imageMinPreview: server + '/ShareService/imageMinPreview'
			},
			/** 获取office预览图
			 * params{id,num}
			 */
			officePreviewResource: function(params){
				return $rootScope.share.itf.previewResource + "/" + params.id + "/" + params.num + ".jpg";
			},
			/** 获取image预览图
			 * params{id,filename}
			 */
			imagePreviewResource: function(params){
				return $rootScope.share.itf.previewResource + "/" + params.id + "/" + params.filename;
			},
			/** 下载*/
			download: function(shareid){
				var path = $rootScope.share.itf.download + "?shareid=" + shareid;
				window.open(path,"_blank");
			},
			/**
			 * 获取当前分享资源链接
			 * @param shareid
			 * @returns {string}
			 */
			getLink: function (shareid) {
				return $rootScope.client + "/link/#/" + shareid;
			},
			/**
			 * 图片缩略图
			 * @param shareid
			 * @returns {string}
			 */
			imageMinPreview: function (shareid) {
				return $rootScope.share.itf.imageMinPreview +'/'+shareid;
			}
		};
		/** 资源*/
		$rootScope.resource = {
			itf: {
				previewResource: server + "/ResourceService/previewResource"
			},
			/** 获取image预览图
			 * params{id}
			 */
			imagePreviewResource: function(params){
				return $rootScope.resource.itf.previewResource + "/" + params.id + "/" + params.filename;
			},
			/** 获取office预览图
			 * params{id,num}
			 */
			officePreviewResource: function(params){
				return $rootScope.resource.itf.previewResource + "/" + params.id + "/" + params.num + ".jpg";
			}
		};
		/** 应用*/
		$rootScope.app = {
			itf: {
				getApp: server + "/Down/getApp"
			}
		};
		/** 模态loading*/
		$rootScope.loading = {
			show: function(context,milliseconds){
				var opts = {};
				if(!context){
					context = "";
				}
				if(milliseconds){
					opts.duration = milliseconds;
				}
				opts.template = "<ion-spinner icon='spiral'></ion-spinner><br/>"+context;
				$ionicLoading.show(opts);
			},
			hide: function(){
				$ionicLoading.hide();
			}
		};
		/** 加载图片*/
		$rootScope.loadImage = function(path,successCallback,errorCallback){
			var image = new Image();
			if(path){
				image.src = path;
			}
			image.onload = function(){
				if(successCallback){
					successCallback(image);
				}
			};
			image.onerror = function(error){
				if(errorCallback){
					errorCallback(error);
				}
			};
		};
		/**
		 *
		 * @param message {title,desc,link,imgUrl}
		 */
		$rootScope.registerWX = function (message) {
			if(wx){
				var url = encodeURIComponent(location.href.split('#')[0]);
				//获取验证
				var xhr = new XMLHttpRequest();
				var onreadystatechange = function(){
					if(xhr.readyState==4) {//4表示数据已经调用完成
						if(xhr.status==200) { //HTTP的状态码
							initWx(xhr.responseText);
							$rootScope.response = xhr.responseText;
						}
					}
				};
				xhr.onreadystatechange = onreadystatechange;
				xhr.open("GET",$rootScope.share.itf.getTicket+"?url="+url ,true);
				xhr.send();

				//配置
				var initWx = function(data){
					data = JSON.parse(data);
					if(data.data){
						wx.config({
							// debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
							appId: data.data.appId, // 必填，公众号的唯一标识
							timestamp: data.data.timestamp, // 必填，生成签名的时间戳
							nonceStr: data.data.nonceStr, // 必填，生成签名的随机串
							signature: data.data.signature,// 必填，签名，见附录1
							jsApiList: ["onMenuShareTimeline","onMenuShareAppMessage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
						});
					}
				}
				//配置完成
				wx.ready(function(){
					//分享朋友圈
					wx.onMenuShareTimeline({
						title: message.title, // 分享标题
						link: message.link, // 分享链接
						imgUrl: message.imgUrl, // 分享图标
						success: function () {
							// 用户确认分享后执行的回调函数
						},
						cancel: function () {
							// 用户取消分享后执行的回调函数
						}
					});
					//朋友
					wx.onMenuShareAppMessage({
						title: message.title, // 分享标题
						desc: message.desc, // 分享描述
						link: message.link, // 分享链接
						imgUrl: message.imgUrl, // 分享图标
						type: '', // 分享类型,music、video或link，不填默认为link
						dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
						success: function () {
							// 用户确认分享后执行的回调函数
						},
						cancel: function () {
							// 用户取消分享后执行的回调函数
						}
					});
				});
			}
		};

	});
