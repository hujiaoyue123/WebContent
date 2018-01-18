/** 个人盘*/
angular.module("app")
	.controller("ppanCtrl",function($scope,$rootScope,$RESOURCE,service,component,$stateParams,$$share,$$data,$$user,$$preview,$$widget,clipboard,$$util,$ionicScrollDelegate,Upload,$injector){
		/** @$stateParams
		 * id 文件夹id
		 * domain 域名
		 * title 文件夹名
		 * rootid 根id
		 * belongid 部门id
		 */
		$scope.$stateParams = $stateParams;
		$scope.isWeb = UPF.is("web");
		$scope.isApp = UPF.is("APP");
		$scope.isAndroid = UPF.is("android");
		/** 分页配置*/
		$scope.pageConfig = {
			resource: {
				start: 0, //查询开始
				pageSize: $rootScope.CONFIG.page.resource.pageSize, //查询数量
				hasMore: false, //是否还有
				lastId: null //验证id
			}
		};
		/**
		 * 下拉刷新
		 */
		$scope.onRefresh = function(){
			//获取待审核文件数目
			$scope.getResourceAuditCount();
			//获取文件列表
			$scope.FOLDER.getFolder();
		};
		/** 操作
		 * params {
		 *	 type 操作类型
		 * 	 file 操作对象
		 * 	 $event 点击事件
		 * }
		 */
		$scope.operate = function(params){
			//禁止向上传播
			if(params.$event){
				params.$event.stopPropagation();
			}
			//关闭toolbar
			if(params.type != "toolMenu"){
				if(params.resource && params.resource.showTool){
					params.resource.showTool = false;
				}
				if(params.folder && params.folder.showTool){
					params.folder.showTool = false;
				}
			}
			//关闭List侧滑按钮
			$injector.get("$ionicListDelegate").closeOptionButtons();
			/** 搜索*/
			if(params.type == "search"){
				var inParams = {
					domain: $scope.getDomain(),
					folderid: $scope.getFolderId(),
					competence: $scope.resource.competence,
					rootid: $scope.getRootId(),
					foldertype: $scope.foldertype //文件夹类型：user,chat,group
				};
				service.$state.go("searchPan",inParams);
			}
			/** 新建文件*/
			else if(params.type == 'newFile'){
				$$widget.POPOVER.hide();
				var scope = $rootScope.$new(true);
				scope.closeModal = function(){
					$rootScope.ionicModal.hide();
				};
				scope.newListFile = function(){
					$rootScope.ionicModal.hide();
					$state.go('zltFile',{folderid: $scope.getFolderId()});
				};
				var $ionicModal = $injector.get('$ionicModal');
				var $state = $injector.get('$state');
				$ionicModal.fromTemplateUrl('tpl/modal/newFile.html',{
					scope: scope,
					animation: 'none'
				}).then(function(modal){
					modal.show();
					$rootScope.ionicModal = modal;
				});
			}
			/** 顶部菜单
			 * params.$event
			 */
			else if(params.type == "qrScan"){
				service.scanQr();
			}else if(params.type == "topMenu"){
				//TODO 测试阶段
				$scope.showNewFile = function(){
					var a = ['万小昉','邹瑜','何鑫','胡忠满','李西','刘兵','莫非','杨轶','雷雅'];
					var currentUserName = $rootScope.USER.username;
					if(a.indexOf(currentUserName) != -1){
						return true;
					}else{
						return false;
					}
				};
				if($scope.topMenu){
					$scope.topMenu.show(params.$event);
				}else{
					$$widget.POPOVER.panMenu($scope,"topMenu",params.$event);
				}
			}
			/** 点击菜单按钮*/
			else if(params.type == "clickTopMenuItem"){
				$$widget.POPOVER.hide();
			}
			/** 点击下拉菜单*/
			else if(params.type == "toolMenu"){
				//关闭其他
				//资源
				angular.forEach($scope.resource.resources,function(resource){
					if(params.resource && resource.id == params.resource.id){
						params.resource.showTool = !params.resource.showTool;
					}else if(resource.showTool){
						resource.showTool = false;
					}
				});
				//文件夹
				angular.forEach($scope.resource.folders,function(folder){
					if(params.folder && folder.id == params.folder.id){
						params.folder.showTool = !params.folder.showTool;
					}else if(folder.showTool){
						folder.showTool = false;
					}
				});
			}
			/** 加入企业*/
			else if(params.type == "neworg"){
				service.$state.go("neworg");
			}
			/** 文件夹-点击
			 * params.folder
			 */
			else if(params.type == "clickFolder"){
				var inParams = {
					id: params.folder.id, //文件id
					title: params.folder.name, //回退标题
					belongid: params.folder.belongid, //企业、部门、分享给我的
					rootid: params.folder.rootid //根id
				};
				var currentStateName = service.$ionicHistory.currentView().stateName;
				service.$state.go(currentStateName, inParams);
			}
			/** 文件夹-新建*/
			else if(params.type == "newFolder"){
				if($scope.topMenu){
					$scope.topMenu.hide();
				}
				//新版增添权限
				var scope = $rootScope.$new(true);
				//初始表单
				scope.form = {
					folderName: '',
					public: 0, //公开
					audit: 0 //审批
				};
				//是否显示‘公开’选项
				//是否显示‘审批’选项
				if($scope.foldertype == 'org' || $scope.foldertype == 'dept'){
					//只有部门才显示是否公开
					if($scope.foldertype == 'dept'){
						scope.form.showPublic = true;
					}
					scope.form.showAudit = true;
				}
				/*
				 //是否显示权限功能
				 if($stateParams.rootid && $rootScope.USER.folderid != $stateParams.rootid){ //自己的文件夹不显示
				 scope.form.competence = true;//$scope.resource.competence;
				 }*/
				var options = {
					title: '新建文件夹',
					templateUrl: 'tpl/popup/newFolder.html',
					scope: scope,
					buttons: [{
						text: '取消'
					},{
						text: '确定',
						type: 'button-positive',
						onTap: function(e){
							if(!scope.form.folderName){
								e.preventDefault();
								return;
							}
							var successCallback = function(){
								//操作
								$scope.FOLDER.newFolder(scope.form.folderName,scope.form.public,scope.form.audit);
							}
							//判断是否提醒审核以及后续操作
							var params = {
								folderid: $scope.currentFolder.id
							};
							$injector.get('service').checkFolderAudit(params,successCallback);
							/*
							 //审核提醒：1.是审核文件夹 2.文件夹属于组织 3.文件夹属主不是自己
							 if(!$scope.competence && $scope.currentFolder && $scope.currentFolder.audit == 1 && ($scope.foldertype == 'org' || $scope.foldertype == 'dept') && $scope.currentFolder.createuserid != $rootScope.USER.id){
							 //文件需要审批-popup
							 $injector.get('$$widget').POPUP.fileAuditTip($scope.currentFolder.username,successCallback);
							 }else{
							 successCallback();
							 }
							 */
						}
					}]
				}
				$injector.get('$ionicPopup').show(options);
			}
			/** 文件夹-重命名
			 * params.$event
			 * params.folder
			 */
			else if(params.type == "renameFolder"){
				var options = {
					title: "重命名",
					defaultText: params.folder.name
				};
				$$widget.POPUP.prompt(options)
					.then(function(result){
						if(result && result != params.folder.name){
							params.folder.name = result;
							$scope.FOLDER.updateFolder(params.folder);
						}
					});
			}
			/**
			 * 文件夹-详情
			 */
			else if(params.type == "folderInfo"){
				if($scope.topMenu){
					$scope.topMenu.hide();
				}
				var inParams = {
					domain: $scope.getDomain(),
					id: params.folder.id,
					rootid: params.folder.rootid
				};
				$injector.get('$state').go('folderInfo',inParams);
			}
			/** 文件夹-移动
			 * params.$event
			 * params.folder
			 */
			else if(params.type == "moveFolder"){
				//数据包
				var dataPackage = {
					title: "移动文件夹",
					rootid: params.folder.rootid,
					excludes: [params.folder.id],
					hideResource: true,
					disableButton: [params.folder.parentid],
					callback: function(data){
						var successCallback = function(){
							var folder = {
								id: params.folder.id,
								folderid: $scope.getFolderId(),
								parentid: data.newFolderId
							};
							//执行修改
							$scope.FOLDER.updateFolder(folder);
						};
						//判断是否提醒审核以及后续操作
						var inParams = {
							folderid: data.newFolderId
						};
						$injector.get('service').checkFolderAudit(inParams,successCallback);
					}
				};
				//打开modal
				$$widget.MODAL.fileSelect($scope,dataPackage);
			}
			/** 文件夹-删除
			 * params.folder
			 */
			else if(params.type == "deleteFolder"){
				var options = {
					title: "提醒",
					template: "<p style='text-align:center;'>确定删除该文件夹?</p>"
				};
				$$widget.POPUP.confirm(options)
					.then(function(result){
						if(result){
							$scope.FOLDER.deleteFolder(params.folder);
						}
					});
			}
			/** 资源-点击
			 * params.resource
			 */
			else if(params.type == "clickResource"){
				var resource = params.resource;
				if(resource.preview){
					if(resource.preview == 'image' || resource.preview == 'office' || resource.preview == 'pdf'){//可预览文件
						$scope.RESOURCE.preview(resource);
					}
					else if(resource.preview == 'zlt'){ //zlt文件
						var $state = $injector.get('$state');
						$state.go('zltFile',{folderid: $scope.getFolderId(),resourceid: resource.id});
					}
					//文本预览
					else if(resource.preview == 'txt'){
						var inParams = {
							domain: $scope.getDomain(),
							id: resource.id,
							filename: resource.filename,
							folderid: $scope.currentFolder.id
						};
						$injector.get('$state').go('txtReader',inParams);
					}
					//视频预览
					else if(resource.preview == 'video' || resource.preview == 'audio'){
						var inParams = {
							id: resource.id,
							folderid: $scope.getFolderId(),
							name: resource.filename,
							type: resource.minetype
						};
						$injector.get('service').showMediaModal(inParams);
					}
					//统计浏览
					var inParams = {
						resourceid: resource.id,
						folderid: $scope.getFolderId()
					};
					$RESOURCE.RESOURCE.readResource(inParams);
				}
				else{//不可预览
					$scope.operate({type: "fileDetail",resource: resource});
				};
			}
			/** 资源-重命名*/
			else if(params.type == "renameResource"){
				var options = {
					title: "重命名",
					defaultText: params.resource.filename.replace("." + params.resource.fileext, "")
				};
				$$widget.POPUP.prompt(options)
					.then(function(result){
						if(result && result != options.defaultText){
							var resource = {
								id: params.resource.id,
								filename :  result + "." + params.resource.fileext
							};
							$scope.RESOURCE.updateResource(resource);
						}
					});
			}
			/** 资源-下载 */
			else if(params.type == "downloadResource"){
				$scope.RESOURCE.download(params.resource);
			}
			/** 资源-详情
			 * params.$event
			 * params.resource
			 */
			else if(params.type == "fileDetail"){
				var inParams = {
					domain: $scope.getDomain(),
					id: params.resource.id,
					folderid: $scope.getFolderId(),
					rootid: $scope.getRootId(), //根id
					isaudit: params.resource.isaudit
				};
				service.$state.go("fileDetail",inParams);
			}
			/** 资源-删除
			 * params.resource
			 */
			else if(params.type == "deleteResource"){
				var options = {
					title: "提醒",
					template: "<p style='text-align:center;'>确定删除该资源?</p>"
				};
				$$widget.POPUP.confirm(options)
					.then(function(result){
						if(result){
							$scope.RESOURCE.deleteResource(params.resource);
						}
					});
			}
			/** 资源-选择分享类型
			 * params.$event
			 * params.resource
			 */
			else if(params.type == "share"){
				$scope.showLinkPopup = true;   //显示分享入口
				$scope.showLinkPopupMlk = false; //不显示复制链接页
				$scope.showLinkPopupWxf = false; //不显示分享给微信好友
				$scope.tempResource = params.resource; //待分享资源
				//打开弹窗
				$$widget.POPUP.share.selectShare($scope);
			}
			/** 资源-生成链接*/
			else if(params.type == "makeLink"){
				$scope.showLinkPopup = false;
				$scope.showLinkPopupMlk = true; //分享popup内容切换
				$scope.SHARE.addShare($scope.tempResource);
			}
			/** 资源-复制链接*/
			else if(params.type == "copyLink"){
				try {
					if(UPF.is("APP")){
						var mobile = $injector.get("$$mobile");
						mobile.copyLink($scope.shareLink);
					}else{
						clipboard.copyText($scope.shareLink);
					}
					service.showMsg("success","链接已复制");
				} catch (e) {
					service.showMsg("error","复制链接失败");
				}finally{
					$scope.showLinkPopupMlk = false;
					$$widget.POPUP.close(); //关闭Popup
				}
			}
			/** 资源-分享(微信朋友/圈)二维码
			 * params.resource
			 */
			else if(params.type == "wxfriend" ){
				$scope.showLinkPopup = false;
				$scope.showLinkPopupWxf = true;
				$scope.SHARE.addShare($scope.tempResource);
			}
			/** 资源-分享(掌文朋友)
			 * params.resource
			 */
			else if(params.type == "zwfriend"){
				$$widget.POPUP.close(); //关闭Popup
				var initParam = {
					scope: $scope.$new(true),
					excludes: $rootScope.USER.id,
					range: "all"
				};
				$$widget.MODAL.selectUser(initParam, function(data){
					var execute = function(data){
						var formString = [];
						angular.forEach(data,function(obj){
							//0 群组,1 企业，2 部门
							if(obj.type == 1 || obj.type == 0 || obj.type == 2){
								obj.type = "group";
							}else{
								obj.type = "user";
							}
							var newObj = {
								id: obj.id,
								sharetype: obj.type
							};
							formString.push(newObj);
						});
						var shareParam = {
							resourceid: $scope.tempResource.id,
							formString: JSON.stringify(formString),
							folderid: $scope.getFolderId()
						};
						$$share.addShare(shareParam,function(result){
							if(result.result == 1){
								service.showMsg("info",result.description);
							} else if(result.result == 2){
								service.activeSessionProxy(function(){
									execute(data);
								});
							} else {
								service.showMsg("error",result.description);
							}
						});
					};
					//执行
					execute(data);
				});
			}
			/** 微信App分享 */
			else if(params.type == 'friend' || params.type == 'timeline'){
				$$widget.POPUP.close();
				var initParams = {
					res : $scope.tempResource,
					type: params.type
				};
				$scope.sendWxChar(initParams);
			}
			/** 测试-选择文件*/
			else if(params.type == "select"){
				var dataPackage = {
					action: "select",
					org: "org" //额外获取企业文件,
				};
				service.promiseProxy(function(promise){
					dataPackage.promise = promise;
					$$widget.MODAL.fileSelect($scope,dataPackage);
				},function(resource){
					console.log(resource);
				});
			}
			// 打开摄像头
			else if(params.type == "camera"){
				$$widget.POPOVER.hide(); //关闭POPOVER
				setTimeout(function () {
					if(!$scope.isWeb){
						$scope.cameraUpload();
					}
				});
			}
		};
		/**
		 * 进入回收站
		 * @param folder
		 */
		$scope.enterTrashFolder = function (trashFolder) {
			var inParams = {
				domain: $scope.getDomain(),
				id: trashFolder.id
			};
			$injector.get('$state').go('trash',inParams);
		};
		/**
		 * 进入文件审核列表
		 */
		$scope.enterAuditFile = function () {
			var inParams = {
				domain: $scope.getDomain()
			};
			$injector.get('$state').go('auditFile',inParams);
		};
		/**
		 * 显示排序popover
		 * @param evt
		 */
		$scope.showSortPopover = function (evt) {
			if(!$scope.sortPopover){
				$injector.get('$ionicPopover').fromTemplateUrl('tpl/popover/sort-popover.html',{scope: $scope})
					.then(function (popover) {
						$scope.sortPopover = popover;
						$scope.sortPopover.show(evt);
					})
			}else{
				$scope.sortPopover.show(evt);
			}
		};
        /**
         * 显示排序modal
         */
		$scope.showSortModal = function () {
			var scope = $scope.$new();
			/**
			 * 设置
			 * @param type
			 */
			scope.setSort = function (type) {
				if(type && $rootScope.localConfig.sortResource != type){
					if(type == 'name'){
						$rootScope.localConfig.sortResource = 'name'; //按名称排序
					}else if(type == 'date'){
						$rootScope.localConfig.sortResource = 'date'; //按时间排序
					}
					$scope.FOLDER.getFolder();
				}
				scope.modal && scope.modal.remove();
			};
			$injector.get('$ionicModal').fromTemplateUrl('tpl/modal/sortResource.html',{scope: scope,animation: 'none'})
				.then(function (modal) {
					scope.modal = modal;
					scope.modal.show();
				});
		};
        /**
         * 显示选择排序框
         */
        $scope.showSortPopup = function () {
            var scope = $scope.$new();
            /**
             * 设置
             * @param type
             */
            scope.setSort = function (type) {
                if(type && $rootScope.localConfig.sortResource != type){
                    if(type == 'name'){
                        $rootScope.localConfig.sortResource = 'name'; //按名称排序
                    }else if(type == 'date'){
                        $rootScope.localConfig.sortResource = 'date'; //按时间排序
                    }
                    $scope.FOLDER.getFolder();
                }
                popup && popup.close();
            };
            var options = {
                subTitle: '选择一种排序方式',
                templateUrl: 'tpl/popup/sortResource.html',
                scope: scope
            };
            var popup = $injector.get('$ionicPopup').show(options);
        };
		/** 拍照上传*/
		$scope.cameraUpload = function(){
			$scope.scrollTop();
			var $$mobile = $injector.get("$$mobile");
			var options = {
				type: 'CAMERA',
				allowEdit: true
			};
			if(UPF.is('ios')){
			    // options.hasVideo = true;
                options.disableCamera = true;
            }
			var successCallback = function(uri){
				var $cordovaFileTransfer = $$mobile.$cordovaFileTransfer;
				var server = $rootScope.dynamicITF.app.ppan.mobileAddResource($rootScope.getCurrentDomainAddress());
				var user = $rootScope.USER;
				var fileName = service.getMobileFileName(uri);
				var options = {
					params: {
						userid: user.id,
						sessionid: user.sessionid,
						filename: fileName,
						folderid: $scope.getFolderId()
					}
				};
				//创建task
				var createTask = function(){
					if(!$rootScope.taskList){
						$rootScope.taskList = [];
					}
					var task = {
						id: Math.random(),
						folderid: $scope.getFolderId(),
						file: {
							name: decodeURI(fileName)
						}
					};

					var successCallback = function(res){
						var result = JSON.parse(res.response);
						if(result.result == 1){
							$scope.FOLDER.getFolder();
							service.showMsg("success",result.description);
						} else if(result.result == 2){
							service.activeSessionProxy(function(){
								createTask();
							});
						} else {
							service.showMsg("error",result.description);
						}
						//清除该上传任务
						$scope.removeTask(task.id);
					};
					var errorCallback = function(){
						service.showMsg("error",result.description);
						//清除该上传任务
						$scope.removeTask(task.id);
					};
					var onProgress = function(progress){
						task.progress = parseInt(progress.loaded / progress.total * 100.0);
					};
					task.promise = $cordovaFileTransfer.upload(server,uri,options);
					task.promise.then(successCallback,errorCallback,onProgress);
					//加入任务列
					$rootScope.taskList.push(task);
				};
				createTask();
			};
            if(UPF.is('ios')){
                service.screen.landscape(function () {
                    //开启相机
                    $$mobile.openCamera(options,function () {
                        service.StatusBar.show();
                        service.screen.portrait();
                    },function () {
                        service.StatusBar.show();
                        service.screen.portrait();
                    });
                });
                service.StatusBar.hide();
            }else{
                //开启相机
                $$mobile.openCamera(options,successCallback);
            }
		};
		/**
		 * 进入部门文件夹视图
		 */
		$scope.enterDeptFolder = function(){
			var inParams = {
				domain: $scope.getDomain(),
				folderid: $scope.getFolderId(),
				competence: $scope.resource.competence,
				rootid: $scope.getRootId()
			};
			var currentStateName = service.$ionicHistory.currentView().stateName;
			var prefix = '';
			if(currentStateName.indexOf('tab.') > -1){ //tab视图
				prefix = 'tab.';
			}
			$injector.get('$state').go(prefix + 'departmentFolder', inParams);
		};
		/** 文件体*/
		$scope.FOLDER = {
			/** 查询文件夹
			 * id 资源id
			 */
			getFolder: function(folderid,finalCallback){
				var params = {
					start: 0,
					pagesize: $scope.pageConfig.resource.pageSize
				};
				if(folderid){ //传入id
					params.folderid = folderid;
				}else{ //根级
					params.folderid = $scope.getFolderId();
					params.org = "org";
				}
				//企业、部门、分享给我的
				if($stateParams.belongid){
					params.belongid = $stateParams.belongid;
				}
				//排序方式
				params.sort = $rootScope.localConfig.sortResource;
				$RESOURCE.FOLDER.getFolder(params,function(result){
					if(result.result == 1){ //查询成功
						//文件夹信息
						$scope.currentFolder = result.folder;
						//文件夹类型(user,org,dept,group,chat)
						$scope.foldertype = result.foldertype;
						//当前用户对该文件夹的操作权限
						$scope.competence = result.competence;
						//是否inbox
						$scope.isInbox = (result.folder.type == 'inbox');
						//企业数据处理
						$$data.oneDragonList(result.sub.company);
						//部门数据处理
						$$data.oneDragonList(result.sub.gfolder);
						//接收的分享
						$$data.oneDragon(result.sub.inbox);
						//部门公共文件夹
						$$data.oneDragon(result.sub.public);
						//文件夹数据处理
						$$data.oneDragonList(result.sub.folders);
						//资源数据处理
						$$data.oneDragonList(result.sub.resources);
						//资源
						$scope.resource = {};
						//部门文件夹
						$scope.resource.gsize = result.sub.gsize;
						//权限
						$scope.resource.competence = result.competence;
						//企业
						if(result.sub.company && result.sub.company.length >0){ //如果有企业,就不显示'尚未加入企业'
							$$user.setLocalUser(null,{orguser: 1});
						}
						$scope.resource.company = result.sub.company;
						//部门
						$scope.resource.gfolder = result.sub.gfolder;
						//回收站
						$scope.resource.trash = result.sub.trash;
						//收到的分享
						$scope.resource.inbox = result.sub.inbox;
						//部门公共文件夹
						$scope.resource.public = result.sub.public;
						//文件夹列表
						$scope.resource.folders = result.sub.folders;
						//删除多加载的最后一个资源，保留id
						if(result.sub.resources.length == ($scope.pageConfig.resource.pageSize + 1)){
							$scope.pageConfig.resource.lastId = result.sub.resources.pop().id;
						}
						/** 获取并缓存图片缩略图*/
						if(UPF.is("app") && $rootScope.localConfig.cacheImage){
							var offline = $injector.get("$$mobile").offline;
							offline.loadLocalImageThumb(result.sub.resources);
						}
						//资源文件
						$scope.resource.resources = result.sub.resources;
						//重设start
						$scope.pageConfig.resource.start = $scope.pageConfig.resource.pageSize;
						//开启上拉刷新
						if(result.sub.resources.length == $scope.pageConfig.resource.pageSize){
							$scope.pageConfig.resource.hasMore = true;
							// $scope.FOLDER.pagingForGetFolder();
						}
					}else if(result.result == 2){	//session过期，自动激活
						service.activeSessionProxy(function(){
							$scope.FOLDER.getFolder(folderid,finalCallback);
						});
					}else{	//查询失败
						service.showMsg("error",result.description);
					}
				},null,function(){
					$scope.requestComplete = true; //请求完毕
					$scope.$broadcast("scroll.refreshComplete");  //针对下拉式刷新
					//执行完毕回掉
					finalCallback && finalCallback();
				});
			},
			/** 分页查询*/
			pagingForGetFolder: function(){
				//封装参数
				var params = {
					folderid: $scope.getFolderId(),
					org: "org",
					start: $scope.pageConfig.resource.start,
					pagesize: $scope.pageConfig.resource.pageSize,
					resid: $scope.pageConfig.resource.lastId
				};
				if($stateParams.belongid){
					params.belongid = $stateParams.belongid;
				}
                //排序方式
                params.sort = $rootScope.localConfig.sortResource;
				//数据处理
				$RESOURCE.FOLDER.getFolder(params,function(result){
					if(result.result == 1){ //查询成功
						//是否inbox
						$scope.isInbox = (result.folder.type == 'inbox');
						//企业数据处理
						$$data.oneDragonList(result.sub.company);
						//部门数据处理
						$$data.oneDragonList(result.sub.gfolder);
						//接收的分享
						$$data.oneDragon(result.sub.inbox);
						//部门公共文件夹
						$$data.oneDragon(result.sub.public);
						//文件夹数据处理
						$$data.oneDragonList(result.sub.folders);
						//资源数据处理
						$$data.oneDragonList(result.sub.resources);
						//总资源
						if(!$scope.resource){
							$scope.resource = {};
						}
						//企业
						if(!$scope.resource.company){
							$scope.resource.company = result.sub.company;
						}
						//部门
						if(!$scope.resource.gfolder){
							$scope.resource.gfolder = result.sub.gfolder;
						}
						//收到的分享
						if(!$scope.resource.inbox){
							$scope.resource.inbox = result.sub.inbox;
						}
						//部门公共文件夹
						if(!$scope.resource.public){
							$scope.resource.public = result.sub.public;
						}
						//文件夹
						if(!$scope.resource.folders){
							$scope.resource.folders = result.sub.folders;
						}
						//部门文件夹
						$scope.resource.gsize = result.sub.gsize;
						$scope.resource.competence = result.competence; //权限
						//表示有冲突
						if(result.type == 1){
							//删除多加载的最后一个资源，保留id
							if(result.sub.resources.length == ($scope.pageConfig.resource.pageSize + $scope.pageConfig.resource.start + 1)){
								$scope.pageConfig.resource.lastId = result.sub.resources.pop().id;
							}
							/** 获取并缓存图片缩略图*/
							if(UPF.is("app") && $rootScope.localConfig.cacheImage){
								var offline = $injector.get("$$mobile").offline;
								offline.loadLocalImageThumb(result.sub.resources);
							}
							$scope.resource.resources = result.sub.resources;
						}else{
							//资源
							if(result.sub.resources && result.sub.resources.length>0){
								if(!$scope.resource.resources){
									$scope.resource.resources = [];
								}
								//删除多加载的最后一个资源，保留id
								if(result.sub.resources.length == ($scope.pageConfig.resource.pageSize + 1)){
									$scope.pageConfig.resource.lastId = result.sub.resources.pop().id;
								}
								/** 获取并缓存图片缩略图*/
								if(UPF.is("app") && $rootScope.localConfig.cacheImage){
									var offline = $injector.get("$$mobile").offline;
									offline.loadLocalImageThumb(result.sub.resources);
								}
								//非重复追加
								// $$util.ARRAY.distinctPush($scope.resource.resources,result.sub.resources);
								for(var i=0;i<result.sub.resources.length;i++){
									$scope.resource.resources.push(result.sub.resources[i]);
								}
							}
						}
						//取消上拉刷新
						if(result.sub.resources.length < $scope.pageConfig.resource.pageSize){
							$scope.pageConfig.resource.hasMore = false;
						}else{
							//重设下次的start
							$scope.pageConfig.resource.start += $scope.pageConfig.resource.pageSize;
						}
					}else if(result.result == 2){	//session过期，自动激活
						service.activeSessionProxy(function(){
							$scope.FOLDER.pagingForGetFolder();
						});
					}else{	//查询失败
						$scope.pageConfig.resource.hasMore = false;
						service.showMsg("error",result.description);
					}
				},function(){
					$scope.pageConfig.resource.hasMore = false;
				},function(){
					$scope.$broadcast("scroll.infiniteScrollComplete");  //针对上拉式刷新
				});
			},
			/** 新建文件夹
			 * @param folderName 文件夹名
			 * @param public 是否公开
			 * @param audit 是否需要审批
			 */
			newFolder: function(folderName,public,audit){
				//封装参数
				var params = {
					folderid: $scope.getFolderId(),
					name:  folderName
				};
				if(public || public == 0){ //公开
					params.public = public;
				}
				if(audit || audit == 0){ //审批
					params.audit = audit;
				}
				$RESOURCE.FOLDER.newFolder(params,function(result){
					if(result.result == 1){ //成功
						$scope.FOLDER.getFolder(); //刷新数据
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.FOLDER.newFolder(folderName,public,audit);
						});
					}
					//权限拒绝
					else if(result.result == 6){
						var options = {
							title: '提醒',
							template: result.description
						};
						$injector.get('$$widget').POPUP.alert(options);
					}
					else{
						service.showMsg("error",result.description);
					}
				});
			},
			/** 修改文件夹
			 * updateFile{id,name,parentid}
			 */
			updateFolder: function(updateFolder){
				var inParams = {};
				var folder = [{
					id: updateFolder.id
				}];
				if(updateFolder.name){ //重命名
					folder[0].name = updateFolder.name;
				}
				if(updateFolder.parentid){ //移动
					folder[0].parentid = updateFolder.parentid;
				}
				inParams.updateString = JSON.stringify(folder);
				//执行修改
				$RESOURCE.FOLDER.updateFolder(inParams,function(result){
					if(result.result == 1){
						if(updateFolder.name){ //重命名
							$$util.ARRAY.update($scope.resource.folders, updateFolder); //修改array里的对象
						}else if(updateFolder.parentid){ //移动
							$scope.FOLDER.getFolder(); //刷新
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.FOLDER.updateFolder(updateFolder);
						});
					}else{
						$scope.FOLDER.getFolder();//刷新
						service.showMsg("error",result.description);
					}
				});
			},
			/** 删除文件夹
			 * folder
			 */
			deleteFolder: function(folder){
				//封装参数
				var params = {};
				params.deleteString = JSON.stringify([{id:folder.id}]);
				//执行删除
				$RESOURCE.FOLDER.deleteFolder(params,function(result){
					if(result.result == 1){//删除成功
						$$util.ARRAY.remove($scope.resource.folders, folder); //修改array里的对象
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.FOLDER.deleteFolder(folder);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			}
		};
		/**
		 * 显示文件需要审核的弹框
		 * @param files 文件对象(mobile没有)
		 */
		$scope.showAuditPopup = function(files){
		    if(files && files.length>0){
                var successCallback = function(){
    //				if(UPF.is('android')){
    //					$scope.uploadWithStream();
    //				}
                    $scope.RESOURCE.uploadResource(files);
                };
                //判断是否提醒审核以及后续操作
                var params = {
                    folderid: $scope.currentFolder.id
                };
                $injector.get('service').checkFolderAudit(params,successCallback);
            }
		};


		//加载失败文件上传modal
		var loadFaildUploadModal = function(){
			//创建新的Scope
			$scope.faildUploadScope = $scope.$new(true);
			$scope.faildUploadScope.missFiles = []; //失败文件列表
			$scope.faildUploadScope.selectOptions = [
				{
					index: 0,
					text: '覆盖',
					type: 'cover'
				},{
					index: 1,
					text: '自动重命名',
					type: 'autorename'
				},{
					index: 2,
					text: '跳过',
					type: 'ignore'
				},{
					index: 3,
					text: '重命名',
					type: 'rename'
				}];
			//单个覆盖
			$scope.faildUploadScope._cover = function(file){
				//覆盖上传
				$scope.upload(file,true,function(){
					$scope.faildUploadScope._ignore(file); //失败列表中移除
				});
			};
			//单个重命名
			$scope.faildUploadScope._rename = function(file){
				$scope.upload(file,false,function(){
					$scope.faildUploadScope._ignore(file); //失败列表中移除
				});
			};
			//单个跳过
			$scope.faildUploadScope._ignore = function(file){
				var missFiles = $scope.faildUploadScope.missFiles;
				var result = false; //跳过是否成功
				for(var i=0;i<missFiles.length;i++){
					var f = missFiles[i];
					if(f.name == file.name || f.name == file.filename){
						missFiles.splice(i--,1);
						result = true;
					}
				}
				if(missFiles.length == 0){
					$scope.faildUploadScope.modal.hide();
				}
				return result;
			};
			//全部覆盖
			$scope.faildUploadScope.coverAll = function(missFiles){
				for(var i=0;i<missFiles.length;i++){
					var file = missFiles[i];
					file.selected = $scope.faildUploadScope.selectOptions[0];
				}
			};
			//自动重命名
			$scope.faildUploadScope.renameAll = function(missFiles){
				for(var i=0;i<missFiles.length;i++){
					var file = missFiles[i];
					file.selected = $scope.faildUploadScope.selectOptions[1];
				}
			};
			//全部跳过
			$scope.faildUploadScope.ignoreAll = function(missFiles){
				//全部改为'跳过'
				for(var i=0;i<missFiles.length;i++){
					var file = missFiles[i];
					file.selected = $scope.faildUploadScope.selectOptions[2];
				}
			};
			//确定
			$scope.faildUploadScope.ensure = function(missFiles){
				for(var i=0;i<missFiles.length;i++){
					var file = missFiles[i];
					if(file.selected){
						if(file.selected.type == 'cover'){ //覆盖
							$scope.faildUploadScope._cover(file);
						}else if(file.selected.type == 'ignore'){ //跳过
							var result = $scope.faildUploadScope._ignore(file);
							if(result){
								//跳过会
								--i;
							}
						}else if(file.selected.type == 'rename' || file.selected.type == 'autorename'){ //重命名、自动重命名
							$scope.faildUploadScope._rename(file);
						}
					}
				}
			};
			//取消
			$scope.faildUploadScope.cancel = function(){
				$scope.faildUploadScope.missFiles = [];
				$scope.faildUploadScope.modal.hide();
			};
			/**
			 * 监视选择值变化
			 * @param file 当前file对象
			 * @param lastSelectedIndex select值改变前的值的index
			 */
			$scope.faildUploadScope.selectionChange = function(file,lastSelectedIndex){
				//记录上次的select
				file.lastSelected = $scope.faildUploadScope.selectOptions[lastSelectedIndex];
				//如果选择'重命名'-弹框重命名
				if(file.selected.type == 'rename'){
					$scope.faildUploadScope.renamePopup(file);
				}
			};
			//重命名-弹窗
			$scope.faildUploadScope.renamePopup = function(file){
				var defaultText = file.filename || file.name;
				var fileext = $injector.get('$$util').getFileext(defaultText);
				defaultText = defaultText.replace('.'+fileext,'');
				var options = {
					title: '重命名',
					defaultText: defaultText
				};
				$injector.get('$$widget').POPUP.prompt(options)
					.then(function(res){
						if(res && res != defaultText){
							//名称无冲突
							var successCallback = function(){
								//新名称
								file.filename = res+'.'+fileext;
								//修改select值
								file.selected = $scope.faildUploadScope.selectOptions[3];
							};
							//名称冲突
							var errorCallback = function(){
								$injector.get('toastr').info('该名称已被占有');
								$scope.faildUploadScope.renamePopup(file);
								//恢复上次select值
								file.selected = file.lastSelected;
							};
							//恢复之前的名称
							if((res + '.' + fileext) == file.name){
								successCallback();
								return;
							}
							//检测missFiles集合是否有该名称
							var missFiles = $scope.faildUploadScope.missFiles;
							for(var i=0;i<missFiles.length;i++){
								var f = missFiles[i];
								if(f.filename == (res + '.' + fileext) || f.name == (res + '.' + fileext)){ //判断名称
									errorCallback();
									return;
								}
							}
							//检测服务器是否有该名称
							var tempfile = {filename: (res + '.' + fileext)};
							getResourceRepeat(tempfile,function(isRepeat){
								if(isRepeat){
									errorCallback();
								}else{
									successCallback();
								}
							});
						}else{
							//恢复上次select值
							file.selected = file.lastSelected;
						}
					});
			};
			//加载Modal模板
			var templateUrl = 'tpl/modal/uploadList.html';
			var options = {
				scope: $scope.faildUploadScope,
				animation: 'slide-in-up'
			};
			$injector.get('$ionicModal').fromTemplateUrl(templateUrl,options)
				.then(function(modal){
					$scope.faildUploadScope.modal = modal;
				});
		};
		//初始化-文件失败Modal模块
		loadFaildUploadModal();
		//打开上传列表modal
		var showFileMissModal = function(){
			if($scope.faildUploadScope.modal){ //已有Modal实例
				if(!$scope.faildUploadScope.modal.isShown()){ //modal非active状态
					$scope.faildUploadScope.modal.show();
				}
			};
		};
		//遗漏的文件
		var pushFileMissList = function(file){
			//大小
			file.filesize = $$util.bytesToSize(file.size);
			$scope.faildUploadScope.missFiles.push(file);
			//显示Modal
			showFileMissModal();
		};
		//检测文件大小、是否存在
		var checkFile = function(file){
			//缩略图
			if(file.type.indexOf('image') != -1){ //图片
				file.src = window.URL.createObjectURL(file);
			}else{
				file.src = 'img/filetype/file.png';
			}
			//检测后回调
			var callback = function(isRepeat){
				if(isRepeat){
					pushFileMissList(file); //加入列表
				}else{
					$scope.upload(file);
				}
			};
			//同名检测
			getResourceRepeat(file,callback);
			/* 文件大小限制
			 var sizeLimit = 1024 * 1024 * 200; //200MB
			 if(file.size >= sizeLimit){ //大小检测
			 file.tag = 'size';
			 pushFileMissList(file); //加入列表
			 }else{
			 }*/
		};
		//查询文件是否已存在
		var getResourceRepeat = function(file,callback){
			var inParams = {
				name: file.filename || file.name, //filename是自定义的名称
				folderid: $scope.getFolderId()
			};
			$RESOURCE.RESOURCE.getResourceRepeat(inParams,function(result){
				if(result.result == 1){
					if(callback){
						callback(result.repeat);
					}
				}else if(result.result == 2){
					service.activeSessionProxy(function(){
						getResourceRepeat(file,callback);
					});
				}else{
					$injector.get('toastr').error(result.description);
				}
			});
		};
		/** 资源体*/
		$scope.RESOURCE = {
			/**
			 *  上传资源
			 *  ng-file-upload
			 */
			uploadResource: function(files){
				$scope.scrollTop();
				$$widget.POPOVER.hide();
				//开启任务
				if(!$rootScope.taskList){
					$rootScope.taskList = [];
				}
				if(files && files.length){
					//预先激活session
					// service.activeSessionProxy(function(){
						for (var i = 0; i < files.length; i++) {
							var file = files[i];
							//检测文件：同名、大小
							checkFile(file);
						}
					// });
				}
			},
			/** 资源修改
			 * updateFile{id,title}
			 */
			updateResource: function(updateRes){
				var inParams = {};
				var resource = [{
					id: updateRes.id,
					folderid: $scope.getFolderId()
				}];
				if(updateRes.filename){ //重命名
					resource[0].filename = updateRes.filename;
				}else if(updateRes.newfolderid){ //移动
					inParams.type = "move";
					resource[0].newfolderid = updateRes.newfolderid; //移动到的文件夹
				}
				inParams.updateString = JSON.stringify(resource);
				//执行修改
				$RESOURCE.RESOURCE.updateResource(inParams,function(result){
					if(result.result == 1){
						if(updateRes.filename){ //重命名
							$$util.ARRAY.update($scope.resource.resources, updateRes); //修改array里的对象
						}else if(updateRes.newfolderid){ //移动
							$scope.FOLDER.getFolder();
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.RESOURCE.updateResource(updateRes);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			},
			/** 删除资源
			 * file
			 */
			deleteResource: function(resource){
				//封装参数
				var inParams = {};
				var resouce = [{
					id: resource.id,
					folderid: $scope.getFolderId()
				}];
				inParams.deleteString = JSON.stringify(resouce);
				//执行删除
				$RESOURCE.RESOURCE.deleteResource(inParams,function(result){
					if(result.result == 1){//删除成功
						$$util.ARRAY.remove($scope.resource.resources, resource); //移除array里的对象
						//清除缓存
						if(UPF.is("app")){
							var offline = $injector.get('$$mobile').offline;
							offline.clearSingleResourceCache(resource);
						}
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.RESOURCE.deleteResource(resource);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			},
			/** 预览*/
			preview: function(resource){
				var inParams = {
					resource: resource,
					folderid: $scope.getFolderId()
				};
				$$preview.prepare(inParams);
			}
		};
		/** 分享体*/
		$scope.SHARE = {
			/** 添加分享获取分享id
			 * resource
			 * userList
			 */
			addShare: function(resource,userList){
				var inParams = {
					resourceid: resource.id,
					folderid: $scope.getFolderId()
				};
				inParams.formString = JSON.stringify(userList || []);
				$$share.addShare(inParams,function(result){
					if(result.result == 1){
						if(userList){
							service.showMsg("success",result.description);
						}else{
							$scope.shareLink = $$share.LINK.getLink(result.share.shareid);
						}
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.SHARE.addShare(resource,userList);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			}
		};
		$scope.sendWxChar = function(params){
			Wechat.isInstalled(function (installed) {
				if(!installed){
					service.showMsg("error","未检测到微信程序！");
				}else{
					var initParams = {
						resourceid: params.res.id,
						formString: JSON.stringify([]),
						folderid: $scope.getFolderId()
					};
					$$share.addShare(initParams,function(result){
						if(result.result == 1){
							var shareLink = $$share.LINK.getLink(result.share.shareid);
							var description = "来自掌文 " + service.getUser().username + "\n分享于:" + $$data.DATE.humanize();
							var message = {},media = {},scene=Wechat.Scene.SESSION;
							if(params.type == 'timeline') scene = Wechat.Scene.TIMELINE;
							//消息
							message.title = params.res.filename;
							//除了图片以外都是用图标
							var resource = params.res;
							if(resource.iontype == 'image'){
								message.thumb = $rootScope.dynamicITF.resource.imageMinPreview($rootScope.getCurrentDomainAddress()) + "/" + resource.id +"/" + $rootScope.USER.sessionid;
							}else{
								message.thumb = "www/img/filetype-bg/" + resource.iontype + ".png";
							}
							message.description = description;
							media.type = Wechat.Type.WEBPAGE;
							media.webpageUrl = shareLink;
							message.media = media;
							Wechat.share({"message": message,"scene": scene},function(){
								service.showMsg("info","微信分享成功");
							});
						} else if(result.result == 2){
							service.activeSessionProxy(function(){
								$scope.sendWxChar(params);
							});
						}
					});
				}
			}, function (reason) {
				service.showMsg("error",reason);
			});
		};
		/**
		 * 上传
		 * @param file 文件对象
		 * @param cover 覆盖
		 * @param successCallback 上传成功回调
		 */
		//TODO 待替换
		$scope.upload = function(file,cover,successCallback){
			if(file.size==0){
				service.showMsg("error","不能上传空文件!");
				return;
			}
			//文件格式处理
			var array = file.name.split(".");
			file.fileext = array[array.length-1];
			$$data.type(file);
			//创建任务
			var task = {
				id: Math.random(),
				folderid: $scope.getFolderId(),
				file: file
			};
			var user = $rootScope.USER;
			//开始上传
			var options = {
				url: $rootScope.dynamicITF.resource.addResource($rootScope.getCurrentDomainAddress()),
				data: {
					file: file,
					userid: user.id,
					sessionid: user.sessionid,
					folderid: $scope.getFolderId(),
					filesize: file.size
				}
			};

			//覆盖参数
			if(cover){
				options.data.type = 1;
			}
			//重命名
			if(file.filename){
				options.data.filename = file.filename;
			}
			task.upload = Upload.upload(options);
			//加入任务列
			$rootScope.taskList.push(task);
			task.upload.then(function (resp) { //resp:{config,data,headers}
				var result = resp.data;
				if(result.result == 1){ //成功
					if(successCallback){
						successCallback();
					}
					$scope.FOLDER.getFolder();
					service.showMsg("success",file.name+"上传成功");
				}else if(result.result == 2){ //session过期
					service.activeSessionProxy(function(){
						$scope.upload(file,cover,successCallback);
					});
				}else if(result.result == 5){ //没有权限
					service.showMsg("error", result.description);
				}else{
					service.showMsg("error",file.name+"上传失败");
				}
				//清除该上传任务
				$scope.removeTask(task.id);
			}, function (resp) {
				//清除该上传任务
				$scope.removeTask(task.id);
			}, function (evt) {
				task.progress = parseInt(100.0 * evt.loaded / evt.total);
			});
		};
		/**
		 *  流方式上传(android)（废弃）
		 */
		$scope.uploadWithStream = function(){
			$scope.scrollTop();
			$$widget.POPOVER.hide();
			if(!UPF.is("app")){return;}
			var $$mobile = $injector.get("$$mobile");
			var $cordovaFileTransfer = $$mobile.$cordovaFileTransfer;
			var options = {
				type: "PHOTOLIBRARY",
				mediaType: 2
			};
			$$mobile.openCamera(options,function(uri){
				var upload = function(filePath){
					var server = $rootScope.CONFIG.itf.app.ppan.mobileAddResource; //接口
					var filename = service.getMobileFileName(filePath);
					var task = {
						id: Math.random(),
						folderid: $scope.getFolderId(),
						file: {
							name: decodeURI(filename)
						}
					};
					//开启任务
					if(!$rootScope.taskList){
						$rootScope.taskList = [];
					}
					var options = {
						params: {
							filename: decodeURI(filename),
							folderid: $scope.getFolderId(),
							userid: $rootScope.USER.id,
							sessionid: $rootScope.USER.sessionid
						}
					};
					task.promise = $cordovaFileTransfer.upload(server,filePath,options);
					task.promise.then(function(result){
						var rest = JSON.parse(result.response);
						if(rest.result == 1){
							$scope.FOLDER.getFolder();
							service.showMsg("info","上传成功");
						} else if(rest.result == 2){
							service.activeSessionProxy(function(){
								upload(filePath);
							});
						} else {
							service.showMsg("error","上传文件失败,请重新上传");
						}
						//清除该上传任务
						$scope.removeTask(task.id);
					},function(error){
						//清除该上传任务
						$scope.removeTask(task.id);
						if(error.code == 4){return;} //FileTransferError.ABORT_ERR
						service.showMsg("error","上传文件失败!");
					},function(progress){
						task.progress = parseInt(progress.loaded / progress.total * 100.0);
					});
					//加入任务列
					$rootScope.taskList.push(task);
				};
				//判断是file:还是content
				var prePath = uri.split(":")[0];
				if(prePath == "file"){
					upload(uri);
				}else if(prePath == "content"){
					window.FilePath.resolveNativePath(uri, function(filePath){
						upload(filePath);
					},function(error){
						console.log(error);
					});
				}
			});
		}
		/** 外部文件上传*/
		$scope.uploadFromOther = function(filepath){
			if(filepath && $rootScope.USER.folderid == $scope.getFolderId()){
				delete $rootScope.externalData.file;
				$scope.scrollTop();
				var $$mobile = $injector.get("$$mobile");
				var $cordovaFileTransfer = $$mobile.$cordovaFileTransfer;
				var server = $rootScope.CONFIG.itf.app.ppan.mobileAddResource; //接口
				var filename = service.getMobileFileName(filepath);
				var options = {
					params: {
						filename: decodeURI(filename),
						folderid: $scope.getFolderId(),
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid
					}
				};
				//开启任务
				if(!$rootScope.taskList){
					$rootScope.taskList = [];
				}
				//创建任务
				var task = {
					id: Math.random(),
					folderid: $scope.getFolderId(),
					file: {
						name: decodeURI(filename)
					}
				};
				//上传
				task.promise = $cordovaFileTransfer.upload(server,filepath,options);
				task.promise.then(function(result){
					var rest = JSON.parse(result.response);
					if(rest.result == 1){
						$scope.FOLDER.getFolder();
						service.showMsg("info","上传成功");
					} else if(rest.result == 2){
						service.activeSessionProxy(function(){
							$scope.uploadFromOther(filepath);
						});
					} else {
						service.showMsg("error","上传文件失败,请重新上传");
					}
					//清除该上传任务
					$scope.removeTask(task.id);
				},function(error){
					service.showMsg("error","上传文件失败!");
					//清除该上传任务
					$scope.removeTask(task.id);
				},function(progress){
					task.progress = parseInt(progress.loaded / progress.total * 100.0);
				});
				//加入任务列
				$rootScope.taskList.push(task);
			}
		};
		/** 获取当前文件夹id*/
		$scope.getFolderId = function(){
			var folderid;
			if($stateParams.id){
				folderid = $stateParams.id;
			}else{
				folderid = $rootScope.USER.folderid;
			}
			return folderid;
		};
		/** 获取rootid*/
		$scope.getRootId = function(){
			if($stateParams.rootid){
				return $stateParams.rootid;
			}else{
				return $rootScope.USER.folderid;
			}
		};
		/** 终止任务*/
		$scope.confirmAbortTask = function(task){
			var options = {
				title: "提醒",
				template: "<center>确定要终止该任务么?</center>"
			};
			$$widget.POPUP.confirm(options)
				.then(function(result){
					if(result){
						//终止任务1(Upload方式)
						if(task.upload && task.upload.abort){
							task.upload.abort();
						}
						//终止任务2($cordovaTransfer方式)
						if(task.promise && task.promise.abort){
							task.promise.abort();
						}
						//移除
						$scope.removeTask(task.id);
					}
				})
		};
		/** 清除任务*/
		$scope.removeTask = function(taskId){
			//上传成功，在任务列表清除
			if($rootScope.taskList){
				for(var i=0;i<$rootScope.taskList.length;i++){
					var tk = $rootScope.taskList[i];
					if(tk.id == taskId){
						$rootScope.taskList.splice(i,1);
						return;
					}
				}
			}
		};
		/** ionContent滑动至顶部*/
		$scope.scrollTop = function(){
			$ionicScrollDelegate.$getByHandle("ppan").scrollTop(true);
		};
		/** 获取待审核文件数目*/
		$scope.getResourceAuditCount = function(){
			var inParams = {};
			$RESOURCE.RESOURCE.getResourceAuditCount(inParams,function(result){
				if(result.result == 1){
					$rootScope.resourceAuditCount = result.count;
				}else if(result.result == 2){
					$injector.get('service').activeSessionProxy(function(){
						$scope.getResourceAuditCount();
					});
				}else{
					console.error(result.description);
				}
			});
		};
		//IOS文件上传
		$scope.showIOSActionSheet = function(){
			$$widget.POPOVER.hide();
			var options = {
				cssClass: 'iosCameraActionSheet',
				buttons: [{
					text: '<i class="text">拍照或录像</i><i class="iconx ion-ios-camera"></i>'
				},{
					text: '<i class="text">照片图库</i><i class="iconx ion-ios-photos-outline"></i>'
				}],
				cancelText: '取消',
				buttonClicked: function(index){
					switch(index){
						case 0: //拍照
							$scope.openIosCamera('CAMERA');
							break;
						case 1: //从相册中选择
							$scope.openIosCamera('PHOTOLIBRARY');
							break;
					};
					return true;
				}
			};
			$injector.get('$ionicActionSheet').show(options);
		};
		/**
		 * ios相机
		 * @param type
		 */
		$scope.openIosCamera = function(type) {
			var $$mobile = $injector.get('$$mobile');
			//配置参数
			var options = {
				type: type,
				allowEdit: true,
				mediaType: 2, //所有媒体类型
				hasVideo: true //是否录制视频
			};

			if (UPF.is('ios')) {
				StatusBar.hide();
			}
			//打开相机/相册
			$$mobile.openCamera(options, function (uri) {
				successCallback(uri);
				if (UPF.is('ios')) {
					StatusBar.show();
				}
			}, function () {
				if (UPF.is('ios')) {
					StatusBar.show();
				}
			});
			var successCallback = function(uri){
				var $cordovaFileTransfer = $$mobile.$cordovaFileTransfer;
				var server = $rootScope.dynamicITF.app.ppan.mobileAddResource($rootScope.getCurrentDomainAddress());
				var user = $rootScope.USER;
				var fileName = service.getMobileFileName(uri);
				var options = {
					params: {
						userid: user.id,
						sessionid: user.sessionid,
						filename: fileName,
						folderid: $scope.getFolderId()
					}
				};
				//创建task
				var createTask = function(){
					if(!$rootScope.taskList){
						$rootScope.taskList = [];
					}
					var task = {
						id: Math.random(),
						folderid: $scope.getFolderId(),
						file: {
							name: decodeURI(fileName)
						}
					};

					var successCallback = function(res){
						var result = JSON.parse(res.response);
						if(result.result == 1){
							$scope.FOLDER.getFolder();
							service.showMsg("success",result.description);
						} else if(result.result == 2){
							service.activeSessionProxy(function(){
								createTask();
							});
						} else {
							service.showMsg("error",result.description);
						}
						//清除该上传任务
						$scope.removeTask(task.id);
					};
					var errorCallback = function(){
						service.showMsg("error",result.description);
						//清除该上传任务
						$scope.removeTask(task.id);
					};
					var onProgress = function(progress){
						task.progress = parseInt(progress.loaded / progress.total * 100.0);
					};
					task.promise = $cordovaFileTransfer.upload(server,uri,options);
					task.promise.then(successCallback,errorCallback,onProgress);
					//加入任务列
					$rootScope.taskList.push(task);
				};
				createTask();
			};
		}
		/** 监听全局点击*/
		$scope.$on("click",function(){
			//关闭打开组
			//资源
			if($scope.resource){
				angular.forEach($scope.resource.resources,function(resource){
					if(resource.showTool){
						resource.showTool = false;
					}
				});
				angular.forEach($scope.resource.folders,function(folder){
					if(folder.showTool){
						folder.showTool = false;
					}
				});
				$scope.$digest();
			}
		});
		/** VIEW enter*/
		$scope.$on("$ionicView.enter",function(){
			/** 初始化执行*/
			service.validUser(function(){
				if(!$scope.resource || $rootScope.refreshResource){
					$scope.FOLDER.getFolder();
					$rootScope.refreshResource = false;
				}
				if(UPF.is("APP") ){
					if ($rootScope.externalData){
						if ($rootScope.externalData.file){
							$scope.uploadFromOther($rootScope.externalData.file);
						}
					}
					if(!$$user.mobileContact.readed()){
						$$user.mobileContact.prompt();
					}
				}
				//获取未审核文件条目数
				$scope.getResourceAuditCount();
				if(!$rootScope.domains){
					$rootScope.getUserDomain();
				}
			});
		});
		/** device resume*/
		$scope.$on("resume",function(){
			if(UPF.is("APP") ){
				if ($rootScope.externalData){
					if ($rootScope.externalData.file){
						$scope.uploadFromOther($rootScope.externalData.file);
					}
				}
				if(!$$user.mobileContact.readed()){
					$$user.mobileContact.prompt();
				}
			}
		});
		/**
		 * 监听刷新通知
		 */
		$rootScope.$on('zw.refreshResource',function(e,data){
			$scope.FOLDER.getFolder();
		});
		//上传文件夹
		$scope.uploadFolder = function(files){
			if(files.length>0){
				$rootScope.fileUploadList = files;
				localStorage.fileUploadList = JSON.stringify(files);
				console.log(files);
				$injector.get('$state').go('uploadList',{folderid: $scope.getFolderId()});
			}

		}
	});