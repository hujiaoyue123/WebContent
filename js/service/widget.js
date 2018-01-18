/** 组件*/
angular.module("app")
	.factory("$$widget",function($rootScope,$ionicModal,$ionicPopover,$ionicPopup){
		/** 页面*/
		var extend = angular.extend;
		var HTML = {
			modal: {
				fileSelect: "tpl/modal/fileSelect.html", //选择文件
				qrcode: "tpl/modal/qrcode.html", //二维码名片
				selectUser: "tpl/modal/selectUser.html", //选择用户
				userSelect: "tpl/modal/userSelect.html", //选择人员、群组
				newFeedBack: "tpl/modal/newFeedBack.html", //新建反馈
				adminRegister: "tpl/modal/adminRegister.html"
			},
			popover: {
				panMenu: "tpl/popover/panMenu.html", //盘顶菜单
				msgMenu: "tpl/popover/msgMenu.html", //消息顶菜单
				contactMenu: "tpl/popover/contactMenu.html", //联系人菜单
				contactOrgMenu: "tpl/popover/contactOrgMenu.html", //联系人菜单
				newContactMenu: "tpl/popover/newContact.html", //新联系人顶菜单
				qrcodeMenu: "tpl/popover/qrcodeMenu.html", //二维码名片
				fileDetail: "tpl/popover/fileDetail.html", //文件详情
				chatMenu: "tpl/popover/chatMenu.html", //聊天菜单
				showPageMenu: "tpl/popover/showPageMenu.html" //网页菜单
			},
			popup: {
				shareSelect: "tpl/popup/share.html" //选择分享方式
			}
		};
		/** 弹窗*/
		var POPUP = {
			popupWindow: null,
			/** options*/
			/* title
			 * cssClass
			 * subTitle
			 * template
			 * templateUrl
			 */	
			/** 资源类popup*/
			resource: {
				/** 文件夹-新建*/
				newFolder: function(callback){
					var options = {
						title: "新建文件夹"
					};
					//prompt
					POPUP.prompt(options).then(function(result){
						if(callback && result){
							callback(result);
						}
					});
				},
				/** 文件夹-重命名*/
				renameFolder: function(folder,callback){
					var options = {
						title: "重命名",
						defaultText: folder.name	
					};
					//prompt
					POPUP.prompt(options).then(function(result){
						if(callback && result && result != options.defaultText){
							var updateFolder = angular.copy(folder);
							updateFolder.name = result;
							//执行回调
							callback(updateFolder);
						}
					});
				},
				/** 文件夹-删除*/
				deleteFolder: function(callback){
					var options = {
						title: "提醒",
						template: "<p style='text-align:center;'>确定删除该文件夹?</p>"
					};
					//confirm
					POPUP.confirm(options).then(function(result){
						if(callback && result){
							callback();
						}
					});
				},
				/** 资源-重命名*/
				renameResource: function(res,callback){
					var options = {
						title: "重命名",
						defaultText: res.filename.replace("." + res.fileext, "")	
					};
					//prompt
					POPUP.prompt(options).then(function(result){
						if(callback && result && result != options.defaultText){
							var updateRes = angular.copy(res);
							updateRes.filename = result + "." + res.fileext;
							//执行回调
							callback(updateRes);
						}
					});
				},
				/** 文件夹-删除*/
				deleteResource: function(callback){
					var options = {
						title: "提醒",
						template: "<p style='text-align:center;'>确定删除该资源?</p>"
					};
					//confirm
					POPUP.confirm(options).then(function(result){
						if(callback && result){
							callback();
						}
					});
				}
			},
			/** 分享*/
			share: {
				/** 选择分享*/
				selectShare: function(scope){
					var options = {
						title: "分享",
						scope: scope,
						templateUrl: HTML.popup.shareSelect,
						buttons:[{
							text: "取消"
						}]
					};
					//show
					POPUP.show(options);
				},
				/** 删除分享*/
				deleteShare: function(callback){
					var options = {
						title: "提醒",
						template: "<p style='text-align:center;'>确定删除该分享?</p>"
					};
					//confirm
					POPUP.confirm(options).then(function(result){
						if(callback && result){
							callback();
						}
					});
				}
			},
			/** 联系人*/
			contact: {
				/** 删除联系人*/
				deleteUser: function(user,callback){
					var options = {
						title: "提醒",
						template: "<p style='text-align:center;'>确定删除<span class='mf-blue-color'>"+ user.username +"</span>?</p>"
					};
					//confirm
					POPUP.confirm(options).then(function(result){
						if(callback && result){
							callback();
						}
					})
				}
			},
			/** 重命名*/
			rename: function(){
				var options = {
					title: "重命名",
					defaultText: ""
				};
				return POPUP.prompt(options);
			},
			/** 新建文件夹*/
			newFolder: function(){
				var options = {
					title: "新建文件夹",
					template: "<input ng-model='folder.name' autofocus>"
				};
			},
			/** 更换头像*/
			updateAvatar: function(scope){
				var options = {
					title: "更换头像",
					scope: scope
				};
//				var accept = "image/png,image/jpeg,image/jpg,image/bmp,image/gif";
//				var btn1 = "<label class='button button-block button-calm'>修改头像<input type='file' hidden file-select='"+action+"' pattern="+accept+" accept="+accept+"></label>";
				var btn1 = '<button class="button button-block button-calm" ng-click="USER.updateUserPhotoOnMobile(\'CAMERA\')">拍照</button>';
				var btn2 = '<button class="button button-block button-calm" ng-click="USER.updateUserPhotoOnMobile(\'PHOTOLIBRARY\')">从相册中选择</button>';
				options.template = btn1 + btn2;
				options.buttons = [{
					text: "取消"
				}];
				POPUP.show(options);
			},
			/** @deprecated
			 * 修改昵称
			 * scope
			 * fn 函数
			 */
			updateUserName: function(scope,fn){
				scope.tempUser = {
					username: $rootScope.USER.username
				};
				var options = {
					title: "修改名字",
					subTitle: "请使用您的真实姓名",
					template: "<input ng-model='tempUser.username' autofocus>",
					scope: scope,
					buttons:[{
						text: "取消",
						type: "button-default",
					},{
						text: "确定",
						type: "button-positive",
						onTap: function(e){
							if(!scope.tempUser.username){
								e.preventDefault();
							}else if(scope.tempUser.username == $rootScope.USER.username){
								return;
							}else{
								if(fn){
									fn(scope.tempUser);
								}
							}
						}
					}]
				};
				POPUP.show(options);
			},
			/** 修改签名 */
			updateUserSign: function(scope,fn){
				scope.tempUser = {
					sign: $rootScope.USER.sign
				};
				var options = {
					title: "定义签名",
					subTitle: "一个好的签名，会让人印象深刻.",
					template: '<textarea ng-model="tempUser.sign" style="height:100px;"'
				        + 'maxlength="200"'
				        + 'placeholder="在此处输入签名"'
				        + '>',
					scope: scope,
					buttons:[{
						text: "取消",
						type: "button-default",
					},{
						text: "确定",
						type: "button-positive",
						onTap: function(e){
							//不加非空验证,万一用户不想要签名呢
							if(fn){
								fn(scope.tempUser);
							}
						}
					}]
				};
				POPUP.show(options);
			},
			/** 修改性别*/
			updateUserSex: function(scope){
				scope.tempUser = {
					sex:  $rootScope.USER.sex
				};
				var options = {
					title: "选择性别",
					template: "<ion-radio ng-model='tempUser.sex' ng-value='1' ng-click=\"USER.updateUser({sex:tempUser.sex})\">男</ion-radio><ion-radio ng-model='tempUser.sex' ng-value='0' ng-click=\"USER.updateUser({sex:tempUser.sex})\">女</ion-radio>",
					scope: scope,
					buttons: [{
						text: "取消"
					}]
				};
				POPUP.show(options);
			},
			/** 修改连接设备 */
			updateConnectDevice:function(scope){
				var options = {
					title:"选择连接",
					template :"<div ng-repeat='item in zsettingItems.zsAddresslist track by $index'><ion-radio ng-value='{{item.address}}' ng-click=\"operate({type: 'changeDevice',item : '{{item}}'})\">{{item.name}}</ion-radio></div>",
					scope:scope,
					buttons:[{
						text:"取消"
					}]
				};
				POPUP.show(options);
			},
			/**
			 * 修改设备语言
			 */
			updateDeviceLanguage:function(scope){
				var options = {
					title:"选择语言",
					template :"<div ng-repeat='item in zsettingItems.deviceLanguageList track by $index'><ion-radio ng-value='{{item.inx}}' ng-click=\"operate({type: 'changeLanguage',item : '{{item}}'})\">{{item.name}}</ion-radio></div>",
					scope:scope,
					buttons:[{
						text:"取消"
					}]
				};
				POPUP.show(options);
			},
			/**
			 * 修改显示比例
			 */
			changeDeviceShowZoom:function(scope){
				var options = {
					title:"选择显示比例",
					template :"<div ng-repeat='item in zsettingItems.videoAspectRatioList track by $index'><ion-radio ng-value='{{item}}' ng-click=\"operate({type: 'changeShowZoom',item : '{{item}}'})\">{{item.name}}</ion-radio></div>",
					scope:scope,
					buttons:[{
						text:"取消"
					}]
				};
				POPUP.show(options);
			},
			/**
			 * 修改屏幕设置
			 */
			changeDeviceByUi:function(scope){
				var options = {
						title:"选择显示比例",
						template :"<div ><ion-radio ng-click=\"operate({type: 'changeByUi',item : 'ON'})\">4:3</ion-radio><ion-radio  ng-click=\"operate({type: 'changeByUi',item : 'OFF'})\">16:9</ion-radio></div>",
						scope:scope,
						buttons:[{
							text:"取消"
						}]
					};
					POPUP.show(options);
			},
			/**
			 * 退出
			 */
			quitGroupWin: function(scope){
				var options = {
					title: "系统提示",
					subTitle: "请您确认是否退出！",
					//template: "<input type=\"password\" placeholder=\"密码\" ng-model='Pwd.wifi' autofocus>",
					scope: scope,
					buttons:[{
						text: "取消",
						type: "button-default",
					},{
						text: "确认",
						type: "button-positive",
						onTap: function(e){
							if(!scope){
								e.preventDefault();
							}else {
								scope.quitGroup();
							}
						}
					}]
				};
				POPUP.show(options);
			},
			/**
			 * 设置连接
			 */
			connectWifiWin: function(scope,fn,item){
				scope.Pwd= {};
				var options = {
						title: "连接网络",
						subTitle: "您将连接到:"+item.dspName,
						template: "<input type=\"password\" placeholder=\"密码\" ng-model='Pwd.wifi' autofocus>",
						scope: scope,
						buttons:[{
							text: "取消",
							type: "button-default",
						},{
							text: "连接",
							type: "button-positive",
							onTap: function(e){
								if(!scope.Pwd.wifi){
									e.preventDefault();
								}else if(fn){
									fn(scope.Pwd.wifi);
								}
							}
						}]
				};
				POPUP.show(options);
			},
			changeDeviceNameWin: function(scope,fn){
				scope.dev= {};
				scope.dev.name = scope.zsettingItems.zsDeviceName;
				var options = {
						title: "修改设备名称",
						subTitle: "您将修改的设备:"+scope.zsettingItems.zsDeviceName,
						template: "<input type=\"text\" placeholder=\"设备名称 \" ng-model='dev.name' autofocus>",
						scope: scope,
						buttons:[{
							text: "取消",
							type: "button-default",
						},{
							text: "确定",
							type: "button-positive",
							onTap: function(e){
								if(!scope.dev.name){
									e.preventDefault();
								}else if(fn){
									fn(scope.dev.name);
								}
							}
						}]
				};
				POPUP.show(options);
			},
			/** 选择分享*/
			selectShare: function(scope){
				var options = {
					title: "分享",
					scope: scope,
					templateUrl: HTML.popup.shareSelect,
					buttons:[{
						text: "取消"
					}]
				};
				POPUP.show(options);
			},
			/** 获取文本*/
			getText:function(opts){
			    var scope = $rootScope.$new(true);
			    scope.data = {};
			    scope.data.fieldtype = opts.inputType ? opts.inputType : 'text';
			    scope.data.response = opts.defaultText ? opts.defaultText : '';
			    scope.data.placeholder = opts.inputPlaceholder ? opts.inputPlaceholder : '';
			    scope.data.maxlength = opts.maxLength ? parseInt(opts.maxLength) : '';
			    var text = '';
			    if (opts.template && /<[a-z][\s\S]*>/i.test(opts.template) === false) {
			      text = '<span>' + opts.template + '</span>';
			      delete opts.template;
			    }
			    return POPUP.show(extend({
			      template: text + '<textarea ng-model="data.response" style="height:100px;"'
			        + 'type="{{ data.fieldtype }}"'
			        + 'maxlength="{{ data.maxlength }}"'
			        + 'placeholder="{{ data.placeholder }}"'
			        + ' autofocus >',
			      scope: scope,
			      buttons: [{
			        text: opts.cancelText || '取消',
			        type: opts.cancelType || 'button-default',
			        onTap: function() {}
			      }, {
			        text: opts.okText || '确定',
			        type: opts.okType || 'button-positive',
			        onTap: function() {
			          return scope.data.response || '';
			        }
			      }]
			    }, opts || {}));
			},
			/** 文件需要审批-popup*/
			fileAuditTip: function(owner,successCallback,errorCallback){
				var options = {
					title: '提示',
					template: '<center>此操作需要文件夹所有者<span style="color: red;margin: 0 3px;">'+ owner +'</span>审批。<br/>是否继续？</center>',
					okText: '继续'
				};
				POPUP.confirm(options).then(function(r){
					if(r && successCallback){
						successCallback(r);
					}else if(errorCallback){
						errorCallback();
					}
				})
			},
			/**
			 * 无wifi情况下，播放提醒
			 */
			tipBeforePlay: function (successCallback,errorCallback) {
				var options = {
					title: '提醒',
					template:'<p style="color: #323232;">当前网络无WiFi，需要打开2G/3G/4G播放开关才能播放。</p>',
					okText: '打开',
					cancelText: '取消'
				};
				POPUP.confirm(options).then(function(r){
					if(r && successCallback){
						successCallback(r);
					}else if(errorCallback){
						errorCallback();
					}
				})
			},
			/**
			 * 显示掌秀勋章信息
			 */
			showZXBadgeInfo: function () {
				var options = {
					//title: '掌秀勋章',
					cssClass:'whiteGroundColor',		
					template: '<div style="text-align:center;border:0px;margin:0px auto;"><img style="background-color:#fbebda" class="user-avatar-large" src="img/about/medal_zx.png"></img><h4 style="font-weight:300;">掌秀勋章</h4><p style="font-size:16px;color:#666666">购买掌秀设备并与掌文账号关联<br/>获赠掌秀勋章一枚</p></div>'
					//opacity:0.3
				};
				POPUP.alert(options);
			},
			/** 实现方式
			 * show,alert,confirm,prompt,close
			 */
			show: function(options){
				POPUP.popupWindow = $ionicPopup.show(options);
				return POPUP.popupWindow;
			},
			/** 弹框提醒等
			 * 常用：title,template
			 * 全部：title,cssClass,subTitle,template,templateUrl,okText,okType
			 */
			alert: function(options){
				if(!options.okText){
					options.okText = '确定';
				}
				POPUP.popupWindow = $ionicPopup.alert(options);
				return POPUP.popupWindow;
			},
			/** 确认
			 * 常用：title,template
			 * 全部：title,cssClass,subTitle,template,templateUrl,cancelText,cancelType,okText,okType
			 */
			confirm: function(options){
				if(!options.cancelText){
					options.cancelText = "取消";
				}
				if(!options.okText){
					options.okText = "确定";
				}
				POPUP.popupWindow = $ionicPopup.confirm(options);
				return POPUP.popupWindow;
			},
			/**	输入框
			 * 常用：title,template,defaultText,inputPlaceholder
			 * 全部：title,cssClass,subTitle,template,templateUrl,inputType,defaultText,maxLength,inputPlaceholder,cancelText,cancelType,okText,okType
			 */
			prompt: function(options){
				if(!options.cancelText){
					options.cancelText = "取消";
				}
				if(!options.okText){
					options.okText = "确定";
				}
				POPUP.popupWindow = $ionicPopup.prompt(options);
				return POPUP.popupWindow;
			},
			/** 关闭*/
			close: function(){
				if(POPUP.popupWindow){
					POPUP.popupWindow.close();
				}
			}
		};
		/** 模态窗*/
		var MODAL = {
			modalWindow: null,
			/** 参数
			 * scope 控制器作用域
			 * dataPackage
			 */	
			/** 移动文件*/
			fileSelect: function(scope,dataPackage){
				var newScope = scope.$new(true);
				newScope.dataPackage = dataPackage;
				MODAL.show({scope: newScope}, HTML.modal.fileSelect);
			},
			/** 二维码名片*/
			qrcode: function(scope){
				MODAL.show({scope:scope}, HTML.modal.qrcode);
			},
			/** 新建反馈*/
			newFeedBack: function(scope){
				MODAL.show({scope:scope},HTML.modal.newFeedBack);
			},
			/** 选择人员对话框 */
			selectUser: function(param, fn){
				var id = "selectUser";
				var p = {};
				p.scope = param.scope || $rootScope.$new(true);
				p.scope.fn = fn;
				p.scope.selectParam = param;
				MODAL.show(p, HTML.modal.selectUser);
			},
			/** 分享选择人员、群组*/
			userSelect: function(scope,dataPackage){
				var newScope = scope.$new(true);
				newScope.dataPackage = dataPackage;
				MODAL.show({scope: newScope},HTML.modal.userSelect);
			},
			/** 显示*/
			show: function(param,html){
				$ionicModal.fromTemplateUrl(html,param)
					.then(function(modal){
						MODAL.modalWindow = modal;
						modal.show();
					});
			},
			/** 隐藏*/
			hide: function(){
				if(MODAL.modalWindow){
					MODAL.modalWindow.hide();
				}
			},
			/** 删除*/
			remove: function(){
				if(MODAL.modalWindow){
					MODAL.modalWindow.remove();
				}
			},
			adminRegister: function(scope,groupid,fn){
				var newScope = scope.$new(true);
				newScope.groupid = groupid;
				newScope.fn = fn;
				MODAL.show({scope: newScope}, HTML.modal.adminRegister);
			}
		};
		/** Popover悬浮框*/
		var POPOVER = {
			popoverWindow: null,
			/** 参数
			 * scope 控制器作用域
			 * id Popover实例的命名
			 * $event 事件
			 */
			/** 右上菜单 */
			topMenu: function(menuName, scope, id, $event){
				POPOVER.show(scope, id, $event, HTML.popover[menuName]);
			},
			/** 盘-右上菜单*/
			panMenu: function(scope,id,$event){
				POPOVER.show(scope, id, $event, HTML.popover.panMenu);
			},
			/** 消息-右上菜单*/
			msgMenu: function(scope,id,$event){
				POPOVER.show(scope, id, $event, HTML.popover.msgMenu);
			},
			/** 联系人首页-菜单*/
			contactMenu: function(scope,id,$event){
				POPOVER.show(scope, id, $event, HTML.popover.contactMenu);
			},
			/** 机构部门群组联系人-菜单*/
			contactOrgMenu: function(scope,id,$event){
				POPOVER.show(scope, id, $event, HTML.popover.contactOrgMenu);
			},
			/** 新联系人-右上菜单*/
			newContactMenu: function(scope,id,$event){
				POPOVER.show(scope, id, $event, HTML.popover.newContactMenu);
			},
			/** 二维码名片-右上菜单*/
			qrcodeMenu: function(scope,id,$event){
				POPOVER.show(scope,id,$event,HTML.popover.qrcodeMenu);
			},
			/** 文件详情-右上菜单*/
			fileDetail: function(scope,id,$event){
				POPOVER.show(scope,id,$event,HTML.popover.fileDetail);
			},
			/** 聊天页面-菜单*/
			chatMenu: function(scope,id,$event){
				POPOVER.show(scope, id, $event, HTML.popover.chatMenu);
			},
			/** 显示
			 * 
			 */
			show: function(scope,id,$event,html){
				$ionicPopover.fromTemplateUrl(html,{scope: scope})
					.then(function(popover){
						POPOVER.popoverWindow = scope[id] = popover;
						if($event){
							popover.show($event);
						}
					});
			},
			/** 隐藏*/
			hide: function(){
				if(POPOVER.popoverWindow){
					POPOVER.popoverWindow.hide();
				}
			}
		};
		/**
		 * 显示图片
		 */
		var showSingleImage = function(src){
			//使用modal方式
			var scope = $rootScope.$new(true);
			scope.image = {
				src: src
			};
			var options = {
				scope: scope,
				animation: 'none'
			}
			$ionicModal.fromTemplateUrl("tpl/modal/showImage.html",options)
				.then(function(modal){
					modal.show();
					scope.modal = modal;
				});
		};
		return {
			MODAL: MODAL, //模态窗
			POPOVER: POPOVER,
			POPUP: POPUP,
			showSingleImage: showSingleImage
		};
	});