/** 新建/加入企业 */
angular.module("app")
	.controller("neworg",function($scope,$$widget,$$user,$rootScope,service,$ionicPopup,$injector){
		/**
		 * $stateParams
		 * @param title backbutton文本
		 */
		$scope.$stateParams = $injector.get('$stateParams');
		$scope.fields = {};
		$scope.search = {action : 'new'};
		/**
		 * 搜索
		 * @param txt 搜索文本
		 */
		$scope.searchOrg = function(txt){
			$scope.search.action = 'new';
			if (txt && txt!=''){
				service.promiseProxy(function(promise){
					//封装参数
					var params = {
						type:'levelgroup',
						txt: txt
					};
					service.search(promise,params);
				},function(result){
					if (result.result == 1){
						//企业头像
						for(var i=0;i<result.data.length;i++){
							var org = result.data[i];
							if (org.photo){
								org.avatar = $$user.getPhoto(org.photo,org.updatetime);
							}else{
								org.avatar = $rootScope.CONFIG.defaultOrgPhoto;
							}
						}
						$scope.orgList = result.data;
					}else if(result.result == 2){
						service.activeSessionProxy(function(){
							$scope.searchOrg(txt);
						});
					}
				});
			}else{
				$scope.orgList = {};
			}
		};
		
		/**
		 * 创建企业之前
		 * @param orgname 企业名称
		 */
		$scope.beforeNewOrg = function(orgname){
			//非空验证
			if (orgname && orgname != ''){
				//同名验证
				var conflict = false;
				angular.forEach($scope.orgList,function(org){
					if(org.name == orgname){
						conflict = true;
					}
				});
				//有同名的企业
				if(conflict){
					var options = {
						title: '提醒',
						subTitle: '与现有企业同名',
						template: '<center>是否继续创建?</center>',
						cancelText: '取消',
						okText: '确定'
					};
					$injector.get('$ionicPopup').confirm(options)
						.then(function(r){
							if(r){
								//创建同名企业
								$scope.newOrg(orgname);
							}
						});
				}else{ //创建企业
					var options = {
						title: '提醒',
						template: '<center>确定使用 <span class="calm">'+orgname+'</span> 作为企业名称?</center>',
						cancelText: '取消',
						okText: '确定'
					};
					$injector.get('$ionicPopup').confirm(options)
						.then(function(r){
							if(r){
								//创建同名企业
								$scope.newOrg(orgname);
							}
						});
				}
			}
		}
		/**
		 * 创建新企业
		 * @param orgname 企业名称
		 */
		$scope.newOrg = function(orgname){
			service.promiseProxy(function(promise){
				//封装参数
				var params = {
					type:1,
					name: orgname
				};
				$$user.addGroup(promise,params);
			},function(result){
				if (result.result == 1){
					service.showMsg("success","创建成功");
					$rootScope.USER.orguser = '1';
					//发送通知
					$rootScope.$broadcast('zw.refreshContact'); //刷新联系人
					$rootScope.$broadcast('zw.refreshResource'); //刷新文件库
					//回退视图
					$injector.get('$ionicHistory').goBack();
				}else if(result.result == 2){ // session 过期
					service.activeSessionProxy(function(){
						$scope.newOrg(orgname);
					});
				}else{
					service.showMsg("error",result.description);
				}
			});
		};
		/**
		 * 进入企业详情页
		 * @param org 企业对象
		 */
		$scope.enterOrgDetail = function(org){
			if(org){
				var inParams = {
					id: org.id,
					type: org.type,
					name: org.name
				};
				$injector.get('$state').go('showGroup',inParams);
			}
		};
		/**
		 * 视图进入
		 */
		$scope.$on("$ionicView.enter",function(){
			if($scope.fields.srhInput){
				$scope.fields.srhInput.focus();
				if(UPF.is("android")){
        			cordova.plugins.Keyboard.show();
        		}
			}
		});
	});