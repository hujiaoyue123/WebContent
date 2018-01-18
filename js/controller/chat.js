/** 聊天控制器*/
angular.module("app")
	.controller("chat", function($scope,$rootScope,$state,$$user,$stateParams,$$widget,service,$ionicActionSheet,$ionicPopup,$ionicModal,
			$ionicScrollDelegate,$timeout,$interval,$$chat,$$util,clipboard,$$data,toastr, $injector){
	    /**
	     * $stateParams
	     * @param
	     */
		$scope.$stateParams = $stateParams;
		//媒体
	    var mediaPlayer; //媒体
	    var mediaPlayerList = []; //语音播放列表
	    
		$scope.isNotSysMsg = ($stateParams.id && ($stateParams.id.toLowerCase() != 'zhangwinsystemmsg'));
	
		$scope.isWeb = UPF.is("WEB");
		$scope.isApp = UPF.is("APP");
		$rootScope.Map = $$util.Map;
		var $cordovaClipboard;
		var $$mobile;
		if ($scope.isApp){
			$cordovaClipboard= $injector.get("$cordovaClipboard");
			$$mobile = $injector.get("$$mobile");
		}
		$scope.maxImg = false;
		$scope.showTools = {
				emotion:false,
				tool:false
			};
		$scope.emotionPicData = $$chat.emotionPicData;
		$scope.defaultLinkPic = config.defaultLink;
		var tempTimeout;
		$scope.txtInputLoaded = function(element){
			element.on("focus", $scope.txtInputEnter);
			element.on('blur', function() {
				if($scope.keepKb){
					//针对ios聊天框失去焦点，导致键盘自动缩回
					clearTimeout(tempTimeout);
					tempTimeout = setTimeout(function(){
						$scope.keepKb = false;
					},1000);
					element[0].focus();
				}else{
					$timeout(function() {
						if(viewScroll)
				    	viewScroll.scrollBottom(true);
				    }, 100);
				}
			});
		
		};
		$scope.peerOk = false;
	//url参数
		$scope.params = {
			id: $stateParams.id,
			peerId:$stateParams.id
		};
		if ($stateParams.type == ""||$stateParams.type==undefined || $stateParams.type=='chat'){
			$scope.params.type = "chat";
			$scope.isGroup = false;
		}else{
			$scope.params.type = "groupchat";
			$scope.isGroup = true;
			if (!$stateParams.hxid || $stateParams.hxid == 'creating'){
				$scope.params.peerId = '';
				$scope.params.id = '';
			}else{
				$scope.params.peerId = $stateParams.hxid;
				$scope.params.id = $stateParams.hxid;
			}
			$scope.params.groupid = $stateParams.id;
		}
	    $scope.user = $rootScope.USER;
		$scope.weight = true;

	    $scope.input = {
	      message:''// localStorage['userMessage-' + $scope.params.id] || ''
	    };

	    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
	    
	    $scope.txtInputEnter = function(){
	    	if ($scope.hidekey){
	    		$scope.txtInput.blur();
	    	}else{
	    		$scope.taggleTools();
	    	}
	    };
	    $scope.refreshGetMessages = function(){
	    	var msgId ;
	    	if(!$rootScope.Map.isEmpty()){
	    		msgId = $rootScope.Map.get($scope.params.peerId);
	    	}
	    	$$chat.refreshMsgs({id:$scope.params.peerId,type:$scope.params.type,startMsgId:msgId,callback:function(conv){
	    		if (conv){
	    			$scope.conv = conv;
	    			$scope.messages = conv.msgs;
	    			$scope.toUser = conv.peer;
	    			$scope.toUserName = conv.peer.name;
	    			if(fn){fn();}
	    		}else{
	    			$$user.contacts.getUser($scope.params,function(u){
	    				if(u){
	    					$scope.conv = {
	    						id:$scope.params.id,
	    						peerId:$scope.params.peerId,
	    						groupId:$scope.params.groupid,
	    						type:$scope.params.type,
	    						peer:u,
	    						msgs:[]
	    					};
	    					$scope.toUser = u;
	    					$scope.toUserName = u.name;
	    	    			$scope.toUser.msgs = [];
	    	    			$scope.historyed = true;
	    	    			$scope.messages = $scope.conv.msgs;
	    	    			$$chat.addPeer($scope.conv);
	    	    			if(fn){fn();}
	    				}else{
	    	            	toastr.error('获取用户信息失败');
	    					if($scope.params.type == 'groupchat'){
	    						$$chat.groupError($scope.params, function(hxid){
	    							$scope.params.peerId = hxid;
	    							$scope.params.id = hxid;
	    							$scope.getMessages();
	    						});
	    					}
	    				}
	    			});
	    		}
			    $timeout(function() {
			    	if(viewScroll)
			    	viewScroll.scrollBottom(true);
			    }, 100);
	    	}});
	    	$scope.$broadcast("scroll.refreshComplete");  //针对下拉式刷新
	    };
	    /**
	     * 获取会话消息
	     */
	    $scope.getMessages = function(fn){
    		$$chat.getMsgs({id: $scope.params.peerId,type:$scope.params.type,callback:function(conv){
	    		if (conv){
	    			$scope.conv = conv;
	    			$scope.messages = conv.msgs;
	    			$scope.toUser = conv.peer;
	    			$scope.toUserName = conv.peer.name;
	    			if(fn){fn();}
	    			setTimeout(function(){
	    				//筛选语音消息
	    				$scope.filterVoiceMessage($scope.messages);
	    			});
	    		}else{ //第一次会话
	    			$$user.contacts.getUser($scope.params,function(u){
	    				if(u){
	    					$scope.conv = {
	    						id:$scope.params.id,
	    						peerId:$scope.params.peerId,
	    						groupId:$scope.params.groupid,
	    						type:$scope.params.type,
	    						peer:u,
	    						msgs:[]
	    					};
	    					$scope.toUser = u;
	    					$scope.toUserName = u.name;
	    	    			$scope.toUser.msgs = [];
	    	    			$scope.historyed = true;
	    	    			$scope.messages = $scope.conv.msgs;
	    	    			$$chat.addPeer($scope.conv);
	    	    			if(fn){fn();}
	    				}else{
	    	            	toastr.error('获取用户信息失败');
	    					if($scope.params.type == 'groupchat'){
	    						$$chat.groupError($scope.params, function(hxid){
	    							$scope.params.peerId = hxid;
	    							$scope.params.id = hxid;
	    							$scope.getMessages();
	    						});
	    					}
	    				}
	    			});
	    		}
			    $timeout(function() {
			    	if(viewScroll)
			    	viewScroll.scrollBottom(true);
			    }, 100);
    		}});
	    };
	    /**
	     * 筛选语音消息
	     * @param messages 带过滤消息集合
	     * @param options 过滤项
	     */
	    $scope.filterVoiceMessage = function(messages,options){
	    	mediaPlayerList = [];
	    	angular.forEach(messages,function(message){
	    		if(message.msgType == 'voice'){
	    			//IOS特殊处理
	    			if(UPF.is('ios')){
                        if(message.isListened == 'undefined'){
                        	message.isListened = false;
                        }
                        message.id = message.msgid;
                    }
	    			mediaPlayerList.push(message);
	    		}
	    	});
	    };
	    /** 监听输入*/
//	    $scope.$watch('input.message', function(newValue, oldValue) {
//	    	if (!newValue) newValue = '';
//	    	localStorage['userMessage-' + $scope.params.id] = newValue;
//	    });
	    /** 发送消息*/
	    $scope.sendMessage = function(sendMessageForm) {
	    	if($scope.readySpeak){
	    		return;
	    	}
	    	if ($scope.input.message == ''){
	    		return;
	    	}
	    	
	    	var message = {
	    		to: $scope.params.peerId,
	    		msg: $scope.input.message,
	    		type:$scope.params.type
	    	};
	    	var regx = /@([^\s]+)\s/g;
	    	var msgTxt = $scope.input.message;
	    	var ata = [];
	    	var sr;
	    	while(sr = regx.exec(msgTxt)){
	    		ata.push(sr[1]);	
	    	}	    	
	    	if(ata.length>0){
	    		message.ext = {ext:{}};
	    		message.ext.ext.at = ata.join(',');
	    	}
	    	$scope.keepKb = true;
	    	$scope.input.message = '';
	
		    message.from = $scope.user.id;
		    message.to = $scope.params.peerId;
		    message.type = $scope.params.type;
		    message.msgType = "txt";

		    $$chat.sendMsg(message);
		    message.body = $$chat.parseTextMessage(message.msg).body;
		    $scope.conv.text = message.msg;
		    message.data = message.msg;
		    $scope.updateWeight();
		    $$chat.addMsg(message);
		    


		    $timeout(function() {
		    	if(viewScroll)
		    	viewScroll.scrollBottom(true);
		    }, 0);
	    };
	    /**
	     * 发送掌文文件
	     */
	    $scope.sendZwfile = function(zwfile){
	    	var shareTo = {
	    		id:$scope.params.peerId,
	    	}
	    	if($scope.params.type == "chat"){
	    		shareTo.sharetype = "user";
	    	}else{
	    		shareTo.sharetype = "group";
	    		shareTo.id = $scope.params.groupId || $scope.params.groupid;
	    	}
	    	var formData = [shareTo];
	    	var shareParam = {
	    		folderid: zwfile.folderId,
	    		resourceid: zwfile.id,
	    		formString:angular.toJson(formData),
	    		method:"POST",
	    		action:"share.addShare"
	    	};
	    	
	    	$$user.callService(shareParam,function(r){
	    		if (r.result == 1){
	    			var share = r.share[0];
	    	    	var message = {
    		    		to: $scope.params.peerId,
    		    		msg:"[zwfile]",
    		    		msgType : "zwfile",
    		    		type:$scope.params.type,
    		    		ext:{ext:{
    		    			filename:zwfile.filename,
    		    			zwfileid:zwfile.id,
    		    			zwfolderid:share.folderid,
    		    			icon:zwfile.src
    		    		}}
    		    	};
    		    	$$chat.sendMsg(message);
    		    	message.ext.ext.zwfolderid = zwfile.folderId;
    		    	message.from = $scope.user.id;
    		    	message.msgType = "zwfile";
    			    $scope.updateWeight();
    		    	$$chat.addMsg(message, $scope.toUser);
    		    	$scope.conv.text = '[文件]'+message.ext.ext.filename;
    			    $timeout(function() {
    			    	if(viewScroll)
    				      viewScroll.scrollBottom(true);
    				    }, 0);
	    		}else{
	    			service.showMsg("error",r.description);
	    		}
	    	});
	    	
	    };
	    /**
	     * 发送图片-WEB
	     */
	    $scope.webSendImageMessage = function(files){
	    	if (files.length == 0){
	    		return;
	    	}
			var message = {
	    		to: $scope.params.peerId,
	    		fileInputId:"ngf-chat_selectPhoto",
	    		type:$scope.params.type,
	    		onFileUploadComplete:function(data){
	    			message.filePath = data.uri+"/"+data.entities[0].uuid;
	    			message.from = $scope.user.id;
	    			message.msgType = "pic";
	    		    $scope.updateWeight();
	    			$$chat.addMsg(message);
	    			message.data = '[图片]';
	    			$scope.conv.text = '[图片]';
	    		    $timeout(function() {
	    		      if(viewScroll)
	    		      viewScroll.scrollBottom(true);
	    		    }, 0);
	    		}
			}
			$$chat.sendPicture(message);
	    };
	    /**
	     * 发送图片-Mobile
	     */
	    $scope.sendImageMessage = function(filePath) {
	    	var message = {
	    		to: $scope.params.peerId,
	    		msg:'',
			    msgType : "pic",
	    		type:$scope.params.type,
	    		filePath:filePath
	    	};

		    message.from = $scope.user.id;
		    message.to = $scope.params.peerId;
		    message.type = $scope.params.type;

		    $$chat.sendMsg(message);
		    $scope.updateWeight();
		    $$chat.addMsg(message);
	
		    $timeout(function() {
		      if(viewScroll)
		      viewScroll.scrollBottom(true);
		    }, 0);
	    };
	    /**
	     * 添加亲密度
	     */
	    $scope.updateWeight = function(){
	    	if ($scope.params.type == "chat" && $scope.weight){
	    		$$user.updateFriendWeight($scope.toUser.id);
	    		$scope.weight = false;
	    	}
	    };

	    $scope.onUserHold = function(e, itemIndex, msg){
	    	var s;
	    	if(msg.type == 'chat'){
	    		s = msg.user.name;	
	    	}else{
	    		s = "@"+msg.user.name+" ";
	    	}
			$$util.String.insertText($scope.txtInput, s);
			$scope.input.message = $scope.txtInput.value;
	    };
	    /** 长按文本*/
	    $scope.onMessageHold = function(e, itemIndex, message) {
	    	if(message.msgType == 'voice'){ //语音消息
	    		$ionicActionSheet.show({
	    			buttons: [{
	    				text: '删除'
	    			}],
	    			buttonClicked: function(index) {
	    				switch (index) {
	    				case 0: // Delete
	    					var m = $scope.messages.splice(itemIndex, 1)[0];
	    					if (!$scope.isWeb){
	    						$$chat.conn.chat_removeMessage({username:m.peerId, msgid:m.msgid});
	    					}else{
	    						$$chat.saveWebHistory();
	    					}
	    					$timeout(function() {
	    						if(viewScroll)
	    							viewScroll.resize();
	    					}, 0);
	    					break;
	    				}
	    				return true;
	    			}
	    		});
	    	}else{ //其它消息
	    		$ionicActionSheet.show({
	    			buttons: [{
	    				text: '复制'
	    			}, {
	    				text: '删除'
	    			}],
	    			buttonClicked: function(index) {
	    				switch (index) {
	    				case 0: // Copy Text
	    					if($scope.isWeb){
	    						clipboard.copyText($scope.messages[itemIndex].data);
	    					}else{
	    						$cordovaClipboard.copy($scope.messages[itemIndex].data);
	    					}
	    					break;
	    				case 1: // Delete
	    					var m = $scope.messages.splice(itemIndex, 1)[0];
	    					if (!$scope.isWeb){
	    						$$chat.conn.chat_removeMessage({username:m.peerId, msgid:m.msgid});
	    					}else{
	    						$$chat.saveWebHistory();
	    					}
	    					$timeout(function() {
	    						if(viewScroll)
	    							viewScroll.resize();
	    					}, 0);
	    					break;
	    				}
	    				
	    				return true;
	    			}
	    		});
	    	}
	    };
	    /**
	     * 显示用户详情
	     */
	    $scope.showUserDetail = function(msg) {
	    	//系统消息不执行
	    	if(msg.from.toLowerCase() =='zhangwinsystemmsg'){
	    		return ;
	    	}
	    	var inParams = {
	    		id: msg.from
	    	};
			service.$state.go("showUser",inParams);
	    };
	    
	    $scope.operate = function(param,$event){
			//顶部按钮
			var action = param.action;
			if(action == "topMenu"){
				if ($scope.isGroup){ // 如果是群组，跳转到showGroup页面
					var inParam = {
						id: $scope.params.groupid,
						hxid:$scope.params.peerId,
						type: 0,
						name:$scope.toUser.name
					}
					service.$state.go("showGroup",inParam);
				}else{		// 如果是个人，创建一个群组，并进入群组聊天
					var inParam = {
						param: {
							selected: [$scope.toUser],
							excludes: [$rootScope.USER.id],
							userCheckbox: true
						},
						fn:function(r){
							if (r){
								$$user.groupChat({id:r.groupid});
							}
						}
					};
					$$user.newGroup(inParam);

				}
			}else if(action == "zwfile"){
				var dataPackage = {
					title: "选择文件",
					org: "org", //额外获取企业文件,
					rootid: $scope.USER.folderid,
					callback: function(data){
						$scope.sendZwfile(data.resource);
					}
				};
				$$widget.MODAL.fileSelect($scope,dataPackage);
			}else if(action == "webphoto"){
				var files = param.files;
				//判断是否有图片
				if(files.length == 0){
					$injector.get('toastr').info('请选择图片文件！');
					return;
				}
				$scope.webSendImageMessage(files);
			}else if(action == "photo"){ //mobile选择图片
				/*方案一
				if(!$scope.isWeb){
					service.openCamera({resolve:function(uri){
						$scope.sendImageMessage(uri);
					}},"PHOTOLIBRARY");
				}*/
				//方案二
//				var $$mobile = $injector.get("$$mobile");
				var options = {
					type: "PHOTOLIBRARY"
				};
				var successCallback = function(uri){
					if(!$$mobile.isNativePath(uri)){
						var successCallback = function(filePath){
							$scope.sendImageMessage(filePath);
						};
						$$mobile.resolveNativePath(uri,successCallback);
					}else{
						$scope.sendImageMessage(uri);
					}
				};
				$$mobile.openCamera(options,successCallback)
			}else if(action == "camera"){
				if(!$scope.isWeb){
					service.openCamera({resolve:function(uri){
						$scope.sendImageMessage(uri);
					}},"CAMERA");
				}
			}else if(action == "openFolder"){
				if ($scope.params.type == 'chat'){
					service.$state.go('friendShared',{friendid:$scope.toUser.id});
				}else{
					//本地群组对象没有chat,就需要重新查询
					if($scope.toUser.chat){
						service.$state.go('showPan',{id:$scope.toUser.chat, title:$scope.toUser.name});
					}else{ //获取chat值
						var getGroupByHxid = function(){
							service.promiseProxy(function(promise){
								var inParams = {
									id: $scope.toUser.hxid
								};
								$$user.getGroupByHxid(promise,inParams);
							},function(result){
								if(result.result == 1){
									if(result.group && result.group.chat){
										service.$state.go('showPan',{id: result.group.chat, title: result.group.name});
									}
								}else if(result.result == 2){
									service.activeSessionProxy(getGroupByHxid);
								}else{
									$injector.get('toastr').error(result.description);
								}
							});
						};
						getGroupByHxid();
					}
				}
			}else if(action == "clickZwfile"){
				var inParams = {
					id: param.data.zwfileid,
					folderid: param.data.zwfolderid,
					rootid: param.data.zwrootid
				};
				//内网分享判断
				if(param.data.domain){
					var domain = angular.copy(param.data.domain);
					domain.id = domain.domain;
					domain.temp = true;
					for(var i=0;i<$rootScope.domains.length;i++){
						if($rootScope.domains[i].id != domain.id){
							$rootScope.domains.push(domain);
						}
					}
					inParams.domain = domain.id;
				}
				service.$state.go("fileDetail", inParams);
			}
			//点击已审核的文件、文件夹消息
			else if(action == "clickAuditfile"){
				var resource = param.data;
				//判断审核状态
				if(resource.isaudit == -1){ //未审核通过
					var options = {
						title: '提醒',
						template: '<center>审核失败,可联系管理员咨询.</center>'
					};
					$injector.get('$$widget').POPUP.alert(options);
					return;
				}
				//准备进入详情视图
				var type = resource.type;
				if(type == 'folder'){
					var inParams = {
						id: resource.id,
						rootid: resource.rootid
					};
					service.$state.go("folderInfo", inParams);
				}else if(type == 'resource'){
					var inParams = {
						id: resource.id,
						folderid: resource.folderid,
						rootid: resource.rootid
					};
					service.$state.go("fileDetail", inParams);
				}
			}
			else if(action == "clickUrl"){
				if($scope.isApp){
					$$mobile.app.openUrl({service:service,url:param.data.url});
				}else{
					window.open(param.data.url,'_blank');
				}
			}else if(action == "clickImg"){
				var message = param.data;
				//TODO 聊天图片下载
				$scope.timg = param.event.srcElement;
				//使用modal方式
				var scope = $rootScope.$new(true);
				scope.image = {
					src: param.data.remotePath || param.data.filePath,
					name: message.filename,
					competence: {
						saveToMobile: true //保存到手机
					}
				};
				var options = {
					scope: scope,
					animation: 'none'
				}
				$ionicModal.fromTemplateUrl("tpl/modal/showImage.html",options)
					.then(function(modal){
						modal.show();
						scope.modal = modal;
					})
			}else if(action == "removeClickImg"){
				if($scope.modal){
					$scope.modal.remove();
				}
			}else if(action == "clickEmotion"){
				$scope.hidekey = true;
				$$util.String.insertText($scope.txtInput, param.em.id);
				$scope.input.message = $scope.txtInput.value;
				$scope.hidekey = false;
			}else if(action == "refresh"){
				//下拉刷新－－－－移动端有效
				if($scope.isApp){
					$scope.refreshGetMessages();
				}
				
			}
		};
		/**
		 * 计算图片预览时的大小
		 */
		$scope.loadSize = function(tgtimg){
			var img = $scope.timg;
			var clientWidth = document.documentElement.clientWidth;
			var clientHeight = document.documentElement.clientHeight;
			var imgWidth = img.naturalWidth;
			var imgHeight = img.naturalHeight;

			//计算比例
			var widthScale = clientWidth / imgWidth; //宽度比例
			var heightScale = clientHeight / imgHeight; //高度比例
			var lastscale = Math.min(widthScale,heightScale); //选择最小的比例
			if (lastscale >1){
				lastscale = 1;
			}
			//图片样式参数
			var margintop = 0,marginleft=0,width = imgWidth * lastscale,height = imgHeight * lastscale;  
			//图片高度小于窗口高度，才垂直居中
			if(height < clientHeight){
				margintop = (clientHeight - height)/2;
			}
			if(width < clientWidth){
				marginleft = (clientWidth - width)/2;
			}
			var rs = {
				"width": width + "px",
				"height": height + "px",
				"margin-top": margintop + "px",
				"margin-left":marginleft+"px"
			};
			tgtimg.style.width = rs.width;
			tgtimg.style.height = rs.height;
			tgtimg.style.marginTop = rs["margin-top"];
			tgtimg.style.marginLeft = rs["margin-left"];
			
		};
		$scope.chatback = function(){
			service.$state.go("tab.message");
		};

	    
	    
	    $scope.receiveMessage = function(message){
	    	if (message.userId==$scope.toUser.id){
	    		message.toId = $scope.user.id;
	    		$scope.messages.push(message);
	    	}
	    };
		/**
		 * 切换语音/键盘
		 */
		$scope.toggleVoice = function(){
			$scope.readySpeak = !$scope.readySpeak;
			if($scope.readySpeak){ //显示语音
				if($scope.showTools.emotion){ //关闭表情
					$scope.showTools.emotion = false;
//					$scope.taggleTools('emotion');
				}
				if($scope.showTools.tool){ //关闭工具条
					$scope.showTools.tool = false;
//					$scope.taggleTools('tool');
				}
			}
		};
		/**
		 * 切换emotion/tool
		 */
		$scope.taggleTools = function(tn){
			//emotion/tool都置为false
			if(tn){
				var state = $scope.showTools[tn];
			}
			for(var t in $scope.showTools){
				$scope.showTools[t] = false;
			}
			if(tn){
				$scope.showTools[tn] = !state;
				if($scope.showTools[tn] && $scope.readySpeak){
					$scope.readySpeak = false;
				}
			}
			$scope.toolsOpen();
	    	$timeout(function() {
	    		if(viewScroll)
		    	viewScroll.scrollBottom(true);
		    }, 100);
		};
		/**
		 * 控制底部栏高度
		 */
		$scope.toolsOpen = function(){
			//emotion或者tool为true则
			for(var t in $scope.showTools){
				if ($scope.showTools[t]){
					$scope.toolsOpened = true;
					$scope.toolsClosed = false;
					return true;
				}
			}
			//else
			$scope.toolsOpened = false;
			$scope.toolsClosed = true;
			return false;
		};
		$scope.getCt = function(t){
			return $$data.DATE.chatTime(t);
		};
		$scope.validPeer = function(fn){
			if ($scope.params.id.toLowerCase() == 'zhangwinsystemmsg'){
	    		$scope.peerOk = false;
				if (fn){fn();}
	    		return;
			}
			var param = {
				peerId: $scope.params.id,
				groupId:$scope.params.groupid,
				type : $scope.params.type,
				method:'POST',
				action:'validChatPeer'
			};
			$$user.callService(param, function(r){
				if (r.result == "1"){
					if (r.peerId){
						if(r.peerId == param.peerId){
							$scope.peerOk = true;
							if (fn){fn();}
						}else if (r.peerId == 'creating'){
							$timeout(function(){$scope.validPeer(fn);}, 1000);
						}else{
							$scope.params.id = r.peerId;
							$scope.params.peerId = r.peerId;
							$scope.peerOk = true;
							if (fn){fn();}
						}
					}
				}else if(r.result == "0"){
		    		if ($scope.messages.length==0 || !$scope.messages[$scope.messages.length-1].noFriend){
		    			var message = {
		    					notice:true,
		    					noFriend:true,
		    					data:r.description
		    			}
		    			$scope.messages.push(message);
		    		}
		    		$scope.peerOk = false;
				}else if(r.result == "2"){
					service.activeSessionProxy(function(){
						$scope.validPeer();
					});
				}else{
	            	toastr.error(r.description);
				}
			})
		};

		var recorder,timer,context;
		/**
		 * 开始录音
		 * @platform mobile
		 */
		var amplitudeTimer,durationTimer; //振幅,录制定时器
		$scope.startRecorde = function(){
			$scope.hinder = false; //没有阻碍
			//关闭media
			$scope.stopMedia();
			//防止MediaPlayer线程问题
			setTimeout(function(){
				//创建新media
				if(UPF.is('app')){
					//播放录制语音
					$injector.get('media').audioEffects('beforeRecord',function(){
						//因为异步，所以采用二次验证
						if(!$scope.hinder){
							createMedia();
						}
					});
				}
			},100);
		};
		/**
		 * 创建media
		 */
		var createMedia = function(){
			$scope.isRecord = true; //区分是播放还是录音
			//开始录音
			var src = new Date().getTime() + ".wav";
			//mediaPlayer实例释放
			if(mediaPlayer && mediaPlayer.release){
				mediaPlayer.stopRecord();
				mediaPlayer.release();
				mediaPlayer = null;
			}
			$scope.errorCount = 0;
			mediaPlayer = new Media(src);
			mediaPlayer.errorCallback = function(error){
				if(error && error.code == 1){
					if(UPF.is('ios')){
						$scope.errorCount++;
						if($scope.errorCount<=1){ //因为ios在创建media的时候就会有一次错误回掉
							return;
						}
					}
					if(!$scope.permissionPopup){
						$scope.errorCount = 0; //重置
						var options = {
							title: '无法录音',
							template: '请在手机设置选项中，允许掌文访问你的手机麦克风。',
							okText: "好"
						};
						$scope.permissionPopup = $injector.get('$ionicPopup').alert(options);
						$scope.permissionPopup.then(function(){
							delete $scope.permissionPopup;
						});
					}
				}
			};
			mediaPlayer.statusCallback = function(state){
				if(state == Media.MEDIA_RUNNING && $scope.isRecord){ //开始录音
					//打开幕布
					$injector.get('$ionicLoading').show({
						scope: $scope,
						templateUrl: 'tpl/voice.html'
					});
					$scope.isRecord = false;
				}
				if(state == Media.MEDIA_STOPPED){
					//TODO
				}
			};
			mediaPlayer.startRecordTime = new Date().getTime(); //开始计时
			//IOS特殊处理
			if(UPF.is('ios')){
				var toId = $scope.params.type == 'groupchat' ? $scope.toUser.hxid : $scope.toUser.id;
                var fromId= $rootScope.USER.id;
				mediaPlayer.startRecord(toId,fromId);
			}else{
				mediaPlayer.startRecord();
			}
			//获取媒体振幅
			amplitudeTimer = setInterval(function () {
				mediaPlayer.getCurrentAmplitude(function (amp) {
					if(amp){
						var num = amp * 10; 
						var str = num.toString().substring(0,3);
						var finalNum;
						if(str<1){
							$scope.$apply($scope.amplitude = 1);
						}else if(str>7){
							$scope.$apply($scope.amplitude = 7);
						}else{
							$scope.$apply($scope.amplitude = Math.ceil(str));
						}
					}
				});
			}, 100);
			
			var durationLimit = 60 * 1000; //语音时长限制
			$scope.warning = false; //语音快超时警告
			durationTimer = setInterval(function() {
				durationLimit -= 100;
				//10s提醒
				if(durationLimit == 10 * 1000){
					//震动一下
					$scope.warning = true;
					if(navigator.vibrate){
						navigator.vibrate(100); //震动500ms
					}
				}
				//倒计秒数
				if($scope.warning){
					$scope.$apply(function(){
						$scope.endTime = Math.ceil(durationLimit/1000); 
					});
				}
				//强迫结束
				if(durationLimit == 0) {
					clearInterval(durationTimer);
					$scope.stopRecorde();
				}
			}, 100);
		};
		var lastMediaPlayer; //上次Media实例
		/**
		 * 结束录音
		 * @platform mobile
		 */
		$scope.stopRecorde = function(){
			$scope.isRecord = false;
			$scope.hinder = true; //阻碍到~
			setTimeout(function(){
				$injector.get('$ionicLoading').hide(); //关闭振幅窗
				clearInterval(durationTimer); //清除时长定时器
				clearInterval(amplitudeTimer); //振幅
			},300);
			//1.平台mobile 2.含有mediaPlayer 3.( 上次实例为空 || 最新实例和上次实例的名称不同(ps: 为了防止重复发送))
			if(UPF.is('app') && mediaPlayer && (!lastMediaPlayer || mediaPlayer.src != lastMediaPlayer.src)){
				lastMediaPlayer = mediaPlayer;
				mediaPlayer.stopRecordTime = new Date().getTime();
				mediaPlayer.stopRecord(); //停止录音
				//是否发送
				if(!$scope.cancelRecorde){
//					//人工计时方式
//					if(mediaPlayer.stopRecordTime && mediaPlayer.startRecordTime){
//						var millisecond = mediaPlayer.stopRecordTime - mediaPlayer.startRecordTime;
//						//限制
//						if(millisecond < 500){
//							mediaPlayer.release();
//							return;
//						}
//						var second = Math.ceil(millisecond/1000);
//						//发送语音
//						$scope.sendVoiceMessage(mediaPlayer,second);
//					}
					//使用media提供的getDuration获取
//					else{
						//使用interval方式获取时长
						mediaPlayer.play();
						var counter = 0;
						var timerDur = setInterval(function() {
							counter = counter + 100;
							if (counter > 2000) {
								mediaPlayer.stop();
								clearInterval(timerDur);
							}
							var dur = mediaPlayer.getDuration();
							if (dur > 0) {
								mediaPlayer.stop();
								//清除interval
								clearInterval(timerDur); //时长
								if(dur > 0.5){
									//发送语音
									$scope.sendVoiceMessage(mediaPlayer,dur);
								}
							}
						}, 100);
//					}
				}
				//取消发送
				else{
					$injector.get('media').audioEffects('beforeRecord'); //播放取消音
				}
			}
			$scope.cancelRecorde = false; //重置
		};
	    /**
	     *  发送消息
	     *  @platform mobile
	     *  @param mediaPlayer 媒体对象
	     *  @param length 媒体长度
	     */
	    $scope.sendVoiceMessage = function(mediaPlayer,duration) {
	    	var message = {
	    		to: $scope.params.peerId,
	    		from: $scope.user.id,
	    		msg: mediaPlayer.src,
	    		data: mediaPlayer.src,
	    		type:$scope.params.type,
	    	};
	    	//语音字段
	    	message.msgType = "voice",
		    message.length = Math.ceil(duration) > 60 ? 60 : Math.ceil(duration); //语音长度
	    	message.remoteUrl = mediaPlayer.src;
	    	//请求处理
		    $$chat.sendMsg(message); //发送语音
		    $scope.updateWeight(); //亲密度
		    message.media = mediaPlayer; //临时media对象
		    mediaPlayerList.push(message); //加入队列
		    $injector.get('media').audioEffects('sendAudio'); //播放取消音
		    $$chat.addMsg(message); //加入内存
	    	//scroll置底部
		    $timeout(function() {
		    	if(viewScroll)
		    		viewScroll.scrollBottom(true);
		    }, 0);
	    };
		/**
		 * 点击消息
		 * @param message 消息体
		 */
		$scope.handleMessage = function(message){
			if(message.msgType == 'voice'){
				$injector.get('media').audioEffects('press'); //按下消息语音
				//未读消息
				if($rootScope.USER.id != message.from && message.hasOwnProperty('isListened') && !message.isListened){ //1.过滤自己的消息 2.message自带isListened属性 3.isListened == false未读
					var unListenedList = []; //未读列
					var currentMessageIndex; //当前消息在mediaPlayerList的下标
					for(var i=0;i<mediaPlayerList.length;i++){
						var m = mediaPlayerList[i];
						//找到当前message的小标
						if(m.id && m.id == message.id){
							currentMessageIndex = i;
						}
						if(currentMessageIndex || currentMessageIndex == 0){
							if($rootScope.USER.id != m.from && m.hasOwnProperty('isListened') && !m.isListened){
								unListenedList.push(m); //添加未读
							}else{ //只添加连续未读
								break;
							}
						}
					}
					$scope.playMediaList(unListenedList);
				}
				//已读消息
				else{
					$scope.playMedia(message);
				}
			}
		};
		/**
		 * 播放媒体列表
		 * @param mediaList 播放列表
		 */
		$scope.playMediaList = function(mediaList){
			if(mediaList && mediaList.length>0){
				var media = mediaList[0];
				var successCallback = function(){
					mediaList.shift(); //删除数组第一位
					$scope.playMediaList(mediaList);
				};
				$scope.playMedia(media,successCallback);
			}
		};
		/**
		 * 播放媒体
		 * @param message 消息体
		 * successCallback 播放成功回调
		 */
		$scope.playMedia = function(message,successCallback){
			//关闭正播放中的媒体
			var pause = $scope.stopMedia(message);
			if(pause){
				return;
			}
			//切换播放图片
			function startInterval(message){
				message.playStatus = 0;
				var interval = setInterval(function(){
					switch (message.playStatus){
					case 0:
						$scope.$apply(function(){
							message.playStatus++;
						});
						break;
					case 1:
						$scope.$apply(function(){
							message.playStatus++;
						});
						break;
					case 2:
						$scope.$apply(function(){
							message.playStatus++;
						});
						break;	
					case 3:
						$scope.$apply(function(){
							message.playStatus = 1;
						});
						break;
					}
				},500);
				return interval;
			}
			//mobile播放：本地缓存/远程路径
			if(UPF.is('app')){
				var url = message.remoteUrl;
				var interval;
				//IOS特殊处理
				if(UPF.is('ios') && message.localUrl){
                    url = message.localUrl;
                }
				if(url){
					if(!message.media){
						message.media = new Media(url);
					}
					message.media.successCallback = function(){ //1.完成当前play,record,stop
						message.media.release();
						clearInterval(interval);
						$scope.$apply(function(){
							message.playStatus = 0;
						});
						message.media.playing = false;
						//播放完毕语音
	        			$injector.get('media').audioEffects('playend');
						//播放完毕回调
	                	if(successCallback){
	                		successCallback();
	                	}
					};
					message.media.errorCallback = function(){
						clearInterval(interval);
						$scope.$apply(function(){
							message.playStatus = 0;
						});
						message.media.playing = false;
					};
					message.media.statusCallback = function(state){ //状态变化触发
						if(state == Media.MEDIA_RUNNING){ //播放中
							interval = startInterval(message); //语音播放中动画
						}
						if(state == Media.MEDIA_PAUSED){ //暂停
							successCallback = null; //取消回掉函数
							clearInterval(interval); //关闭播放动画
						}
					}
					//开始播放
					message.media.play();
					message.media.playing = true;
				}
			}
			//web： 远程路径
			else{
				var xhr = new XMLHttpRequest();
				 xhr.addEventListener("load", function(e) {
					 //语音流路径
					 var audioUrl = window.URL.createObjectURL(xhr.response);
					 //播放audio
					 var audio = document.createElement("audio");
					 audio.src = audioUrl;
					 audio.onerror = function() {
	                	clearInterval(interval);
	                	$injector.get('toastr').error('当前浏览器不支持播放此音频');
	                	message.media.playing = false;
					 };
					 audio.onended = function(){
	                	clearInterval(interval); //清除
	                	$scope.$apply(function(){
							message.playStatus = 0;
						});
	                	message.media.playing = false;
	                	//播放完毕语音
	        			$injector.get('media').audioEffects('playend');
	                	//播放完毕回调
	                	if(successCallback){
	                		successCallback();
	                	}
					 };
					 audio.onpause = function(){
					 	clearInterval(interval); //清除
	                	$scope.$apply(function(){
							message.playStatus = 0;
						});
	                	message.media.playing = false;
					 };
					 audio.play();
					 message.media = audio;
					 var interval = startInterval(message);
					 message.media.playing = true;
			        }, false);
				xhr.responseType = 'blob';
				xhr.open('GET',message.url); //web端返回url
				var innerHeaer = {
			        'X-Requested-With' : 'XMLHttpRequest',
			        'Accept' : 'application/octet-stream',
			        'share-secret' : message.secret,
			        'Authorization' : 'Bearer ' + message.accessToken,
			        "Accept" : "audio/mp3"
			    };
				for(var key in innerHeaer){
			        if(innerHeaer[key]){
			            xhr.setRequestHeader(key, innerHeaer[key]);
			        }
			    }
				xhr.send(null);
			}
			//过滤自己的语音
			if($rootScope.USER.id != message.from && !message.isListened){
				//设置语音已读
				if(UPF.is('android')){
					var params = {
						msgId: message.id
					};
					if(message.type == 'groupchat'){
						params.convId = $stateParams.hxid;
					}else if(message.type == 'chat'){
						params.convId = $stateParams.id;
					}
					$injector.get('$$chat').setAudioListened(params,function(s){
						message.isListened = true;
					});
				}else if(UPF.is('ios')){
	                message.isRead = true;
	                message.isListened = true;
	                if(!message.messageId){
	                	message.messageId = message.msgid;
	                }
	                $injector.get('$$chat').setAudioListened(message);
            	}else{
					message.isListened = true;
				}
			}
		};
		/**
		 * 关闭媒体
		 * 切换
		 * 停止当前
		 * 录音
		 */
		$scope.stopMedia = function(message){
			var pause = false;
			//停止当前
			if(message && message.media){
				if(message.media.playing){
					pause = true;
				}
			}
			//重置message.playStatus为0
			angular.forEach(mediaPlayerList,function(m){
				m.playStatus = 0;
				if(m.media && m.media.playing){
					if(m.media.stop){ //mobile
						m.media.pause();
						m.media.stop(); //关闭媒体
					}else if(m.media.pause){ //web
						m.media.pause();
					}
				}
			});
			return pause;
		};

		$scope.onDragDown = function(){
			$scope.cancelRecorde = false;
		};
		$scope.onDragUp = function(){
			$scope.cancelRecorde = true;
		};
		/**
		 * 点击
		 */
		$scope.clickContent = function(){
			//如果emotion或者tools展开则关闭
			var hide = false;
			for(var key in $scope.showTools){
				if($scope.showTools[key]){
					hide = true;
				}
			}
			//关闭tool
			if(hide){
				$scope.taggleTools();
			}
		};
	    $scope.$on('taResize', function(e, ta) {
			if (!ta) return;
			var ih = ta[0].offsetHeight;
			if (ih<36){
				ih = 36;
				ta[0].style.height = 36+'px';
			}
			if (!$scope.footerBar) return;
			var fh = ih + 8;
			fh = (fh > 105) ? 105: fh;
			sh = ih+2;
			$scope.footerBar.style.height = fh + 'px';
			$scope.taWrap.style.height = sh + 'px';
//			$scope.scollHeight = {height: sh+'px'};
//			scroller.style.bottom = newFooterHeight + 'px'; 
	    });
	    
	    $scope.$on('chatMsg',function(e, d){
			if(d.msg == "gotMsg"){
				$scope.keepKb = true;
				$scope.getMessages();
			    $timeout(function() {
			    	if(viewScroll)
			    	viewScroll.scrollBottom(true);
			    }, 0);
			}else if(d.msg == "changeName"){
				$scope.toUser.name = d.newName;
				$scope.toUserName = d.newName;
			}else if(d.msg == "refushUser"){
				try{
					$scope.$digest();
				}catch(e){
					
				}
			}
	    });
	    $scope.$on('$ionicView.enter', function() {
			service.validUser();
	    	$rootScope.currentChatId = $scope.params.id;
	    	if ($scope.params.peerId != ''){
		    	$scope.getMessages(function(){
		    		$scope.validPeer(function(){
					    $timeout(function() {
					    	if(viewScroll)
					    	viewScroll.scrollBottom(true);
					    }, 100);
		    		});
		    	});
	    	}else{
	    		$scope.validPeer(function(){
	    			$scope.getMessages(
	    				function(){
	    					$timeout(function() {
	    						if(viewScroll)
	    							viewScroll.scrollBottom(true);
	    					}, 100);
	    				});
    				});
	    	}
	    });

	    $scope.$on('$ionicView.beforeLeave', function() {
	    	$rootScope.currentChatId = '';
	    	//关闭所有音频
	    	$scope.stopMedia();
		});

	    $scope.$on('$destroy', function() {
	    	if($scope.modal){
	    		$scope.modal.remove();
	    	}
	      });
	    /**
	     * 监听程序被切至后台事件
	     */
	    $rootScope.$on('pause',function(){
	    	//关闭所有音频
	    	$scope.stopMedia();
	    });
	    /**
	     * 监听程序被切至后台事件
	     */
	    $rootScope.$on('resign',function(){
	    	//关闭所有音频
	    	$scope.stopMedia();
	    });
	});