angular.module("app")
	.controller("helpCtrl",function($rootScope,$scope,$RESOURCE,service,$$data,$stateParams){
		$scope.folderId = "";
		if($stateParams.folderid){
			$scope.folderId = $stateParams.folderid;
		}
		if($stateParams.title){
			$scope.title = $stateParams.title;
		}
		var init = function(){
			if($scope.folderId == ""){
				$scope.getDictionary();
			}
		};
		$scope.getDictionary = function(){
			service.getDictionary("defaultHelpFolderId",function(result){
				if(result.result == 1){
					$scope.folderId = result.defaultHelpFolderId;
					$scope.getFolder();
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function(){
						$scope.getDictionary();
					});
				}else{	//查询失败
					service.showMsg("error",result.description);
				}
			});
		};
		$scope.getFolder = function(folderid){
			var params = {};
			if(folderid){ //传入id
				params.folderid = folderid;
			}else{ //根级
				params.folderid = $scope.folderId;
			}
			$RESOURCE.FOLDER.getFolder(params,function(result){
				if(result.result == 1){ //查询成功
					//文件夹数据处理
					$$data.oneDragonList(result.sub.folders);
					//资源数据处理
					$$data.oneDragonList(result.sub.resources);
					$scope.resource = result.sub; //加入数据
					$scope.$broadcast("scroll.refreshComplete");  //针对下拉式刷新
				}else if(result.result == 2){	//session过期，自动激活
					service.activeSessionProxy(function(){
						$scope.getFolder(folderid);
					});
				}else{	//查询失败
					service.showMsg("error",result.description);
				}
			});
		};
		$scope.operate = function(params){
			//点击文件夹
			if(params.type == "clickFolder"){
				var inParams = {
					folderid: params.folder.id,
					title: params.folder.name
				};
				service.$state.go("help",inParams);
			}
			//点击文件
			else if(params.type == "clickResource"){
				var inParams = {};
				inParams.url = $rootScope.CONFIG.itf.resource.previewResource+"/"+params.resource.id+"/html"; //userid
				service.$state.go("showPage",inParams);
			}
		};
		/** VIEW enter*/
		$scope.$on("$ionicView.enter",function(){
			/** 初始化执行*/
			service.validUser(init);
		});
		
	});