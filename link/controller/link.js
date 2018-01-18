angular.module("app")
	.controller("link",function($scope,$rootScope,$stateParams,$http,$$data,$state,$ionicPopup,$injector){
		/** @$stateParams
		 * id 分享id
		 */
		$scope.isMobileBrower = UPF.is("web.ios") || UPF.is("web.android"); //手机浏览器/web浏览器
		/** 查询分享*/	
		$scope.getShare = function(){
			var params = {
				id: $stateParams.id
			};
			//请求数据
			$http.get($rootScope.share.itf.getShare,{params: params})
				.success(function(result){
					if(result.result == 1){
						//分享时间
						var share = result.share;
						if(share.hasOwnProperty('user') || share.hasOwnProperty('resource')){
							share.createtime = $$data.DATE.humanize(share.createtime);
							$scope.share = share;
							//处理资源
							var resource = result.share.resource;
							if(resource){
								$$data.FILE.oneDragon(resource); //处理type,date,icon,size
								//图片缩略图
								if(resource.iontype == 'image'){
									resource.src = $rootScope.share.imageMinPreview(share.id);
								}
								//可预览
								if(resource.preview){
									//图片大图
									if(resource.preview == "image"){
										var inParams = {
											id: resource.id,
											filename: resource.filename
										};
										resource.photo = $rootScope.resource.imagePreviewResource(inParams);
									}
									//office
									else if(resource.preview == "pdf" || resource.preview == "office"){
										var inParams = {
											id: resource.id,
											num: 0
										};
										resource.photo = $rootScope.resource.officePreviewResource(inParams);
									}
									//video/audio
									else if(resource.preview == 'video' || resource.preview == 'audio'){
										//获取地址
										var videoSrc = $rootScope.share.itf.download + "?shareid=" +$scope.share.id;
										//视频列表
										$scope.media = {
											type: resource.minetype,
											src: videoSrc,
											name: resource.filename
										};
									}
									//text
									else if(resource.preview == 'txt'){
										//文件二进制流
										var filepath = $rootScope.share.itf.download + "?shareid=" + $scope.share.id;
										$injector.get('$http').get(filepath)
											.success(function(text){
												$scope.txtContent = text; //文本内容
											});
									}
								}
								$scope.resource = resource;
							}
							//处理用户
							$scope.user = result.share.user;
							$scope.exception = false;
							//设置标题
							if(resource.filename){
								document.title = resource.filename;
								//针对微信不处理onchange事件
								var iframe = document.createElement('iframe');
								iframe.src = '../img/icon/logo.ico';
								iframe.style.display = 'none';
								iframe.onload = function() {
									setTimeout(function(){
										iframe.remove();
									}, 9)
								};
								document.body.appendChild(iframe);
							}
							//注册微信分享
							var message = {};
							message.title = resource.filename;
							message.desc = "来自掌文 " + share.user.username + "\n分享于:" + share.createtime;
                            if(resource.iontype == 'image'){
                                message.imgUrl = resource.src+'.'+resource.fileext;
                            }else{
                                message.imgUrl = $rootScope.client+'/img/filetype-bg/' + resource.iontype + ".png";
                            }
							message.link = $rootScope.share.getLink(share.id);
							$rootScope.registerWX(message);
						}else{
							$scope.exception = true;
							$scope.exceptionResult = '未找到请求的资源';
						}
					}else{
						$scope.exception = true;
						$scope.exceptionResult = result.description;
					}
				});
		};
		/** 预览文件*/
		$scope.preview = function(){
			var resource = $scope.resource,path;
			if(resource.preview == "office" || resource.preview == "pdf"){
				//预加载图片，获取图片尺寸
				var inParams = {
					id: resource.id,
					num: 0
				};
				path = $rootScope.resource.officePreviewResource(inParams);
			}
			//image
			else if(resource.preview == "image"){ //image
				var inParams = {
					id: resource.id,
					filename: resource.filename
				};
				path = $rootScope.resource.imagePreviewResource(inParams);
			}else{
				return;
			}
			$rootScope.loading.show("开始检查文件");
			$rootScope.loadImage(path,function(image){
				var inParams = {};
				if(resource.preview == "office" || resource.preview == "pdf"){
					inParams.model = "office";
					inParams.id = resource.id;
					inParams.name = resource.filename;
					inParams.num = resource.imagenumber;
				}
				else if(resource.preview == "image"){
					inParams.model = "image";
					inParams.fid = resource.id;
					inParams.name = resource.filename;
				}
				//进入office预览
				$state.go("preview", inParams);
				$rootScope.loading.hide();
			},function(){
				alert("没有文件数据!");
				$rootScope.loading.hide();
			});
		};
        /**
         * 文本预览
         */
		$scope.previewText = function () {
            var inParams = {
                id: $scope.share.id,
                filename: $scope.share.resource.filename
            };
            $injector.get('$state').go('txtReader',inParams);
        };

		/** App打开文件*/
		$scope.openApp = function(){
			var appScheme = "zhangwen://open?id=" + $scope.share.id;
			window.location = appScheme;
			setTimeout(function(){
				$scope.$apply(function(){
					$scope.showDownload = true;
				});
			},1500);
			//微信特殊处理
			if($scope.isWeiXin()){
				$scope.showTip = true;
			}
		};
		/** 下载应用*/
		$scope.downApp = function(){
			window.open($rootScope.app.itf.getApp,"_blank");
		};
		/** 进入掌文*/
		$scope.goHome = function(){
			window.open($rootScope.client,"_blank");
		};
		
		/** 初始化*/
		$scope.getShare();
		/**
		 * 判断是否微信浏览器
		 */
		$scope.isWeiXin = function(){
			var ua = window.navigator.userAgent.toLowerCase(); 
			if(ua.match(/MicroMessenger/i) == 'micromessenger'){ 
				return true; 
			}else{ 
				return false; 
			} 
		};
	});