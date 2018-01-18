/** 资源*/
angular.module("app")
	.factory("$RESOURCE",function($rootScope,$HTTPProxy){
		/** 文件夹体*/
		var FOLDER = {
			/** 查询资源
			 * promise
			 * params{domain,data}
			 */
			getFolder: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.folder.getFolder,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/**
			 * 查询部门文件夹
			 * @param params
			 * @param successCallback
			 * @param errorCallback
			 * @param finalCallback
			 */
			getDeptFolder: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.folder.getDeptFolder,
					method: 'POST',
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/**
			 * 获取文件夹详情
			 */
			getFolderInfo: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.folder.getFolderInfo,
					method: 'POST',
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 获取指定文件夹下所有图片文件
			 * promise
			 * params {folderid}
			 */
			getFolderImage: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.folder.getFolderImage,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 新建文件夹
			 * promise
			 * params {}
			 */
			newFolder: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.folder.newFolder,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 修改文件夹
			 * promise
			 * params {folder}
			 */
			updateFolder: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.folder.updateFolder,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 删除文件夹
			 * promise
			 * params {pan:盘符,id:资源id}
			 */
			deleteFolder: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.folder.deleteFolder,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/**
			 * 从回收站还原文件夹
			 * @param folderid
			 * @param successCallback
			 * @param errorCallback
			 */
			recoverFolder: function (params,successCallback,errorCallback,finalCallback) {
				var reqParams = {
					url: $rootScope.dynamicITF.folder.recoverFolder,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			copyFile: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.folder.copyFile,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			}
		};
		/** 资源体*/
		var RESOURCE = {
			/** 查询资源
			 * promise
			 * params
			 */
			addResource: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.resource.addResource,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 查询资源
			 * promise
			 * params
			 */
			getResource: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.resource.getResource,
					method: "GET",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 根据文件名查询文件是否重复
			 *
			 */
			getResourceRepeat: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.resource.getResourceRepeat,
					method: 'GET',
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/**
			 * 获取未审核文件条目数
			 */
			getResourceAuditCount: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.resource.getResourceAuditCount,
					method: 'POST',
					data: params,
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/**
			 * 获取待审核文件列表
			 * @param params {start,pagesize,resid}
			 */
			getResourceAudits: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.resource.getResourceAudits,
					method: 'POST',
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 删除资源
			 * promise
			 * params {id:资源id,folderid:文件文件夹}
			 */
			deleteResource: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.resource.deleteResource,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 修改资源
			 * promise
			 * params {type,resource}
			 */
			updateResource: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.resource.updateResource,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 下载资源
			 * params{id,folderid}
			 */
			download: function(params){
				var user = $rootScope.USER;
				return $rootScope.dynamicITF.resource.download($rootScope.getCurrentDomainAddress()) + "?id=" + params.id +  "&folderid=" + params.folderid + "&userid=" + user.id + "&sessionid=" + user.sessionid;
			},
			/** 获取图片缩略图
			 * resourceid
			 */
			imageMinPreview: function(resourceid){
                return $rootScope.dynamicITF.resource.imageMinPreview($rootScope.getCurrentDomainAddress()) + "/" + resourceid +"/" + $rootScope.USER.sessionid;
			},
			/**
			 * 文件图标
			 */
			getFileIcon: function(iontype){
				return "img/filetype/" + iontype + ".png";
			},
			/** 获取office预览图
			 * params{id,num}
			 */
			officePreviewResource: function(params){
				return $rootScope.dynamicITF.resource.previewResource($rootScope.getCurrentDomainAddress()) + "/" + params.id + "/" + params.num + ".jpg";
			},
			/** 获取image预览图
			 * params{id}
			 */
			imagePreviewResource: function(params){
				return $rootScope.dynamicITF.resource.previewResource($rootScope.getCurrentDomainAddress()) + "/" + params.id + "/" + params.filename;
			},
			/**
			 * 阅读计数
			 * @param resourceid
			 * @param folderid
			 */
			readResource: function (params) {
				var params = {
					url: $rootScope.dynamicITF.resource.readResource,
					method: 'POST',
					data: params
				};
				$HTTPProxy(params);
			},
			/**
			 * 从回收站还原文件
			 * @param params
			 * @param successCallback
			 * @param errorCallback
			 */
			recoverResource : function (params,successCallback,errorCallback,finalCallback) {
				var reqParams = {
					url: $rootScope.dynamicITF.resource.recoverResource,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			}
		};
		/** 搜索体*/
		var SEARCH = {
			/** 查询资源
			 * promise
			 * params
			 */
			search: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.search.search,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			}
		};
		return {
			FOLDER: FOLDER, //文件夹体
			RESOURCE: RESOURCE, //资源体
			SEARCH: SEARCH //搜索
		};
	}); 