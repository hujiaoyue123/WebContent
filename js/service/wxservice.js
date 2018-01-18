/** 微信 */
angular.module("app")
	.service("wxservice",function(service, $$data){
		/** 检测客户端
		 * fn 执行函数
		 */
		
		this.serverUrl =  config[config.model].server + "/rest";
		this.previewUrl = serverUrl + config.itf.share.link.previewResource;
		
		this.isInstalled = function(fn){
			Wechat.isInstalled(function (installed) {
				if(!installed){
					service.showMsg("error","未检测到微信程序！");
				}else{
					fn();
				}
			}, function (reason) {
				service.showMsg("error",reason);
			});
		};
		/** 分享图片
		 * params{title,description,image} 图片链接
		 * scene 分享情景
		 */
		var _shareImage = function(params,scene){
			var message = {},media = {};
			message.title = params.title;
			message.description = params.description;
			message.thumb = params.thumb;
			media.type = _weixin.TYPE.IMAGE;
			media.image = params.image;
			message.media = media;
			//执行分享
			_weixin.shareMedia(message,scene);
		};
		/** 分享链接
		 * params {title: 分享标题,thumb：分享缩略图,description：分享描述,url：分享链接}
		 * scene 分享情景
		 */
		var _shareLink = function(params,scene){
			console.log(params)
			var message = {},media = {};
			//消息
			message.title = params.title;
			message.thumb = params.thumb;
			message.description = params.description;
			//媒体
			media.type = _weixin.TYPE.WEBPAGE;
			media.webpageUrl = params.url;
			message.media = media;
			//执行分享
			_weixin.shareMedia(message,scene);
		};
		/** 微信API
		 *  params{text:string,scene:number}
		 *  params{message:{
		 *  		title: string,
		 *  		description: string,
		 *  		thumb: url,
		 *  		mediaTagName: string,
		 *  		messageExt: string,
		 *  		messageAction:,
		 *  		media: {
		 *  			type:number,
		 *  		}
		 *  	},scene}
		 */
		this.Weixin = _weixin = {
				//分享情景
				SCENE:{
					SESSION:  0, // 聊天界面
			        TIMELINE: 1, // 朋友圈
			        FAVORITE: 2  // 收藏
				},
				//media类型
				TYPE: {
					APP:     1,
			        EMOTION: 2,
			        FILE:    3,
			        IMAGE:   4,
			        MUSIC:   5,
			        VIDEO:   6,
			        WEBPAGE: 7
				},
				//分享文本
				shareText: function(promise,text,scene){
					Wechat.share({"text": text,"scene": scene},function(){
						promise.resolve();
					},function(reason){
						promise.reject(reason);
					});
				},
				//分享Media(image,music,video,webpage,file,appextend)
				shareMedia: function(message,scene,success,error){
					Wechat.share({"message": message,"scene": scene},function(){
						if(success){
							success();
						}
					},function(reason){
						if(error){
							error(reason);
						}
					});
				}
		};
		/** 微信分享处理
		 * file 文件对象
		 * scene 分享情景
		 * 2015-11-25
		 */
		this.shareExecute = function(scope,file,type){
			//分享场景
			var scene = "";
			if(type == "friend"){
				scene = _weixin.SCENE.SESSION;
			}else if(type == "timeline"){
				scene = _weixin.SCENE.TIMELINE;
			}
			//盘分区
			var pan = {};
			if(scope.ctrlname == "ppanCtrl"){ //个人盘资源
				pan.ctrl = 0;
				pan.name = "ppan";
			}else if(scope.ctrlname == "cpanCtrl"){ //个人盘资源
				pan.ctrl = 1;
				pan.name = "cpan";
			}
			var description = "来自掌文 " + service.getUser().username + "\n分享于:" + $$data.DATE.humanize();
			//分享历史再次分享
			if(scope.ctrlname == "shareCtrl"){
				var message = {};
				var innerFile = file.file[0];
				message.title = innerFile.title;
				message.description = description;
				//图片与文件
				if(innerFile.iontype == "image"){
					//分享资源所属个人/企业资源
					if(innerFile.ctrl == 0){
						pan.name = "ppan";
					}else if(innerFile.ctrl == 1){
						pan.name = "cpan";
					}
					//微信消息
					message.thumb = innerFile.src;
					message.image = service.getServer().itf[pan.name].previewOtherResource + "/" + innerFile.id;
					//接入微信分享
					_shareImage(message,scene);
				}else{
					message.thumb = "www/ionic/" + innerFile.src;
					message.url = service.getCopyLink(file.id); //分享链接
					//接入微信分享
					_shareLink(message,scene);
				}
			}
			//个人/企业盘分享
			else{
				//微信消息
				var message = {};
				message.title = file.title;
				message.description = description;
				if(file.iontype == "image"){ //图片分享图片
					message.thumb = file.src;
					message.image = config.itf.resource.previewResource + "/" + file.id;
					//执行分享
					_shareImage(message, scene);
				}else{ //非图片分享链接
					message.thumb = "www/ionic/" + file.src;
					if(file.sharetype == 1){ //资源已分享
						service.promiseProxy(function(promise){
							service.shareCtrl_query(promise,file.id); //查询该资源分享信息
						},function(result){
							if(result.result == 1){ //查询成功
								var sharedFile = result.sub; //分享历史
								//微信参数
								message.url = service.getCopyLink(sharedFile.id); //分享链接
								var today = new Date().getTime(); //当前时间毫秒数
								if(today > parseInt(sharedFile.exptime)){ //过期
									sharedFile.exptime = service.getDelayDay(); //延后3天
									//封装修改参数
									var params = {},updateString = [],newObj = {};
									newObj.id = sharedFile.id;
									newObj.password = sharedFile.password;
									newObj.exptime = new Date(sharedFile.exptime).getTime(); //获取毫秒
									updateString.push(newObj);
									params.action = "update";
									params.updateString = updateString;
									//执行修改
									service.promiseProxy(function(promise){
										service.shareCtrl_execute(params,promise); //修改、删除
									},function(result){
										//接入微信分享
										_shareLink(message,scene);
										//刷新盘数据
										if(scope.loadPan){
											scope.loadPan(); 
										}
									});
								}else{ //显示
									//刷新盘数据
									if(scope.loadPan){
										scope.loadPan(); 
									}
									_shareLink(message,scene);
								}
							}else{
								service.showMsg("error",result.description);
							}
						});
					}
					//该资源未分享
					else{ 
						var params = {};
						params.action = "add";
						params.id = file.id;
						params.exptime = new Date(service.getDelayDay()).getTime(); //延后3天
						params.ctrl = pan.ctrl;
						//执行添加
						service.promiseProxy(function(promise){
							service.shareCtrl_execute(params,promise); //执行添加
						},function(result){
							//查询分享
							service.promiseProxy(function(promise){
								service.shareCtrl_query(promise,file.id); //查询该资源分享信息
							},function(result){
								if(result.result == 1){ //查询成功
									var sharedFile = result.sub; //分享历史
									//微信参数
									message.url = service.getCopyLink(sharedFile.id); //分享链接
									//接入微信分享
									_shareLink(message,scene);
									//刷新盘数据
									if(scope.loadPan){
										scope.loadPan(); 
									}
								}else{
									service.showMsg("error",result.description);
								}
							});
						});
					}
				}
			}
		};
	});