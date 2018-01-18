/**
 * 文件夹详情
 */
angular.module('app')
.controller('folderInfo',function($scope,$rootScope,$stateParams,$injector,$RESOURCE){
	/** $stateParams
	 * id 文件夹id(查询文件夹详情)
	 * rootid 文件夹(匹配权限)
	 */
	var service = $injector.get('service');
	var $ionicHistory = $injector.get('$ionicHistory');
	var $$widget = $injector.get('$$widget');
	/**
	 * 文件夹-重命名
	 */
	$scope.renameFolder = function(folder){
		var options = {
			title: "重命名",
			defaultText: folder.name
		};
		$$widget.POPUP.prompt(options)
			.then(function(result){
				if(result && result != folder.name){
					var updateFolder = {
						id: folder.id,
						name: result
					};
					$scope.FOLDER.updateFolder(updateFolder);
				}
			});
	};
	/**
	 * 文件夹-移动
	 */
	$scope.moveFolder = function(folder){
		//数据包
		var dataPackage = {
			title: "移动文件夹",
			rootid: folder.rootid,
			excludes: [folder.id],
			hideResource: true,
			disableButton: [folder.parentid],
			callback: function(data){
				var successCallback = function(){
					var newFolder = {
						id: folder.id,
						folderid: folder.parentid,
						parentid: data.newFolderId
					};
					//执行修改
					$scope.FOLDER.updateFolder(newFolder);
				};
				//判断是否提醒审核以及后续操作
				var params = {
					folderid: data.newFolderId
				};
				$injector.get('service').checkFolderAudit(params,successCallback);
			}
		};
		//打开modal
		$injector.get('$$widget').MODAL.fileSelect($scope,dataPackage);
	};
	/**
	 * 文件夹-删除
	 */
	$scope.deleteFolder = function(folder){
		var options = {
			title: "提醒",
			template: "<p style='text-align:center;'>确定删除该文件夹?</p>"
		};
		$$widget.POPUP.confirm(options)
			.then(function(result){
				if(result){
					$scope.FOLDER.deleteFolder(folder);
				}
			});
	};
	/**
	 * 修改公开
	 */
	$scope.setPublic = function(folder){
		var updateFolder = {
			id: folder.id,
			public: folder.public
		};
		$scope.FOLDER.updateFolder(updateFolder);
	};
	/**
	 * 修改审批
	 */
	$scope.setAudit = function(folder){
		var updateFolder = {
			id: folder.id,
			audit: folder.audit
		};
		$scope.FOLDER.updateFolder(updateFolder);
	};
	/**
	 * 审核文件夹
	 * @param type 'pass/refuse'
	 */
	$scope.auditFolder = function(type){
		var folder = $scope.folder;
		var updateFolder = {
			id: folder.id
		};
		if(type == 'pass'){
			updateFolder.isaudit = 0;
		}else if(type == 'refuse'){
			updateFolder.isaudit = -1;
		}
		//修改成功回调
		var successCallback = function(){
			//发送消息
			var inParams = {
				to: folder.createuserid,
				from: $rootScope.USER.id,
				type: 'folder',
				id: folder.id,
				rootid: folder.rootid,
				filename: folder.name,
				icon: folder.src,
				isaudit: updateFolder.isaudit
			};
			if(updateFolder.isaudit == 0){
				inParams.title = '[审核通过] ' + folder.name;
			}else if(updateFolder.isaudit == -1){
				inParams.title = '[审核失败] ' + folder.name;
			}
			sendMessage(inParams);
			$injector.get('$ionicHistory').goBack();
		};
		//执行修改
		$scope.FOLDER.updateFolder(updateFolder,successCallback);
	};
	/**
	 * 发送通知
	 * @param params{userid,id,folderid,isaudit,filename,src,title}
	 */
	var sendMessage = function(params){
		var $$chat = $injector.get('$$chat');
		var message = {
			to: params.to,
			from: params.from,
			msg: "[auditfile]",
			type: 'chat',
			msgType: 'auditfile',
			ext: {
				ext: params
			}
		};
		//发送消息
		$$chat.sendMsg(message);
		//本地保存
		$$chat.addMsg(message);
	};
	/**
	 * 是否显示权限功能
	 */
	$scope.showCompetence = function(){
		if($stateParams.rootid && $rootScope.USER.folderid != $stateParams.rootid){ //自己的文件夹不显示
			return true;
		}else{
			return false;
		}
	};
	/**
	 * 进入文件库
	 */
	$scope.enterShowPan = function(folder){
		var inParams = {
			domain: $scope.getDomain(),
			id: folder.id,
			title: folder.name,
			rootid: folder.rootid
		};
		$injector.get('$state').go('showPan',inParams);
	};
	/** 文件夹*/
	$scope.FOLDER = {
			/**
			 * 获取文件夹详情
			 */
			getFolderInfo: function(folderid){
				var inParams = {
					folderid: folderid? folderid : $stateParams.id
				};
				$RESOURCE.FOLDER.getFolderInfo(inParams,function(result){
					if(result.result == 1){
						var folder = result.data;
						//处理图标
						if(folder.foldertype == 'chat'){
							folder.src = 'img/filetype/folder-org.png';
						}else if(folder.foldertype == 'group'){
							folder.src = 'img/filetype/folder-user.png';
						}else{
							if($rootScope.USER.folderid == folder.rootid){
								folder.src = 'img/filetype/folder-user.png';
							}else{
								folder.src = 'img/filetype/folder-org.png';
							}
						}
						//处理日期
						var createtime = $injector.get('$$data').DATE.format(new Date(parseInt(folder.createtime)),'yyyy-MM-dd hh:mm');
						folder.createtime = createtime;
						//文件位置
						if(folder.path){
							var path = JSON.parse(folder.path);
							folder.pathList = path;
						}
						//装载数据
						$scope.folder = folder;
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.FOLDER.getFolderInfo(folderid);
						});
					}else{
						$injector.get('toastr').error(result.description);
					}
				});
			},
			/** 修改文件夹
			 * updateFile{id,name,parentid}
			 */
			updateFolder: function(updateFolder,successCallback){
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
				if(updateFolder.public == 0 || updateFolder.public){ //公开
					folder[0].public = updateFolder.public;
				}
				if(updateFolder.audit == 0 ||updateFolder.audit){ //审批
					folder[0].audit = updateFolder.audit;
				}
				if(updateFolder.isaudit == 0 || updateFolder.isaudit){ //通过/决绝审批
					folder[0].isaudit = updateFolder.isaudit;
				}
				inParams.updateString = JSON.stringify(folder);
				//执行修改
				$RESOURCE.FOLDER.updateFolder(inParams,function(result){
					if(result.result == 1){
						if(successCallback){
							successCallback();
						}else{
							//刷新
							$scope.FOLDER.getFolderInfo(updateFolder.id);
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.FOLDER.updateFolder(updateFolder);
						});
					}else{
						//设置权限toggle出错，复位
						$scope.FOLDER.getFolderInfo(updateFolder.id);
						service.showMsg("error",result.description);
					}
				});
			},
			/** 删除文件夹
			 * folder
			 */
			deleteFolder: function(folder){
				//封装参数
				var params = {
					deleteString: JSON.stringify([{id: folder.id}])
				};
				//执行删除
				$RESOURCE.FOLDER.deleteFolder(params,function(result){
					if(result.result == 1){//删除成功
						$ionicHistory.goBack();
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
	/** 视图进入*/
	$scope.$on('$ionicView.enter',function(){
		$scope.FOLDER.getFolderInfo();
	});
});