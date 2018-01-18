/**
 * 列表文件
 */
angular.module('app')
	.controller('zltFile',function($scope,$rootScope,$stateParams,$injector){
		/** 时间转换*/
		var convertDate = function(cols,content){
			angular.forEach(cols,function(col){
				if(col.type == 'date'){
					angular.forEach(content,function(c){
						if(c.hasOwnProperty(col.cid)){
							c[col.cid] = new Date(c[col.cid]);
						}
					});
				}
			});
		};
		/** 获取模板*/
		$scope.getTemplate = function(){
			var params = {
				url: $rootScope.CONFIG.itf.zwfile.getTemplate,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					filename: 'note.zlt'
				},
				successCallBack: function(result){
					if(result.result == 1){
						$scope.data = JSON.parse(result.data);
						//提交数据
						$scope.postData();
					}else if(result.result == 2){
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.getTemplate();
						});
					}
					$scope.$broadcast('scroll.refreshComplete');
				}
			};
			var $$http = $injector.get('$$http');
			$$http.HTTP(params);
		};
		/** 
		 * 获取数据
		 * @param resourceId 资源id
		 * @param callback 获取成功回调函数
		 */
		$scope.getData = function(resourceId,callback){
			var $http = $injector.get('$http');
			var url = $rootScope.CONFIG.itf.zwfile.getResourceData;
			var params = {
				url: $rootScope.CONFIG.itf.zwfile.getResourceData,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					resourceid: resourceId || $stateParams.resourceid || $scope.data.resourceid,
				},
				successCallBack: function(result){
					if(result.result == 1){
						var data = JSON.parse(result.data);
						convertDate(data.cols,data.content); //时间字符串转换为时间格式
						if(!data.resourceid){
							data.resourceid = resourceId || $stateParams.resourceid || $scope.data.resourceid;
						}
						$scope.data = data;
						//回调
						if(callback){
							callback();
						}
						//兼容之前写法,新增内容id
						angular.forEach(data.content,function(content){
							if(!content.id){
								content.id = $injector.get('$$util').guid();
							}
						})
					}else if(result.result == 2){
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.getData(resourceId);
						});
					}else{
						$injector.get('toastr').error(result.description);
					}
					$scope.$broadcast('scroll.refreshComplete');
				}
			};
			$injector.get('$$http').HTTP(params);
		};
		/** 去除废弃数据-删除列*/
		var removeRedundancyData = function(){
			var newContent = [];
			angular.forEach($scope.data.content,function(content){
				var obj = {};
				angular.forEach($scope.data.cols,function(col){
					for(var key in content){
						if(key == col.cid || key == 'history' || key == 'id'){
							obj[key] = content[key];
						}
					}
				});
				var $$util = $injector.get('$$util');
				if(!$$util.isEmptyObject(obj)){
					newContent.push(obj);
				}
			});
			$scope.data.content = newContent;
		};
		/** 设置默认数据-新增列*/
		var setDefaultData = function(){
			//新列，没key
			angular.forEach($scope.data.cols,function(col){
				angular.forEach($scope.data.content,function(content){
					if(!content.hasOwnProperty(col.cid)){
						if(col.type == 'checkbox'){
							content[col.cid] = false;
						}else if(col.type == 'text' || col.type == 'textarea'){
							content[col.cid] = '';
						}else if(col.type == 'date'){
							content[col.cid] = new Date();
						}else if(col.type == 'number'){
							content[col.cid] = 0;
						}
					}
				})
			});
		};
		/** 记录操作人
		 *  通常情况下一个用户记一次
		 *  多人交互时,可记录多次
		 */
		var recordAuth2 = function(){
			var currentUser = $rootScope.USER;
			//生成新记录
			var getNewRecord = function(){
				return{
					date: new Date(),
					username: $rootScope.USER.username,
				}
			};
			var $$util = $injector.get('$$util');
			if(!$scope.data.history){
				$scope.data.history = [];
			}
			if($scope.data.history.length == 0){
				$scope.data.history.push(getNewRecord());
			}else{
				var history = $scope.data.history[$scope.data.history.length-1]; //最后一条记录
				if(history.username == currentUser.username){ //同用户
					if($$util.isSameDate(new Date(history.date),new Date())){ //同一天,执行修改
						$scope.data.history[$scope.data.history.length-1] = getNewRecord();
					}else{ //不是同一天,执行添加
						$scope.data.history.push(getNewRecord());
					}
				}else{ //不同用户,添加
					$scope.data.history.push(getNewRecord());
				}
			}
		};
		/** 记录操作人
		 *  通常情况下一个用户记一次
		 *  多人交互时,可记录多次
		 */
		var recordAuth = function(content){
			var currentUser = $rootScope.USER;
			//生成新记录
			var getNewRecord = function(){
				return{
					date: new Date(),
					username: $rootScope.USER.username,
				}
			};
			var $$util = $injector.get('$$util');
			if(!content.history){
				content.history = [];
			}
			if(content.history.length == 0){
				content.history.push(getNewRecord());
			}else{
				var history = content.history[content.history.length-1]; //最后一条记录
				if(history.username == currentUser.username){ //同用户
					if($$util.isSameDate(new Date(history.date),new Date())){ //同一天,执行修改
						content.history[content.history.length-1] = getNewRecord();
					}else{ //不是同一天,执行添加
						content.history.push(getNewRecord());
					}
				}else{ //不同用户,添加
					content.history.push(getNewRecord());
				}
			}
		};
		$scope.state = {};
		/** 发送数据*/
		$scope.postData = function(content){
			$scope.state.posting = true; //提交中
			//请求前处理
			if(content){
				recordAuth(content);
			}
			removeRedundancyData(); //删除废弃数据 -- 针对删除列
			setDefaultData(); //添加默认数据--针对新增列
			//准备请求
			var params = {
				url: $rootScope.CONFIG.itf.zwfile.addResource,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					folderid: $stateParams.folderid,
					resourceid: $scope.data.resourceid || '',
					filename: $scope.data.filename + "." + $scope.data.fileext,
					content: angular.toJson($scope.data)
				},
				successCallBack: function(result){
					if(result.result == 1){
						$scope.data.resourceid = result.resourceid;
					}else if(result.result == 2){
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.postData();
						});
					}else{
						if(result.result == 3){ //无权限
							$scope.getData();
						}
						$injector.get('toastr').error(result.description);
					}
					setTimeout(function(){
						$scope.$apply(function(){
							$scope.state.posting = false;
						});
					},500);
				},
				errorCallBack: function(){
					setTimeout(function(){
						$scope.$apply(function(){
							$scope.state.posting = false;
						});
					},500);
				}
			};
			$injector.get('$$http').HTTP(params);
		};
		/** 转换为MM/dd*/
		$scope.formatMonthAndDate = function(dateString){
			var formatString = "MM/dd";
			var $$data = $injector.get('$$data');
			return $$data.DATE.format(new Date(dateString),formatString);
		};
		/** 选择时间-ios/android*/
		$scope.pickerDate = function(content,key){
			var ionicDatePicker = $injector.get('ionicDatePicker');
			var dateconfig = {
				inputDate: new Date(content[key]),
				callback: function(millisecond){
					content[key] = new Date(millisecond);
					//提交数据
					$scope.postData(content);
				},
				templateType: 'modal'
			};
			ionicDatePicker.openDatePicker(dateconfig);
		};
		/** 开关全选*/
		$scope.toggleCheckAll = function(col){
			col.checked = !col.checked;
			angular.forEach($scope.data.content,function(content){
				if(content.hasOwnProperty(col.cid)){
					content[col.cid] = col.checked;
				}
			});
			//提交数据
		    $scope.postData();
		};
		/** 开关复选框*/
		$scope.toggleCheckbox = function(content,key){
			content[key] = !content[key];
			//提交数据
			$scope.postData(content);
		};
		/** 开关排序按钮*/
		$scope.toggleReorderButton = function(){
			$scope.showReorder = !$scope.showReorder;
		};
		/** 重新排列-行*/
		$scope.reorderRow = function(item,fromIndex,toIndex){
			$scope.data.content.splice(fromIndex, 1); //fromIndex删除
		    $scope.data.content.splice(toIndex, 0, item); //toIndex添加
		    //提交数据
		    $scope.postData();
		};
		/** 添加一行*/
		$scope.addContentRow = function(){
			var emptyContent = {
				id: $injector.get('$$util').guid() //生成id
			};
			angular.forEach($scope.data.cols,function(col){
				if(col.type == 'checkbox'){
					emptyContent[col.cid] = false;
				}else if(col.type == 'text' || col.type == 'textarea'){
					emptyContent[col.cid] = '';
				}else if(col.type == 'date'){
					emptyContent[col.cid] = new Date();
				}else if(col.type == 'number'){
					emptyContent[col.cid] = 0;
				}
			});
			$scope.data.content.push(emptyContent);
			//提交数据
			$scope.postData(emptyContent);
			//scroll至底
			$injector.get('$ionicScrollDelegate').$getByHandle('zltScrollDelegate').scrollBottom(true);
		};
		/** 删除一行*/
		$scope.removeContentRow = function(content){
			for(var i=0;i< $scope.data.content.length;i++){
				var c = $scope.data.content[i];
				if(c == content){
					$scope.data.content.splice(i,1);
					//提交数据
				    $scope.postData();
				}
			}
		};
		/** 是否有匹配的content*/
		$scope.hasMatchContent = function(col,content){
			try {
				return content.hasOwnProperty(col.cid);
			} catch (e) {
				return false;
			}
		};
		/** 打开详情*/
		$scope.openFileDetail = function(content){
			var params = {
				contentid: content.id,
				resourceid: $stateParams.resourceid || $scope.data.resourceid,
				folderid: $stateParams.folderid
			};
			$injector.get('$state').go('zltFileDetail',params);
		};
		/** 打开popover菜单*/
		$scope.openPopover = function(event){
			var scope = $rootScope.$new();
			scope.data = $scope.data;
			//设计列
			scope.openDesignColumnModal = function(){
				scope.ionicPopover.remove();
				$scope.openDesignColumnModal();
			};
			//新增行
			scope.addContentRow = function(){
				scope.ionicPopover.remove();
				$scope.addContentRow();
			};
			//打开popover
			var $ionicPopover = $injector.get('$ionicPopover');
			$ionicPopover.fromTemplateUrl('tpl/popover/zltFile.html',{
				scope: scope
			}).then(function(popover){
				popover.show(event);
				scope.ionicPopover = popover;
			});
		};
		
		/** 打开modal-设计列*/
		$scope.openDesignColumnModal = function(){
			var scope = $rootScope.$new();
			/** 移除modal*/
			scope.removeModal = function(){
				scope.ionicModal.remove();
			};
			//列集合
			scope.columns = angular.copy($scope.data.cols);
			/** 添加设计行*/
			scope.addDesignRow = function(){
				var $$util = $injector.get('$$util');
				var emptyColumn = {
					cid: $$util.guid(),
					colname: '',
					display: false,
					type: 'textarea',
					state: 'new' //解决类型转换问题
				};
				scope.columns.push(emptyColumn);
			};
			/** 删除设计行*/
			scope.removeDesignRow = function(col){
				for(var i=0;i<scope.columns.length;i++){
					var item = scope.columns[i];
					if(item == col){
						scope.columns.splice(i,1);
					}
				}
			};
			/** 开关排序按钮*/
			scope.toggleReorderButton = function(){
				scope.showReorder = !scope.showReorder;
			};
			/** 重新排列*/
			scope.reorderColumn = function(column,fromIndex,toIndex){
				scope.columns.splice(fromIndex, 1); //fromIndex删除
				scope.columns.splice(toIndex, 0, column); //toIndex添加
			};
			/** 保存设计*/
			scope.saveDesign = function(){
				//去除state
				angular.forEach(scope.columns,function(column){
					if(column.state){
						delete column.state;
					}
				});
				$scope.data.cols = scope.columns;
				//提交数据
			    $scope.postData();
				scope.ionicModal.remove();
			};
			
			//打开Modal
			var $ionicModal = $injector.get('$ionicModal');
			$ionicModal.fromTemplateUrl('tpl/modal/designColumn.html',{
				scope: scope
			}).then(function(modal){
				modal.show();
				scope.ionicModal = modal;
			});
		};
		/**
		 * 资源重命名
		 */
		$scope.updateResourceName = function(){	
			if(!$scope.data.resourceid){
				$scope.postData();
				return;
			}
			var updateResource = [{
				id: $scope.data.resourceid,
				filename: $scope.data.filename + "." +$scope.data.fileext,
				folderid: $stateParams.folderid
			}];
			var params = {
				url: $rootScope.CONFIG.itf.resource.updateResource,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					updateString: JSON.stringify(updateResource)
				},
				successCallBack: function(result){
					if(result.result == 1){
						$scope.postData();
					}else if(result.result == 2){
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.updateResourceName ();
						});
					}
				}
			};
			var $$http = $injector.get('$$http');
			$$http.HTTP(params);
		};
		/**
		 * 资源名称对比
		 */
		$scope.getResource = function(){
			var params = {
				url: $rootScope.CONFIG.itf.resource.getResource,
				method: 'get',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					id: $stateParams.resourceid,
					folderid: $stateParams.folderid
				},
				successCallBack: function(result){
					if(result.result == 1){
						var resource = result.resource;
						var filename = resource.filename.replace('.'+ resource.fileext,'');
						if($scope.data.filename != filename){
							$scope.data.filename = filename;
							//提交数据
							$scope.postData();
						}
						//
					}else if(result.result == 2){
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.getResource();
						});
					}
				}
			};
			var $$http = $injector.get('$$http');
			$$http.HTTP(params);
		};
		/** 视图进入*/
		$scope.$on('$ionicView.enter',function(){
			var service = $injector.get('service');
			service.validUser(function(){
				//查询进入/返回进入
				if($stateParams.resourceid || $scope.data){ //查询
					$scope.getData($stateParams.resourceid,function(){
						//初始进入验证文件名
						$scope.getResource();
					});
				}else{ //获取模板
					$scope.getTemplate();
				}
			});
		});
	});