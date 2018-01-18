/** 通讯录*/
angular.module("app")
	.factory("$$contact",function($rootScope,$$http){
		var ITF = {
			get: function(itfName){
				return $rootScope.CONFIG.itf.contact[itfName] || $rootScope.CONFIG.itf.user[itfName];
			},
			getUserByDeptId: $rootScope.CONFIG.itf.contact.getUserByDeptId, //加载联系人
			deleteFriend: $rootScope.CONFIG.itf.contact.deleteFriend //删除联系人
		};
		/** 通讯录*/
		var CONTACT = {
			/** 获取联系人
			 * promise
			 * params {type}
			 */
			getUserByDeptId: function(promise, params){
				var reqParams = {
					promise: promise,
					url: ITF.getUserByDeptId,
					method: "GET",
					data: {
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid,
						type: params.type
					}
				};
				//id
				if(params.id || params.id == 0){
					reqParams.data.id = params.id;
				}
				//分页-开始未知
				if(params.start || params.start == 0){
					reqParams.data.start = params.start;
				}
				//分页-获取数量
				if(params.pagesize){
					reqParams.data.pagesize = params.pagesize;
				}
				//验证多加载的资源id
				if(params.uid){
					reqParams.data.uid = params.uid;
				}
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 获取群组/企业所有用户的id
			 * 
			 */
			getAllUserIdByDeptId: function(id,successCallback,errorCallback){
				var reqParams = {
					url: $rootScope.CONFIG.itf.user.getAllUserIdByDeptId,
					method: "GET",
					data: {
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid,
						id: id
					},
					successCallBack: successCallback,
					errorCallBack: errorCallback
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 删除联系人
			 * promise
			 * params {friendids}
			 */
			deleteFriend: function(promise, params){
				var reqParams = {
					promise: promise,
					url: ITF.deleteFriend,
					method: "POST",
					data: {
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid,
						friendids: params.friendids
					}
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 解散群组
			 * groupid 群组id
			 */
			dismissGroup: function(groupid,sCallback,eCallback){
				var reqParams = {
					url: ITF.get("deleteGroup"),
					method: "POST",
					data: {
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid,
						groupid: groupid
					},
					successCallBack: sCallback,
					errorCallBack: eCallback
				};
				//发起请求
				$$http.HTTP(reqParams);
			},
			/** 群组删除成员
			 * group 群组,至少包括id 和 type属性
			 * userIds 用户id列表字符串
			 */
			deleteUserFromGroup:function(group,userIds,success,error){
				var reqParams = {
						url: ITF.get("deleteUserToGroup"),
						method: "POST",
						data: {
							groupid:group.id,
							type:group.type,
							userids:userIds,
							userid: $rootScope.USER.id,
							sessionid: $rootScope.USER.sessionid
						},
						successCallBack: success,
						errorCallBack: error
					};
					//发起请求
					$$http.HTTP(reqParams);				
			}
		};
		
		return CONTACT;
	});