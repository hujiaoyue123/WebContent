/**预览
 * $stateParams {id(父级id), ctrlname(个人/企业), fid(图片文件id))}
 */
angular.module("app")
	.controller("previewCtrl",function($scope,$rootScope,service,$stateParams,$$resource,$$data,$$share,$ionicSlideBoxDelegate,$ionicScrollDelegate,$injector){
		/** @stateParams
		 * model 预览模式(文档类/图片)
		 * id office模式：id为资源id,image模式id为folderid
		 * fid image模式的文件id
		 * name office文件名
		 * num office图片数量
		 * type 预览方式(type: link)
		 */
		var idx = -1; //idx预览图片在图片集的下标
		var limit = 5; //slider显示数量
		$scope.isApp = UPF.is("APP"); //平台
		$scope.ionicSlideBoxDelegate = $ionicSlideBoxDelegate; //ionSlide代理
		var previewSlideBoxDelegate = $ionicSlideBoxDelegate.$getByHandle("preview");
		$scope.zoomMin = 1;//缩放最小比例
		$scope.direction = "xy"; //ionScroll可滑动方向
		$scope.$stateParams = $stateParams; //url参数
		$scope.showList = []; //显示list
		$scope.actualList = []; //实际list
		var length = parseInt($stateParams.num); //实际图片数量
		// 退出时还原屏幕方向
		$scope.goBack = function(){
			service.lock();
			service.$ionicHistory.goBack();
			if ($scope.isApp){
				service.previewModel.quit();
			}
			//退出预览回掉(针对外部打开预览)
			if($rootScope.previewCallBack){
				$rootScope.previewCallBack();
				$rootScope.previewCallBack = null; //置空
			}
			//记录预览位置
			console.log($scope.showIndex);
			$injector.get('$$preview').setRecordLocation($stateParams.id,$scope.showIndex);
		};
		/** 加载本地文件
		 * params {
		 * 	showIndex 显示集合的index
		 * 	actualIndex 实际总集合的index
		 *  id 文件id
		 *  type 文件类型
		 *  filename 针对image
		 * }
		 */
		var loadLocalImage = function(showIndex,actualObject){
			if($rootScope.localConfig.cacheImage && UPF.is("app")){
				var offline = $injector.get("$$mobile").offline;
				var inParams = {
						id: actualObject.id,
						type: $stateParams.model,
						num: actualObject.index,
						filename: actualObject.filename
				};
				//检测并提取url
				offline.checkFile(inParams,function(url){
					actualObject.src = url;
					$scope.showList[showIndex] = actualObject;
					//更新slidebox
					previewSlideBoxDelegate.update();
				},function(){
					$scope.showList[showIndex] = actualObject;
					//更新slidebox
					previewSlideBoxDelegate.update();
				});
			}
		}
		//初始化
		$scope.initImages = function(){
			//office、pdf预览
			if($stateParams.model == "office" || $stateParams.model == "pdf"){
				//实际图片集合
				for(var i=0;i<length;i++){
					var obj = {
						id: $stateParams.id,
						index: i,
						scale: 1
					};
					var inParams = {
						id: $stateParams.id,
						num: i
					};
					if($stateParams.type == "link"){
						obj.src = $$share.LINK.officePreviewResource(inParams); //office图片路径
					}else {
						obj.src = $$resource.RESOURCE.officePreviewResource(inParams);
					}
					//初始显示集合
					$scope.actualList.push(obj);
				}
				//实际显示图片集合
				for(var i=0; i<(limit/2);i++){
					if($rootScope.localConfig.cacheImage && UPF.is("app")){
						var showIndex = i,actualObject = $scope.actualList[i%length];
						loadLocalImage(showIndex,actualObject);
					}else{
						$scope.showList[i] = $scope.actualList[i%length];
					}
				}
				for(var i=(parseInt(limit/2)+1); i<limit;i++){
					if($rootScope.localConfig.cacheImage && UPF.is("app")){
						var showIndex = i,actualObject = $scope.actualList[(length- limit+i)%length];
						loadLocalImage(showIndex,actualObject);
					}else{
						$scope.showList[i] = $scope.actualList[(length- limit+i)%length];
					}
				}
				$scope.showIndex = 0; //showList的当前显示下标
				$scope.actualIndex = 0; //actualList的当前显示下标
			}
			//图片
			else if($stateParams.model == "image"){
				if($stateParams.type == "link"){
					var obj = {
						scale: 1,
						id: $stateParams.fid,
						filename: $stateParams.name
					};
					obj.src = $$share.LINK.imagePreviewResource(obj); //图片路径
					$scope.showList.push(obj);
				}
				else{
					var init = function(result){
						var index = 0;
						//文件格式
						angular.forEach(result.data,function(value,key){
							$$data.type(value); //处理文件格式
							//筛选出图片文件
							if(value.preview == "image"){
								value.index = index;
								value.scale = 1;
								//跳转到指定图片下标
								var inParams = {
									id: value.id,
									filename: value.filename
								};
								value.src = $$resource.RESOURCE.imagePreviewResource(inParams);
								if(value.id == $stateParams.fid){
									idx = index;
									$scope.headerTitle = value.filename;
								}
								index++;
								$scope.actualList.push(value);
							}
						});
						length = index;
						//实际显示图片集合
						for(var i=0; i<(limit/2);i++){
							if($rootScope.localConfig.cacheImage && UPF.is("app")){
								var showIndex = i,actualObject= $scope.actualList[(i+idx)%length];
								loadLocalImage(showIndex,actualObject);
							}else{
								$scope.showList[i] = $scope.actualList[(i+idx)%length];
							}
						}
						for(var i=(parseInt(limit/2)+1); i<limit;i++){
							if($rootScope.localConfig.cacheImage && UPF.is("app")){
								var showIndex = i,actualObject = $scope.actualList[(length- limit+i+idx%length)%length];
								loadLocalImage(showIndex,actualObject);
							}else{
								$scope.showList[i] = $scope.actualList[(length- limit+i+idx%length)%length];
							}
						}
						$scope.showIndex = idx; //showList的当前显示下标
						$scope.actualIndex = idx; //actualList的当前显示下标
					};
					if($stateParams.type == "friendShared"){
						$scope.getFriendShare(init);
					}else{
						$scope.FOLDER.getFolderImage(init);
					}
				}
			}
		};
		/** 轮巡图片
		 * $index 当前slide index
		 */
		$scope.slideHasChanged = function($index){
			//当前要显示的item
			var readyShow = $scope.showList[$index];
			//当先显示item的index
			$scope.showIndex = readyShow.index;
			//每张图片的名称都不同，需要手动更改
			if($stateParams.model == "image"){
				$scope.headerTitle = readyShow.filename;
			}
			if($rootScope.localConfig.cacheImage && UPF.is("APP")){
				//预加载后两张
				var showIndex = ($index+1)%limit,actualObject = $scope.actualList[(readyShow.index+1)%length];
				loadLocalImage(showIndex,actualObject);
				var showIndex = ($index+2)%limit,actualObject = $scope.actualList[(readyShow.index+2)%length];
				loadLocalImage(showIndex,actualObject);
				//预加载前两张
				var showIndex = ($index+limit-1)%limit,actualObject = $scope.actualList[(readyShow.index-1+length)%length];
				loadLocalImage(showIndex,actualObject);
				var showIndex = ($index+limit-2)%limit,actualObject = $scope.actualList[(readyShow.index-2 + length)%length];
				loadLocalImage(showIndex,actualObject);
			}else{
				//预加载后两张
				$scope.showList[($index+1)%limit] = $scope.actualList[(readyShow.index+1)%length];
				$scope.showList[($index+2)%limit] = $scope.actualList[(readyShow.index+2)%length];
				//预加载前两张
				$scope.showList[($index+limit-1)%limit] = $scope.actualList[(readyShow.index-1+length)%length];
				$scope.showList[($index+limit-2)%limit] = $scope.actualList[(readyShow.index-2 + length)%length];
				//更新slidebox
				previewSlideBoxDelegate.update();
			}
			//控制slide滑动
	    	if($scope.actualList[$scope.actualList.length-1].index == readyShow.index || $scope.actualList[0].index == readyShow.index){
	    		previewSlideBoxDelegate.update();
	    		setTimeout(function(){
	    			previewSlideBoxDelegate.enableSlide(false);
	    		},0);
	    	}
		};
		/** showList遍历完成-只会执行一次*/
		$scope.repeatDone = function(){
			previewSlideBoxDelegate.update();
			if($scope.actualList.length<= 1){
				previewSlideBoxDelegate.enableSlide(false); //不起作用
			}else{
				previewSlideBoxDelegate.loop(true);
			}
		};
		/** 功能操作
		 * type: zoomin,zoomout,fullscreen
		 */
		$scope.operate = function(type){
			var index = previewSlideBoxDelegate.currentIndex();
			var file = $scope.showList[index];
			if(type == "zoomin"){ //缩小
				if(file.scale > 0.5){
					file.scale -= 0.2;
					$ionicScrollDelegate.$getByHandle('scrollHandle' + index).zoomTo(file.scale);
				}
			}else if(type == "zoomout"){ //放大
				if(file.scale < 3){
					file.scale += 0.2;
					$ionicScrollDelegate.$getByHandle('scrollHandle' + index).zoomTo(file.scale);
				}
			}
			else if(type == "fullscreen"){ //全屏
				service.fullScreen("preview");
				$scope.menuShown = false;
				/**Mobile
				 service.StatusBar.toggle();*/
			}else if(type == "rotate"){ // 旋转
				service.screen.toggle();
				$scope.menuShown = false;
			}else if(type == "resize"){ //还原
				file.scale = 1;
				$ionicScrollDelegate.$getByHandle('scrollHandle' + index).zoomTo(file.scale);
				$ionicScrollDelegate.$getByHandle('scrollHandle' + index).resize();
				$ionicSlideBoxDelegate.enableSlide(true);
				return;
			}else if(type == "camera"){ //拍摄
				try {
					var $$mobile = $injector.get("$$mobile");
					$$mobile.openCamera({type: "CAMERA",correctOrientation: true},function(uri){
						//TODO 暂不操作
					});
				} catch (e) {
					// TODO: handle exception
				}
			}
			//是否禁用slideBox swipe
		    var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + index).getScrollPosition().zoom;
		    if (zoomFactor <= 1) {
		    	$ionicSlideBoxDelegate.enableSlide(true);
		    } else {
		    	$ionicSlideBoxDelegate.enableSlide(false);
		    }
		};
		//key
		$scope.$on("previewEvent",function(event,data){
			switch(data){
				case 37: case 33:	//键盘方向-左,上,pageup
					if($scope.showIndex != 0){
						$ionicSlideBoxDelegate.previous(400);
					}else{
						$injector.get('toastr').info('已是第一页');
					}
					break;
				case 39: case 34:	//键盘方向-右下pagedown
					if($scope.showIndex != $scope.actualList[$scope.actualList.length-1].index){
						$ionicSlideBoxDelegate.next();
					}else{
						$injector.get('toastr').info('已是最后一页');
					}
					break;
				case 38:
					break;
				case 40:
					break;
			}
		});
		/** 是否禁用slide swipe
		 * slide 第几个box
		 */
		$scope.updateSlideStatus = function(slide,img) {
			var currentScrollDelegate = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide); //当前scroll代理
			if(currentScrollDelegate){ //是否有scroll代理
				var position = currentScrollDelegate.getScrollPosition(); //当前scroll的position
				if(position){
					var zoomFactor = position.zoom;
					if(zoomFactor <= 1) {
						//针对多slides
						if($scope.actualList.length > 1 && $scope.actualList[$scope.actualList.length-1].index != img.index && $scope.actualList[0].index != img.index){
							previewSlideBoxDelegate.enableSlide(true);
						}
					}else{
						previewSlideBoxDelegate.enableSlide(false); 
					}
				}
			}
		  };
		/** */
		$scope.FOLDER = {
			/** 查询文件夹
			 * id 资源id
			 */
			getFolderImage: function(successCallback){
				//封装参数
				var params = {};
				if($stateParams.id){ //url参数id
					params.folderid = $stateParams.id;
				}else{ //根级
					params.folderid = $rootScope.USER.folderid;
				}
				//数据处理
				service.promiseProxy(function(promise){
					$$resource.FOLDER.getFolderImage(promise,params);
				},function(result){
					if(result.result == 1){ //查询成功
						if(successCallback){
							successCallback(result);
						}
					}else if(result.result == 2){	//session过期，自动激活
						service.activeSessionProxy(function(){
							$scope.FOLDER.getFolderImage(successCallback);
						});
					}else{	//查询失败
						service.showMsg("error",result.description);
					}
				});
			}
		};
		/** 获取好友分享的资源*/
		$scope.getFriendShare = function(successCallback){
			service.promiseProxy(function(promise){
				$$share.getFriendShare(promise, $stateParams.id);
			},function(result){
				if(result.result == 1){
					if(successCallback){
						successCallback(result);
					}
				}else if(result.result == 2){
					service.activeSessionProxy(function(){
						$scope.getFriendShare(successCallback);
					});
				}else{
					service.showMsg("error",result.description);
				}
			});
		};
		/** 监听屏幕变化 - 才会执行*/
		$scope.$on("screenResize",function(){
			var clientWidth = document.documentElement.clientWidth;
			var clientHeight = document.documentElement.clientHeight;
			angular.forEach($scope.showList,function(img){
				if(img.src){
					var naturalWidth,naturalHeight;
					if(img.naturalWidth && img.naturalHeight){
						naturalWidth = img.naturalWidth,naturalHeight = img.naturalHeight;
					}else{
						naturalWidth = 1024,naturalHeight = 768;
					}
					var widthScale = clientWidth / naturalWidth; //宽度比例
					var heightScale = clientHeight / naturalHeight; //高度比例
		    		var minScale = Math.min(widthScale,heightScale); //选择最小的比例
					/** 适应屏幕*/
					//图片样式参数
					var margintop = 0, marginleft = 0, width = naturalWidth * minScale, height = naturalHeight * minScale; 
					
					//图片高度小于窗口高度，才垂直居中
					if(parseInt(height) <= clientHeight){
						margintop = (clientHeight - height)/2;
						marginleft = (clientWidth - width)/2;
					}
					//图片添加currentWidth,currentHeight
					img.currentWidth = width;
					img.currentHeight = height;
					img.clientHeight = clientHeight;
					img.clientWidth = clientWidth;
					img.marginTop = margintop;
					img.marginLeft = marginleft;
				}
			});
		});
		/** slideBox监听右拖动事件*/
		$scope.onDragRight = function(){
			var currentImage = $scope.showList[previewSlideBoxDelegate.currentIndex()];
			if(currentImage && currentImage.index == $scope.actualList[0].index){ //第一张时禁止
				setTimeout(function(){
					previewSlideBoxDelegate.enableSlide(false);
				},0);
			}else if(!previewSlideBoxDelegate.enableSlide()){
				previewSlideBoxDelegate.enableSlide(true);
			}
		};
		/** 监听左滑事件*/
		$scope.onDragLeft = function(){
			var currentImage = $scope.showList[previewSlideBoxDelegate.currentIndex()];
			if(currentImage && currentImage.index == $scope.actualList[$scope.actualList.length-1].index){ //最后一张时禁止
				setTimeout(function(){
					previewSlideBoxDelegate.enableSlide(false);
				},0);
			}else if(!previewSlideBoxDelegate.enableSlide()){
				previewSlideBoxDelegate.enableSlide(true);
			}
		};
		/** 执行初始化 */
		$scope.initImages();		
	});