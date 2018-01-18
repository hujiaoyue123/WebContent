/** 搜索*/
angular.module("app")
	.controller("searchPan",function($scope,$rootScope,$RESOURCE,service,component,$stateParams,$$share,$$data,$$preview,$$widget,clipboard,$$util,$injector){
		/** @$stateParams
		 * folderid 文件夹id
		 * competence 文件夹下资源操作权限
		 * rootid 
		 * foldertype (user,org,dept,chat,group)区分当前搜索的是什么盘
		 */	
		$scope.$stateParams = $stateParams;
		$scope.search = {
			competence: $stateParams.competence
		}; //搜索
		/** 分页配置*/
		$scope.pageConfig = {
			search: {
				start: 0,
				pageSize: $rootScope.CONFIG.page.search.pageSize,
				hasMore: false,
				lastId: null
			}
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
			/** 点击下拉菜单*/
			if(params.type == "toolMenu"){
				//关闭其他
				//资源
				angular.forEach($scope.search.resources,function(resource){
					if(params.resource && resource.id == params.resource.id){
						params.resource.showTool = !params.resource.showTool;
					}else if(resource.showTool){
						resource.showTool = false;
					}
				});
				//文件夹
				angular.forEach($scope.search.folders,function(folder){
					if(params.folder && folder.id == params.folder.id){
						params.folder.showTool = !params.folder.showTool;
					}else if(folder.showTool){
						folder.showTool = false;
					}
				});
			}
			/** 文件夹-点击
			 * params.folder
			 */
			if(params.type == "clickFolder"){
				var inParams = {
					domain: $scope.getDomain(),
					id: params.folder.id, //文件id
					title: params.folder.name, //回退标题
					belongid: params.folder.belongid //部门id
				};
				service.$state.go("showPan",inParams);
			}
			/**
			 * 文件夹-详情
			 */
			else if(params.type == "folderInfo"){
				var inParams = {
					domain: $scope.getDomain(),
					id: params.folder.id,
					rootid: params.folder.rootid
				};
				$injector.get('$state').go('folderInfo',inParams);
			}
			/** 文件夹-重命名
			 * params.$event
			 * params.folder
			 */
			else if(params.type == "renameFolder"){ 
				//弹框-修改
				var options = {
					title: "重命名",
					defaultText: params.folder.name
				};
				$$widget.POPUP.prompt(options)
					.then(function(result){
						if(result && result !== params.folder.name){
							params.folder.name = result;
							$scope.FOLDER.updateFolder(params.folder);
						}
					});
			}
			/** 文件夹-移动
			 * params.$event
			 * params.folder
			 */
			else if(params.type == "moveFolder"){ 
				//数据包
				var dataPackage = {
					title: "移动文件夹",
					excludes: [params.folder.id],
					hideResource: true,
					disableButton: [params.folder.parentid],
					callback: function(data){
						var folder = {
							id: params.folder.id,
							folderid: params.folder.parentid,
							parentid: data.newFolderId
						};
						$scope.FOLDER.updateFolder(folder);
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
					if(resource.preview == 'image' || resource.preview == 'office' || resource.preview == 'pdf'){
						$scope.RESOURCE.preview(resource);
					}
					else if(resource.preview == 'zlt'){ //zlt文件
						var $state = $injector.get('$state');
						$state.go('zltFile',{folderid: resource.folderid,resourceid: resource.id});
					}
					//文本预览
					else if(resource.preview == 'txt'){
						var inParams = {
							domain: $scope.getDomain(),
							id: resource.id,
							filename: resource.filename,
							folderid: resource.folderid
						};
						$injector.get('$state').go('txtReader',inParams);
					}
					//视频预览
					else if(resource.preview == 'video' || resource.preview == 'audio'){
						//获取地址
						var inParams = {
							id: resource.id,
							folderid: resource.folderid
						};
						var mediaSrc = $RESOURCE.RESOURCE.download(inParams);
						var scope = $scope.$new(true);
						//媒体源
						scope.media = {
							type: resource.minetype,
							src: mediaSrc,
							name: resource.filename
						};
						//关闭Modal
						scope.closeModal = function () {
							scope.modal.remove();
						};
						//展现Modal
						$injector.get('$ionicModal').fromTemplateUrl('tpl/modal/mediaplayer.html',{scope: scope})
							.then(function (modal) {
								scope.modal = modal;
								scope.modal .show();
							})
					}
					//统计浏览
					var inParams = {
						resourceid: resource.id,
						folderid: resource.folderid
					};
					$RESOURCE.RESOURCE.readResource(inParams);
				}
				else{//不可预览
					$scope.operate({type: "fileDetail",resource: resource});
				}
			}
			/** 资源-详情
			 * params.$event
			 * params.resource
			 */
			else if(params.type == "fileDetail"){
				var inParams = {
					domain: $scope.getDomain(),
					id: params.resource.id,
					folderid: params.resource.folderid,
					rootid: $stateParams.rootid
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
			/** 资源-选择分享方式
			 * params.$event
			 * params.resource
			 */
			else if(params.type == "share"){
				$scope.showLinkPopup = true;   //显示分享入口
				$scope.showLinkPopupMlk = false; //不显示复制链接页
				$scope.showLinkPopupWxf = false; //不显示分享给微信好友
				$scope.tempResource = params.resource; //待分享资源
				var options = {
					title: "分享",
					scope: $scope,
					templateUrl: "tpl/popup/share.html", //选择分享方式
					buttons:[{
						text: "取消"
					}]
				};
				$$widget.POPUP.show(options);
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
			/** @deprecated
			 * 资源-分享(微信朋友/圈)
			 * params.resource
			 */
			else if(params.type == "wxfriend" || params.type == "wxtimeline"){
				$scope.showLinkPopup = false;
				$scope.showLinkPopupWxf = true;
				//处理与分享
				$scope.SHARE.addShare($scope.tempResource);
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
			/** 资源-分享(掌文朋友)
			 * params.resource
			 */
			else if(params.type == "zwfriend"){
				$$widget.POPUP.close(); //关闭Popup
				var initParam = {
					excludes: $rootScope.USER.id,
					range: "all"
				};
				$$widget.MODAL.selectUser(initParam, function(data){
					var formString = [];
					angular.forEach(data,function(obj){
						if(obj.type == 1 || obj.type == 0){
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
						folderid: $scope.tempResource.folderid
					};
					$$share.addShare(shareParam,function(result){
						if(result.result == 1){
							service.showMsg("info",result.description);
						} else if(result.result == 2){
							service.activeSessionProxy(function(){
								$scope.operate(params);
							});
						} else {
							service.showMsg("error",result.description);
						}
					});
				});
			}
		};
		/** 分享到微信*/
		$scope.sendWxChar = function(params){
			Wechat.isInstalled(function (installed) {
				if(!installed){
					service.showMsg("error","未检测到微信程序！");
				}else{
					var initParams = {
						resourceid: params.res.id,
						formString: JSON.stringify([]),
						folderid: $stateParams.folderid
					};
					$$share.addShare(initParams,function(result){
						if(result.result == 1){
							var shareLink = $$share.LINK.getLink(result.share.shareid);
							$$data.oneDragonList(params.res);
							var description = "来自掌文 " + service.getUser().username + "\n分享于:" + $$data.DATE.humanize();
							var message = {},media = {},scene=Wechat.Scene.SESSION;
							if(params.type == 'timeline') scene = Wechat.Scene.TIMELINE;
							//消息
							message.title = params.res.filename;
							//除了图片以外都是用图标
							var resource = params.res;
							if(resource.iontype == 'image'){
								message.thumb = params.res.src;
							}else{
								message.thumb = "www/img/filetype-bg/" + resource.iontype + ".png";
							}
							message.description = description;
							media.type = Wechat.Type.WEBPAGE;
							media.webpageUrl = shareLink;
							message.media = media;
							Wechat.share({"message": message,"scene": scene},function(){
								service.showMsg("info","微信分享成功");
							},function(reason){
								service.showMsg("error",reason);
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
		/** 文件体*/
		$scope.FOLDER = {
			/** 修改文件夹
			 * updateFile{id,title}
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
							$$util.ARRAY.update($scope.search.folders, updateFolder); //修改array里的对象
						}else if(updateFolder.parentid){ //移动
							$scope.SEARCH.searchResource($scope.search.text);
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.FOLDER.updateFolder(updateFolder);
						});
					}else{
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
				params.deleteString = JSON.stringify([{id: folder.id}]);
				//执行删除
				$RESOURCE.FOLDER.deleteFolder(params,function(result){
					if(result.result == 1){//删除成功
						$$util.ARRAY.remove($scope.search.folders, folder); //修改array里的对象
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
		/** 资源体*/
		$scope.RESOURCE = {
			/** 资源修改
			 * updateFile{id,title}
			 */
			updateResource: function(updateRes){
				var inParams = {};
				var resource =  [{
					id: updateRes.id,
					folderid: updateRes.folderid
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
							$$util.ARRAY.update($scope.search.resources, updateRes); //修改array里的对象
						}else if(updateRes.newfolderid){ //移动
							$scope.SEARCH.searchResource($scope.search.text); //刷新
						}
						$rootScope.refreshResource = true;
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
				var resources = [{
					id: resource.id,
					folderid: resource.folderid
				}];
				inParams.deleteString = JSON.stringify(resources);
				//执行删除
				$RESOURCE.RESOURCE.deleteResource(inParams,function(result){
					if(result.result == 1){//删除成功
						$$util.ARRAY.remove($scope.search.resources, resource); //修改array里的对象
						$rootScope.refreshResource = true;
						//清除缓存
						if(UPF.is('app')){
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
					folderid: resource.folderid
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
					formString: JSON.stringify(userList || []),
					folderid: resource.folderid
				};
				$$share.addShare(inParams,function(result){
					if(result.result == 1){
						if(userList){ //分享给好友
							service.showMsg("success",result.description);
						}else{ //单纯复制链接
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
		/** 搜索体*/
		$scope.SEARCH = {
			/** 搜索资源
			 * text 搜索内容 $scope.search.text
			 */
			searchResource: function(text){
				if(!text){
					//滚动条回至顶部
					$injector.get('$ionicScrollDelegate').$getByHandle('searchPanScrollDelegate').scrollTop();
					return;
				}
				var inParams = {
					start: 0,
					pagesize: $scope.pageConfig.search.pageSize,
					txt: text,
					type: "resource",
					parentid: $stateParams.folderid
				};
				$RESOURCE.SEARCH.search(inParams,function(result){
					if(text != $scope.search.text){ //预防中文拼音
						return;
					}
					if(result.result == 1){
						//滚动条回至顶部
						$injector.get('$ionicScrollDelegate').$getByHandle('searchPanScrollDelegate').scrollTop();
						//搜索资源
						if(!$scope.search){
							$scope.search = {};
						}
						var resources = result.data.resources;
						var folders = result.data.folders;
						//文件夹处理
						if(folders){
							$$data.oneDragonList(folders);
							//装载文件夹
							$scope.search.folders = folders;
						}
						//资源处理
						if(resources){
							$$data.oneDragonList(resources);
							//删除多加载的最后一个资源，保留id
							if(resources.length == ($scope.pageConfig.search.pageSize + 1)){
								$scope.pageConfig.search.lastId = resources.pop().id;
							}
							//装载资源
							$scope.search.resources = resources;
							//重置start
							$scope.pageConfig.search.start = $scope.pageConfig.search.pageSize;
							//开启上拉刷新
							if(resources.length > 0 && resources.length == $scope.pageConfig.search.pageSize){
								$scope.pageConfig.search.hasMore = true;
							}
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.SEARCH.searchResource(text);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			},
			/** 分页搜索*/
			pagingForSearchResource: function(){
				if(!$scope.search.text){
					$scope.$broadcast("scroll.infiniteScrollComplete"); //针对下拉式刷新
					return;
				}
				var inParams = {
					start: $scope.pageConfig.search.start,
					pagesize: $scope.pageConfig.search.pageSize,
					genericid: $scope.pageConfig.search.lastId,
					txt: $scope.search.text,
					type: "resource",
					parentid: $stateParams.folderid
				};
				$RESOURCE.SEARCH.search(inParams,function(result){
					if(result.result == 1){
						//文件夹处理
						$$data.oneDragonList(result.data.folders);
						//资源处理
						$$data.oneDragonList(result.data.resources);
						//资源
						if(!$scope.search){
							$scope.search = {};
						}
						//文件夹
						if(!$scope.search.folders){
							$scope.search.folders = result.data.folders; //装载文件夹
						}
						//删除多加载的最后一个资源，保留id
						if(result.data.resources.length == ($scope.pageConfig.search.pageSize + $scope.pageConfig.search.start + 1)){
							$scope.pageConfig.search.lastId = result.data.resources.pop().id;
						}
						//表示有冲突
						if(result.data.type == 1){
							$scope.search.resources = result.data.resources; //装载资源
						}
						//资源
						else if(result.data.resources && result.data.resources.length>0){
							if(!$scope.search.resources){
								$scope.search.resources = [];
							}
							//非重复追加
							$$util.ARRAY.distinctPush($scope.search.resources, result.data.resources);
						}
						//取消上拉刷新
						if(result.data.resources.length < $scope.pageConfig.search.pageSize){
							$scope.pageConfig.search.hasMore = false;
						}else{
							//重设下次的start
							$scope.pageConfig.search.start += $scope.pageConfig.search.pageSize;
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.SEARCH.searchResource();
						});
					}
				},function(){
					$scope.pageConfig.search.hasMore = false;
				},function(){
					$scope.$broadcast("scroll.infiniteScrollComplete"); //针对下拉式刷新
				});
			}
		};
		/** 视图进入*/
		$scope.$on("$ionicView.enter",function(){
			$scope.SEARCH.searchResource($scope.search.text);
			if ($scope.autofocus){
				$scope.autofocus();
			}
		});
		/** 监听全局点击*/
		$scope.$on("click",function(){
			//关闭打开组
			//资源
			if($scope.search && $scope.search.resources || $scope.search.folders){
				angular.forEach($scope.search.resources,function(resource){
					if(resource.showTool){
						resource.showTool = false;
					}
				});
				angular.forEach($scope.search.folders,function(folder){
					if(folder.showTool){
						folder.showTool = false;
					}
				});
				$scope.$digest();
			}
		});
	});