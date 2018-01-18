/** 移动端模块 */
angular.module("mobile",["ngCordova"])
	.factory("$$mobile",function($cordovaAppVersion,$cordovaNativeAudio,$http,$cordovaClipboard,$ionicPlatform,$ionicHistory,$cordovaToast,$timeout,$rootScope,$cordovaCamera,$cordovaFileTransfer,$cordovaFile,$injector){
		var mobile = {
			$cordovaFileTransfer: $cordovaFileTransfer,
			$cordovaFile: $cordovaFile,
			//外部根文件夹
			getRootDirectory: function(){
				return cordova.file.externalRootDirectory; //android
			},
			savedImageFolder: 'zhangwen/pictures', //图片保存的文件夹
			//应用
			app: {
				//外部打开app,传递参数
				externalOpen: function(successCallBack){
					cordova.require("cordova-zhangwen-ExternalOpen.ExternalOpen").get(function(data){
						successCallBack(data);
					});
				},
				//调用插件，在新视图中打开外部url
				openUrl:function(url){
					cordova.require("cordova-zhangwen-ExternalOpen.ExternalOpen").openUrl(url);
				},
				//比较当前app与服务端版本
				vsVersion: function(successCallBack, errorCallBack){
					if(UPF.is('ios')){
						return;
					}
					//获取服务器app版本
					$http.get($rootScope.CONFIG.itf.app.getAppNewVersion)
						.success(function(result){
							var conflict = false;
							if(result.result == 1){
								if(mobile.app.compareVersion(result.version,UPF.version)){ //新版本提醒
									$rootScope.updateVersion = 1;
									if (result.isforce == 1){
										conflict = true;
									}
								}
							}
							if(successCallBack){
								successCallBack(conflict,result);
							}
						})
						.error(function(error){
							if(errorCallBack){
								errorCallBack(error);
							}
						});
				},
				//获取掌秀ROM版本
				getNewVersionInfo : function(){
					$http.get($rootScope.CONFIG.itf.app.getZsNewVersion)
					.success(function(result){
						if(result.result == 1){
							$rootScope.ZXVersion = result.version;
						}
					})
					.error(function(error){
					});
				},
				compareVersion:function(v1,v2){
					var n1 = v1.split(".");
					var n2 = v2.split(".");
					var len = n1.length>n2.length?n1.length:n2.length;
					for(var i=0;i<len;i++){
						var v1 = n1[i] || 0;
						var v2 = n2[i] || 0;
						if(v1>v2){
							return true;
						}else if(v1<v2){
							return false;
						}
					}
					return false;
				}
			},
			//音频
			audio: {
				//加载消息提醒文件
				preload: function(){
					//return;
					$cordovaNativeAudio.preloadSimple("tip","media/notify.mp3");
				},
				//播放
				play: function(id){
					$cordovaNativeAudio.play("tip");
				}
				
			},
			//复制链接
			copyLink: function(link){
				$cordovaClipboard.copy(link);
			},
			//预览模式
			previewModel: {
				ready: function(){
					if(UPF.is("APP")){
						StatusBar.hide();
						screen.lockOrientation("landscape");
						//设置不锁屏
						var settingPlugin = cordova.require("cordova-zhangwen-external-setting.Settings");
						settingPlugin.unlock(); 
					}
				},
				quit: function(){
					if(UPF.is("APP")){
						StatusBar.show();
						screen.lockOrientation("portrait");
						//设置可以锁屏
						var settingPlugin = cordova.require("cordova-zhangwen-external-setting.Settings");
						settingPlugin.lock(); 
					}
				}
			},
			/** 打开相机/相册
			 * params {type,quality,destinatonType,saveToPhotoAlbum,allowEdit}
			 * successCallback
			 * errorCallback
			 */
			openCamera: function(params,successCallback,errorCallback){
				var options = params || {};
				//图片源
				if(params.type == "CAMERA"){
					options.quality = params.quality || 50; //图片质量 0-100
					options.sourceType = Camera.PictureSourceType.CAMERA; 
					options.destinatonType = params.destinatonType || 1; //DATA_URL : 0,FILE_URI : 1,NATIVE_URI : 2
					 //拍摄完保存到相册
					options.saveToPhotoAlbum = params.saveToPhotoAlbum || false;
					if(params.correctOrientation){
						options.correctOrientation = true;
					}
				}else if(params.type == "PHOTOLIBRARY"){
					options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
					if(params.mediaType){
						options.mediaType = params.mediaType;
					}
					options.destinatonType = params.destinatonType || 1; 
				}else if(params.type == "SAVEDPHOTOALBUM"){
					options.sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
				}
				//拍照/选取后可编辑
				options.allowEdit = params.allowEdit || false;
				//像素设置
				$cordovaCamera.getPicture(options)
					.then(function(uri){ //图片数据
						if(successCallback){
							successCallback(uri);
						}
					},function(error){
						if(errorCallback){
							errorCallback(error);
						}
					});
			},
			//注册回退事件(在ionic的基础上添加特殊处理)
			registerBackButtonAction: function(){
				var array = ["tab.ppan","tab.message","tab.contact","tab.about","loginPc","loginMobile","welcome","zxScan","nameChange","changeFive","hotPoint","reset","changeWifi"];
				//回退事件
		        $ionicPlatform.registerBackButtonAction(function(e) {
		        	var view = $ionicHistory.currentView();
					//横屏预览时，回退要切为竖屏
					if(view.stateName.indexOf("preview") != -1 || view.stateName.indexOf("imagePreview") != -1){
						mobile.previewModel.quit(); //退出预览
					}
		            //判断处于哪个页面时双击退出
		            if(array.indexOf(view.stateName) != -1) {
		            	//文件库有相同的stateName只能用stateParams来判定是否首页
						if(view.stateName == "tab.ppan" && view.stateParams.id){
							$ionicHistory.goBack();
							return;
						}
						//从掌秀搜索页跳转到我界面
						if(view.stateName == "zxScan"){
							$injector.get('$state').go("tab.about");
							return;
						}
						//从掌秀操作提示页跳转到搜索页面
						if(view.stateName == "nameChange" ||
								view.stateName == "changeFive" || view.stateName == "hotPoint" || 
									view.stateName == "reset" || view.stateName == "changeWifi"
							){
							$injector.get('$state').go("zxScan");
							return;
						}
		                if($rootScope.backButtonPressedOnceToExit) {
		                    ionic.Platform.exitApp();
		                }else {
		                    $rootScope.backButtonPressedOnceToExit = true;
		                    $cordovaToast.showShortBottom('再按一次退出 掌文!');
		                    setTimeout(function () {
		                        $rootScope.backButtonPressedOnceToExit = false;
		                    }, 2000);
		                }
		            }
		            else if ($ionicHistory.backView()) {
		                $ionicHistory.goBack();
		            }else {
		                $rootScope.backButtonPressedOnceToExit = true;
		                $cordovaToast.showShortBottom('再按一次退出 掌文!');
		                setTimeout(function () {
		                    $rootScope.backButtonPressedOnceToExit = false;
		                }, 2000);
		            }
		            e.preventDefault();
		            return false;
		        }, 101);
			},
			/** 离线*/
			offline: {
				/** 根路径
				 * android file:///data/data/<app-id>/files
				 */
				getPath: function(){
					return cordova.file.dataDirectory;
				},
				server: {
					office: function(id,num){
						return $rootScope.dynamicITF.resource.previewResource($rootScope.getCurrentDomainAddress()) + "/" + id + "/" + num + ".jpg"; //office预览图
					},
					image: function(id,filename){
						return $rootScope.dynamicITF.resource.previewResource($rootScope.getCurrentDomainAddress()) + "/" + id + "/" + filename; //image预览图
					},
					thumb: function(id){
						return $rootScope.dynamicITF.resource.imageMinPreview($rootScope.getCurrentDomainAddress()) + "/" + id +"/" + $rootScope.USER.sessionid;//image缩略图
					},
					avatar: function(photo){
						return $rootScope.dynamicITF.user.getPhoto($rootScope.getCurrentDomainAddress()) + "/" + photo; //user头像
					}
				},
				/** 检查本地文件夹
				 * folder 文件夹路径
				 */
				checkDir: function(folder,successCallback,errorCallback){
					//检测
					$cordovaFile.checkDir(mobile.offline.getPath(),folder)
						.then(function(){ //有文件夹
							if(successCallback){
								successCallback();
							}
						},function(error){ //没有文件夹
							if(error.code == 1){ //NOT_FOUND_ERR
								$cordovaFile.createDir(mobile.offline.getPath(),folder)
									.then(function(){
										if(successCallback){
											successCallback();
										}
									},function(error){
										if(error.code == 12){ //PATH_EXISTS_ERR
											if(successCallback){
												successCallback();
											}
										}else if(errorCallback){
											errorCallback(error);
										}
									});
							}else if(error.code == 12){//PATH_EXISTS_ERR
								if(successCallback){
									successCallback();
								}
							}else{
								if(errorCallback){
									errorCallback(error);
								}
							}
						});
				},
				/** 检查本地文件
				 * params{id,type,(office:num/image:filename),sync(是否同步)}
				 */
				checkFile: function(params,successCallback,errorCallback){
					var filePath; //本地文件路径
					var url; //服务器文件路径
					if(params.type == "office"){
						filePath = params.type + "/" + params.id + "/" + params.num + ".jpg";
						url = mobile.offline.server[params.type](params.id,params.num);
					}else if(params.type == "image"){
						filePath = "image/" + params.id + "/" + params.filename;
						url = mobile.offline.server[params.type](params.id,params.filename);
					}else if(params.type == "thumb"){
						filePath = "image/" + params.id + "/" + params.id + ".jpg";
						url = mobile.offline.server[params.type](params.id);
					}else if(params.type == "avatar"){
						filePath = params.type + "/" + params.updatetime + "_"+ params.photo;
						url = mobile.offline.server[params.type](params.photo);
					}
					$cordovaFile.checkFile(mobile.offline.getPath(),filePath)
						.then(function(result){ //有文件
							if(successCallback){
								successCallback(result.nativeURL);
							}
						},function(error){ //无文件
							var targetFilePath = mobile.offline.getPath() + filePath; //本地存储路径
							//检测tmp文件
							if (!mobile.offline.downloading){
								mobile.offline.downloading = [];
							}
							if(mobile.offline.downloading[url]){
								return;
							}
							mobile.offline.downloading[url] = true;
							//同步下载
							if(!params.sync){
								if(errorCallback){
									errorCallback(error);
								}
							}
							$cordovaFileTransfer.download(url,targetFilePath+'.tmp')
								.then(function(result){
									//rename
									$cordovaFile.moveFile(mobile.offline.getPath(),filePath+'.tmp',mobile.offline.getPath(),filePath)
										.then(function(result){
											delete mobile.offline.downloading[url];
											if(params.sync && successCallback){
												successCallback(result.nativeURL);
											}
										},function(error){
											delete mobile.offline.downloading[url];
										});
								},function(error){
									delete mobile.offline.downloading[url];
									if(params.sync && errorCallback){
										errorCallback(error);
									}
								});
						});
				},
				/** 递归式删除文件夹以及子文件夹、文件
				 * dir 为空则删除根以下所有
				 */
				removeRecursively: function(dir,successCallback,errorCallback){
					$cordovaFile.removeRecursively(mobile.offline.getPath(),dir)
						.then(function(success){
							if(successCallback){
								successCallback(success);
							}
						},function(error){
							if(errorCallback){
								errorCallback(error);
							}
						});
				},
				/** 缓存用户头像
				 * users 用户列表
				 */
				loadLocalUserAvatar: function(users,sync){
					if($rootScope.localConfig.cacheImage && UPF.is("app")){
						var offline = mobile.offline;
						//加载本地
						var load = function(user){
							var avatar = user.avatar;
							user.avatar = mobile.offline.getPath() + "avatar/" + user.updatetime + "_" + user.photo; //针对图片闪烁问题: 默认直接采用本地路径
//							user.avatar = mobile.offline.getPath() + "avatar/" + user.photo; //针对图片闪烁问题: 默认直接采用本地路径
							var successCallback = function(url){
								user.avatar = url;
							};
							var errorCallback = function(){
								user.avatar = avatar;
							};
							offline.checkDir("avatar",function(){
								var inParams = {
									updatetime: user.updatetime,
									photo: user.photo,
									type: "avatar",
									sync:sync
								};
								offline.checkFile(inParams,successCallback,errorCallback);
							});
						};
						//遍历所有图片
						angular.forEach(users,function(user){
							if(user.photo){ //群组多头像,就不处理
								load(user);
							}
						});
					}
				},
				/** 获取并缓存图片缩略图
				 * 
				 */
				loadLocalImageThumb: function(resources){
					if($rootScope.localConfig.cacheImage && UPF.is("app")){
						var offline = mobile.offline;
						//加载本地
						var load = function(resource){
							var src = resource.src;
							resource.src = mobile.offline.getPath() + "image/" + resource.id + "/" + resource.id + ".jpg"; //针对图片闪烁问题: 默认直接采用本地路径
							var successCallback = function(url){
								resource.src = url;
							};
							var errorCallback = function(){
								resource.src = src;
							};
							var inParams = {
								type: "thumb",
								id: resource.id
							};
							offline.checkDir("image",function(){
								offline.checkDir("image/"+resource.id,function(){
									offline.checkFile(inParams,successCallback,errorCallback);
								},errorCallback);
							},errorCallback);
						};
						//遍历所有图片
						angular.forEach(resources,function(resource){
							if(resource.iontype == "image"){
								load(resource);
							}
						});
					};
				},
				/** 清除资源缓存
				 * 
				 */
				clearSingleResourceCache: function(resource,successCallback,errorCallback){
					if($rootScope.localConfig.cacheImage && UPF.is("app")){
						var offline = mobile.offline;
						if(resource.preview == "image"){
							var dirPath = "image/"+ resource.id
							offline.removeRecursively(dirPath,successCallback,errorCallback);
						}else if(resource.preview == "pdf" || resource.preview == "office"){
							var dirPath = "office/"+ resource.id;
							offline.removeRecursively(dirPath,successCallback,errorCallback);
						}
					}
				}
			},
			/** 判断文件路径是否绝对路径
			 * uri
			 */
			isNativePath: function(uri){
				var prePath = uri.split(":")[0];
				if(prePath == "file"){ 
					return true;
				}else if(prePath == "content"){
					return false;
				}else{
					return true;
				}
			},
			/** 获取文件绝对路径,只针对android(cordova.plugin.filepath)
			 * uri
			 */
			resolveNativePath: function(uri,successCallback,errorCallback){
				var prePath = uri.split(":")[0];
				if(prePath == "file"){ //此乃文件绝对路径
					if(successCallback){
						successCallback(uri);
					}
				}else if(prePath == "content"){//此路径非文件绝对路径
					window.FilePath.resolveNativePath(uri, function(filePath){
						if(successCallback){
							successCallback(filePath);
						}
					},function(error){
						if(errorCallback){
							errorCallback(error);
						}
					});
				}else{ //其它,不予处理
					if(successCallback){
						successCallback(uri);
					}
				}
			},
			/**
			 * 检测文件夹
			 * @param basePath Base FileSystem
			 * @param folder 文件名字符串
			 * @param successCallback 成功回掉
			 * @param errorCallback 失败回掉
			 */
			checkDir: function(basePath,folder,successCallback,errorCallback){
				$cordovaFile.checkDir(basePath,folder)
					.then(function(success){
						if(successCallback){
							successCallback(success);
						}
					},function(error){ //没有
						if(errorCallback){
							errorCallback(error);
						}
					});
			},
			/**
			 * 创建文件夹
			 * @param basePath Base FileSystem
			 * @param folder 文件名字符串
			 * @param successCallback 成功回掉
			 * @param errorCallback 失败回掉
			 */
			createDir: function(basePath,folder,successCallback,errorCallback){
				$cordovaFile.createDir(basePath,folder,false)
					.then(function(success){
						if(successCallback){
							successCallback(success);
						}
					},function(error){
						if(errorCallback){
							errorCallback(error);
						}
					});
			},
			/**
			 * 迭代检测/创建文件夹
			 * @param basePath Base FileSystem
			 * @param folder 文件名字符串
			 * @param successCallback 成功回掉
			 * @param errorCallback 失败回掉
			 */
			createDirIterator: function(basePath,folder,successCallback,errorCallback){
				if(!folder){return};
				var folderList = folder.split('/');
				//提取第一个文件名
				var folderName = folderList[0];
				//剩余的文件夹
				var surplusFolder;
				if(folder.indexOf(folderName+'/') != -1){
					surplusFolder = folder.replace(folderName+'/','');
				}else{
					surplusFolder = folder.replace(folderName,'');
				}
				//成功回掉
				var allSuccessCallback = function(){
					//执行迭代
					if(surplusFolder){
						mobile.createDirIterator(basePath,surplusFolder,successCallback,errorCallback);
					}else if(successCallback){
						successCallback();
					}
				};
				//检测失败回掉
				var checkErrorCallback = function(error){
					//创建失败回掉
					var createErrorCallback = function(error){
						if(error.code == 12 || error.code == 5){ //PATH_EXISTS_ERR/ENCODING_ERR
							allSuccessCallback();
						}else{
							//执行失败回掉
							if(errorCallback){
								errorCallback(error);
							}
						}
					};
					//创建该文件夹
					mobile.createDir(basePath,folderName,allSuccessCallback,createErrorCallback);
				};
				//检测该文件夹
				mobile.checkDir(basePath,folderName,allSuccessCallback,checkErrorCallback);
			},
			/**
			 * 保存图片到手机
			 * @param imageSourceUrl 图片资源路径
			 * @param savedImageName 保存的图片名称
			 * @param savedFolderPath 要保存到的文件夹
			 */
			saveImageToMobile: function(imageSourceUrl,savedImageName,successCallback,errorCallback){
				//检测/创建成功
				var createSuccessCallback = function(){
					//图片保存路径
					var saveUrl = mobile.getRootDirectory() + mobile.savedImageFolder + '/' + savedImageName;
					//下载成功回调
					var downloadSuccess = function(success){
						//刷新Gallery的插件
						if(refreshMedia){
							refreshMedia.refresh(saveUrl);
						}
						if(successCallback){
							successCallback(success);
						}
					};
					//下载失败回调
					var downloadError = function(error){
						if(errorCallback){
							errorCallback(error);
						}
					};
					mobile.download(imageSourceUrl,saveUrl,downloadSuccess,downloadError);
				};
				//检测/创建失败
				var createErrorCallback = function(error){
					if(errorCallback){
						errorCallback(error);
					}
				};
				//迭代式检测并创建文件夹
				mobile.createDirIterator(mobile.getRootDirectory(),mobile.savedImageFolder,createSuccessCallback,createErrorCallback);
			},
			/**
			 * 下载
			 * @param sourceUrl 资源下载链接
			 * @param saveUrl 本地保存路径
			 * @param successCallback
			 * @param errorCallback
			 */
			download: function(sourceUrl,saveUrl,successCallback,errorCallback){
				$cordovaFileTransfer.download(sourceUrl,saveUrl)
					.then(function(success){
						if(successCallback){
							successCallback(success);
						}
					},function(error){
						if(errorCallback){
							errorCallback(error);
						}
					});
			},
		};
		return mobile;
	});