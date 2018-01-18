/** 用户*/
angular.module("app")
	.factory("$$user",function($rootScope,$injector,$HTTPProxy,$$http,$ionicHistory,$$widget,pmservice,toastr,$timeout,$state,$ionicLoading,$$util){
		//接口
		function getITF(itfname){
			if(itfname.indexOf(".")<0 ){
				return $rootScope.CONFIG.itf.user[itfname];
			}else{
				var itfs = itfname.split(".");
				var itf = $rootScope.CONFIG.itf;
				for (var i=0;i<itfs.length;i++){
					itf = itf[itfs[i]];
				}
				if (typeof(itf) == "string"){
					return itf;
				}else{
					return null;
				}
			}
		};
		var ITF = {
			login: function(){
				return $rootScope.CONFIG.itf.user.login; //登陆
			},
			register: function(){
				return $rootScope.CONFIG.itf.user.register; //登陆
			},
			verifyCode: function(){
				return $rootScope.CONFIG.itf.user.pushVerificationCode; //获取验证码
			},
			verifyLogin: function(){
				return $rootScope.CONFIG.itf.user.verifyAndLogin; //验证码登陆
			},
			getUserInfo: function(){
				return $rootScope.CONFIG.itf.user.getUserInfo; //获取服务器用户
			},
			getUserByDeptId: function(){
				return $rootScope.CONFIG.itf.user.getUserByDeptId; //获取指定用户
			},
			updateUser: function(){
				return $rootScope.CONFIG.itf.user.updateUser; //修改用户(昵称、头像)
			},
			getUserPhoto: function(){
				return $rootScope.CONFIG.itf.user.getUserPhoto; //获取用户头像
			},
			updateUserPhoto: function(){
				return $rootScope.CONFIG.itf.user.updateUserPhoto; //修改用户头像
			},
			updateUserPass: function(){
				return $rootScope.CONFIG.itf.user.updateUserPass; //修改用户(密码)
			},
			addGroup: function(){
				return $rootScope.CONFIG.itf.user.addGroup; //创建企业和部门
			},
		};
		
		var mobileContact = {
			readed:function(){
				var readed = localStorage.mobileContactRead;
				var asked = localStorage.mobileContactAsked;
				if (readed){
					return true;
				}else if (!asked){
					localStorage.mobileContactAsked = true;
					return false;
				}else{
					return true;
				}
			},
			
			prompt:function(){
				$$widget.POPUP.confirm(
					{title:'读取手机联系人',template:'应用将读取您的手机联系人信息，信息仅用于您更方便的和好友联系和分享文件，不会将您的联系人信息泄露'}
				).then(function(r){
					if (r){
						USER.mobileContact.getAll();
					}
				});
			},
			/** 格式化联系人信息*/
			formatContacts: function(contacts){
				var mc = [];
				for(var i=0; i< contacts.length;i++){
					var u = contacts[i];
					if (!u.displayName || u.displayName == 'null'){
						if (u.name && u.name.formatted){
							u.displayName = u.name.formatted;
						}else{
							break;
						}
					}
					if(u.phoneNumbers && u.phoneNumbers.length){
						for (var j=0;j<u.phoneNumbers.length;j++){
							var phoneNum = u.phoneNumbers[j].value;
							phoneNum = phoneNum.replace(/\s+|-|\(.*\)|\+/g,''); // 去除手机号码特殊字符
							if ($$util.String.verifyMobile(phoneNum)){
								var mu = {
									name:u.displayName,
									mobile:phoneNum
								}
								mc.push(mu);
							}
						}
					}
				}
				return mc;
			},
			getContacts: function(callback){
				var options = new ContactFindOptions();	
				options.filter = "";   
				options.multiple = true;
				var fields = ["displayName", "name", "phoneNumbers"];
				options.fields = fields;
				$injector.get('$cordovaContacts').find(options).then(callback);
			},
			getAll:function(inParams){
				$ionicLoading.show();
				try{
					var options = new ContactFindOptions();	
					options.filter = "";   
					options.multiple = true;
					var fields = ["displayName", "name", "phoneNumbers"];
					options.fields = fields;
					var getMobileContacts = function(contacts){
						var mc = [];
						for(var i=0; i< contacts.length;i++){
							var u = contacts[i];
							if (!u.displayName || u.displayName == 'null'){
								if (u.name && u.name.formatted){
									u.displayName = u.name.formatted;
								}else{
									break;
								}
							}
							if(u.phoneNumbers && u.phoneNumbers.length){
								for (var j=0;j<u.phoneNumbers.length;j++){
									var phoneNum = u.phoneNumbers[j].value;
									phoneNum = phoneNum.replace(/\s+|-|\(.*\)|\+/g,''); // 去除手机号码特殊字符
									if ($$util.String.verifyMobile(phoneNum)){
										var mu = {
											name:u.displayName,
											mobile:phoneNum
										}
										mc.push(mu);
									}
								}
							}
						}
						var param = {
							jsonstring:JSON.stringify(mc),
							method:'POST',
							action:'saveMobileFriend'
						}
						USER.callService(param,function(r){
							if (r.result == 1){
								localStorage.mobileContactRead = true;
								$ionicLoading.hide();
								toastr.success("成功读取"+r.count+"个联系人");
							}
							else if(r.result == 2){
								USER.activeSessionWithCallback(function(result){
									if(result.result == 1){
										USER.setLocalUser(null,result.user); //更新本地用户
										getMobileContacts(contacts);
									}
								});
							}
							else{
								$ionicLoading.hide();
								toastr.error(r.description);
							}
						});
					};
					$injector.get('$cordovaContacts').find(options).then(getMobileContacts);
				}catch(e){
					toastr.error("读取联系人失败");
				}finally{
					$ionicLoading.hide();
				}
			}
		};
		
		//用户体
		var USER = {
			/**
			 * 登录
			 * @param params
			 * @param successCallback
			 * @param errorCallback
			 * @param finalCallback
			 */
			login: function (params,successCallback,errorCallback,finalCallback) {
				var reqParams = {
					url: $rootScope.dynamicITF.user.login,
					method: "POST",
					data: params,
					domain: params.domain
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 注册新用户
			 * promise
			 * params{loginname:手机号,validation:验证码,nickname:姓名,password:登录密码}
			 */
			register: function(promise,params){
				var reqParams = {
						promise: promise,
						url: ITF.register(),
						method: "POST",
						data: params
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/**
			 * 
			 */
			adminRegister: function(promise,params){
				var reqParams = {
					promise: promise,
					url: getITF("adminRegister"),
					method: "POST",
					data: params
				};
				reqParams.data.userid = $rootScope.USER.id;
				reqParams.data.sessionid = $rootScope.USER.sessionid;
				//发起请求
				$$http.HTTP(reqParams);
			},
			/**
			 * 激活session
			 * @param successCallback
			 * @param errorCallback
			 * @param finalCallback
			 */
			activeSession: function(successCallback,errorCallback,finalCallback){
				var reqParams = {
					url: $rootScope.dynamicITF.user.tokenLogin,
					method: "POST",
					data: {},
					token: true
				};
				//发起请求
				$HTTPProxy(reqParams,successCallback,errorCallback,finalCallback);
			},
			/** 激活session
			 * callback方式
			 */
			activeSessionWithCallback: function(successCallback,errorCallback){
				var reqParams = {
					url: $rootScope.CONFIG.itf.user.tokenLogin,
					method: "POST",
					data: {
						userid: $rootScope.USER.id,
						token: $rootScope.USER.token
					},
					successCallBack: successCallback,
					errorCallBack: errorCallback
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			callActiveSession:function(scope, action, params){
                USER.activeSession(function(result){
					if(result.result == 1){ //验证成功
						USER.setLocalUser(null,result.user); //更新本地用户
						//再次调用
						if(typeof action == "string"){
							scope[action](params);
						}else if(typeof action == "object"){
							scope[action[0]][action[1]](params);
						}else if(typeof action == "function"){
							action();
						}
					}else{
						if(IsPc()){
							$state.go("loginPc");
						}else{
							$state.go("loginMobile");
						}
					}
				});
			},
			callActiveSessionWithCallback:function(successCallback){
                USER.activeSession(function(result){
					if(result.result == 1){ //验证成功
						USER.setLocalUser(null,result.user); //更新本地用户
						if(successCallback){
							successCallback();
						}
					}else{
						if(IsPc()){
							$state.go("loginPc");
						}else{
							$state.go("loginMobile");
						}
					}
				});
			},
			/** 获取验证码
			 * promise
			 * params {loginname:登录名,type:获取类型(0:手机 1:邮箱)}
			 */
			verifyCode: function(promise,params){
				var reqParams = {
					promise: promise,
					url: ITF.verifyCode(),
					method: "GET",
					data: {
						loginname: params.loginname,
						type: params.type
					}
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 验证登陆
			 * promise
			 * params {loginname:登录名,validation:验证码}
			 */
			verifyLogin: function(promise,params){
				var reqParams = {
				    promise: promise,
				    url: ITF.verifyLogin(),
				    method: "POST",
				    data: {
				    	loginname: params.loginname,
				    	validation: params.validation
				    }
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 退出用户*/
			logout: function(){
				USER.rmLocalUser(); //清除本地用户
				$ionicHistory.clearHistory();
				$ionicHistory.clearCache(); //清除缓存
				if(USER.$$chat && USER.$$chat.conn){
					if (UPF.is("web")){
						USER.$$chat.conn.close();
					}else{
						USER.$$chat.conn.chat_logout();
					}
				}
			},
			/** 获取本地用户信息*/
			//TODO localStorage OR webSql
			getLocalUser: function(){
				var localUser = localStorage.user ? JSON.parse(localStorage.user) : {}; //本地user
				if(localUser == null){
					localUser = {};
				}
				//删除废弃的password字段
				if(localUser.password){
					delete localUser.password;
				}
				return localUser;
			},
			/**获取上次登录用户账号信息*/
			getLastUser: function(){
				if(localStorage.lastuser){
					return JSON.parse(localStorage.lastuser);
				}else{
					return {};
				}
			},
			/** 设置本地用户信息
			 * promise
			 * user
			 */
			setLocalUser: function(promise,user){
				var localUser = USER.getLocalUser()||{};
				if(!$rootScope.USER){
					$rootScope.USER = {};
				}
				if(user){ //存储-更新
					for(var key in user){
						if(user[key] || user[key] == "0" || key == "sign" || user[key] == ""){
							localUser[key] = user[key];
							$rootScope.USER[key] = user[key];
						}
					}
					//删除废弃的password字段
					if(localUser.password){
						delete localUser.password;
					}
					localStorage.user = JSON.stringify(localUser);
				}
			},
			/** 删除本地用户信息
			 * 
			 */
			rmLocalUser: function(){
				//当前登录账号保存至lastuser
				var user = JSON.parse(localStorage.user);
				if(user){
					localStorage.lastuser = JSON.stringify({
						loginname: user.loginname
					});
				}
				//清除本地用户
				localStorage.removeItem("user"); //删除user属性
			},
			/** 获取用户信息
			 * id
			 */
			getUserInfo: function(id,successCallBack){
				var reqParams = {
					url: ITF.getUserInfo(),
					method: "POST",
					data: {
						id: id || $rootScope.USER.id,
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid
					},
					successCallBack: successCallBack
					
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 获取指定用户
			 * promise
			 * userid
			 */
			getUserById: function(promise,param){
				var reqParams = {
					promise: promise,
					url: ITF.getUserInfo(),
					method: "POST",
					data: {
						id: param.id,
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid
					}
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 获取指定群组
			 * promise
			 * id
			 */
			getGroupByHxid: function(promise,param){
				var reqParams = {
						promise: promise,
						url: getITF('getGroupByHxid'),
						method: "POST",
						data: {
							hxid: param.id,
							userid: $rootScope.USER.id,
							sessionid: $rootScope.USER.sessionid
						}
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 获取组织用户
			 * promise
			 * params{id,name}
			 */
			getUserByDepId: function(promise,params){
				var data = {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid
				};
				if(params.id){
					data.id = params.id;
				}
				if(params.name){
					data.name = params.name;
				}
				var reqParams = {
					promise: promise,
					url: ITF.getUserByDeptId(),
					method: "GET",
					data: data
				};
				//发起请求
				$$http.HTTP(reqParams);
			},

			/** 修改用户 (头像，昵称)
			 * promise
			 *  params {username,files}
			 */
			updateUser: function(promise,params){
				var data = {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					updateString: JSON.stringify(params)
				};
				var reqParams = {
					promise: promise,
					url: ITF.updateUser(),
					method: "POST",
					data: data
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 修改密码
			 * params {password}
			 * promise {resolve(),reject()}
			 */
			updatePwd: function(promise,params){
				params.userid = $rootScope.USER.id;
				params.sessionid = $rootScope.USER.sessionid;
				var reqParams = {
					promise: promise,
					url: getITF("updateUserPassword"),
					method: "POST",
					data: params
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 获取用户头像
			 * obj 1.user对象 2.user.id
			 */
			getUserPhoto: function(userId,updateTime){
				if(userId){
					var additional = updateTime ? "?"+updateTime : "";
					return $rootScope.CONFIG.itf.user.getUserPhoto + '/' + userId + additional;
				}else{
					return null;
				}
			},
			/**
			 * 获取用户预览头像
			 * @param userId 用户id
			 * @param updateTime 用户上次修改时间
			 */
			getUserPreviewPhoto: function(userId,updateTime){
				if(userId){
					var additional = updateTime ? "?"+updateTime : "";
					return $rootScope.CONFIG.itf.user.getUserPreviewPhoto + '/' + userId + additional;
				}else{
					return null;
				}
			},
			/** 获取头像
			 * photo filename
			 * @param updateTime 用户上次修改时间
			 */
			getPhoto: function(fileName,updateTime){
				var additional = updateTime ? "?"+updateTime : "";
				return $rootScope.CONFIG.itf.user.getPhoto + "/" + fileName + additional;
			},
			
			/** 修改用户头像
			 * obj 1.user对象 2.user.id
			 */
			updateUserPhoto: function(promise,params){
				var reqParams = {
					promise: promise,
					url: ITF.updateUserPhoto(),
					method: "POST",
					data: {
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid
					}
				};
				//修改头像
				if(params.files){
					reqParams.data.filename = params.files[0].name;
					reqParams.data.file = params.files[0];
				}else{
					return;
				}
					//发起请求
					$$http.HTTP(reqParams);
			},
			/** 企业批量上传数据 */
			uploadImportExecl: function(promise,params){
				var reqParams = {
					promise: promise,
					url: getITF("uploadUserExcel"),
					method: "POST",
					data: {
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid
					}
				};
				//上传execl
				if(params.files){
					reqParams.data.filename = params.files[0].name;
					reqParams.data.file = params.files[0];
					reqParams.data.levelgroupid = params.id;
				}else{
					return;
				}
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 创建群组(机构，部门)
			 * 
			 * @param params
			 *  params.type: 0:群组，1：企业，2：部门
			 *  params.name: 群组名称
			 * @returns
			 */
			addGroup:function(promise, params){
				params.userid = $rootScope.USER.id;
				params.sessionid = $rootScope.USER.sessionid;
				var reqParam ={
					promise: promise,
					//url:getITF('addGroup'),
					url:ITF.addGroup(),
					method:"POST",
					data:params
				};
				$$http.HTTP(reqParam);
			},
			
			groupChat:function(group){
				if(!group.hxid || group.hxid == ""){
					var param = {
						id:group.id,
						hxid:'',
						method:'POST',
						action:'updateChatGroup'
					};
					USER.callService(param, function(r){
						if(r.result == 1){
							group.hxid = r.hxid;
							var inParams = {
								id:group.id,
								hxid:group.hxid,
								type:"groupchat",
								name:group.name,
								photo:group.avatar
							};
							$state.go("chat",inParams);
						}else if(r.result == 2){
							if (!group.retry || group.retry<4){
								group.retry = group.retry?group.retry+1:1;
								$timeout(function(){USER.groupChat(group)},1000);
							}else{
								toastr.error("连接服务器错误");
							}
						}else{
							toastr.error("连接服务器错误");
						}
					});
				}else{
					var inParams = {
						id:group.id,
						hxid:group.hxid,
						type:group.type,
						name:group.name,
						photo:group.avatar
					};
					$state.go("chat",inParams);
				}
			},
			
			/** 当前用户加入群组(机构，部门)
			 * 
			 * @param params
			 *  params.groupid: 群组id
			 * @returns
			 */
			joinGroup:function(promise, params){
				params.userid = $rootScope.USER.id;
				params.sessionid = $rootScope.USER.sessionid;
				var reqParam ={
					promise: promise,
					url:getITF('addUserToGroup'),
					method:"POST",
					data:params
				};
				$$http.HTTP(reqParam);
			},
			/** 加载联系人
			 * 
			 * @param params
			 * @returns
			 */
			loadContact:function(promise, params){
				params.userid = $rootScope.USER.id;
				params.sessionid = $rootScope.USER.sessionid;
				var reqParam ={
					promise: promise,
					url:getITF('loadContact'),
					method:"GET",
					data:params
				};
				$$http.HTTP(reqParam);
			},
			/** 添加成员或联系人
			 * 
			 * @param params
			 * @returns
			 */
			newInvite:function(promise, params){
				params.userid = $rootScope.USER.id;
				params.sessionid = $rootScope.USER.sessionid;
				var reqParam ={
						promise: promise,
						url:getITF('newInvite'),
						method:"POST",
						data:params
				};
				$$http.HTTP(reqParam);
			},
			/**
			 * 新建一个群组
			 * param 是调用selectUser的参数，参数说明参见selectUser的参数说明
			 */
			newGroup:function(params){
				params = params ||{};
				var param = params.param;
				var fn = params.fn;
				param = param || {};
				param.title = "创建群组";
				param.userCheckbox = true;
				param.excludes = [$rootScope.USER.id];
				$$widget.MODAL.selectUser(param,function(data){
					var name = $rootScope.USER.username;
					var ids = "[";
					for(var i =0; i<data.length; i++){
						var u = data[i];
						if (u.id != $rootScope.USER.id){
							if(i<5){
								if(u.username == undefined){
									name += ","+u.name;
								}else{
									name += ","+u.username;
								}
							}else if (i == 5){
								name += "...";
							}
							ids += "'"+u.id+"',";
						}
					}
					ids = ids.substring(0,ids.length-1)+"]";
					var addGroup = function(){
						var inParam = {
							type:0,
							name:name,
							userids:ids,
							method:"POST",
							action:"addGroup"
						};
						pmservice.promiseProxy(function(promise){
							USER.go(promise,inParam);
						},function(result){
							if (result.result == 1){
								toastr.success("创建群组成功");
								if (fn) fn(result);
							}else if(result.result == 2){ // session 过期
								USER.callActiveSessionWithCallback(function(){
									addGroup();
								});
							}else{
								toastr.error(result.description);
								if (fn) fn(false);
							}
						});
					};
					addGroup();
				});
			},
			/**
			 * 更新常用联系人
			 * 
			 *  参数：一个用户id
			 *  该函数判断该用户是否是当前用户的常用联系人，如果不是，就加为常用联系人，如果是，就给他的weight加1
			 */
			updateFriendWeight:function(userId){
				var param = {
					action:"updateFriendWeight",
					method:"POST",
					friendid:userId
				};
				USER.callService(param, function(){});
			},
			// 缓存联系人
			contactData:[{
				id:'zhangwinsystemmsg',
				name:'系统消息',
				photo:'img/logo-p.png',
				avatar:'img/logo-p.png',
				ah:{
					photo:'img/logo-p.png',
					avatar:'img/logo-p.png'
				}
			}],
			contacts:{
				gettingId:{},
				indexOf:function(obj){
					if (typeof(obj) == "object"){
						obj = obj.id;
					}
					obj = obj.toLowerCase();
					var data = USER.contactData || [];
					for(var i=0;i<data.length;i++){
						var u = data[i]
						if (u.id == obj){
							return u;
						}
					}
				},
				indexOfField:function(field, value){
					var data = USER.contactData || [];
					for(var i=0;i<data.length;i++){
						var u = data[i]
						if (u[field] == value){
							return u;
						}
					}
				},
				update:function(data){
					USER.contactData = data;
				},
				getUserFun:function(p, fn){
					var contacts = this;
					return function(){
						contacts.getUser(p, fn);
					}
				},
				getUser:function(p, fn){
					var uid = p.id;
					var contacts = this;
					var u = null;
					if (p.type == "groupchat"){
						uid = p.peerId;
						u = USER.contacts.indexOfField('hxid',p.peerId);
					}else{
						u = USER.contacts.indexOf(uid);
					}
					//用户缓存集合contactData没有没有该用户缓存时
					if (!u){
						if (this.gettingId[uid]){
							setTimeout(this.getUserFun(p, fn),100);
							return;
						}
						this.gettingId[uid] = true;
						var params={id:uid};
						var action;
						if(p.type != "groupchat"){
							action = USER.getUserById;
						}else{
							params.id = p.peerId;
							action = USER.getGroupByHxid; 
						}
						params.type = p.type;
						pmservice.promiseProxy(function(promise){
							action(promise,params);
						},function(result){
							delete contacts.gettingId[uid];
							if(result.result == 1){ //查询成功
								var r;
								if (params.type == "chat"){
									u = result.user;
									u.name = u.username;
									u.avatar = USER.getPhoto(u.photo,u.updatetime);
									/** 获取并缓存用户头像*/
									if(UPF.is("app") && $rootScope.localConfig.cacheImage){
										var offline = $injector.get("$$mobile").offline;
										offline.loadLocalUserAvatar([u],true);
									}
								}else{
									u = result.group;
									u.groupId = u.id;
									u.folderId = u.folderid;
									if (u.photo){
										u.avatar = USER.getPhoto(u.photo,u.updatetime);
										/** 获取并缓存用户头像*/
										if(UPF.is("app") && $rootScope.localConfig.cacheImage){
											var offline = $injector.get("$$mobile").offline;
											offline.loadLocalUserAvatar([u],true);
										}
									}
									if(u.photos){
										for(var i=0;i<u.photos.length;i++){
											u.photos[i] = (USER.getPhoto(u.photos[i],u.updatetime));
										}
									}
								}
								u.type = params.type;
								if(!USER.contactData){
									USER.contactData = [];
								}
								USER.contactData.push(u);
								fn(u);
							}else if(result.result == 2){	//session过期，自动激活
								USER.callActiveSessionWithCallback(function(){
									USER.contacts.getUser(p,fn);
								})
							}else{	//查询失败
								fn();
							}
						});
					}else{
						fn(u);
					}
				},
				addUser:function(obj){
					var u = USER.contacts.indexOf(obj);
					if(u){
						u = obj;
					}else{
						USER.contacts.push(u);
					}
				}
			},
			/** 升级版go函数
			 * params： action,method,data,[successCallback,errorCallback]
			 * successCallback
			 * errorCallback
			 * @description
			 * 1.用起来更便捷(不用预先创建promise)
			 * 2.请求信息更干净
			 * @auth hexin
			 */
			action: function(params,successCallback,errorCallback){
				if(params.data){
					params.data.userid = $rootScope.USER.id;
					params.data.sessionid = $rootScope.USER.sessionid;
				}
				var reqParams = {
					url: getITF(params.action),
					method: params.method,
					data: params.data,
					successCallBack: params.successCallback || successCallback,
					errorCallBack: params.errorCallback || errorCallback
				};
				$$http.HTTP(reqParams);
			},
			//  heihei
			go:function(promise, params){
				if(!$rootScope.USER){return;};
				params.userid = $rootScope.USER.id;
				params.sessionid = $rootScope.USER.sessionid;
				if (!params.method){
					params.method = 'POST';
				}
				var reqParam ={
					promise: promise,
					url:getITF(params.action),
					method:params.method,
					data:params
				};
				$$http.HTTP(reqParam);
			},
			run:function(param,fn){
				var go = this.go;
				pmservice.promiseProxy(function(promise){
					go(promise,param);
				},fn)
			},
			callService:function(param,fn){
				var go = this.go;
				if (fn == null){
					fn = function(result){
						if (result.result == 1){
							toastr.success(result.description);
						}else if(result.result == 2){ // session 过期
							USER.callActiveSession($$user,"callService",param);
						}else{
							toastr.error(result.description);
						}
					};
				}
				pmservice.promiseProxy(function(promise){
					go(promise,param);
				},fn)
			},
			uploadUserExcel: function(params,fn){
				var param = {
					
				};
			},
			getImportTemplet: function(){
				return getITF("getImportTemplet");
			},
			mobileContact:mobileContact,
			/*
			 * p: 用户
			 */
			addFriend:function(p){
				var options = {
						title:'请发送验证申请，等待对方通过',
						defaultText:'我是 '+$rootScope.USER.username
					};
				$$widget.POPUP.prompt(options).then(function(r){
					if (r){
						var param = {
							type:4,
							msg:r,
							loginname:p.user.loginname,
							username:p.user.username
						};
						pmservice.promiseProxy(function(promise){
							USER.newInvite(promise,param);
						},function(result){
							if(result.result == 1){ //成功
								toastr.success("已发送请求");
							}else if(result.result == 2){	//session过期，自动激活
								USER.callActiveSession(USER,"addFriend", p);
							}else{	//失败
								toastr.error(result.description);
							}
						});
					}
				});
			},
			/**
			 * 获取用户域名服务
			 * @param successCallback
			 * @param errorCallback
			 */
			getUserDomain: function (successCallback,errorCallback) {
				var reqParam ={
					url: $rootScope.dynamicITF.user.getUserDomain,
					method: 'POST',
					data: {}
				};
				$HTTPProxy(reqParam,successCallback,errorCallback);
			}
		};
		
		return USER;
	});

