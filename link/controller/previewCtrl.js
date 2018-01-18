/**预览
 * $stateParams {id(父级id), ctrlname(个人/企业), fid(图片文件id))}
 */
angular.module("app")
	.controller("previewCtrl",function($scope,$rootScope,$stateParams,$ionicSlideBoxDelegate,$ionicScrollDelegate,$injector){
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
		$scope.ionicSlideBoxDelegate = $ionicSlideBoxDelegate; //ionSlide代理
		$scope.zoomMin = 1;//缩放最小比例
		$scope.direction = "xy"; //ionScroll可滑动方向
		$scope.$stateParams = $stateParams; //url参数
		$scope.showList = []; //显示list
		$scope.actualList = []; //实际list
		var length = parseInt($stateParams.num); //实际图片数量
		//初始化
		$scope.initImages = function(){
			//office、pdf预览
			if($stateParams.model == "office" || $stateParams.model == "pdf"){
				//实际图片集合
				for(var i=0;i<length;i++){
					var obj = {
						index: i,
						scale: 1
					};
					var inParams = {
						id: $stateParams.id,
						num: i
					};
					obj.src = $rootScope.resource.officePreviewResource(inParams); //office图片路径
					//初始显示集合
					$scope.actualList.push(obj);
				}
				//实际显示图片集合
				for(var i=0; i<(limit/2);i++){
					$scope.showList[i] = $scope.actualList[i%length];
				}
				for(var i=(parseInt(limit/2)+1); i<limit;i++){
					$scope.showList[i] = $scope.actualList[(length- limit+i)%length];
				}
				$scope.showIndex = 0; //showList的当前显示下标
				$scope.actualIndex = 0; //actualList的当前显示下标
			}else if($stateParams.model == "image"){
				var obj = {
					scale: 1,
					id: $stateParams.fid,
					filename: $stateParams.name
				};
				obj.src = $rootScope.resource.imagePreviewResource(obj); //图片路径
				$scope.actualList.push(obj);
				$scope.showList.push(obj);
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
			//预加载后两张
			$scope.showList[($index+1)%limit] = $scope.actualList[(readyShow.index+1)%length];
			$scope.showList[($index+2)%limit] = $scope.actualList[(readyShow.index+2)%length];
			//预加载前两张
			$scope.showList[($index+limit-1)%limit] = $scope.actualList[(readyShow.index-1+length)%length];
			$scope.showList[($index+limit-2)%limit] = $scope.actualList[(readyShow.index-2 + length)%length];
			//更新slidebox
			$ionicSlideBoxDelegate.$getByHandle("preview").update();
		};
		/** showList遍历完成-只会执行一次*/
		$scope.repeatDone = function(){
			$ionicSlideBoxDelegate.$getByHandle("preview").update();
			if($scope.actualList.length<= 1){
				$ionicSlideBoxDelegate.$getByHandle("preview").enableSlide(false);
			}
		};
		/** 功能操作
		 * type: zoomin,zoomout,fullscreen
		 */
		$scope.operate = function(type){
			var index = $ionicSlideBoxDelegate.$getByHandle("preview").currentIndex();
			var file = $scope.showList[index];
			if(type == "zoomin"){ //缩小
				if(file.scale > 0.5){
					file.scale -= 0.2;
					$ionicScrollDelegate.$getByHandle('scrollHandle' + index).zoomTo(file.scale);
				}
				oneChange();
			}else if(type == "zoomout"){ //放大
				if(file.scale < 3){
					file.scale += 0.2;
					$ionicScrollDelegate.$getByHandle('scrollHandle' + index).zoomTo(file.scale);
				}
			}
			else if(type == "fullscreen"){ //全屏
				$scope.fullScreen = !$scope.fullScreen;
				$scope.menuShown = false;
				console.log(file);
				/**Mobile
				 service.StatusBar.toggle();*/
			}else if(type == "rotate"){ // 旋转
				if(!file.rotate){
					file.rotate = 0;
				}
				file.rotate = file.rotate + 90;
//				auto();
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
					$$mobile.openCamera({type: "CAMERA"},function(uri){
						//TODO 暂不操作
					});
				} catch (e) {
					// TODO: handle exception
				}
			}
			//是否禁用slideBox swipe
		    var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + index).getScrollPosition().zoom;
		    if(zoomFactor <= 1){
		    	$ionicSlideBoxDelegate.enableSlide(true);
		    }else{
		    	$ionicSlideBoxDelegate.enableSlide(false);
		    }
		};
		//key
		$scope.$on("previewEvent",function(event,data){
			switch(data){
				case 37: case 33:	//键盘方向-左,上,pageup
					$ionicSlideBoxDelegate.previous(400);
					break;
				case 39: case 34:	//键盘方向-右下pagedown
					$ionicSlideBoxDelegate.next();
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
		    var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
		    if(zoomFactor <= 1) {
		      $ionicSlideBoxDelegate.enableSlide(true);
		    }else{
		      $ionicSlideBoxDelegate.enableSlide(false); 
		      /**待完成
		      if(parseInt(img.currentHeight*zoomFactor) >= img.clientHeight){
		    	  $scope.direction = "xy";
		    	  console.log("xy");
		      }else{
		    	  $scope.direction = "x";
		      }*/
		    }
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
					img.marginTop = margintop;
					img.marginLeft = marginleft;
				}
			});
		});
		var oneChange = function(){
			var index = $ionicSlideBoxDelegate.$getByHandle("preview").currentIndex();
			var img = $scope.showList[index];
			var clientWidth = document.documentElement.clientWidth;
			var clientHeight = document.documentElement.clientHeight;
//			if(parseInt(img.rotate)%180 != 0){
//				clientWidth = document.documentElement.clientHeight;
//				clientHeight = document.documentElement.clientWidth;
//			}
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
			img.marginTop = margintop;
			img.marginLeft = marginleft;
		};
		/** 执行初始化 */
		$scope.initImages();
	});