/** 预览服务*/
angular.module("app")
	.factory("$$preview",function(service,$RESOURCE,$$share,$injector,$rootScope){
		/**
		 * 等待预览
		 * @params resource,folderid
		 */
		var waitPreview = function(params,successCallBack,errorCallBack){
			var inParams = {
				id: params.resource.id,
				folderid: params.folderid
			};
			$RESOURCE.RESOURCE.getResource(inParams,function(result){
				if(result.result == 1){
					if(result.resource.imagenumber>0){
						params.resource.imagenumber = result.resource.imagenumber;
						//重新调用
						PREVIEW.prepare(params,successCallBack,errorCallBack);
					}else{
						$injector.get('toastr').warning('正在转换中,请稍后再预览');
					}
				}else if(result.result == 2){
					service.activeSessionProxy(function(){
						waitPreview(params,successCallBack,errorCallBack);
					});
				}else{
					$injector.get('toastr').error(result.description);
				}
			})
		};
		/** 预览体*/
		var PREVIEW = {
			/** 预览前
			 * params {resource,folderid,type}
			 */
			prepare: function(params,successCallBack,errorCallBack){
				var resource = params.resource; //资源对象
				//预防未转换完就预览
				if((resource.preview == 'office' || resource.preview == 'pdf') && (!resource.imagenumber || resource.imagenumber == '0')){
					waitPreview(params,successCallBack,errorCallBack);
					return;
				}
				var image = new Image(); //IMAGE
				//office、pdf
				if(resource.preview == "office" || resource.preview == "pdf"){
					//预加载图片，获取图片尺寸
					var inParams = {
						id: resource.id,
						num: 0
					};
					if(params.type == "link"){
						image.src = $$share.LINK.officePreviewResource(inParams); //link预览
					}else{
						if($rootScope.localConfig.cacheImage && UPF.is("app")){
							//mobile离线
							var offline = $injector.get("$$mobile").offline;
							var obj = {
								type: "office",
								id: resource.id,
								sync: true,
								num: 0
							};
							//离线处理-失败回调
							var errorCallback = function(){
								image.src = $RESOURCE.RESOURCE.officePreviewResource(inParams); //office图片路径
							};
							//离线处理-成功回调
							var successCallback = function(url){
								image.src = url;
							};
							offline.checkDir("office",function(){
								offline.checkDir("office/"+resource.id,function(){
									offline.checkFile(obj,successCallback,errorCallback);
								},errorCallback);
							},errorCallback);
						}else{
							image.src = $RESOURCE.RESOURCE.officePreviewResource(inParams); //office图片路径
						}
					}
				}
				//image
				else if(resource.preview == "image"){ //image
					var inParams = {
						id: resource.id,
						filename: resource.filename
					};
					if(params.type == "link"){
						image.src = $$share.LINK.imagePreviewResource(inParams); //office图片路径
					}else{
						if($rootScope.localConfig.cacheImage && UPF.is("app")){
							//mobile离线
							var offline = $injector.get("$$mobile").offline;
							var obj = {
								type: "image",
								sync: true,
								id: resource.id,
								filename: resource.filename
							};
							offline.checkDir("image",function(){
								offline.checkDir("image/"+resource.id,function(){
									offline.checkFile(obj,successCallback,errorCallback);
								},errorCallback);
							},errorCallback);
							//离线处理-失败回调
							var errorCallback = function(){
								image.src = $RESOURCE.RESOURCE.imagePreviewResource(inParams); //image图片路径
							};
							//离线处理-成功回调
							var successCallback = function(url){
								image.src = url;
							};
						}else{
							image.src = $RESOURCE.RESOURCE.imagePreviewResource(inParams); //image图片路径
						}
					}
				}else{
					return;
				}
				//显示加载中
				var show = function(){
					var scope = $rootScope.$new(true);
					//取消
					scope.cancel = function(){
						image = new Image(); //重新初始化Image
						$injector.get('$ionicLoading').hide();
					};
					var watchTimeout = function(){
						var limit = 3; //多少秒后显示关闭
						var interval = setInterval(function(){
							limit--;
							if(limit == 0){
								clearInterval(interval);
								scope.$apply(function(){
									scope.showCancel = true;
								});
							}
						},1000);
					};
					var options = {
						scope: scope,	
						template: '<div><ion-spinner icon="spiral"></ion-spinner><br/>'+'开始检查文件'+'<br/><button ng-if="showCancel" ng-click="cancel()" class="button button-light button-small button-outline" style="position: relative;top: 10px;padding-left: 10px;padding-right: 10px;">取 消</button></div>'
					};
					$injector.get('$ionicLoading').show(options);
					watchTimeout();
				};
				show();
				//加载成功
				image.onload = function(){
					if(image.complete){
						if(successCallBack){
							successCallBack();
						}
						/**Mobile是否旋转屏幕 */
						if (UPF.is("APP")){
							service.unlock();
							service.StatusBar.hide();
							if(image.width > image.height){
								//隐藏状态栏,横屏显示
								service.screen.landscape();
							}
						}
						var inParams = {
							domain: $rootScope.getDomain()
						};
						if(resource.preview == "office" || resource.preview == "pdf"){
							inParams.model = "office";
							inParams.id = resource.id;
							inParams.name = resource.filename;
							inParams.num = resource.imagenumber;
							//获取上次记录位置
							var history = PREVIEW.getRecordLocation(resource.id);
							if(history && history.index){
								inParams.historyIndex = history.index;
							}
						}
						else if(resource.preview == "image"){
							inParams.model = "image";
							inParams.id = params.folderid;
							inParams.fid = resource.id;
							if(params.type == "link"){
								inParams.name = resource.filename;
							}
							//分享给我的
							if(params.type == "friendShared"){
								inParams.id = params.id;
							}
						}
						inParams.type = params.type;
						//进入office预览
						service.$state.go("imagePreview", inParams);
						// service.$state.go("preview", inParams);
						$injector.get('$ionicLoading').hide();
					}
				};
				//加载失败
				image.onerror = function(){
					if(errorCallBack){
						errorCallBack();
					}
					service.previewModel.quit();
					$injector.get('$ionicLoading').hide();
					service.showMsg("error","没有文件数据!");
				};
			},
			/**
			 * 获取资源浏览记录
			 * @param resourceId 资源id
			 */
			getRecordLocation: function(resourceId){
				var previewHistory = localStorage.previewHistory; //第一次为undefined
				if(previewHistory){
					previewHistory = JSON.parse(previewHistory);
					if(previewHistory.length>0){
						for(var i=0;i<previewHistory.length;i++){
							var history = previewHistory[i];
							if(history.resourceId == resourceId){ //找到该历史
								return history;
							}
						}
						return null;
					}else{
						return null;
					}
				}else{
					localStorage.previewHistory = JSON.stringify(new Array());
					return null;
				}
			},
			/**
			 * 设置资源浏览记录
			 * @param resourceId 资源id
			 */
			setRecordLocation: function(resourceId,index){
				var newHistory = {
					resourceId: resourceId,
					index: index
				};
				var previewHistory = localStorage.previewHistory;
				if(previewHistory){
					previewHistory = JSON.parse(previewHistory);
					if(previewHistory.length>0){
						var contains = false;
						for(var i=0;i<previewHistory.length;i++){
							var history = previewHistory[i];
							if(history.resourceId == newHistory.resourceId){ //找到该历史
								history.index = newHistory.index;
								contains = true;
								break;
							}
						}
						//暂无该资源历史
						if(!contains){
							previewHistory.push(newHistory);
						}
						//重新存储
						localStorage.previewHistory = JSON.stringify(previewHistory);
					}else{
						localStorage.previewHistory = JSON.stringify([newHistory]);
					}
				}else{
					localStorage.previewHistory = JSON.stringify([newHistory]);
				}
			}
		};
		
		return PREVIEW;
	});