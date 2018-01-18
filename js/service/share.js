/** 分享*/
angular.module("app")
	.factory("$$share",function($rootScope,$HTTPProxy){
		/** 分享体*/
		var SHARE = {
			/** 分享
			 * params {res,users}
			 */
			addShare: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.share.addShare,
					method: "POST",
					data: params,
					domain: params.domain
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 保存链接分享到-分享给我的文件 
			 * id 分享id
			 */
			addLinkShare: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.share.addLinkShare,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 删除分享
			 * promise
			 * params {id: 分享id,type: 'me'/'other'}
			 * type
			 */
			delShare: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.share.deleteShareRes,
					method: "POST",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 查询分享
			 * promise
			 * type
			 */
			getShareMeTo: function(successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.share.getShareMeTo,
					method: "GET",
					data: {}
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 获取用户分享的资源
			 * friendid 用户id
			 */
			getFriendShare: function(params,successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.share.getFriendShare,
					method: "GET",
					data: params
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 添加链接分享*/
			
			/** 链接*/
			LINK: {
				/** 链接-获取分享链接
				 * id
				 */
				getLink: function(id){
					var domain = $rootScope.getCurrentDomain();
					if(domain){
						return domain.domain + '/'+ domain.webdomainname + "/link/#/" + id;
					}else {
						return $rootScope.CONFIG.address + "/link/#/" + id;
					}
				},
				/**  链接-查询资源分享信息
				 * promise
				 * resourceId
				 */
				getShare: function(params,successCallback,errorCallback,finalCallback){
					var reqParams = {
						url: $rootScope.dynamicITF.share.link.getShare,
						method: "GET",
						data: params
					};
					//发起请求
					$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
				},
				/** 链接-分享下载
				 * shareid 分享id
				 */
				download: function(shareid){
					return $rootScope.dynamicITF.share.link.download($rootScope.getCurrentDomainAddress()) + "?shareid=" + shareid;
				},
				/** 链接-图片缩略图
				 * id 分享id
				 */
				imageMinPreview: function(id){
					return $rootScope.dynamicITF.share.link.imageMinPreview($rootScope.getCurrentDomainAddress()) + "/" + id
				},
				/** 链接-获取office预览图
				 * params{id,num}
				 */
				officePreviewResource: function(params){
					return $rootScope.dynamicITF.share.link.previewResource($rootScope.getCurrentDomainAddress()) + "/" + params.id + "/" + params.num + ".jpg";
				},
				/** 链接-获取image预览图
				 * params{id}
				 */
				imagePreviewResource: function(params){
					return $rootScope.dynamicITF.share.link.previewResource($rootScope.getCurrentDomainAddress()) + "/" + params.id + "/" + params.filename;
				}
			}
		};
		return SHARE;
	});