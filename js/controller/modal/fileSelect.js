/** 选择文件*/
angular.module("app")
	.controller("fileSelect",function($scope,$rootScope,service,$RESOURCE,$$share,$$data,$$widget,$$util,$injector){
		/** @dataPackage
		 * title 显示的标题
		 * org 额外获取企业文件
		 * rootid 根id
		 * excludes 排除
		 * hideResource 隐藏资源
		 * disableButton禁用确定按钮
		 * callback 操作完回调
		 */
		$scope.backList = []; //返回层级集合
		$scope.search = {}; //搜索资源
		/** 分页配置*/
		$scope.pageConfig = {
			resource: {
				start: 0, //查询开始
				pageSize: $rootScope.CONFIG.page.resource.pageSize, //查询数量
				hasMore: true, //是否还有
				lastId: null //验证id
			},
			search: {
				start: 0,
				pageSize: $rootScope.CONFIG.page.search.pageSize,
				hasMore: false,
				lastId: null
			}
		};
		/** 操作*/
		$scope.operate = function(params){
			/** 回退*/
			if(params.action == "back"){
				if($scope.backList.length>0){
					$scope.backList.pop();
					var folder = $scope.backList[$scope.backList.length-1];
					$scope.FOLDER.getFolder(folder);	
				}else{
					$$widget.MODAL.hide();
				}
			}
			/** 文件夹-点击*/
			else if(params.action == "clickFolder"){
				$scope.FOLDER.getFolder(params.folder,function(){
					$scope.backList.push(params.folder);
				});
				$scope.search.text = "";
			}
			/** 部门文件夹-点击*/
			else if(params.action == "clickDepartmentFolder"){
				$scope.FOLDER.getDeptFolder();
				$scope.search.text = "";
			}
			/** 资源点击*/
			else if(params.action == "clickResource"){
				//遍历查询资源
				angular.forEach($scope.resource.resources,function(resource){
					if(resource.id == params.resource.id){
						resource.checked = !resource.checked;
						if(resource.checked){
							$scope.disableBtn = false;
						}else{
							$scope.disableBtn = true;
						}
					}else{
						resource.checked = false;
					}
				});
				//遍历搜索资源
				angular.forEach($scope.search.resources,function(resource){
					if(resource.id == params.resource.id){
						resource.checked = !resource.checked;
						if(resource.checked){
							$scope.disableBtn = false;
						}else{
							$scope.disableBtn = true;
						}
					}else{
						resource.checked = false;
					}
				});
			}
			/** 关闭*/
			else if(params.type == "close"){
				$$widget.MODAL.remove();
			}
			/** 确定*/
			else if(params.action == "ensure"){
				//回调
				if($scope.dataPackage.callback){
					var data = {
						newFolderId: $scope.getFolderId(), //移动到的新文件夹id
						isaudit: $scope.isaudit, //文件夹是否需要审批
						competence: $scope.competence //当前用户对此文件夹的操作权限
					};
					if($scope.resource.resources){
						//获取选中的资源
						angular.forEach($scope.resource.resources,function(resource){
							if(resource.checked){
								resource.folderId = $scope.getFolderId(); //资源添加folderid
								data.resource = resource; //资源
							}
						});
					}
					$scope.dataPackage.callback(data);
				}
				//关闭modal
				$$widget.MODAL.hide();
			}
		};
		/** 文件体*/
		$scope.FOLDER = {
			/** 获取数据*/
			getFolder: function(folder,callback){
				var inParams = {
					start: 0,
					pagesize: $scope.pageConfig.resource.pageSize
				};
				if(folder && folder.id){
					inParams.folderid = folder.id;
				}else{
					inParams.folderid = $scope.getFolderId();
				}
				
				//额外获取企业文件
				if($scope.dataPackage.org){
					inParams.org = $scope.dataPackage.org;
					if(folder && folder.belongid){ //部门Id
						inParams.belongid = folder.belongid;
					}
				}
				$RESOURCE.FOLDER.getFolder(inParams,function(result){
					if(result.result == 1){ //查询成功
						//执行 进入文件夹/返回 回调函数
						if(callback){
							callback();
						}
						//文件夹类型(user,org,dept,group,chat)
						$scope.foldertype = result.foldertype;
						//当前文件夹是否需要审批
						$scope.isaudit = result.isaudit;
						//当前用户对该文件夹的操作权限
						$scope.competence = result.competence;
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
						//总数据对象
						if(!$scope.resource){
							$scope.resource = {};
						}
						//部门文件夹
						$scope.resource.gsize = result.sub.gsize;
						//权限
						$scope.resource.competence = result.competence;
						//排除文件夹
						if($scope.dataPackage.excludes && $scope.dataPackage.excludes.length>0){
							$scope.resource.folders = []; //加载文件夹
							//排除文件夹
							angular.forEach(result.sub.folders,function(folder){
								if($scope.dataPackage.excludes.indexOf(folder.id) == -1){
									$scope.resource.folders.push(folder);
								}
							});
						}else{
							$scope.resource.folders = result.sub.folders; //加载文件夹
						}
						//加载额外
						if($scope.dataPackage.org){
							$scope.resource.company = result.sub.company; //加载企业
							$scope.resource.gfolder = result.sub.gfolder; //加载部门
							$scope.resource.inbox = result.sub.inbox; //我收到的分享
							$scope.resource.public = result.sub.public; //部门公共文件夹
						}
						//显示资源
						if(!$scope.dataPackage.hideResource){
							//删除多加载的最后一个资源，保留id
							if(result.sub.resources.length == ($scope.pageConfig.resource.pageSize + 1)){
								$scope.pageConfig.resource.lastId = result.sub.resources.pop().id;
							}
							$scope.resource.resources = result.sub.resources; //加载资源
							//重设start
							$scope.pageConfig.resource.start = $scope.pageConfig.resource.pageSize;
							//开启上拉刷新 
							if(result.sub.resources.length > 0 && result.sub.resources.length == $scope.pageConfig.resource.pageSize){
								$scope.pageConfig.resource.hasMore = true;
							}
						}
						//禁用确定按钮
						if($scope.dataPackage.disableButton){
							if($scope.dataPackage.disableButton.indexOf($scope.getFolderId()) != -1){
								$scope.disableBtn = true;
							}else{
								$scope.disableBtn = false;
							}
						}else{
							$scope.disableBtn = false;
						}
						//scroll复位
						$injector.get('$ionicScrollDelegate').$getByHandle("fileSelect").scrollTop();
					}else if(result.result == 2){	//session过期，自动激活
						service.activeSessionProxy(function(){
							$scope.FOLDER.getFolder(folder,callback);
						});
					}else{	//查询失败
						service.showMsg("error",result.description);
					}
				});
			},
			/** 分页查询*/
			pagingForGetFolder: function(){
				var inParams = {
					folderid: $scope.getFolderId(),
					start: $scope.pageConfig.resource.start,
					pagesize: $scope.pageConfig.resource.pageSize,
					resid: $scope.pageConfig.resource.lastId
				};
				//额外获取企业文件
				if($scope.dataPackage.org){
					inParams.org = $scope.dataPackage.org;
					if($scope.dataPackage.belongid){ //部门Id
						inParams.belongid = $scope.dataPackage.belongid;
					}
				}
				$RESOURCE.FOLDER.getFolder(inParams,function(result){
					if(result.result == 1){ //查询成功
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
						//总数据对象
						if(!$scope.resource){
							$scope.resource = {};
						}
						//部门文件夹
						$scope.resource.gsize = result.sub.gsize;
						//权限
						$scope.resource.competence = result.competence;
						//加载文件夹
						if(!$scope.resource.folders){
							//排除文件夹
							if($scope.dataPackage.excludes && $scope.dataPackage.excludes.length>0){
								$scope.resource.folders = []; //加载文件夹
								//排除文件夹
								angular.forEach(result.sub.folders,function(folder){
									if($scope.dataPackage.excludes.indexOf(folder.id) == -1){
										$scope.resource.folders.push(folder);
									}
								});
							}else{
								$scope.resource.folders = result.sub.folders; //加载文件夹
							}
						}
						//加载额外
						if($scope.dataPackage.org){
							if(!$scope.resource.company){
								$scope.resource.company = result.sub.company; //加载企业
							}
							if(!$scope.resource.gfolder){
								$scope.resource.gfolder = result.sub.gfolder; //加载部门
							}
							if(!$scope.resource.inbox){
								$scope.resource.inbox = result.sub.inbox; //我收到的分享
							}
							if(!$scope.resource.public){ //部门公共文件夹
								$scope.resource.public = result.sub.public;
							}
						}
						//显示资源
						if(!$scope.dataPackage.hideResource){
							//表示有冲突
							if(result.type == 1){
								//删除多加载的最后一个资源，保留id
								if(result.sub.resources.length == ($scope.pageConfig.resource.pageSize + $scope.pageConfig.resource.start + 1)){
									$scope.pageConfig.resource.lastId = result.sub.resources.pop().id;
								}
								$scope.resource.resources = result.sub.resources;
								//重设下次的start
								$scope.pageConfig.resource.start += $scope.pageConfig.resource.pageSize;
							}else{
								//资源数据处理
								if(result.sub.resources && result.sub.resources.length>0){
									//删除多加载的最后一个资源，保留id
									if(result.sub.resources.length == ($scope.pageConfig.resource.pageSize + 1)){
										$scope.pageConfig.resource.lastId = result.sub.resources.pop().id;
									}
									if(!$scope.resource.resources){
										$scope.resource.resources = result.sub.resources; //加载资源
									}else{
										//非重复追加
										$$util.ARRAY.distinctPush($scope.resource.resources,result.sub.resources);
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
						}
						//隐藏资源
						else{
							//关闭上拉刷新
							$scope.pageConfig.resource.hasMore = false;
						}
						//控制确定按钮
						if($scope.dataPackage.disableButton){
							if($scope.dataPackage.disableButton.indexOf($scope.getFolderId()) != -1){ //
								$scope.disableBtn = true;
							}
							else{
								$scope.disableBtn = false;
							}
						}else{
							$scope.disableBtn = false;
						}
					}else if(result.result == 2){	//session过期，自动激活
						service.activeSessionProxy(function(){
							$scope.FOLDER.getFolder();
						});
					}else{	//查询失败
						$scope.pageConfig.resource.hasMore = false;
						service.showMsg("error",result.description);
					}
				},function(){
					$scope.pageConfig.resource.hasMore = false;
				},function(){
					$scope.$broadcast("scroll.infiniteScrollComplete"); //针对下拉式刷新
				});
			},
			/**
			 * 获取部门文件夹
			 */
			getDeptFolder: function(){
				var inParams = {
					folderid: $scope.getFolderId()
				};
				//发起请求
				$RESOURCE.FOLDER.getDeptFolder(inParams,function(result){
					if(result.result == 1){
						var folders = result.sub.folders; //部门文件夹列表
						//处理时间
						for(var i=0;i<folders.length;i++){
							var folder = folders[i];
							folder.updatetime = $$data.DATE.format(new Date(parseInt(folder.updatetime)),"yyyy-MM-dd hh:mm")
						}
						//装载
						$scope.resource = {
							folders: folders
						};
						//压入回退栈
						$scope.backList.push({id: $scope.getFolderId(),name: '部门文件夹'});
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.FOLDER.getDeptFolder();
						});
					}else{ //发生错误
						$injector.get('toastr').error(result.description);
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
					//scroll复位
					$injector.get('$ionicScrollDelegate').$getByHandle("fileSelect").scrollTop();
					return;
				}
				var inParams = {
					start: 0,
					pagesize: $scope.pageConfig.search.pageSize,
					txt: text,
					type: "resource",
					parentid: $scope.getFolderId()
				};
				$RESOURCE.SEARCH.search(inParams,function(result){
					if(text != $scope.search.text){ //预防中文拼音
						return;
					}
					if(result.result == 1){
						//文件夹处理
						$$data.oneDragonList(result.data.folders);
						//资源处理
						$$data.oneDragonList(result.data.resources);
						//资源
						if(!$scope.search){
							$scope.search = {};
						}
						//装载文件夹
						$scope.search.folders = result.data.folders;
						//显示资源
						if(!$scope.dataPackage.hideResource){
							//删除多加载的最后一个资源，保留id
							if(result.data.resources.length == ($scope.pageConfig.search.pageSize + 1)){
								$scope.pageConfig.search.lastId = result.data.resources.pop().id;
							}
							//装载资源
							$scope.search.resources = result.data.resources;
							//重置start
							$scope.pageConfig.search.start = $scope.pageConfig.search.pageSize;
							//开启上拉刷新
							if($scope.search.resources.length > 0 && $scope.search.resources.length == $scope.pageConfig.search.pageSize){
								$scope.pageConfig.search.hasMore = true;
							}
						}else{
							$scope.pageConfig.search.hasMore = false;
						}
						//scroll复位
						$injector.get('$ionicScrollDelegate').$getByHandle("fileSelect").scrollTop();
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
					parentid: $scope.getFolderId()
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
						//显示资源
						if(!$scope.dataPackage.hideResource){
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
								$$util.ARRAY.distinctPush($scope.search.resources,result.data.resources);
							}
							//取消上拉刷新
							if(result.data.resources.length < $scope.pageConfig.search.pageSize){
								$scope.pageConfig.search.hasMore = false;
							}else{
								//重设下次的start
								$scope.pageConfig.search.start += $scope.pageConfig.search.pageSize;
							}
						}else{
							$scope.pageConfig.search.hasMore = false;
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
		/** 监听搜索内容
		 * 一旦搜索 关闭资源分页
		 * 搜索内容为空 关闭搜索分页 
		 */
		$scope.$watch("search.text",function(newVal){
			if(!newVal){
				$scope.pageConfig.search.hasMore = false;
				$scope.pageConfig.resource.hasMore = true;
			}else{
				$scope.pageConfig.search.hasMore = true;
				$scope.pageConfig.resource.hasMore = false;
			}
		});
		/** 获取当前folderid*/
		$scope.getFolderId = function(){
			if($scope.backList.length>0){
				return $scope.backList[$scope.backList.length - 1].id;
			}else{
				return $scope.dataPackage.rootid;
			}
		};
		//压栈
		$scope.backList.push({id: $scope.getFolderId()});
	});