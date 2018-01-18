/** 指令*/
angular.module("app")
	/** D1-全局键盘监听*/
	.directive("keyEvents",function($rootScope,$ionicListDelegate){
		return {
		 	link: function(scope, elem){
		        elem[0].addEventListener("keyup",function(evt){
		        	$rootScope.$broadcast("previewEvent",evt.keyCode);
		        });
		        elem.bind("click",function(){
					$ionicListDelegate.closeOptionButtons(); //关闭List侧滑按钮
					$rootScope.$broadcast("click");
				});
		      }
		    };
	})
	/** D3-ngReapeat完成触发*/
	.directive("repeatDone",function(){
		return function(scope,element,attrs){
			if(scope.$last){
				scope.$eval(attrs.repeatDone);
			}
		};
	})
    /**image load*/
    .directive('imgLoad', function ($ionicSlideBoxDelegate) {       
	    return {
	    	restrict: "A",
	    	scope:{
	    		"imgLoad": "=",
	    		"file": "="
	    	},
	        link: function(scope, element, attrs) {
	        	/** 应用样式*/
	        	var apply = function(naturalWidth,naturalHeight){
	        		var clientWidth = document.documentElement.clientWidth;
					var clientHeight = document.documentElement.clientHeight;
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
    				scope.file.currentWidth = width;
    				scope.file.currentHeight = height;
    				scope.file.marginTop = margintop;
    				scope.file.marginLeft = marginleft;
    				element.css({
    					"transition": "transform 500ms ease",
    					"width": width+"px",
    					"height": height+"px",
    					"margin-top": margintop+"px",
    					"margin-left": marginleft+"px",
    					"box-shadow": "0 3px 10px 10px rgba(0, 0, 0, 0.3)"
    				});
	        	};
				/** 图片加载*/
	            element.bind("load",function(e){
	            	scope.file.naturalWidth = element[0].naturalWidth;
	            	scope.file.naturalHeight = element[0].naturalHeight;
					apply(element[0].naturalWidth,element[0].naturalHeight);
					if(element[0].complete){
						scope.file.loading = true;
						$ionicSlideBoxDelegate.$getByHandle("preview").update();
					}
	            });
	            /** 图片加载前*/
	            apply(1080,768);
	        }
	    };
    })
    /** 预览顶,低部菜单显示/隐藏*/
    .directive("toggleMenu",function(){
    	return {
    		restrict: 'A',
    		scope: {
    			toggleMenu: "=",
    			position: "@"
    		},
    		link: function(scope,element,attrs){
    			var transition = ["transition","-webkit-transition","-moz-transition","-ms-transition"];
    			var transform = ["transform","-webkit-transform","-moz-transform","-ms-transform"];
    			for(var key in transition){
    				element.css(transition[key], "transform 400ms ease");
    			}
    			//监听
    			scope.$watch("toggleMenu",function(newVal,oldVal){
    				var num = 0;
    				if(scope.position == "top"){
    					num = -70;
    				}else if(scope.position == "bottom"){
    					num = 70;
    				}
    				for(var key in transform){
    					element.css(transform[key],scope.toggleMenu ? "translate(0,0)" : "translate(0,"+ num +"px)");
    				}
    			})
    		}
    	};
    })
	.directive("screenResize",function($window,$rootScope){
		return function(scope,element){
			angular.element($window).bind("resize",function(){
				$rootScope.$broadcast("screenResize");
			});
		};
	})
	/** 全屏*/
	.directive("fullScreen",function(){
		return {
			scope: {
				fullScreen: "="
			},
			link: function(scope,element,attr){
				scope.fullScreen = false;
				var dom = document.getElementById(attr.id);
				scope.$watch("fullScreen",function(newVal){
					if(newVal == true){
						if(dom.requestFullscreen){
							dom.requestFullscreen();
						}else if(dom.msRequestFullscreen){
							dom.msRequestFullscreen();
						}else if(dom.mozRequestFullScreen){
							dom.mozRequestFullScreen();
						}else if(dom.webkitRequestFullscreen){
							dom.webkitRequestFullscreen();
						}
					}else{
						if(document.exitFullscreen){
							document.exitFullscreen();
						}else if(document.msExitFullscreen){
							document.msExitFullscreen();
						}else if(document.mozFullScreen){
							document.mozExitFullScreen();
						}else if(document.webkitExitFullscreen){
							document.webkitExitFullscreen();
						}
					}
				})
			}
		}
	})
	/**二维码点击动画*/
	.directive("qrcodeAnimation",function(){
		return function(scope,element,attr){
    			var transition = ["transition","-webkit-transition","-moz-transition","-ms-transition"];
    			var transform = ["transform","-webkit-transform","-moz-transform","-ms-transform"];
    			for(var key in transition){
    				element.css(transition[key], "all 700ms ease");
    			}
    			scope.size = 40;
    			var change = function(e){
    				if(e){
						e.stopPropagation();
					}
    				scope.isShown = !scope.isShown;
					if(scope.isShown){
						scope.size = 120;
					}else{
						scope.size = 40;
					}
					scope.$digest();
					element.css("width",scope.isShown ? "180px" : "60px");
					element.css("height",scope.isShown ? "180px" : "60px");
					element.css("opacity",scope.isShown? 0.9 : 0.5);
					element.css("padding",scope.isShown ? "30px" : "10px");
					element.css("border-radius",scope.isShown ? "16px" : "50%");
					for(var key in transform){
    					element.css(transform[key], scope.isShown ? "translate(-10px,-10px)" : "translate(0,0)");
    				}
    			};
				element.on("click",change);
				scope.$on("click",function(){
					if(scope.isShown){
						change();
					}
				});
			}
	})
    ;
