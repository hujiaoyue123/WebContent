/** 组件 */
angular.module("app")
	.service("component",function(service,$rootScope){
		var popup = {};
		/** T1-分享密码验证*/
		popup.pwdValid = function(scope){
			scope.temp = {};
			var popup = {};
			popup.template = "<input type='password' ng-model='temp.password' autofocus/>";
			popup.title = "请输入资源密码";
			popup.subTitle = "";
			popup.scope = scope;
			popup.buttons = [];
			var btn1={},btn2={};
			btn1.text = "关闭";
			btn2.text = "确定";
			btn2.type = "button-positive";
			btn2.onTap = function(e){
				if(scope.temp.password){
					scope.validPwd(scope.temp.password);
				}else{
					e.preventDefault();
				}
			};
			popup.buttons.push(btn1,btn2);
			return popup;
		};
		/** T2-文件/文件夹重命名*/
		popup.rename = function(scope,file,fnName){
			//资源filename，文件夹name
			var splitArray,typeLength,fileType;
			if(file.filename && file.iontype != "folder"){
				splitArray = file.filename.split(".");
				typeLength = splitArray[splitArray.length-1].length;
				fileType = splitArray[splitArray.length-1];
				file.name = file.filename.slice(0,file.filename.length - typeLength - 1);
			}
			if(file){ //只有文件夹操作用携带file参数
				scope.file = angular.copy(file);
			}
			var popup = {};
//			var oldTitle = scope.file.title; //保留原值
			popup.template = "<input ng-model='file.name' autofocus>";
			popup.title = "重命名";
			popup.scope = scope;
			popup.buttons = [];
			var cancel={},ensure={};
			cancel.text = "取消";
//			cancel.onTap = function(){ //撤销修改，就还原值
//				scope.file.name = oldTitle;
//			};
			ensure.text = "确定";
			ensure.type = "button-positive";
			ensure.onTap = function(e){
				if(!scope.file.name){
					e.preventDefault();
				}else{
					var updateFile = {
						id: file.id,
						filename: file.iontype != "folder" ?scope.file.name + "." + fileType:scope.file.name
					};
					if(typeof fnName == "object"){
						scope[fnName[0]][fnName[1]](updateFile);
					}else if(typeof fnName == "string"){
						scope[fnName](updateFile);
					}
				}
			};
			popup.buttons.push(cancel,ensure);
			return popup;
		};
		/** T3-新建文件夹*/
		popup.newFolder = function(scope,fnName){
			var popup = {};
			scope.folder = {};
			popup.template = "<input ng-model='folder.name' autofocus>";
			popup.title = "新建文件夹";
			popup.scope = scope;
			popup.buttons = [];
			var cancel={},ensure={};
			cancel.text = "取消";
			ensure.text = "确定";
			ensure.type = "button-positive";
			ensure.onTap = function(e){
				if(!scope.folder.name){
					e.preventDefault();
				}else{
					if(typeof fnName == "object"){
						scope[fnName[0]][fnName[1]](scope.folder.name);
					}else if(typeof fnName == "string"){
						scope[fnName](scope.folder.name);
					}
				}
			};
			popup.buttons.push(cancel,ensure);
			return popup;
		};
		/** T4-昵称*/
		popup.editUserName = function(scope,fn){
			var popup = {};
			scope.tempUser = {
				username: $rootScope.USER.username
			};
			popup.template = "<input ng-model='tempUser.username' autofocus>";
			popup.title = "修改昵称";
			popup.subTitle = "一个好的名字，更容易让人记住.";
			popup.scope = scope;
			popup.buttons = [];
			var cancel = {},ensure={};
			cancel.text = "取消";
			ensure.text = "确定";
			ensure.type = "button-positive";
			ensure.onTap = function(e){
				if(!scope.tempUser.username){
					e.preventDefault();
				}else if(scope.tempUser.username == $rootScope.USER.username){
					return;
				}else{
					if(fn){
						if(typeof fn == "object"){
							scope[fn[0]][fn[1]](scope.tempUser);
						}else{
							scope[fn](scope.tempUser);
						}
					}
				}
			};
			popup.buttons.push(cancel,ensure);
			return popup;
		};
		/** T5-拍照*/
		popup.camera = function(scope){
			var popup = {};
			popup.title = "更换头像";
			popup.scope = scope;
			var btn1 = "<a class='button button-block button-calm' ng-click=\"openCamera('CAMERA')\">拍照</a>";
			var btn2 = "<a class='button button-block' ng-click=\"openCamera('PHOTOLIBRARY')\">相册</a>";
			popup.template = btn1 + btn2;
			popup.buttons =[{
				text: "取消"
			}];
			return popup;
		};
		/** T6-删除提醒 */
		popup.remove = function(scope,file,fnName){
			var popup = {};
			popup.title = "提醒";
//			if(file.sharetype == 1){
//				popup.subTitle = "该资源已分享，同时也会删除该分享.";
//			}
			popup.scope = scope;
			popup.template = "<p style='text-align:center;'>确定删除该资源?</p>";
			popup.buttons = [];
			//按钮
			var cancel = {},ensure = {};
			cancel.text = "取消";
			ensure.text = "确定";
			ensure.type = "button-positive";
			ensure.onTap = function(e){
				if(fnName){
					if(typeof fnName == "object"){
						scope[fnName[0]][fnName[1]](file);
					}else if(typeof fnName == "string"){
						scope[fnName](file);
					}
				}else{
					scope.remove(file);
				}
			};
			popup.buttons.push(cancel,ensure);
			return popup;
		};
		/** T7-分享-添加 */
		popup.fileShare = function(scope,file){
			scope.temp = {};
			scope.temp.action = "add"; //分享操作
			scope.temp.id = file.id; //文件id
//			scope.temp.password = "1234"; //默认密码
			scope.temp.time = service.getDelayDay(); //默认延后3天
			if(scope.ctrlname == "ppanCtrl"){
				scope.temp.ctrl = 0; 
			}else if(scope.ctrlname == "cpanCtrl"){
				scope.temp.ctrl = 1;
			}
			var popup = {};
			popup.templateUrl = "tpl/popup/share.html";
			popup.title = "添加分享";
			popup.scope = scope;
			popup.buttons = [];
			var btn1={},btn2={};
			btn1.text = "取消";
			btn2.text = "分享";
			/** Mobile 
			btn2.text = "分享并复制";*/
			btn2.type = "button-positive";
			btn2.onTap = function(e){
				scope.fileShare(scope.temp); //分享
			};
			popup.buttons.push(btn1,btn2);
			return popup;
		};
		/**复制链接*/
		popup.copyLink = function(scope,link){
			scope.temp = {};
			scope.temp.copyLink = link;
			var popup = {};
			popup.scope = scope;
			popup.title = "文件分享链接";
			popup.template = "<input ng-model='temp.copyLink' readonly/><button id='copyBtn' style='display:none' clipboard text='temp.copyLink' on-copied='onCopy(1)' on-error='onCopy(2)'>copy</button>";
			popup.buttons = [];
			var btn1={},btn2={};
			btn1.text = "取消";
			btn2.text = "复制链接";
			btn2.type = "button-positive";
			btn2.onTap = function(e){
				document.getElementById("copyBtn").click();
			};
			popup.buttons.push(btn1,btn2);
			return popup;
		};
		/** T8-分享-编辑 */
		popup.editShare = function(scope,params){
			scope.temp = angular.extend({},params);
			scope.temp.time = params.exptime;
			scope.$watch("temp",function(value){
				scope.temp.copyLink = service.getCopyLink(scope.temp.id,scope.temp.password);
			},true);
			if(scope.ctrlname == "ppanCtrl"){
				scope.temp.ctrl = 0; 
			}else if(scope.ctrlname == "cpanCtrl"){
				scope.temp.ctrl = 1;
			}
			var popup = {};
			popup.templateUrl = "component/share.html";
			popup.title = "修改分享";
			if(scope.ctrlname == "ppanCtrl" || scope.ctrlname == "cpanCtrl"){
				popup.subTitle = "该资源已分享";
			}
			popup.scope = scope;
			popup.buttons = [];
			var btn1={},btn2={};
			btn1.text = "取消";
			btn2.text = "分享并复制";
			btn2.type = "button-positive";
			btn2.onTap = function(e){
				scope.updateShared(scope.temp);
				//执行复制
				document.getElementById("copyBtn").click();
			};
			popup.buttons.push(btn1,btn2);
			return popup;
		};
		/** T9-app更新提示 */
		popup.appUpgrade = function(scope,title){
			var popup = {};
			popup.scope = scope;
			popup.title = "版本更新";
			popup.template = title;
			popup.buttons = [];
			var btn1={},btn2={};
			btn1.text = "下次再说";
			btn2.text = "马上更新";
			btn2.type = "button-positive";
			btn2.onTap = function(e){
				scope.appdownload();
			};
			popup.buttons.push(btn1,btn2);
			return popup;
		};
		/** T10-app分享 */
		popup.wxShare = function(scope,file){
			scope.tempfile = angular.extend({},file);
			var popup = {};
			popup.title = "分享";
			popup.scope = scope;
			popup.templateUrl = "component/wxShare.html";
			popup.buttons = [];
			var btn1={};
			btn1.text="取消分享";
			popup.buttons.push(btn1);
			return popup;
		};
		/** T11-选择分享类型 */
		popup.share = function(scope,file,copyLink){
			scope.tempfile = angular.copy(file);
			scope.copyLink = copyLink;
			var popup = {};
			popup.title = "分享";
			popup.scope = scope;
			popup.templateUrl = "tpl/popup/share.html";
			popup.buttons = [];
			var btn1={};
			btn1.text="取消分享";
			popup.buttons.push(btn1);
			return popup;
		};
		/** 实例*/
		this.popup = popup;
	});