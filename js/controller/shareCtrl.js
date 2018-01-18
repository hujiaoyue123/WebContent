/** C9-分享 **/
angular.module("app")
	.controller("shareCtrl",function($scope,service,component,$$share,$$data){ /**wxservice, */
		//初始化
		var init = function(){
			SHARE.select();
		};
		/** 操作
		 * type 操作类型
		 * share 资源分享信息
		 */
		$scope.operate = function(type,share){
			//选择分享类型
			if(type == "share"){ 
				service.initPopup(component.popup.share($scope,share,$$share.getLink(share.id))); //弹窗选择
			}
			//删除分享提醒
			else if(type == "remove"){ 
				service.initPopup(component.popup.remove($scope,share.id,["SHARE","remove"]));
			}
			//掌文分享
			else if(type == "zwfriend"){ //选择：分享好友
				service.popupWindow.close(); //关闭Popup
				service.$state.go("friend",{type:"share",rid: share.resource.id,ctrl:share.ctrl});
			}
			//链接
			else if(type == "link"){
				service.popupWindow.close(); //关闭Popup
				var status = share; //拷贝状态
				service.onCopy(status);
			}
			//微信好友/朋友圈
			else if(type == "wxfriend" || type == "wxtimeline"){
				//处理与分享
				wxservice.shareExecute($scope,file,type);
			}
		};
		/** 分享*/
		$scope.SHARE = SHARE = {
			/** 查询分享*/
			select: function(){
				service.promiseProxy(function(promise){
					$$share.select(promise,"other");
				},function(result){
					if(result.result == 2){
						service.activeSessionProxy(function () {
                            $scope.SHARE.select();
                        });
					}else if(result.result == 1){
						for(var i=0;i<result.sub.length;i++){
							result.sub[i].sharetime = $$data.DATE.humanize(result.sub[i].sharetime); //分享时间
							$$data.type(result.sub[i].resource); //文件格式
							$$data.icon(result.sub[i].resource,result.sub[i].ctrl); //文件显示图标
						}
						$scope.shareList = result.sub;
					}
				},function(error){
					console.log(error);
				},function(){
					$scope.$broadcast("scroll.refreshComplete");
				});
			},
			/** 删除分享*/
			remove: function(id){
				var inParams = {
					id: id,
					type: "other"
				};
				$$share.delShare(inParams,function(result){
					if(result.result == 1){
						SHARE.select();
					}else if(result.result == 2){
						service.activeSessionProxy(function () {
							$scope.SHARE.remove(id);
						});
					}
				});
				
			}
		};
		/** 拷贝文本
		 * text
		 */
		var Mobileclipboard = function(text){
			service.promiseProxy(function(promise){
				service.Mobileclipboard(promise,text); //copy文本
			},function(){ //成功
				onCopy(1);
			},function(){ //失败
				onCopy(0);
			});
		};
		/** 分享-mobile
		 * file 分享的文件
		 * type 分享类型
		 */
		$scope.mobileShare = function(shared,type){
			//关闭Popup
			service.popupWindow.close();
			if(type == "link"){
				var copyLink = service.getCopyLink(shared.id,shared.password);
				Mobileclipboard(shared.copyLink);
			}else if(type == "friend" || type == "timeline"){
				//处理与分享
				wxservice.shareExecute($scope,shared,type);
			}
		};
		//打开文件
		$scope.openFile = function(file){
			var ctrlname = "";
			if(file.ctrl == 0){
				ctrlname = "ppanCtrl";
			}else if(file.ctrl == 1){
				ctrlname = "cpanCtrl";
			}else{
				return;
			}
			if(file.preview){
				if(file.preview == "pdf"){ //PDF || file.preview == "txt"
					//预加载图片，获取图片尺寸
					var image = new Image();
					image.src = service.imgpath_office(ctrlname,file.id,0); //office图片路径
					service.loading("start");
					//加载成功
					image.onload = function(){
						service.loading("end");
						var data = {};
						data.model = "office";
						data.id = file.id; //文件id
						data.title = file.title; //文件名
						data.ctrlname = ctrlname; //ctrl名称
						data.num = file.imagenumber; //图片数量
						data.size = image.width + "*" + image.height;
						/**Mobile是否旋转屏幕
						if(image.width > image.height){
							//隐藏状态栏,横屏显示
							service.previewModel.ready();
						}
						*/
						//进入office预览
						service.$state.go("tab.share_preview", data);
					};
					//加载失败
					image.onerror = function(){
						/** Mobile
						service.previewModel.quit();
						*/
						service.loading("end");
						service.showMsg("error","没有文件数据!");
						//service.$cordovaToast.showShortBottom("没有文件数据!");
					};
				}else if(file.preview == "image"){ //image
					var image = new Image();
					image.src = service.imgPath_other(ctrlname,file.id); //其他文件路径
					service.loading("start");
					//加载成功
					image.onload = function(){
						service.loading("end");
						var data = {};
						data.model = "image";
						data.fid = file.id; //文件id
						data.type = "share"; //类型
						data.size = image.width + "*" + image.height;
						//进入img预览
						service.$state.go("tab.share_preview",data);
					};
					//加载失败
					image.onerror = function(){
						service.loading("end");
						service.showMsg("error","没有文件数据!");
						//service.$cordovaToast.showShortBottom("没有文件数据!");
					};
				}
			}else{
				service.showMsg("waring","目前还无法打开此文件!");
				//service.$cordovaToast.showShortBottom("目前还无法打开此文件!");
			}
		};
		//复制链接回调
		$scope.onCopy = onCopy = function(type){
			service.onCopy(type);
		};
		/** 初始化*/
//		init();
		service.validUser(init);
	});