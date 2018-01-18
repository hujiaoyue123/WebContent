/** 文件详情*/
angular.module("app")
	.controller("fileDetail",function($scope,$rootScope,$RESOURCE,service,component,clipboard,$$data,$$share,$$user,$stateParams,$$widget,$$preview,$injector){
		/** @$stateParams
		 * id 资源id
		 * folderid 文件夹id
		 * rootid 根id
		 * isaudit 文件是否需要审核
		 */
		$scope.$stateParams = $stateParams;
		$scope.isApp = UPF.is("APP");
		$scope.isaudit = $stateParams.isaudit ? parseInt($stateParams.isaudit) : 0; //是否审核文件
		var loadCount = 5;
		/** 下拉刷新*/
		$scope.onRefresh = function(){
			$scope.loadCount = loadCount; //重置重新获取资源次数
			$scope.RESOURCE.getResource();
		};
		/** 操作*/
		$scope.operate = function(params){
			/** 右上菜单
			 * $event
			 */
			if(params.type == "topMenu"){
				$$widget.POPOVER.fileDetail($scope,null,params.$event);
			}
			/** 资源-重命名 */
			else if(params.type == "rename"){
				//弹窗方式
				$$widget.POPUP.resource.renameResource($scope.resource, function(newRes){
					$scope.RESOURCE.updateResource(newRes);
				});
			}
			/** 资源-下载 */
			else if(params.type == "download"){
				$scope.RESOURCE.download($scope.resource);
			}
			/** 资源-移动 */
			else if(params.type == "moveResource"){
				//数据包
				var dataPackage = {
					title: "移动文件",
					rootid: $stateParams.rootid,
					hideResource: true,
					disableButton: [$stateParams.folderid],
					callback: function(data){
						var successCallback = function(){
							var resource = {
								id: $scope.resource.id,
								folderid: $stateParams.folderid,
								newfolderid: data.newFolderId
							};
							//执行修改
							$scope.RESOURCE.updateResource(resource);
						};
						//判断是否提醒审核以及后续操作
						var params = {
							folderid: data.newFolderId
						};
						$injector.get('service').checkFolderAudit(params,successCallback);
					}
				};
				if($scope.competence){ //有权限才可以移至部门等文件夹
					dataPackage.org = 'org';
				}
				//开启modal
				$$widget.MODAL.fileSelect($scope,dataPackage);
			}
			/** 资源-删除 */
			else if(params.type == "deleteResource"){
				//弹窗方式
				$$widget.POPUP.resource.deleteResource(function(){
					$scope.RESOURCE.deleteResource($scope.resource);
				});
			}
			/** 资源复制
			 * 
			 */
			else if(params.type == "copyResource"){
				//数据包
				var dataPackage = {
					title: "复制文件",
					rootid: $stateParams.rootid,
					hideResource: true,
					disableButton: [$stateParams.folderid],
					callback: function(data){
						var successCallback = function(){
							//查询文件是否已存在
							var getResourceRepeat = function(callback){
								var inParams = {
									name: $scope.resource.filename,
									folderid: data.newFolderId
								};
								var successCallback = function(result){
									if(result.result == 1){
										if(result.repeat){ //重复
											//弹框提醒
											var options = {
												title: '提醒',
												template: '<center>文件夹含有同名文件,是否覆盖?</center>',
												cancelText: '取消',
												okText: '覆盖'
											};
											$injector.get('$ionicPopup').confirm(options)
												.then(function(res){
													if(res && callback){
														callback(1);
													}
												});
										}else if(callback){
											callback();
										}
									}else if(result.result == 2){
										$injector.get('service').activeSessionProxy(function(){
											getResourceRepeat(callback);
										});
									}else{
										$injector.get('toastr').error(result.description);
									}
								};
								$RESOURCE.RESOURCE.getResourceRepeat(inParams,successCallback);
							};
							var callback = function(type){
								var resource = {
									id: $scope.resource.id,
									type: 'file',
									newfolderid: data.newFolderId
								};
								//执行修改
								$scope.RESOURCE.copyResource(resource,type);
							};
							//执行查询
							getResourceRepeat(callback);
						};
						//判断是否提醒审核以及后续操作
						var params = {
							folderid: data.newFolderId
						};
						$injector.get('service').checkFolderAudit(params,successCallback);
						/*
						//权限验证：目标文件夹需要审核,并且当前用户对此文件夹权限不高
						if(data.isaudit == 1 && data.competence != 1){
							//文件需要审批-popup
							$injector.get('$$widget').POPUP.fileAuditTip(successCallback);
						}else{
							successCallback();
						}
						*/
					}
				};
				if($scope.competence){ //有权限才可以移至部门等文件夹
					dataPackage.org = 'org';
				}
				//开启modal
				$$widget.MODAL.fileSelect($scope,dataPackage);
			}
			/**分享**/
			else if(params.type == "share"){
				if(params.$event){
					params.$event.stopPropagation(); //禁止向上传播
				}
				$scope.showLinkPopup = true;   //显示分享入口
				$scope.showLinkPopupMlk = false; //不显示复制链接页
				$scope.showLinkPopupWxf = false; //不显示分享给微信好友
				//$scope.resource = params.resource; //待分享资源
				//打开弹窗
				$$widget.POPUP.share.selectShare($scope);
			}
			/** 资源-生成链接*/
			else if(params.type == "makeLink"){
				$scope.showLinkPopup = false;  
				$scope.showLinkPopupMlk = true; //分享popup内容切换
				$scope.SHARE.addShare($scope.resource);
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
				$scope.SHARE.addShare($scope.resource);
			}
			/** 分享-掌文朋友*/
			else if(params.type == "zwfriend"){
				$$widget.POPUP.close(); //关闭Popup
				var initParam = {
					excludes: $rootScope.USER.id,
					range: "all"
				};
				$$widget.MODAL.selectUser(initParam, function(data){
					var formString = [];
					angular.forEach(data,function(obj){
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
						resourceid: $scope.resource.id,
						formString: JSON.stringify(formString),
						folderid: $scope.$stateParams.folderid
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
			/** 预览image/pdf/office*/
			else if(params.type == "preview"){
				var inParams = {
					resource: $scope.resource,
					folderid: $stateParams.folderid
				};
				$$preview.prepare(inParams);
			}
			/** 预览text*/
			else if(params.type == 'previewText'){
			    var inParams = {
			    	domain: $scope.getDomain(),
                    id: $scope.resource.id,
                    folderid: $stateParams.folderid,
                    filename: $scope.resource.filename
                };
			    $injector.get('$state').go('txtReader',inParams);
            }
			/** 打开用户信息页 */
			else if(params.type == "showUser"){
				var param = {
					id: params.id
				};
				service.$state.go("showUser",param);
			}
			/** 微信App分享 */
			else if(params.type == 'friend' || params.type == 'timeline'){
				$$widget.POPUP.close(); //关闭Popup
				var initParams = {
					res : $scope.resource,
					folderid: $stateParams.folderid,
					type: params.type
				};
				$scope.sendWxChar(initParams);
			}
		};
		$scope.CACHE = {
			isCached: false,
			number: 0,
			/** 加载本地图片
			 * 
			 */
			loadLocal: function(resource,successCallback,errorCallback){
				var offline = $injector.get("$$mobile").offline;
				if(resource.preview == "image"){
					offline.checkDir("image",function(){
						offline.checkDir("image/"+resource.id,function(){
							var inParams = {
								type: "image",
								sync: true,
								id: resource.id,
								filename: resource.filename
							};
							offline.checkFile(inParams,successCallback,errorCallback);
						},errorCallback);
					},errorCallback);
				}else if(resource.preview == "office" || resource.preview == "pdf"){
					offline.checkDir("office",function(){
						offline.checkDir("office/"+resource.id,function(){
							var inParams = {
								type: "office",
								sync: true,
								id: resource.id,
								num: 0
							};
							offline.checkFile(inParams,successCallback,errorCallback);
						},errorCallback);
					},errorCallback);
				}
			},
			/** 检测是否缓存以及缓存图片数量
			 * resource
			 */
			check: function(resource){
				if($rootScope.localConfig.cacheImage && UPF.is("app")){
					var $$mobile = $injector.get("$$mobile");
					var offline = $$mobile.offline;
					var $cordovaFile = $$mobile.$cordovaFile;
					var path = offline.getPath();
					$scope.CACHE.number = 0;
					if(resource.preview == "image"){
						var errorCallback = function(){
							$scope.CACHE.isCached = false;
							$scope.CACHE.number = 0;
						};
						var successCallback = function(){
							$scope.CACHE.number++;
							$scope.CACHE.isCached = true;
						};
						var filePath = "image/"+resource.id + "/" + resource.filename;
						$cordovaFile.checkDir(path,"image")
							.then(function(){
								$cordovaFile.checkDir(path,"image/"+resource.id)
									.then(function(){
										$cordovaFile.checkFile(path,filePath)
											.then(function(){
												successCallback();
											},errorCallback);
									},errorCallback);
							},errorCallback);
					}else if(resource.preview == "pdf" || resource.preview == "office"){
						var sum = resource.imagenumber;
						var errorCallback = function(){
							$scope.CACHE.isCached = false;
							$scope.CACHE.number = 0;
						};
						var successCallback = function(){
							$scope.CACHE.number++;
							if($scope.CACHE.number == sum){
								$scope.CACHE.isCached = true;
							}
						};
						$cordovaFile.checkDir(path,"office")
							.then(function(){
								$cordovaFile.checkDir(path,"office/"+resource.id)
									.then(function(){
										var check = function(filePath){
											$cordovaFile.checkFile(path,filePath)
												.then(function(){
													successCallback();
												},errorCallback);
										};
										for(var i=0;i<sum;i++){
											var filePath = "office/"+resource.id + "/" + i + ".jpg";
											check(filePath);
										}
									},errorCallback);
							},errorCallback);
					}
				}
			},
			/** 缓存*/
			cache: function(){
				service.loading("start","缓存中...",5000);
				var resource = $scope.resource;
				var offline = $injector.get("$$mobile").offline;
				$scope.CACHE.number = 0; //缓存图片数量
				if(resource.preview == "image"){
					var errorCallback = function(error){
						service.loading("end");
						$scope.CACHE.isCached = false;
						service.showMsg("error","本地缓存失败");
					};
					var successCallback = function(){
						service.loading("end");
						$scope.CACHE.number++;
						$scope.CACHE.isCached = true;
						service.showMsg("success","已缓存到本地");
					};
					offline.checkDir("image",function(){
						offline.checkDir("image/"+resource.id,function(){
							var inParams = {
								type: "image",
								sync: true,
								id: resource.id,
								filename: resource.filename
							};
							offline.checkFile(inParams,successCallback,errorCallback);
						},errorCallback);
					},errorCallback);
				}else if(resource.preview == "pdf" || resource.preview == "office"){
					var sum = resource.imagenumber;
					var errorCallback = function(error){
						service.loading("end");
						$scope.CACHE.isCached = false;
						service.showMsg("error","本地缓存失败");
					};
					var successCallback = function(){
						service.loading("end");
						$scope.CACHE.number++;
						if($scope.CACHE.number == sum){
							service.showMsg("success","已缓存到本地");
							$scope.CACHE.isCached = true;
						}
					};
					offline.checkDir("office",function(){
						offline.checkDir("office/"+resource.id,function(){
							var inParams = {
								type: "office",
								sync: true,
								id: resource.id
							};
							var cacheLocal = function(params){
								offline.checkFile(params,successCallback,errorCallback);
							}
							for(var i=0;i<sum;i++){
								inParams.num = i;
								cacheLocal(inParams);
							}
						},errorCallback);
					},errorCallback);
				}
			},
			/** 清除缓存
			 * noRemind 不提醒
			 */
			clear: function(noRemind){
				var resource = $scope.resource;
				var offline = $injector.get("$$mobile").offline;
				if(resource.preview == "image"){
					var $cordovaFile = $injector.get("$$mobile").$cordovaFile;
					var path = offline.getPath();
					var filePath = "image/"+ resource.id + "/" + resource.filename;
					$cordovaFile.removeFile(path,filePath)
						.then(function(){
							$scope.CACHE.number = 0;
							$scope.CACHE.isCached = false;
							if(!noRemind){
								service.showMsg("success","缓存已清除");
							}
						},function(){
							if(!noRemind){
								service.showMsg("error","缓存清除失败");
							}
						});
				}else if(resource.preview == "pdf" || resource.preview == "office"){
					var dirPath = "office/"+ resource.id;
					offline.removeRecursively(dirPath,function(){
						$scope.CACHE.isCached = false;
						$scope.CACHE.number = 0;
						if(!noRemind){
							service.showMsg("success","缓存已清除");
						}
					},function(){
						if(!noRemind){
							service.showMsg("error","缓存清除失败");
						}
					});
				}
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
						folderid: params.folderid
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
		/** 编辑zlt文件*/
		$scope.editFile = function(resource){
			var $state = $injector.get('$state');
			$state.go('zltFile',{folderid: $stateParams.folderid,resourceid: resource.id});
		};
		
		/** 资源体*/
		$scope.RESOURCE = {
			/** 查询资源
			 * id 资源id
			 */
			getResource: function(id){
				//封装参数
				var inParams = {
					id: id || $stateParams.id,
					folderid: $stateParams.folderid
				};
				//数据处理
				$RESOURCE.RESOURCE.getResource(inParams,function(result){
					if(result.result == 1){ //查询成功
						var resource = result.resource;
						resource.folderid = $stateParams.folderid; //后台未提供folderid
						//资源数据
						$$data.type(resource);
						$$data.size(resource);
						$$data.icon(resource);
						//创建时间时间
						if(resource.createtime){
							var createtime = $injector.get('$$data').DATE.format(new Date(parseInt(resource.createtime)),'yyyy-MM-dd hh:mm');
							resource.createtime = createtime;
						}
						//审核时间
						if(resource.audittime){
							var audittime = $injector.get('$$data').DATE.format(new Date(parseInt(resource.audittime)),'yyyy-MM-dd hh:mm');
							resource.audittime = audittime;
						}
						//可预览
						if(resource.preview){
							//图片大图
							if(resource.preview == "image"){
								var inParams = {
									id: resource.id,
									filename: resource.filename
								};
								if($rootScope.localConfig.cacheImage && UPF.is("app")){
									/** 缓存*/
									$scope.CACHE.loadLocal(resource,function(url){
										resource.photo = url;
									},function(){
										resource.photo = $RESOURCE.RESOURCE.imagePreviewResource(inParams);
									});
								}else{
									resource.photo = $RESOURCE.RESOURCE.imagePreviewResource(inParams);
								}
							}
							//pdf/office
							else if(resource.preview == "pdf" || resource.preview == "office"){
								//已转换完成
								if(resource.imagenumber>0){
									var inParams = {
										id: resource.id,
										num: 0
									};
									if($rootScope.localConfig.cacheImage && UPF.is("app")){
										/** 缓存*/
										$scope.CACHE.loadLocal(resource,function(url){
											resource.photo = url;
										},function(){
											resource.photo = $RESOURCE.RESOURCE.officePreviewResource(inParams);
										});
									}else{
										resource.photo = $RESOURCE.RESOURCE.officePreviewResource(inParams);
									}

								}
							}
							//video/audio
							else if(resource.preview == 'video' || resource.preview == 'audio'){
								//获取地址
								var inParams = {
									id: resource.id,
									folderid: $stateParams.folderid
								};
								var videoSrc = $RESOURCE.RESOURCE.download(inParams);
								//视频列表
								var media = {
									type: resource.minetype,
									src: videoSrc,
									name: resource.filename
								};
								if(UPF.is('android')){ //因为android无法获取到元数据
									media.poster = 'img/media/default-poster.png';
								}
								$scope.media = media;
							}
							//txt
                            else if(resource.preview == 'txt'){
                                //文件二进制流
								//获取地址
								var inParams = {
									id: resource.id,
									folderid: $stateParams.folderid
								};
								var filepath = $RESOURCE.RESOURCE.download(inParams);
                                $injector.get('$http').get(filepath)
                                    .success(function(text){
                                        $scope.txtContent = text; //文本内容
                                    });
                            }
							//统计浏览
							var params = {
								resourceid: resource.id,
								folderid: $stateParams.folderid
							};
							$RESOURCE.RESOURCE.readResource(params);
						}

						//分享人
						if(result.shareuser && result.sharetime){
							result.shareuser.sharetime = $$data.DATE.humanize(result.sharetime); //分享时间
						}
						//文件位置
						if(resource.path){
							var path = JSON.parse(resource.path.replace('personalfolder','个人文件夹'));
							resource.pathList = path;
						}
						//加入数据
						$scope.resource = resource; //资源
						$scope.shareuser = result.shareuser; //分享人
						$scope.competence = result.competence;
						$scope.createUser = result.user;
						/**检测是否缓存以及缓存的数量*/
						$scope.CACHE.check($scope.resource);
					}else if(result.result == 2){	//session过期，自动激活
						service.activeSessionProxy(function(){
							$scope.RESOURCE.getResource(id);
						});
					}else{	//查询失败
						service.showMsg("error",result.description);
					}
				},undefined,function(){
					$scope.$broadcast('scroll.refreshComplete')
				});
			},
			/** 资源下载
			 * id 文件id
			 */
			download: function(resource){
				if($scope.isApp){
                    var url = $RESOURCE.RESOURCE.download({id: resource.id,folderid:$scope.$stateParams.folderid});
                    cordova.require("cordova-open.Open").download(url,resource.filename,resource.alias,function(result){
                        console.log(result);
                    },function(msg){
                    	console.log(msg);
                    });
                } else {
                	$injector.get('service').download($RESOURCE.RESOURCE.download({id: resource.id,folderid:$scope.$stateParams.folderid}));
                }
			},
			/** 资源修改
			 * updateFile{id,title}
			 */
			updateResource: function(updateRes,successCallback){
				var inParams = {};
				var resource = [{
					id: updateRes.id
				}];
				if(updateRes.filename){ //重命名
					resource[0].filename = updateRes.filename;
					resource[0].folderid = $scope.$stateParams.folderid;
				}else if(updateRes.newfolderid){ //移动
					inParams.type = "move";
					resource[0].folderid = updateRes.folderid; //之前所在文件夹
					resource[0].newfolderid = updateRes.newfolderid; //移动到的文件夹
				}else if(updateRes.isaudit == 0 || updateRes.isaudit){ //审核
					resource[0].folderid = $stateParams.folderid;
					resource[0].isaudit = updateRes.isaudit;
				}
				inParams.updateString = JSON.stringify(resource);
				//执行修改
				$RESOURCE.RESOURCE.updateResource(inParams,function(result){
					if(result.result == 1){
						if(successCallback){
							successCallback();
						}
						$rootScope.refreshResource = true;
						if(updateRes.filename){ //重命名
							$scope.resource = updateRes; //修改变量的值
						}else if(updateRes.newfolderid){ //移动
							service.$ionicHistory.goBack();
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.RESOURCE.updateResource(updateRes,successCallback);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			},
			/** 删除
			 * file
			 */
			deleteResource: function(resource){
				//封装参数
				var params = {};
				var resources = [{
					id: resource.id
				}];
				if($scope.$stateParams.folderid){
					resources[0].folderid = $scope.$stateParams.folderid;
				}else{
					resources[0].folderid = $rootScope.USER.folderid;
				}
				params.deleteString = JSON.stringify(resources);
				//执行删除
				$RESOURCE.RESOURCE.deleteResource(params,function(result){
					if(result.result == 1){//删除成功
						//删除缓存文件
						if($scope.CACHE.isCached){
							$scope.CACHE.clear('noRemind');
						}
						$rootScope.refreshResource = true;
						service.$ionicHistory.goBack();
						service.showMsg("success",result.description);
					}else if(result.result == 2){ //session过期
						service.activeSessionProxy(function(){
							$scope.RESOURCE.deleteResource(resource);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			},
			/**
			 * 复制资源
			 * @param resource
			 * @param type 有则覆盖
			 */
			copyResource: function(resource,type){
				var params = {
					type: type,
					folderid: resource.newfolderid,
					copyarray: JSON.stringify([{id: resource.id,type: resource.type,fid: $stateParams.folderid}])
				};
				$RESOURCE.FOLDER.copyFile(params,function(result){
					if(result.result == 1){
						$injector.get('toastr').success(result.description);
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.RESOURCE.copyResource(resource,type);
						});
					}else{
						$injector.get('toastr').error(result.description);
					}
				});
			}
		};
		/** 分享体*/
		$scope.SHARE = {
			/** 添加分享获取分享id
			 * resource
			 * userList 有:分享给人|没有：复制链接
			 */
			addShare: function(resource,userList){
				var inParams = {
					resourceid: resource.id,
					formString: JSON.stringify(userList || []),
					folderid: $stateParams.folderid
				};
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
		/**
		 * 审核文件
		 * @param type 'pass/refuse'
		 */
		$scope.auditFile = function(result){
			var newResource = {
				id: $scope.resource.id
			};
			if(result == 'pass'){ //通过
				newResource.isaudit = 0;
			}else if(result == 'refuse'){ //拒绝
				newResource.isaudit = -1;
			}
			var successCallback = function(){
				//发送消息
				var resource = $scope.resource;
				var inParams = {
					to: resource.userid,
					from: $rootScope.USER.id,
					type: 'resource',
					id: resource.id,
					folderid: $stateParams.folderid,
					filename: resource.filename,
					icon: resource.src,
					isaudit: newResource.isaudit
				};
				if(newResource.isaudit == 0){
					inParams.title = '[审核通过] ' + resource.filename;
				}else if(newResource.isaudit == -1){
					inParams.title = '[审核失败] ' + resource.filename;
				}
				sendMessage(inParams);
				//视图回退
				$injector.get('$ionicHistory').goBack();
			};
			//执行资源修改
			$scope.RESOURCE.updateResource(newResource,successCallback);
		};
		/**
		 * 发送通知
		 * @param params{userid,id,folderid,isaudit,filename,icon,title}
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
		// /**
		//  * 获取当前试图的folderid
		//  * @returns {*}
		//  */
		// $scope.getFolderId = function () {
		// 	if($stateParams.folderid){
		// 		return $stateParams.folderid;
		// 	}else{
		// 		return null;
		// 	}
		// };
		/** VIEW enter*/
		$scope.$on("$ionicView.enter",function(){
			if(!$scope.resource || $scope.resource.imagenumber < 1){
				$scope.loadCount = loadCount; //重置重新获取资源次数
				$scope.RESOURCE.getResource($scope.$stateParams.id);
			}
		});
		$scope.STORAGE = {
			/**
			 * 存储资源
			 * @param resource
			 */
			download: function (resource) {
				//TODO 资源类型处理
				resource.caching = {};
				$STORAGE.getProxy().download(resource,function (result) {
					delete resource.caching;
					resource.cache = result;
					//获取到本地文件大小
					window.resolveLocalFileSystemURL(result.nativeURL,function (fileEntry) {
						fileEntry.file(function (file) {
							resource.cache.size = file.size;
						});
					});
				},function (error) {
					//TODO 提醒失败
				},function (progress) {
					resource.caching = progress;
				});
			},
			/**
			 * 获取存储资源
			 * @param resource
			 * @param successCallback
			 * @param errorCallback
			 */
			checkFile: function (resource,successCallback,errorCallback) {
				//TODO 资源类型处理
				$STORAGE.getProxy().checkFile(resource,function (result) {
					resource.cache = result;
					//获取到本地文件大小
					window.resolveLocalFileSystemURL(result.nativeURL,function (fileEntry) {
						fileEntry.file(function (file) {
							resource.cache.size = file.size;
						});
					});
					successCallback && successCallback(result.nativeURL);
				},function (error) {
					errorCallback && errorCallback(error);
				});
			},
			/**
			 *
			 * @param resource
			 */
			removeFile: function (resource) {
				$STORAGE.getProxy().removeFile(resource,function (success) {
					delete resource.cache;
				},function (error) {
					$injector.get('toastr').error('删除失败!');
				});
			}
		};
	});
	