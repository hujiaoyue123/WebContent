/** 部门群组企业详情页面 */
angular.module("app")
	.controller("showGroupCtrl",function($rootScope,$scope,service,$stateParams,$$user,$$contact,$$widget,$ionicPopup,$ionicHistory,$injector){
		/**
		 * $stateParams
		 * @param id 组织id
		 * @param backText 回退文本
		 */
		$scope.$stateParams = $stateParams;

		$scope.init = function(){
			$scope.loadGroup($stateParams.id);
		};
		/**
		 * 加载企业信息
		 * @param orgid 组织id
		 */
		$scope.loadGroup = function(orgid){
			var inParams = {
				url: $rootScope.CONFIG.itf.user.getGroupProperties,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: orgid
				},
				successCallBack: function(result){
					if(result.result == 1){ //查询成功
						$scope.role = result.role; //权限
						if(result.group.photo){
							result.group.avatar = $$user.getPhoto(result.group.photo,result.group.updatetime);
							/** 获取并缓存用户头像*/
							if(UPF.is("app") && $rootScope.localConfig.cacheImage){
								var offline = $injector.get("$$mobile").offline;
								offline.loadLocalUserAvatar([result.group]);
							}
						}else{
							if(result.group.type == 1){
								result.group.avatar = $rootScope.CONFIG.defaultOrgPhoto;
							}else if(result.group.type == 2){
								result.group.avatar = $rootScope.CONFIG.defaultDeptPhoto;
							}else if(result.group.type == 0){
								result.group.avatar = $rootScope.CONFIG.defaultGroupPhoto;
							}
						}
						result.group.count = result.count; //组织成员数量
						//通告信息--目前没有
						if(result.notice){
							$scope.noticeTitle = result.notice.title;
						}
						$scope.cgroup = result.group;
						//获取组织文件使用空间
						$scope.getOrgCloudSpace(orgid);
					}else if(result.result == 2){	//session过期，自动激活
						service.activeSessionProxy(function(){
							$scope.loadGroup(orgid);
						});
					}else{	//查询失败
						service.showMsg("error",result.description);
					}
					$scope.$broadcast("scroll.refreshComplete"); 
				},
				errorCallBack: function(){
					$scope.$broadcast("scroll.refreshComplete"); 
				}
			};
			$injector.get('$$http').HTTP(inParams);
		};
		/**
		 * 操作
		 */
		$scope.operate = function(param){
			if (param.action == "showMembers"){
				service.$state.go("contactOrg",$scope.cgroup);
			}else if (param.action == "groupManage"){
				service.$state.go("groupManage",$scope.cgroup);
			}else if(param.action == "folderPan"){
				var inParams = {
					id: $scope.cgroup.folderid,
					title: $scope.cgroup.name,
					belongid: $scope.cgroup.id
				};
				service.$state.go("showPan",inParams);
			}else if(param.action == "changeName"){
				$scope.changeGroupName();
			}else if(param.action == "dismiss"){
				$scope.dismissGroup();
			}else if (param.action == "addMember"){
				$scope.addMember();
			}else if (param.action == "removeMember"){
				$scope.removeMember();
			}else if (param.action == "setManager"){
				$scope.setManager();
			}else if (param.action == "transfer"){
				$scope.transfer();
			}else if (param.action == "upgradeEnt"){
				service.$state.go("upgradeEnt",$scope.cgroup);
			}else if(param.action == "import"){
				service.$state.go("importManage",$scope.cgroup);
			}else if(param.action == "adminRegister"){
				$scope.adminRegister();
			}else if(param.action == "quitGroup"){
				$scope.quitGroup();
			}
			//离职成员
			else if(param.action = 'terminateMember'){
				var param = {
					title: '选择离职成员',
					excludes: [$rootScope.USER.id],
					rootId:$scope.cgroup.id,
					selectMax: 1,
					userCheckbox: true //仅用户显示复选框
				};
				$$widget.MODAL.selectUser(param, function(userList){
					$scope.terminateContract(userList[0]);
				});
			}
		};
		
		$scope.goBack = goBack = function(){
    		service.$ionicHistory.goBack();
		};
		/** 成员离职
		 * user 要离职成员
		 * orgId 当前企业id
		 */
		$scope.terminateContract = function(user,orgId){
			var params = {
				action: 'terminateContract',
				method: 'post',
				data: {
					groupid: orgId || $scope.cgroup.id, //当前企业id
					tcuserid: user.id //
				},
				successCallback: function(result){
					if(result.result == 1){
						service.showMsg('success',result.description);
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.terminateContract(user,orgId);
						});
					}
				}
			};
			$$user.action(params);
		};
		/** 更换企业、群组头像
		 * web
		 */
		$scope.updateGroupPhoto = function(files){
			//判断是否有图片
			if(files.length == 0){
				$injector.get('toastr').info('请选择图片文件！');
				return;
			}
			var execute = function(){
				if(files.length == 0){
					return;
				}
				if(files.length > 0){
					var inParams = {
						files: files
					};
					var inParams = {
						method:'POST',
						action:'updateGroupPhoto',
						groupid: $scope.cgroup.id,
						filename: files[0].name,
						file: files[0]
					};
					var execute = function(inParams){
						$$user.callService(inParams,function(result){
							if(result.result == 1){
								$scope.cgroup.avatar = $$user.getPhoto(result.filename,result.updatetime); //更新现有头像
								service.showMsg("info",result.description);
							}else if(result.result == 2){
								service.activeSessionProxy(function(){
									execute(inParams);
								});
							}else {
								service.showMsg("error",result.description);
							}
						});
					};
					execute(inParams);
				}
			};
			var type = $scope.cgroup.type;
			var role = $scope.role;
			if(type > 0){ //1是企业，2是部门
				if(role>0){
					execute();
				}
			}else if(type == 0){ //群组
				execute();
			}
		};
		/** 更换企业、群组头像
		 * mobile
		 */
		$scope.updateGroupPhotoOnMobile = function(){
			var type = $scope.cgroup.type;
			var role = $scope.role;
			//权限判断
			if(role<=0 || !role){
				return;
			}
			var $$mobile = $injector.get("$$mobile");
			var options = {
				type: "PHOTOLIBRARY",
				allowEdit: true
			};
			var successCallback = function(uri){
				var execute = function(uri){
					var fileTransfer = $$mobile.$cordovaFileTransfer;
					var server = $rootScope.CONFIG.itf.contact.updateGroupPhoto;
					var filename = decodeURI(service.getMobileFileName(uri));
					var options = {
						params: {
							userid: $rootScope.USER.id,
							sessionid: $rootScope.USER.sessionid,
							groupid: $scope.cgroup.id,
							filename: filename
						}	
					};
					//上传
					fileTransfer.upload(server,uri,options)
						.then(function(res){
							var result = JSON.parse(res.response);
							if(result.result == 1){ //处理成功
								$scope.cgroup.avatar = $$user.getPhoto(result.filename,result.updatetime); //更新现有头像
								service.showMsg("info",result.description);
							}else if(result.result == 2){ //session过期
								service.activeSessionProxy(function(){
									execute(uri);
								});
							}else {
								service.showMsg("error",result.description);
							}
						},function(error){
							service.showMsg("error","上传失败");
						});
				};
				//判断获取的uri是否绝对路径
				if($$mobile.isNativePath(uri)){
					execute(uri);
				}else{
					$$mobile.resolveNatviePath(uri,function(filePath){
						execute(filePath);
					});
				}
			};
			//打开相册
			$$mobile.openCamera(options,successCallback);
		};
		/**
		 * 发消息
		 */
		$scope.chat = function(){
			$scope.chatClicked = true;
			$$user.groupChat($scope.cgroup);
		};
		/** 修改简介*/
		$scope.modifyIntro = function($event){
			$event.stopPropagation();
			$$widget.POPUP.getText({
				title: '修改简介',
				defaultText: angular.copy($scope.cgroup.intro)
			}).then(function(res){
				if(res!= undefined){
					var execute = function(){
						var param = {
								groupid:$scope.cgroup.id,
								field:'intro',
								value:res,
								mothod:'POST',
								action:'updateGroupProp',
						};
						$$user.callService(param,function(result){
							if(result.result == 1){
								$scope.cgroup.intro = res;
								service.showMsg('success',result.description);
							}else if(result.result == 2){
								service.activeSessionProxy(function(){
									execute();
								});
							}else{
								service.showMsg('error',result.description);
							}
						});
					};
					execute();
				}
			});
		};
		/**
		 * 进入公告
		 */
		$scope.clickNotice = function(){
			service.$state.go("groupNotice",{groupid:$scope.cgroup.id});
		};
		/** 转让*/
		$scope.transfer = function(){
			// selectUser 范围， 选择本群组的人
			var param = {
				range:$scope.cgroup.type,
				depth:1,
				rootId:$scope.cgroup.id,
				selectMax: 1,
				userCheckbox: true
			};
			$$widget.MODAL.selectUser(param, function(data){
				var transfer = function(data){
					var newid = data[0].id;
					var param = {
						groupid:$scope.cgroup.id,
						grouptype:$scope.cgroup.type,
						newid:newid,
						method:"POST",
						action:"transfer"
					};
					$$user.callService(param, function(result){
						if(result.result == 1){
							$scope.loadGroup($stateParams.id);
							service.showMsg('success',result.description);
							//通知
							$rootScope.$broadcast('zw.refreshContactOrg'); //
						}else if(result.result == 2){
							service.activeSessionProxy(function(){
								transfer(data);
							});
						}else{
							$injector.get('toastr').error(result.description);
						}
					});
				};
				transfer(data);
			});
		};
		
		/**@deprecated
		 *  更换头像
		 */
		$scope.changeAvatar = function(files){
			if(files.length <= 0){
				return;
			}
			var inParams = {
				method:'POST',
				action:'updateGroupPhoto',
				groupid: $scope.cgroup.id,
				filename: files[0].name,
				file: files[0]
			};
			var execute = function(inParams){
				$$user.callService(inParams,function(result){
					if(result.result == 1){
						$scope.cgroup.avatar = $$user.getPhoto(result.filename,result.updatetime); //更新现有头像
						service.showMsg("info",result.description);
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							execute(inParams);
						});
					}else {
						service.showMsg("error",result.description);
					}
				});
			};
			execute(inParams);
		};

		/** 设置管理员*/
		$scope.setManager = function(){
			// selectUser 范围， 当给部门添加人时，只能添加本企业的人
			var param = {
				selectedCondition:function(o){
					return (o.role == 1);
				},
				excludeCondition:function(o){
					return (o.role == 2);
				},
//				checkbox:true,
				userCheckbox: true,
				//selectMax:5,
				selectMin:0,
				title:"设置管理员",
				range:$scope.cgroup.type,
				depth:1,
				rootId:$scope.cgroup.id
			};
			$$widget.MODAL.selectUser(param, function(data){
				var ids = "[";
				for(var i =0; i<data.length; i++){
					var u = data[i];
					ids += "'"+u.id+"',";
				}
				ids = ids.substring(0,ids.length-1)+"]";
				//取消管理员
				if(data.length == 0){
					ids = "[]";
				}
				var param = {
					groupid:$scope.cgroup.id,
					grouptype:$scope.cgroup.type,
					userids:ids,
					method:"POST",
					action:"setManager"
				};
				var execute = function(param){
					$$user.callService(param,function(result){
						if(result.result == 1){
							service.showMsg('success',result.description);
						}else if(result.result == 2){
							service.activeSessionProxy(function(){
								execute(param);
							});
						}else{
							service.showMsg('error',result.description);
						}
					});
				};
				execute(param);
			});
		};
		/** 删除成员*/
		$scope.removeMember = function(){
			// selectUser 范围， 当删除人时，只能选择本群组的人
			var param = {
				range:$scope.cgroup.type,
				excludeCondition:function(o){
					return (o.role == 2);
				},
				depth:1,
				rootId:$scope.cgroup.id,
				userCheckbox: true
			};
			$$widget.MODAL.selectUser(param, function(data){
				var ids = "[";
				for(var i =0; i<data.length; i++){
					var u = data[i];
					ids += "'"+u.id+"',";
				}
				ids = ids.substring(0,ids.length-1)+"]";
				var param = {
						groupid:$scope.cgroup.id,
						grouptype:$scope.cgroup.type,
						userids:ids,
						method:"POST",
						action:"deleteUserToGroup"
				};
				service.promiseProxy(function(promise){
					$$user.go(promise,param);
				},function(result){
					if (result.result == 1){
						$scope.cgroup.count = $scope.cgroup.count-data.length;
						service.showMsg("success","删除成功");
					}else if(result.result == 2){ // session 过期
						service.activeSessionProxy(function () {
							$scope.removeMember();
						});
					}else if(result.result == 3){ // 部分删除
						var msg = "";
						for(var i=0; i<result.data.length;i++){
							var re = result.data[i];
							var user =  re.user;
							var groupNames = [];
							for(var j=0; j<re.groups.length;j++){
								groupNames[j] = re.groups[j].name; 
							}
							msg += user.username;
							msg += "("+groupNames.join(",")+")<br>";
						}
						$scope.cgroup.count = $scope.cgroup.count-(data.length-result.data.length);
						msg = '以下人员是部门负责人，不能删除<br>'+msg;
						$$widget.POPUP.alert({title:'以下人员未删除',template:msg});
					}else{
						service.showMsg("error",result.description);
					}
				});
				
			});
		};
		/** 添加成员*/
		$scope.addMember = function(){
			// selectUser 范围， 当给部门添加人时，只能添加本企业的人
			var param = {range:'user'};
			param.excludes = []; //需要排除的id集合
			if($scope.cgroup.type == 1){ //企业
				param.excludes.push($scope.cgroup.id); //排除当前企业
			}else if ($scope.cgroup.type == 2){ //部门
				param.rootId = $scope.cgroup.parentid;
				param.type = 'user';
			}
			//排除条件
			param.excludeCondition = function(o){
				return (o.role == 2);
			};		
			param.userCheckbox = true; //仅用户显示复选框
			//排除现有成员
			$scope.getAllUserIdByDeptId($stateParams.id,function(result){
				if(result.data && result.data.length>0){
					angular.forEach(result.data,function(value){
						param.excludes.push(value.id);
					});
				}
				openModal();
			},function(){
				openModal();
			});
			var openModal = function(){
				$$widget.MODAL.selectUser(param, function(data){
					var ids = "[";
					for(var i =0; i<data.length; i++){
						var u = data[i];
						ids += "'"+u.id+"',";
					}
					ids = ids.substring(0,ids.length-1)+"]";
					var param = {
						groupid:$scope.cgroup.id,
						grouptype:$scope.cgroup.type,
						userids:ids,
						method:"POST",
						action:"addUserToGroup"
					};
					var execute = function(param){
						service.promiseProxy(function(promise){
							$$user.go(promise,param);
						},function(result){
							if (result.result == 1){
								$scope.cgroup.count = $scope.cgroup.count+data.length;
								service.showMsg("success","添加成功");
							}else if(result.result == 2){ // session 过期
								service.activeSessionProxy(function(){
									execute(param);
								});
							}else{
								service.showMsg("error",result.description);
							}
						});
					};
					execute(param);
				});
			}
		};
		/**
		 * 创建组织之前
		 * @param parentOrg 父组织
		 * @param type 新组织类型
		 */
		$scope.beforeAddGroup = function(parentOrg,type){
			var options = {
				title: "新部门名称",
				cancelText: '取消',
				okText: '确定'
			};
			$injector.get('$ionicPopup').prompt(options)
				.then(function(r){
					if(r && r.trim()){
						var newOrg = {
							name: r,
							type: type
						};
						$scope.addGroup(parentOrg,newOrg);
					}
				});
		};
		/**
		 * 创建组织
		 * @param parentOrg 父组织 {id}
		 * @param newOrg 新组织 {name,type}
		 */
		
		$scope.addGroup = function(parentOrg,newOrg){
			var inParams = {
				url: $rootScope.CONFIG.itf.user.addGroup,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					parentid: parentOrg.id,
					type: newOrg.type,
					name: newOrg.name
				},
				successCallBack: function(result){
					if(result.result == 1){
						$injector.get('toastr').success(result.description);
						//发放通知
						$rootScope.$broadcast('zw.refreshContactOrg');
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.addGroup(parentOrg, newOrg);
						});
					}else{
						$injector.get('toastr').error(result.description);
					}
				}
			};
			$injector.get('$$http').HTTP(inParams);
		};
		/**
		 * 退出组织之前
		 * @param org 组织对象
		 */
		$scope.beforeQuitGroup = function(org){
			$ionicPopup.confirm({
				okText:'确认',
				cancelText:'取消',
				title:'您确认要退出吗？',
				template:'<center>如果想再次加入，必须由成员拉您进入!</center>'
			}).then(function(r){
				if (r){
					var userids = "['"+$rootScope.USER.id+"']";
					$scope.quitGroup(org, userids);
				}
			});
		};
		/**
		 *  退出组织
		 *  @description 仅管理员和成员
		 *  @param org 组织对象
		 *  @param useids 用户id字符串,以逗号隔开
		 */
		$scope.quitGroup = function(org,userids){
			var inParams = {
				url: $rootScope.CONFIG.itf.user.deleteUserToGroup,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: org.id,
					type: org.type,
					userids: userids
				},
				successCallBack: function(result){
					if(result.result == 1){
						//发送通知
						$rootScope.$broadcast('zw.refreshContact'); //刷新联系人
						$rootScope.$broadcast('zw.refreshResource'); //刷新文件库
						$ionicHistory.goBack();
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.quitGroup(org, userids);
						});
					}else{
						$injector.get('toastr').error(result.description);
					}
				}
			};
			$injector.get('$$http').HTTP(inParams);
		};
		/**
		 * 解散组织之前 
		 * @param id 组织id
		 */
		$scope.beforeDismissGroup = function(id){
			if(id){
				var options = {
					okText:'确认',
					cancelText:'取消',
					title:'您确认要解散吗？',
					template:'<center>这将会删除相关的所有文件!</center>'
				};
				$ionicPopup.confirm(options)
				.then(function(r){
					if (r){
						$scope.dismissGroup(id);
					}
				});
			}
		};
		/**
		 *  解散组织
		 *  @param id 组织id
		 *  @description 仅创建人可以操作
		 */
		$scope.dismissGroup = function(id){
			var params = {
				action: 'deleteGroup',
				method: 'POST',
				groupid: id
			};
			$$user.run(params, function(result){
				if (result.result == 1){
					service.showMsg("success","成功解散");
					//发送通知
					//TODO 如果是解散企业,应该回到'联系人'页
					if($scope.cgroup.type == 1){
						$rootScope.$broadcast('zw.refreshContact'); //刷新联系人
						$rootScope.$broadcast('zw.refreshResource'); //刷新文件库
						$injector.get('$state').go('tab.contact');
					}else{
						$rootScope.$broadcast('zw.refreshContactOrg'); //刷新联系人
						$injector.get('$ionicHistory').goBack(-2); //回退视图
					}
				}else if(result.result == 2){ // session 过期
					service.activeSessionProxy(function(){
						$scope.dismissGroup(id);
					});
				}else{
					service.showMsg("error",result.description);
				}
			});
		};
		/** 修改名称*/
		$scope.changeGroupName = function(){
			$ionicPopup.prompt({
				   title: '修改名称',
				   cancelText:'取消',
				   okText:'确认',
				   defaultText:$scope.cgroup.name
				 }).then(function(res) {
					 if(res){
						 var updateGroupName = function(){
							 var params = {
								 action:"updateGroupName",
								 method:"POST",
								 groupid:$scope.cgroup.id,
								 name:res
							 };
							 $$user.run(params,function(result){
								 if (result.result == 1){
									 $scope.cgroup.name = res; //修改组织名称									 
									 service.showMsg("success","修改成功");
									 //通知
									 $rootScope.$broadcast('zw.refreshResource');
									 $rootScope.$broadcast('zw.refreshContact');
									 $rootScope.$broadcast('zw.refreshContactOrg');
								 }else if(result.result == 2){ // session 过期
									 service.activeSessionProxy(function(){
										 updateGroupName(); 
									 });
								 }else{
									 service.showMsg("error",result.description);
								 }
							 });
						 };
						 updateGroupName();
					 }
				 });
		};
		$scope.adminRegister = function(){
			$$widget.MODAL.adminRegister($scope,$scope.cgroup.id,function(user){
				$$widget.MODAL.remove();
				var execute = function(user){
					service.promiseProxy(function(promise){
						$$user.adminRegister(promise,user);
					},function(result){
						if (result.result == 1){
							service.showMsg("success",result.description);
						}else if(result.result == 2){ // session 过期
							service.activeSessionProxy(function(){
								execute(user);
							});
						}else{
							service.showMsg("error",result.description);
						}
					});
				};
				execute(user);
			});
		};
		/** 查询群组所有成员id*/
		$scope.getAllUserIdByDeptId = function(id,successCallback,errorCallback){
			//查询该群组下所
			$$contact.getAllUserIdByDeptId(id,function(result){
				if(result.result == 1){
					if(successCallback){successCallback(result);}
				}else if(result.result == 2){
					service.activeSessionProxy(function(){
						$scope.getAllUserIdByDeptId(id,successCallback,errorCallback);
					});
				}else{
					if(errorCallback){ errorCallback();}
				}
			},function(){
				if(errorCallback){ errorCallback();}
			});
		};
		/** 设置邮箱域名*/
		$scope.authEmail = function(){
			$scope.form = {
				emaildomain: $scope.cgroup.maildomain
			};
			var options = {
				title: '设置企业邮箱域名',
				subTitle: '多域名请用英文分号隔开.<br/>例如：@domain.com;@mycompany.com;',
				template: '<textarea type="text" style="min-height: 60px;" ng-model="form.emaildomain"/>',
				scope: $scope,
				buttons:[{
					text: '关闭'
				},{
					text: "确定",
					type: "button-positive",
					onTap: function(){
						var updateEmailDomain = function(){
							var params = {
								groupid: $scope.cgroup.id,
								field: 'maildomain',
								value: $scope.form.emaildomain,
								mothod: 'POST',
								action: 'updateGroupProp'
							};
							$$user.callService(params,function(result){
								if(result.result == 1){
									$scope.cgroup.maildomain = $scope.form.emaildomain; //免刷新
									service.showMsg("success",result.description);
								}else if(result.result == 2){
									service.activeSessionProxy(function(){
										updateEmailDomain();
									});
								}else{
									service.showMsg("error",result.description);
								}
							});
						};
						//执行修改
						updateEmailDomain();
					}
				}]
			};
			$ionicPopup.show(options)
		};
		/** 选择认证方式*/
		$scope.selectAuth = function(verifytype){
			if(verifytype){
				var params = {
					groupid:$scope.cgroup.id,
					field:'verifytype',
					value: verifytype,
					mothod:'POST',
					action:'updateGroupProp'
				};
				$$user.callService(params,function(result){
					if(result.result == 1){
						service.showMsg("success",result.description);
						$rootScope.ionicPopupWindow.close();
					}else if(result.result ==2){
						service.activeSessionProxy(function(){
							$scope.selectAuth(verifytype);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			}else{
				var radio = '<ion-radio ng-value="\'email\'" ng-model="cgroup.verifytype" ng-click="selectAuth(cgroup.verifytype)">邮件域名认证</ion-radio>';
				var radio2 = '<ion-radio ng-value="\'manager\'" ng-model="cgroup.verifytype" ng-click="selectAuth(cgroup.verifytype)">管理员认证</ion-radio>';
				var options = {
						title: "选择认证方式",
						template: radio + radio2,
						scope: $scope,
						buttons: [{
							text: "取消"
						}]
				};
				$rootScope.ionicPopupWindow = $ionicPopup.show(options);
			}
		};
		/** 进入公告*/
		$scope.openNoticeList = function(){
			var $state = $injector.get('$state');
			var params = {
				groupid: $stateParams.id,
				folderid: $scope.cgroup.folderid,
				role: $scope.role,
				urlType: 'list'
			};
			$state.go('notice',params);
		};
		/** 打开文档排名*/
		$scope.openDocumentRanking = function(){
			$injector.get('$state').go('topRead',{groupid: $stateParams.id});
		};
		/**
		 * 加入企业
		 * @param org 企业对象
		 */
		$scope.joinOrg = function(org){
			/**
			 * 用户未设置邮箱
			 */
			var addEmail = function(error){
				var tip;
				if(error){
					tip = "<p>邮箱地址与该企业邮箱不匹配.</p>";
				}else{
					tip = "<p>请输入邮箱完成申请.</p>"
				}
				var options = {
					title: "提醒",
					subTitle: "<p>该企业已设置邮箱验证方式</p>" + tip,
					inputPlaceholder: '请输入匹配的邮箱',
					cancelText: "取消",
					okText: "确定",
					okType: "button-positive"
				};
				var addEmailPopup = $ionicPopup.prompt(options);
				addEmailPopup.then(function(email){
						if(email){
							addEmailPopup.close();
							if($injector.get('$$util').String.verifyEmail(email)){ //验证邮箱格式
								//修改个人邮箱
								updateUserEmail(email,function(){
									joinByEmail(org); //匹配企业邮箱
								});
							}else{
								$injector.get('toastr').warning('邮箱格式不正确');
							}
						}
					});
			};
			/**
			 * 
			 * 修改用户邮箱
			 */
			var updateUserEmail = function(email,successCallback){
				var data = {email: email};
				var params = {
					action: "updateUser",
					method: 'POST',
					updateString: JSON.stringify(data)
				};
				$$user.callService(params,function(result){
					if(result.result == 1){
						$$user.setLocalUser(null,data);
						if(successCallback){
							successCallback();
						}
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							updateUserEmail(email,successCallback);
						});
					}else{
						service.showMsg("error",result.description);
					}
				});
			};
			/**
			 * 邮箱方式
			 * @param org 企业对象
			 */
			var joinByEmail = function(org){
				var user = $rootScope.USER;
				//去掉换行符
				org.maildomain = org.maildomain.replace('\n','');
				user.email = user.email.replace('\n','');
				//获取邮箱域名
				var getUserEmailDomain = function(email){
					var array = email.split("@");
					return '@' + array[array.length-1];
				};
				var userEmailDomainList = user.email.split(";"); //用户邮箱集合
				var orgEmailDomainList = org.maildomain.split(";"); //企业邮箱域名集合
				var validEmailList = []; //用户匹配企业的有效邮箱集合
				//开始匹配邮箱
				for(var i=0;i<userEmailDomainList.length;i++){
					var userEmailDomain = getUserEmailDomain(userEmailDomainList[i]); //用户邮箱域名
					if(orgEmailDomainList.indexOf(userEmailDomain) != -1){ //匹配成功
						validEmailList.push(userEmailDomainList[i]); //添加匹配邮箱
					}
				}
				//选择邮箱
				var selectEmail = function(emailList,org){
					$scope.popup = {
						emailList: emailList,
						org: org
					};
					if(emailList.length == 1){
						$scope.popup.selectedEmail = emailList[0];
					}
					//发送邮箱
					var options = {
						title: "发送邮件",
						subTitle: "请选择要接收验证的邮箱",
						template: '<ion-radio ng-repeat="email in popup.emailList track by $index" ng-model="popup.selectedEmail" ng-value="email">{{email}}</ion-radio>',
						scope: $scope,
						buttons: [{
							text: "取消"
						},{
							text: "确定",
							type: 'button-positive',
							onTap: function(e){ 
								var selectedEmail = $scope.popup.selectedEmail;
								//发送邮件
								var sendEmail = function(org,email){
									var inParams = {
										action: 'newInvite',
										method: 'POST',
										groupid: org.id,
										type: org.type,
										email: email
									};
									//调用发送邮件
									$$user.callService(inParams,function(result){
										if(result.result == 1){
											//通知已发送邮件
											var alertEmailSended = function(msg){
												var options = {
													title: '提醒',
													template: '<center style="font-size: 12px">系统已经向</center><center class="calm"> '+ msg+ '</center><center style="font-size: 12px">发送了验证邮件</center><center style="font-size: 12px">请收到邮件继续相关操作。</center>',
													okText: '确定'
												}
												$ionicPopup.alert(options)
													.then(function(){
														service.showMsg("success","申请成功");
													});
											};
											//执行
											alertEmailSended(selectedEmail);
										}else if(result.result == 2){
											service.activeSessionProxy(function(){
												sendEmail(org,email);
											});
										}else{
											service.showMsg("error",result.description);
										}
									});
								};
								//执行
								sendEmail($scope.popup.org,selectedEmail);
							}
						}]
					};
					//显示
					$ionicPopup.show(options);
				};
				//处理有效邮箱
				if(validEmailList.length>0){
					selectEmail(validEmailList,org);
				}else{ //不匹配
					addEmail(true);
				}
			};
			/**
			 * 管理员方式
			 * @param org 企业对象
			 */
			var joinByManager = function(org){ 
				if (org.id && org.id!=''){
					$$widget.POPUP.prompt({
						title:'请发送验证申请，等待对方通过',
						defaultText:'我是 '+$rootScope.USER.username
					}).then(function(r){
						if (r){
							//发送申请
							var sendInvite = function(orgid){
								var param = {
									type: 1,
									msg: r,
									groupid: orgid
								};
								service.promiseProxy(function(promise){
									$$user.newInvite(promise,param);
								},function(result){
									if(result.result == 1){ //成功
										service.showMsg("success","已发送请求");
									}else if(result.result == 2){	//session过期，自动激活
										service.activeSessionProxy(function(){
											sendInvite(orgid);
										});
									}else{	//失败
										service.showMsg("error",result.description);
									}
								});
							};
							//执行
							sendInvite(org.id);
						}
					});
				}else{
					service.showMsg("error","参数错误，请重新选择");
				}
			}
			var user = $rootScope.USER;
			if(org.verifytype == "email"){ //企业邮箱认证
				if(user.email){
					joinByEmail(org); //邮箱方式
				}else{ //用户没邮箱
					addEmail();
				}
			}else{
				//管理员方式
				joinByManager(org);
			}
		};
		/**
		 * 图片异常处理
		 */
		$scope.imgLoadError = function(){
			if($scope.cgroup.type == 0){ //群组
				return 'img/icon/group.png';
			}else if($scope.cgroup.type == 1){ //企业
				return 'img/icon/org.png';
			}else if($scope.cgroup.type == 2){ //部门
				return 'img/icon/dept.png';
			}
		};
		/**
		 * 获取企业/部门/群组文件已使用空间
		 * @param orgid 组织Id
		 */
		$scope.getOrgCloudSpace = function(orgid){
			if(!orgid){return;}
			var inParams = {
				url: $rootScope.CONFIG.itf.folder.getGroupCloudSpace,
				method: 'POST',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					groupid: orgid
				},
				successCallBack: function(result){
					if(result.result == 1){
						$scope.orgUsedCloudSpace = $injector.get('$$util').bytesToSize(result.data); //用户文件使用空间
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.getOrgCloudSpace();
						});
					}
				}
			};
			$injector.get('$$http').HTTP(inParams);
		};
		/**
		 * 视图进入
		 */
		$scope.$on("$ionicView.enter",function(){
			/** 初始化执行*/
			$scope.chatClicked = false;
			service.validUser($scope.init);
		});
	});