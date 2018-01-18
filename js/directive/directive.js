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
	/** D2-文件选择*/
	.directive("fileSelect",function($$widget,$timeout){
		return {
			scope: {
				fileSelect: "=",
				params:"="
			},
			link: function(scope,element,attr){
				//点击
				element.bind("click",function(e){
					if($$widget.POPOVER.popoverWindow){
						$$widget.POPOVER.hide();
					}
				});
				//文件选择
				element.bind("change",function(e){
					var files = e.target.files;
					if(files == undefined){ //没选择文件
						return false;
					}
					scope.fileSelect(files,scope.params);
				});
			}
		}
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
    				element.css({
    					"width": width+"px",
    					"height": height+"px",
    					"margin-top": margintop+"px",
    					"margin-left": marginleft+"px",
    					"box-shadow": "0 3px 10px 10px rgba(0, 0, 0, 0.3)"
    				});
	        	};
				/** 图片加载*/
	            element.bind("load",function(){
	            	scope.file.naturalWidth = element[0].naturalWidth;
	            	scope.file.naturalHeight = element[0].naturalHeight;
					apply(element[0].naturalWidth,element[0].naturalHeight);
					if(element[0].complete){
						scope.file.loading = true;
						$ionicSlideBoxDelegate.$getByHandle("preview").update();
					}
	            });
	        }
	    };
    })
	/*预览图片*/
	.directive('previewViewImage',function($ionicScrollDelegate){
		return{
			scope: {
				image: '=',
				delegateName: '@'
			},
			link: function(scope,element){
				function scaleImage() {
					var clientWidth = document.documentElement.clientWidth;
					var clientHeight = document.documentElement.clientHeight;
					var naturalWidth = element[0].scaledWidth || element[0].naturalWidth;
					var naturalHeight = element[0].scaledHeight || element[0].naturalHeight;
					//scroll实例
					var scrollDelegate = $ionicScrollDelegate.$getByHandle(scope.delegateName);
					var scrollView = scrollDelegate.getScrollView();
					if(!scrollView){return} //未找到实例
					var widthScale = clientWidth/naturalWidth;
					var heightScale = clientHeight/naturalHeight;
					var finalScale = Math.min(widthScale,heightScale);

					//小图片显示原始尺寸
					var showLittleImage = false;
					if(showLittleImage && naturalWidth<clientWidth && naturalHeight<clientHeight){
						var imageContainer = element[0].parentNode.parentNode;
						imageContainer.style.width = clientWidth + 'px';
						imageContainer.style.height = clientHeight + 'px';
						scrollView.options.minZoom = 1;
						scrollView.options.maxZoom = 3;
						//记录当前尺寸
						scope.image.scale = 1;
						//记录默认尺寸
						scope.image.defaultScale = 1;
						//图片最佳尺寸
						scope.image.suitableScale = finalScale;
						//重置当前scroll
						scrollView.zoomTo(1);
						//位移居中
						scrollDelegate.scrollTo(0,0,true);
						return;
					}
					//图片最佳尺寸
					scope.image.suitableScale = finalScale;
					//记录默认尺寸
					scope.image.defaultScale = finalScale;
					//记录当前尺寸
					scope.image.scale = finalScale;

					//给imageContainer设置width,height
					var containerScale = 1/finalScale;
					var imageContainer = element[0].parentNode.parentNode;
					imageContainer.style.width = clientWidth * containerScale + 'px';
					imageContainer.style.height = clientHeight * containerScale + 'px';

					//解决scroll的__maxScrollLeft和__maxScrollTop计算问题
					var scrollDiv = imageContainer.parentNode;
					scrollDiv.style.width = clientWidth * containerScale + 'px';
					scrollDiv.style.height = clientHeight * containerScale+ 'px';

					//缩放
					scrollView.options.minZoom = finalScale; //合适比例置为最小比例
					scrollView.options.maxZoom = finalScale * 3; //可放大3倍
					scrollView.zoomTo(finalScale);
					//位移居中
					scrollDelegate.scrollTo(0,0,true);
					scope.$apply();
				};
				//图片加载完成
				element.bind('load', function(){
					if(element[0].complete){
						scope.image.loading = true;
						scope.$apply();
					}
					// scaleImage();
				});
				/**
				 * 监视image对象src的变化
				 */
				scope.$watch('image.src',function () {
					if(scope.calcTimer){
						clearInterval(scope.calcTimer);
					}
					scope.calcTimer = setInterval(function () {
						if(element[0].naturalWidth>0 || element[0].naturalHeight > 0){
							clearInterval(scope.calcTimer);
							addScaledSize(element[0]);
							scaleImage();
							element[0].width = element[0].scaledWidth || element[0].naturalWidth;
							element[0].height = element[0].scaledHeight || element[0].naturalHeight;
						}
					});
				});
				//监视屏幕大小变化
				//移动端
				scope.$on('resize',function () {
					//图片已获取到数据
					if(element[0].naturalWidth>0 || element[0].naturalHeight > 0){
						addScaledSize(element[0]);
						scaleImage();
					}
				});
                //针对高像素图片处理
				function addScaledSize(element) {
					var maximum = 1600; //像素
					if(element.naturalWidth>maximum || element.naturalHeight>maximum){
						//使用临界值
						var widthScale = maximum/element.naturalWidth;
						var heightScale = maximum/element.naturalHeight;
						var finalScale = Math.min(widthScale,heightScale);
						element.scaledWidth = finalScale * element.naturalWidth;
						element.scaledHeight = finalScale * element.naturalHeight;
					}else{
						element.scaledWidth = 0;
						element.scaledHeight = 0;
					}
				}
				//鼠标滚动
				element.bind('mousewheel',function (evt) {
					var scrollDelegate = $ionicScrollDelegate.$getByHandle(scope.delegateName);
					var zoom = scrollDelegate.getScrollPosition().zoom;
					if(evt.wheelDelta>0){
						scrollDelegate.zoomTo(zoom+0.2);
					}else{
						scrollDelegate.zoomTo(zoom-0.2);
					}
				})
			}
		}
	})
    /**图片modal方式预览*/
    .directive('imageAutoScreen', function ($ionicSlideBoxDelegate) {       
	    return {
	    	restrict: "A",
	    	scope:{
	    		image: "=?"
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
    				element.css({
    					"width": width+"px",
    					"height": height+"px",
    					"margin-top": margintop+"px",
    					"margin-left": marginleft+"px"
    				});
	        	};
				/** 图片加载*/
	            element.bind("load",function(e){
					apply(element[0].naturalWidth,element[0].naturalHeight);
					if(scope.image && element[0].complete){
						scope.image.complete = true;
					}
	            });
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
    		link: function(scope,element){
    			var transition = ["transition","-webkit-transition","-moz-transition","-ms-transition"];
    			var transform = ["transform","-webkit-transform","-moz-transform","-ms-transform"];
    			for(var key in transition){
    				element.css(transition[key], "transform 400ms ease");
    			}
    			//监听
    			scope.$watch("toggleMenu",function(newVal){
					var distance = 0;
					if(scope.position == "top"){
						distance = -element[0].clientHeight;
					}else if(scope.position == "down"){
						distance = element[0].clientHeight;
					}
					for(var key in transform){
						element.css(transform[key], newVal ? "translate(0,0)" : "translate(0,"+ distance +"px)");
					}
    			})
    		}
    	};
    })
	.directive("scopeField",function(){
		return function(scope,element,attr){
			if(element[0]){
				scope[attr.scopeField] = element[0];
				if (!scope.fields){
					scope.fields = {};
				}
				scope.fields[attr.scopeField] = element[0];
				if(scope[attr.scopeField+"Loaded"]){
					scope[attr.scopeField+"Loaded"](element);
				}
			}
		};
	})
	/** 搜索框*/
    .directive('ionSearch', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                getData: '&source', //获取数据的函数
                model: '=', //搜索结果
                model2: "=",
                search: '=filter', //搜索内容
                delKeyDown: '&' //del键触发
            },
            link: function(scope, element, attrs) {
            	scope.focus = function(){
                	if (scope.inputEl){
                		scope.inputEl.focus();
                		if(UPF.is("android")){
                			cordova.plugins.Keyboard.show();
                		}
                	}
                };
                if (attrs.autofocus != undefined){
                	scope.$parent.autofocus = scope.focus;
                }
                attrs.minLength = attrs.minLength || 0;
                scope.placeholder = attrs.placeholder || '';
                scope.fieldName = attrs.inputField || ''; 
                scope.search = "";
                if (attrs.class)
                    element.addClass(attrs.class);

                if (attrs.source) {
                    scope.$watch('search', function (newValue, oldValue) {
                        if (newValue && newValue.length > attrs.minLength) {
                        	scope.getData({str: newValue});
                        } else {
                        	scope.getData({str: newValue}); //即使为空,也需要再次调用
                        	//清除搜索记录
                            scope.model = {};
                            if(scope.model2){
                            	scope.model2 = {};
                            }
                        }
                    });
                }
                //input键盘事件
                scope.inputKeyDown = function($event){
                	if(scope.delKeyDown){
	                	var keycode = window.event?$event.keyCode:$event.which;
	    	            if(scope.search.length == 0 && keycode == 8){//del
	    					scope.delKeyDown({keycode: keycode});
	    	            }
                	}
                };
                //清除查询文本
                scope.clearSearch = function() {
                    scope.search = '';
                    scope.model = {};
                    scope.model2 = {};
                };
            },
            template: '<div class="item-input-wrapper">' +
                        '<i class="icon ion-ios-search" style="color: rgb(76,184,243);font-size: 18px;margin-left: 5px;"></i>' +
                        '<input type="search" placeholder="{{placeholder}}" ng-model="search" ng-keydown="inputKeyDown($event)" scope-field="inputEl">' +
                        '<i ng-if="search.length > 0" ng-click="clearSearch()" class="icon ion-ios-close-empty" style="color: rgb(76,184,243);font-size: 30px;width: 30px;text-align: center;cursor: pointer;"></i>' +
                      '</div>'
        };
    })
    /** 搜索栏*/
    .directive("searchBar",function(){
    	return {
    		restrict: "E",
    		scope: {
    			placeholder: '@'
    		},
    		template: '<div style="background-color: #fff;text-align:center;border: 1px solid #ddd;border-radius:5px;padding: 2px;margin: 5px;cursor: pointer;">' +
    					'<i class="icon ion-ios-search"></i>' +
    					'<span style="color: gray;font-size: 12px;margin-left: 3px;">{{placeholder ? placeholder : \'搜索\'}}</span>' +
    					'</div>'
    	};
    })
    /** 打开链接指令*/
	.directive('autolinker', ['$timeout',
		function($timeout) {
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					$timeout(function() {
						var eleHtml = element.html();
						
						if (eleHtml === '') {
						  return false;
						}
						
						var text = Autolinker.link(eleHtml, {
						  className: 'autolinker',
						  stripPrefix: false, //是否显示前缀
						  truncate: { //缩短
							  length: 30,
							  location: 'end'
						  },
						  newWindow: false
						});
						
						element.html(text);
						
						var autolinks = element[0].getElementsByClassName('autolinker');
						
						for (var i = 0; i < autolinks.length; i++) {
						  angular.element(autolinks[i]).bind('click', function(e) {
						    var href = e.target.href;
						
						    if (href) {
						      //window.open(href, '_system');
						      if(UPF.is("WEB")){
						    	  window.open(href, '_blank');
						      }else{
						    	  cordova.InAppBrowser.open(href, '_system');
						      }
						    }
						
						    e.preventDefault();
						    return false;
						  });
						}
					}, 0);
				}
			}
		}
	])
	.directive("screenResize",function($window,$rootScope){
		return function(scope,element){
			angular.element($window).bind("resize",function(){
				$rootScope.$broadcast("screenResize");
			});
		};
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
				element.on("click",function(){
					scope.isShown = !scope.isShown;
					if(scope.isShown){
						scope.size = 120;
					}else{
						scope.size = 40;
					}
					scope.$digest();
					element.css("width",scope.isShown ? "180px" : "60px");
					element.css("height",scope.isShown ? "180px" : "60px");
					element.css("opacity",scope.isShown? 1 : 0.5);
					element.css("padding",scope.isShown ? "30px" : "10px");
					element.css("border-radius",scope.isShown ? "16px" : "50%");
					for(var key in transform){
    					element.css(transform[key], scope.isShown ? "translate(-10px,-10px)" : "translate(0,0)");
    				}
				});
			}
	})
	/** image加载完成*/
	.directive('imageComplete',function($rootScope){
		return{
			scope: {
				imageComplete: "=" //含有image src的对象
			},
			link: function(scope,element,attr){
				var image = new Image();
				//监听src属性的变化
				scope.$watch('imageComplete.src',function(newVal,oldVal){
					image.src = newVal;
				});
				//图片加载
				image.onload = function(){
					$rootScope.$apply(function(){
						scope.imageComplete.complete = image.complete;
					});
				};
			}
		}
	})
	/**
	 *  图片加载失败
	 *  img src
	 *  div background-image
	 */
	.directive('imgLoadError',function(service){
		return {
			restrict: 'A',
			scope: {
				'imgSource': '=', //图像对象
				'imgLoadError': '@', //必需(字符串),图片加载失败显示的图片路径
				'imgLoadErrorFn': '=', //可选(函数),函数return路径
				'imgLoadUrl': '@', //可选(字符串),当前
				'imgStandbyUrl': '@', //可选(字符串),备用图片路径
				'showLoading': '@' //是否显示加载
			},
			link: function(scope,element,attr){
				//img src方式
				if(element[0].localName == 'img'){
					element.on('error',function(){
						if(scope.imgLoadError){
							element[0].src = scope.imgLoadError;
						}else if(scope.imgLoadErrorFn){
							element[0].src = scope.imgLoadErrorFn();
						}
					});
				}
				//div background-image方式
				else{
					//先显示缩略图
					if(scope.imgStandbyUrl){
						element.css('background-image', "url("+ scope.imgStandbyUrl +")");
					}else if(scope.showLoading){ //开启-加载中
						service.loading('start');
					}
					var image = new Image();
					image.src = scope.imgLoadUrl;
					image.onload = function(e){
						if(scope.imgSource){
							scope.imgSource.complete = true;
						}
						//更换预览图片
						element.css('background-image', "url("+ scope.imgLoadUrl +")");
						//关闭-加载中
						if(scope.showLoading){
							service.loading('end');
						}
					};
					image.onerror = function(){
						if(scope.imgSource){
							scope.imgSource.complete = false;
						}
						if(!scope.imgStandbyUrl){ //错误提醒图片
							element.css('background-image', "url("+ scope.imgLoadError +")");
						}
						//关闭-加载中
						if(scope.showLoading){
							service.loading('end');
						}
					};
				}
			}
		}
	})
	/**
	 * 图片两种图片过渡渲染
	 */
	.directive('imgTransitionRender',function(service){
		return {
			restrict: 'E',
			replace: true,
			template: '<img/>',
			scope: {
				'defaultSrc': '@',//默认加载图片
				'renderSrc': '@',//过渡到的最终图片
				'errorSrc': '@',//图片加载失败显示的图片
				'showLoading': '@', //是否显示加载
				'onRender': '&' //渲染完成
			},
			link: function(scope,element){
				var imgElement = element[0];
				//先显示缩略图
				if(scope.defaultSrc){
					imgElement.src = scope.defaultSrc;
				}
				//加载渲染图片
				if(scope.renderSrc){
					if(scope.showLoading){ //开启-加载中
						service.loading('start');
					}
					var image = new Image();
					image.src = scope.renderSrc;
					image.onload = function(){
						//更换预览图片
						imgElement.src = scope.renderSrc;
						//关闭-加载中
						if(scope.showLoading){
							service.loading('end');
						}
						//渲染完成
						scope.onRender && scope.onRender();
					};
					image.onerror = function(){
						if(!scope.defaultSrc){
							imgElement.src = scope.errorSrc;
						}
						//关闭-加载中
						if(scope.showLoading){
							service.loading('end');
						}
					};
				}

			}
		}
	})
	/**
	 * toggle 添加文字
	 */
	 .directive('ionToggleText', function () {

		  var $ = angular.element;
		
		  return {
		    restrict: 'A',
		    link: function ($scope, $element, $attrs) {
		      
		      // Try to figure out what text values we're going to use 
		      
		      var textOn = $attrs.ngTrueValue || 'on',
		        textOff = $attrs.ngFalseValue || 'off';
		
		      if ($attrs.ionToggleText) {
		        var x = $attrs.ionToggleText.split(';');
		
		        if (x.length === 2) {
		          textOn = x[0] || textOn;
		          textOff = x[1] || textOff;
		        }
		      }
		
		      // Create the text elements
		      
		      var $handleTrue = $('<div class="handle-text handle-text-true">' + textOn + '</div>'),
		        $handleFalse = $('<div class="handle-text handle-text-false">' + textOff + '</div>');
		
		      var label = $element.find('label');
		
		      if (label.length) {
		        label.addClass('toggle-text');
		
		        // Locate both the track and handle elements
		        
		        var $divs = label.find('div'),
		          $track, $handle;
		
		        angular.forEach($divs, function (div) {
		          var $div = $(div);
		
		          if ($div.hasClass('handle')) {
		            $handle = $div;
		          } else if ($div.hasClass('track')) {
		            $track = $div;
		          }
		        });
		
		        if ($handle && $track) {
		          
		          // Append the text elements
		          
		          $handle.append($handleTrue);
		          $handle.append($handleFalse);
		
		          // Grab the width of the elements
		          
		          var wTrue = $handleTrue[0].offsetWidth,
		            wFalse = $handleFalse[0].offsetWidth;
		
		          // Adjust the offset of the left element
		          
		          $handleTrue.css('left', '-' + (wTrue + 10) + 'px');
		
		          // Ensure that the track element fits the largest text
		          
		          var wTrack = Math.max(wTrue, wFalse);
		          $track.css('width', (wTrack + 60) + 'px');
		        }
		      }
		    }
		  };
		})
    //input sting值转int
	.directive('inputToNumber',function () {
		return{
			require: 'ngModel',
			link: function (scope, element, attr, ngModel) {
				ngModel.$parsers.push(function(value) {
					return parseInt(value);
				});
				ngModel.$formatters.push(function(value) {
					return parseInt(value);
				});
			}
		}
	})
	//烟花炮竹
	.directive('fireworks',function () {
		return{
			link: function (scope, element) {
				//添加新dom
				var show = function (tpl) {
					element[0].appendChild(tpl);
					setTimeout(function () {
						element[0].removeChild(tpl);
					},3000);
				};
				//创建新dom
				var addFire = function () {
					var left = Math.random() * window.innerWidth;
					var width = Math.random() * 50;
					var tpl = '<div class="zx-snow-roll" style="width: 0px;height: 0px;left:'+left+'px;"></div>';
					tpl = angular.element(tpl)[0];
					tpl.style.borderRight = width/2 + 'px solid transparent';
					tpl.style.borderLeft = width/2 + 'px solid transparent';
					tpl.style.borderBottom = width + 'px solid #fff';
					show(tpl);
				};
				//雪一直下
				var high =0;
				var create = function () {
					high +=1;
					addFire();
					setTimeout(function () {
						create();
					},high);
				};
				create();
			}
		}
	})
    ;
