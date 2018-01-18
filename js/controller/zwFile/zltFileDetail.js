/**
 * 列表文件
 */
angular.module('app')
	.controller('zltFileDetail',function($scope,$rootScope,$stateParams,$injector){
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
		/** 
		 * 获取数据
		 * @param resourceId 资源id
		 * @param callback 获取成功回调函数
		 */
		$scope.getData = function(){
			var $http = $injector.get('$http');
			var params = {
				url: $rootScope.CONFIG.itf.zwfile.getResourceData,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					resourceid: $stateParams.resourceid,
				},
				successCallBack: function(result){
					if(result.result == 1){
						var data = JSON.parse(result.data);
						convertDate(data.cols,data.content); //时间字符串转换为时间格式
						$scope.columns = data.cols;
						//获取到指定content
						angular.forEach(data.content,function(content){
							if(content.id == $stateParams.contentid){
								$scope.content = content;
							}
						});
						$scope.data = data;
					}else if(result.result == 2){
						var service = $injector.get('service');
						service.activeSessionProxy(function(){
							$scope.getData();
						});
					}else{
						$injector.get('toastr').error(result.description);
					}
					$scope.$broadcast('scroll.refreshComplete');
				}
			};
			$injector.get('$$http').HTTP(params);
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
		/** 发送数据*/
		$scope.postData = function(content){
			$scope.posting = true; //提交中
			//请求前处理
			if(content){
				recordAuth(content);
			}
			//准备请求
			var params = {
				url: $rootScope.CONFIG.itf.zwfile.addResource,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					folderid: $stateParams.folderid,
					resourceid: $stateParams.resourceid,
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
					}
					setTimeout(function(){
						$scope.$apply(function(){
							$scope.posting = false;
						});
					},500);
				},
				errorCallBack: function(){
					setTimeout(function(){
						$scope.$apply(function(){
							$scope.posting = false;
						});
					},500);
				}
			};
			$injector.get('$$http').HTTP(params);
		};
		/** 转换为yyyy/MM/dd*/
		$scope.formatDate = function(dateString){
			var formatString = "yyyy/MM/dd";
			var $$data = $injector.get('$$data');
			return $$data.DATE.format(new Date(dateString),formatString);
		};
		/** 转换为MM/dd*/
		$scope.formatMonthAndDate = function(dateString){
			var formatString = "MM/dd";
			var $$data = $injector.get('$$data');
			return $$data.DATE.format(new Date(dateString),formatString);
		};
		/** 选择时间*/
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
		/** 开关复选框*/
		$scope.toggleCheckbox = function(content,key){
			content[key] = !content[key];
			//提交数据
			$scope.postData(content);
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
		/** 视图进入*/
		$scope.$on('$ionicView.enter',function(){
			var service = $injector.get('service');
			service.validUser(function(){
				$scope.getData();
			});
		});
	});