/**
 * Created by hx on 2017/3/3.
 */
angular.module('app')
.controller('trash',function ($scope,$rootScope,$RESOURCE,$injector,$stateParams) {
    $scope.pageConfig = {
        start: 0, //查询开始
        pageSize: $rootScope.CONFIG.page.resource.pageSize, //查询数量
        hasMore: false, //是否还有
        lastId: null //验证id
    };
    $scope.sort = {type: 'date'}; //默认名称排序
    /**
     * 下拉刷新
     */
    $scope.onUpRefresh = function () {
        $scope.FOLDER.getFolder();
    };
    /**
     * 上拉刷新
     */
    $scope.onDownRefresh = function () {
        $scope.FOLDER.pagingForGetFolder();
    };
    $scope.toggleMenu = function (obj,$event) {
        if($event){
            $event.stopPropagation();
        }
        //资源
        angular.forEach($scope.resource.resources,function(resource){
            if(resource.id == obj.id){
                obj.showTool = !obj.showTool;
            }else if(resource.showTool){
                resource.showTool = false;
            }
        });
        //文件夹
        angular.forEach($scope.resource.folders,function(folder){
            if(folder.id == obj.id){
                obj.showTool = !obj.showTool;
            }else if(folder.showTool){
                folder.showTool = false;
            }
        });
    };
    /**
     * 显示操作ActionSheet
     * @param params
     */
    $scope.showOperateActionSheet = function (params) {
        $injector.get('$ionicActionSheet').show({
            titleText: '选择操作方式',
            buttons: [{
                text: '还原'
            }],
            destructiveText: '删除',
            buttonClicked: function (index) {
                if(index == 0){
                    if(params.type == 'folder'){
                        $scope.FOLDER.recoverFolder(params.folder);
                    }else if(params.type == 'resource'){
                        $scope.RESOURCE.recoverResource(params.resource);
                    }
                    return true;
                }
            },
            destructiveButtonClicked: function () {
                if(params.type == 'folder'){
                    $scope.POPUP.deleteFolder(params.folder)
                }else if(params.type == 'resource'){
                    $scope.POPUP.deleteResource(params.resource)
                }
                return true;
            }
        })
    };
    $scope.POPUP = {
        /**
         * 初始化
         * @param tip
         * @param callback
         */
        init: function (tip,callback) {
          var options = {
              title: '提醒',
              template: '<center>'+ tip +'</center>',
              okText: '确定',
              cancelText: '取消'
          };
          $injector.get('$ionicPopup').confirm(options)
              .then(function (res) {
                  if(res && callback){
                      callback();
                  }
              });
        },
        /**
         * 删除文件夹
         * @param folder
         */
        deleteFolder: function (folder) {
            this.init('确定要永久删除此文件夹？',function () {
                $scope.FOLDER.deleteFolder(folder);
            });
        },
        /**
         * 删除资源
         * @param resource
         */
        deleteResource: function (resource) {
            this.init('确定要永久删除此文件？',function () {
                $scope.RESOURCE.deleteResource(resource);
            });
        },
        /**
         * 选择文件夹
         */
        selectFolder: function (successCallback) {
            this.init('原始文件夹不存在，只能重新选择文件夹。',function () {
                $scope.selectFolder(successCallback);
            });
        }
    };
    /**
     * 选择文件夹
     * @param successCallback
     */
    $scope.selectFolder = function (successCallback) {
        //数据包
        var dataPackage = {
            title: "选择文件夹",
            rootid: $scope.currentFolder.rootid,
            hideResource: true,
            callback: function(data){
                //判断是否提醒审核以及后续操作
                var params = {
                    folderid: data.newFolderId
                };
                $injector.get('service').checkFolderAudit(params,function () {
                    successCallback && successCallback(data.newFolderId);
                });
            }
        };
        //打开modal
        $injector.get('$$widget').MODAL.fileSelect($scope,dataPackage);
    };
    $scope.FOLDER = {
        /**
         * 查询文件夹
         * @param folderid
         * @param finalCallback
         */
        getFolder: function(folderid,finalCallback){
            //封装参数
            var params = {
                start: 0,
                pagesize: $scope.pageConfig.pageSize
            };
            if(folderid){ //传入id
                params.folderid = folderid;
            }else{ //根级
                params.folderid = $scope.getFolderId();
            }
            //排序方式
            params.sort = $scope.sort.type;
            //数据处理
            $RESOURCE.FOLDER.getFolder(params,function(result){
                if(result.result == 1){ //查询成功
                    //当前文件夹信息
                    $scope.currentFolder = result.folder;
                    //文件夹类型(user,org,dept,group,chat)
                    $scope.foldertype = result.foldertype;
                    //当前用户对该文件夹的操作权限
                    $scope.competence = result.competence;
                    //文件夹数据处理
                    $injector.get('$$data').oneDragonList(result.sub.folders);
                    //资源数据处理
                    $injector.get('$$data').oneDragonList(result.sub.resources);
                    //资源
                    $scope.resource = {};
                    //文件夹列表
                    $scope.resource.folders = result.sub.folders;
                    //删除多加载的最后一个资源，保留id
                    if(result.sub.resources.length == ($scope.pageConfig.pageSize + 1)){
                        $scope.pageConfig.lastId = result.sub.resources.pop().id;
                    }
                    /** 获取并缓存图片缩略图*/
                    if(UPF.is("app") && $rootScope.localConfig.cacheImage){
                        var offline = $injector.get("$$mobile").offline;
                        offline.loadLocalImageThumb(result.sub.resources);
                    }
                    //资源文件
                    $scope.resource.resources = result.sub.resources;
                    //重设start
                    $scope.pageConfig.start = $scope.pageConfig.pageSize;
                    //开启上拉刷新
                    if(result.sub.resources.length == $scope.pageConfig.pageSize){
                        $scope.pageConfig.hasMore = true;
                        $scope.FOLDER.pagingForGetFolder();
                    }
                }else if(result.result == 2){	//session过期，自动激活
                    $injector.get('service').activeSessionProxy(function(){
                        $scope.FOLDER.getFolder(folderid);
                    });
                }else{	//查询失败
                    $injector.get('toastr').error(result.description);
                }
            },null,function(){
                $scope.requestComplete = true; //请求完毕
                $scope.$broadcast("scroll.refreshComplete");  //针对下拉式刷新
                //执行完毕回掉
                finalCallback && finalCallback();
            });
        },
        /**
         * 分页查询文件夹
         */
        pagingForGetFolder: function(){
            //封装参数
            var params = {
                folderid: $scope.getFolderId(),
                start: $scope.pageConfig.start,
                pagesize: $scope.pageConfig.pageSize,
                resid: $scope.pageConfig.lastId
            };
            //数据处理
                $RESOURCE.FOLDER.getFolder(params,function(result){
                if(result.result == 1){ //查询成功
                    //文件夹数据处理
                    $injector.get('$$data').oneDragonList(result.sub.folders);
                    //资源数据处理
                    $injector.get('$$data').oneDragonList(result.sub.resources);
                    //总资源
                    if(!$scope.resource){
                        $scope.resource = {};
                    }
                    //文件夹
                    if(!$scope.resource.folders){
                        $scope.resource.folders = result.sub.folders;
                    }
                    //部门文件夹
                    $scope.resource.competence = result.competence; //权限
                    //表示有冲突
                    if(result.type == 1){
                        //删除多加载的最后一个资源，保留id
                        if(result.sub.resources.length == ($scope.pageConfig.pageSize + $scope.pageConfig.start + 1)){
                            $scope.pageConfig.lastId = result.sub.resources.pop().id;
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
                            if(result.sub.resources.length == ($scope.pageConfig.pageSize + 1)){
                                $scope.pageConfig.lastId = result.sub.resources.pop().id;
                            }
                            /** 获取并缓存图片缩略图*/
                            if(UPF.is("app") && $rootScope.localConfig.cacheImage){
                                var offline = $injector.get("$$mobile").offline;
                                offline.loadLocalImageThumb(result.sub.resources);
                            }
                            //非重复追加
                            $injector.get('$$util').ARRAY.distinctPush($scope.resource.resources,result.sub.resources);
                        }
                    }
                    //取消上拉刷新
                    if(result.sub.resources.length < $scope.pageConfig.pageSize){
                        $scope.pageConfig.hasMore = false;
                    }else{
                        //重设下次的start
                        $scope.pageConfig.start += $scope.pageConfig.pageSize;
                    }
                }else if(result.result == 2){	//session过期，自动激活
                    $injector.get('service').activeSessionProxy(function(){
                        $scope.FOLDER.pagingForGetFolder();
                    });
                }else{	//查询失败
                    $scope.pageConfig.hasMore = false;
                    $injector.get('toastr').error(result.description);
                }
            },function(){
                $scope.pageConfig.hasMore = false;
            },function(){
                $scope.$broadcast("scroll.infiniteScrollComplete");  //针对上拉式刷新
            });
        },
        /**
         * 还原文件夹
         * @param folder
         */
        recoverFolder: function(folder) {
            var params = {
                folderid: folder.id
            };
            $RESOURCE.FOLDER.recoverFolder(params,function (result) {
                if(result.result == 1){
                    $injector.get('$$util').ARRAY.remove($scope.resource.folders, folder); //修改array里的对象
                }else if(result.result == 2){
                    $injector.get('service').activeSessionProxy(function () {
                       $scope.FOLDER.recoverFolder(folder);
                    });
                }else if(result.result == 6){
                    $scope.POPUP.selectFolder(function (newFolderid) {
                        var inParams = {
                            id: folder.id,
                            parentid: newFolderid
                        };
                        $scope.FOLDER.updateFolder(inParams,function () {
                            $injector.get('$$util').ARRAY.remove($scope.resource.folders, folder); //修改array里的对象
                        });
                    });
                }else{
                    $injector.get('toastr').error(result.description);
                }
            });
        },
        /**
         * 更改文件夹
         * @param params
         * @param successCallback
         */
        updateFolder: function(params,successCallback){
            var inParams = {
                updateString: JSON.stringify([params])
            };
            //执行修改
            $RESOURCE.FOLDER.updateFolder(inParams,function(result){
                if(result.result == 1){
                    successCallback && successCallback();
                }else if(result.result == 2){
                    $injector.get('service').activeSessionProxy(function(){
                        $scope.FOLDER.updateFolder(params,successCallback);
                    });
                }else{
                    $injector.get('toastr').error(result.description);
                }
            });
        },
        /**
         * 删除文件夹
         * @param folder
         */
        deleteFolder: function(folder){
            //封装参数
            var params = {
                type: 'delete' //从回收站彻底删除
            };
            params.deleteString = JSON.stringify([{id: folder.id}]);
            //执行删除
            $RESOURCE.FOLDER.deleteFolder(params,function(result){
                if(result.result == 1){//删除成功
                    $injector.get('$$util').ARRAY.remove($scope.resource.folders, folder); //修改array里的对象
                }else if(result.result == 2){ //session过期
                    $injector.get('service').activeSessionProxy(function(){
                        $scope.FOLDER.deleteFolder(folder);
                    });

                }else{
                    $injector.get('toastr').error(result.description);
                }
            });
        }
    };

    $scope.RESOURCE = {
        /**
         * 还原资源
         * @param resource
         */
        recoverResource: function (resource) {
            var inParams = {
                resourceid: resource.id,
                folderid: $scope.getFolderId()
            };
            $RESOURCE.RESOURCE.recoverResource(inParams,function (result) {
                if(result.result == 1){
                    $injector.get('$$util').ARRAY.remove($scope.resource.resources, resource); //修改array里的对象
                }else if(result.result == 2){
                    $injector.get('service').activeSessionProxy(function () {
                        $scope.RESOURCE.recoverResource(resource);
                    });
                }else if(result.result == 6){ //原始文件夹不存在
                    $scope.POPUP.selectFolder(function (newFolderid) {
                        var params = {
                            type: 'move',
                            id: resource.id,
                            folderid: $scope.currentFolder.id,
                            newfolderid: newFolderid
                        };
                        $scope.RESOURCE.updateResource(params,function () {
                            $injector.get('$$util').ARRAY.remove($scope.resource.resources, resource); //移除array里的对象
                        })
                    });
                }else{
                    $injector.get('toastr').error(result.description);
                }
            });
        },
        /**
         * 修改资源
         * @param params
         * @param successCallback
         */
        updateResource: function(params,successCallback) {
            var inParams = {
                type: params.type
            };
            inParams.updateString = JSON.stringify([params]);
            //执行修改
            $RESOURCE.RESOURCE.updateResource(inParams,function (result) {
                if (result.result == 1) {
                    if (successCallback) {
                        successCallback();
                    }
                } else if (result.result == 2) {
                    $injector.get('service').activeSessionProxy(function () {
                        $scope.RESOURCE.updateResource(params, successCallback);
                    });
                } else {
                    $injector.get('toastr').error(result.description);
                }
            })
        },
        /**
         * 删除资源
         * @param resource
         */
        deleteResource: function(resource){
            //封装参数
            var inParams = {
                type: 'delete'
            };
            inParams.deleteString = JSON.stringify([{id: resource.id,folderid: $scope.getFolderId()}]);
            //执行删除
            $RESOURCE.RESOURCE.deleteResource(inParams,function(result){
                if(result.result == 1){//删除成功
                    $injector.get('$$util').ARRAY.remove($scope.resource.resources, resource); //移除array里的对象
                    //清除缓存
                    if(UPF.is("app")){
                        var offline = $injector.get('$$mobile').offline;
                        offline.clearSingleResourceCache(resource);
                    }
                }else if(result.result == 2){ //session过期
                    $injector.get('service').activeSessionProxy(function(){
                        $scope.RESOURCE.deleteResource(resource);
                    });
                }else{
                    $injector.get('toastr').error(result.description);
                }
            });
        }
    };
    /**
     * 获取当前文件
     * @returns {*}
     */
    $scope.getFolderId = function () {
        return $stateParams.id;
    };
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
    /**
     * 视图进入
     */
    $scope.$on('$ionicView.enter',function () {
        //初始执行
        $scope.FOLDER.getFolder();
    });
});