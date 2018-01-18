/** 二维码名片*/
angular.module("app")
	.controller("qrcode",function($scope,$$widget,$rootScope,service){
		$scope.url = config[config.model].client+"/#/qrforward?action=user&id="+$rootScope.USER.id;
		/** 操作*/
		$scope.operate = function(params){
			//关闭窗
			if(params.type == "hide"){
				if($$widget.MODAL.modalWindow){
					$$widget.MODAL.hide();
				}
			}
			//顶菜单
			else if(params.type == "topMenu"){
				$$widget.POPOVER.qrcodeMenu($scope,"",params.$event);
			}
			/** 微信App分享 */
			else if(params.type == 'friend' || params.type == 'timeline'){
				$$widget.POPUP.close();
				var initParams = {
					type: params.type
				};
				$scope.shareToWexin(initParams);
			}
		};
		/**
		 * 分享二维码
		 */
		$scope.shareQrcode = function(){
			$scope.showLinkPopup = true; 
			$scope.disabledList = {
				zhangwen: true,
				link: true,
				wxqrcode: true
			};
			$$widget.POPUP.share.selectShare($scope);
		};
		/**
		 * 分享到微信
		 * @param params{type}
		 */
		$scope.shareToWexin = function(params){
			Wechat.isInstalled(function (installed) {
				if(!installed){
					service.showMsg("error","未检测到微信程序！");
				}else{
					//朋友圈/会话
					var scene = Wechat.Scene.SESSION;
					var message = {
						title: '点击下载掌文',
						description: "移动工作从掌文开始，掌文让工作更轻松。"
					};
					if(params.type == 'timeline'){ //朋友圈
						scene = Wechat.Scene.TIMELINE;
						//消息体
						message.thumb = 'www/img/qrcode/zw_qrcode.png',
						message.media = {
							type: Wechat.Type.IMAGE,
							image: 'www/img/qrcode/zw_qrcode.png'
						}
					}else{ //会话
						message.thumb = 'www/img/logo-p.png',
						message.media = {
							type: Wechat.Type.WEBPAGE,
							webpageUrl: $rootScope.CONFIG.itf.app.getApp
						}
					}
					Wechat.share({"message": message,"scene": scene},function(){
						service.showMsg("info","微信分享成功");
					});
				}
			}, function (reason) {
				service.showMsg("error",reason);
			});
		};
	});