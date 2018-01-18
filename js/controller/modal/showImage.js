/**
 * 显示单张图片的Modal控制器
 */
angular.module('app')
.controller('showImage',function($scope,$injector){
	/** $parent
	 * image {
	 * 	src: 显示图片路径,
	 * 	standbySrc: 图片备用路径
	 * 	name: 图片名称,
	 * 	competence: {
	 * 		saveToMobile: 保存到手机
	 * 	}
	 * }
	 * modal 
	 * 
	 */
	var parent = $scope.$parent;
	//图片对象
	if(parent.image){
		$scope.image = parent.image;
	}
	//Modal实例
	if(parent.modal){
		$scope.modal = parent.modal;
	}
	//移动端插件
	var $cordovaFile,$cordovaFileTransfer,rootDirectory;
	if(UPF.is('app')){
		$cordovaFile = $injector.get('$cordovaFile');
		$cordovaFileTransfer = $injector.get('$cordovaFileTransfer');
		if(UPF.is('android')){
			rootDirectory = cordova.file.externalRootDirectory;
		}else{
			rootDirectory = cordova.file.documentsDirectory;
		}
	}
	/**
	 * 长按功能
	 * @param image 图片对象
	 */
	$scope.showHoldMenu = function(image){
		//是否开启功能
		if(!image.competence || !image.complete){ //无此权限 || 图片未成功加载
			return;
		}
		var options = {
			buttons:[{
				text: UPF.is('app') ? '保存到手机' : '下载图片'
			}],
			cancelText: '取消',
			cancel: function(){
				
			},
			buttonClicked: function(index){
				switch (index){
				case 0:
					if(UPF.is('android')){ //android
						saveToMobile(image);
					}else if(UPF.is('ios')){ //ios
						var fileTransfer = new FileTransfer();
						if(fileTransfer.savePictureTo){
							var successCallback = function(success){
								$injector.get('toastr').success('保存成功');
							};
							var errorCallback = function(error){
								$injector.get('toastr').error('保存失败');
							};
							var params = {
								url: $scope.image.src
							};
							fileTransfer.savePictureTo(successCallback,errorCallback,params);
						}
					}
					else{
						window.open($scope.image.src,"_blank");
					}
					return true;
					break;
				}
			}
		};
		$injector.get('$ionicActionSheet').show(options);
	};
	
	/**
	 * 保存到手机 android
	 * @param image 图片对象
	 */
	var saveToMobile = function(image){
		//保存必须要图片名称
		if(!image.name){
			$injector.get('toastr').error('保存失败');
			return;
		}
		var localFolder = 'zhangwen/pictures';
		var localFile = localFolder + '/' + image.name;
		var successCallback = function(){
			var remoteUrl = $scope.image.src; //远程图片链接
			var localUrl = rootDirectory + localFile; //本地存储图片链接
			var downloadSuccess = function(success){
				$injector.get('toastr').success('保存成功');
				//刷新Gallery的插件
				if(refreshMedia){
					refreshMedia.refresh(localUrl);
				}
			};
			var downloadError = function(error){
				$injector.get('toastr').error('保存失败');
			};
			download(remoteUrl,localUrl,downloadSuccess,downloadError);
		};
		var errorCallback = function(error){
			$injector.get('toastr').error('保存失败');
		};
		//迭代式检测并创建目录
		createDirIterator('zhangwen/pictures',successCallback,errorCallback);
	};
	/**
	 * 迭代创建目录
	 * @param folder 文件名字符串
	 * @param successCallback 成功回掉
	 * @param errorCallback 失败回掉
	 */
	var createDirIterator = function(folder,successCallback,errorCallback){
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
				createDirIterator(surplusFolder,successCallback,errorCallback);
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
			//创建该目录
			createDir(folderName,allSuccessCallback,createErrorCallback);
		};
		//检测该目录
		checkDir(folderName,allSuccessCallback,checkErrorCallback);
	};
	/**
	 * 检测目录
	 */
	var checkDir = function(folder,successCallback,errorCallback){
		$cordovaFile.checkDir(cordova.file.externalRootDirector,folder)
			.then(function(success){
				if(successCallback){
					successCallback(success);
				}
			},function(error){ //没有
				if(errorCallback){
					errorCallback(error);
				}
			});
	};
	/**
	 * 创建目录
	 */
	var createDir = function(folder,successCallback,errorCallback){
		$cordovaFile.createDir(rootDirectory,folder,false)
			.then(function(success){
				if(successCallback){
					successCallback(success);
				}
			},function(error){
				if(errorCallback){
					errorCallback(error);
				}
			});
	};
	/**
	 * 下载
	 * @param remoteUrl
	 * @param localUrl
	 * @param successCallback
	 * @param errorCallback
	 */
	var download = function(remoteUrl,localUrl,successCallback,errorCallback){
		$cordovaFileTransfer.download(remoteUrl,localUrl)
			.then(function(success){
				if(successCallback){
					successCallback(success);
				}
			},function(error){
				if(errorCallback){
					errorCallback(error);
				}
			});
	};
});