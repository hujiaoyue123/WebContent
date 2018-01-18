/**
 * 用户设置标签
 */
angular.module('app')
	.controller('setTags',function($scope,$rootScope,$stateParams,$injector){
		/** $stateParams
		 * @param id 用户Id
		 */
		$scope.tags = []; //实际拥有的标签
		/**
		 * 初始化新添加标签集合、删除集合、新的标签内容
		 */
		var initTag = function(){
			$scope.newTags = []; //新增的标签
			$scope.delTags = []; //删除的标签
			$scope.newTag = {
				competence: true
			};
		};
		initTag();
		/**
		 * tag状态(仅查看、可编辑、待删除)
		 */
		$scope.getState = function(tag){
			if(tag.competence){ //有权限,当前人添加的标签
				return{
					'color': tag.readyDelete ? '#fff': '#33cd5f',
					'background-color': tag.readyDelete ? '#33cd5f': 'none'
				};
			}else{
				return{
					'color': '#aaaaaa',
					'border': '1px solid #aaaaaa'
				};
			}
		};
		
		/**
		 * 查询标签
		 */
		$scope.getTags = function(){
			var inParams = {
				url: $rootScope.CONFIG.itf.user.getUserTags,
				method: 'post',
				data: {
					userid: $rootScope.USER.id,
					sessionid: $rootScope.USER.sessionid,
					id: $stateParams.id
				},
				successCallBack: function(result){
					if(result.result == 1){
						//匹配权限
						angular.forEach(result.data,function(tag){
							//自己创建的自己可以操作;自己本身能操作全部
							if(tag.createuserid == $rootScope.USER.id || $stateParams.id == $rootScope.USER.id){
								tag.competence = true;
							}
						});
						$scope.tags = result.data; //装载数据
					}else if(result.result == 2){
						$injector.get('service').activeSessionProxy(function(){
							$scope.getTags();
						});
					}else{
						$injector.get('toastr').error(result.description);
					}
				}
			};
			$injector.get('$$http').HTTP(inParams);
		};
		/**
		 * 添加标签
		 */
		$scope.addTags = function(){
			//重置readyDelete
			angular.forEach($scope.tags,function(tag){
				if(tag.competence && tag.readyDelete){
					tag.readyDelete = false;
				}
			});
			 //去除标签两端空白
			if($scope.newTag.tag){
				$scope.newTag.tag = $scope.newTag.tag.trim();
			}
			//非空验证
			if(!$scope.newTag.tag){
				return;
			}else{ //非重复验证
				var conflict = false;
				angular.forEach($scope.tags,function(tag){
					if(tag.tag == $scope.newTag.tag){
						$injector.get('toastr').warning('标签重复');
						conflict = true;
					}
				});
				if(conflict){
					return;
				}
			}
			//添加至内存
			$scope.tags.push($scope.newTag);
			$scope.newTags.push($scope.newTag.tag);
			//置空
			$scope.newTag = {
				competence: true
			};
		};
		/**
		 * 保存标签
		 */
		$scope.saveTags = function(){
			//新增和删除队列
			if($scope.newTags.length>0 || $scope.delTags.length>0){
				var inParams = {
					url: $rootScope.CONFIG.itf.user.setUserTags,
					method: 'post',
					data: {
						userid: $rootScope.USER.id,
						sessionid: $rootScope.USER.sessionid,
						cuserid: $stateParams.id,
						tagjson: angular.toJson($scope.newTags),
						deletejson: angular.toJson($scope.delTags)
					},
					successCallBack: function(result){
						if(result.result == 1){
							$scope.getTags(); //刷新
							//置空
							initTag();
							//回退
							$injector.get('$ionicHistory').goBack();
						}else if(result.result == 2){
							$injector.get('service').activeSessionProxy(function(){
								$scope.saveTags();
							});
						}else{
							$injector.get('toastr').error(result.description);
						}
					}
				};
				$injector.get('$$http').HTTP(inParams);
			}else{ //待添加状态的标签
				$scope.addTags();
				if($scope.newTags.length>0){
					$scope.saveTags();
				}
			}
		};
		/**
		 * 阻止事件冒泡
		 */
		$scope.stopPropagation = function($event){
			if($event){
				$event.stopPropagation();
			}
		}
		/**
		 * 准备删除
		 */
		$scope.readyDelete = function(tag,$event){
			if($event){
				$event.stopPropagation(); //阻止事件冒泡
			}
			if(tag.competence){
				if(tag.readyDelete){ //已标记过
					$scope.deleteTags(tag); //执行删除
				}else{
					tag.readyDelete = true; //标记
				}
			}
		};
		/**
		 * 删除标签
		 */
		$scope.deleteTags = function(tag){
			if(tag){
				var index = 0;
				angular.forEach($scope.tags,function(t){
					if(t.tag == tag.tag){
						if(tag.id){
							$scope.delTags.push(tag.id);
						}
						//移除
						$scope.tags.splice(index,1);
					}
					index++;
				});
			}
		};
		/**
		 * 视图进入
		 */
		$scope.$on('$ionicView.enter',function(){
			$scope.getTags();
		});
		/**
		 * 监听路由跳转开始
		 */
		$scope.$on('$stateChangeStart',function(event){
			if($scope.newTags.length>0 || $scope.delTags.length>0 || $scope.newTag.tag){
				event.preventDefault();
				var options = {
						title: '是否保存本次编辑?',
						cancelText: '取消',
						okText: '确定'
					};
					$injector.get('$ionicPopup').confirm(options)
						.then(function(r){
							if(r){
								$scope.saveTags();
							}else{
								//置空
								initTag();
								$injector.get('$ionicHistory').goBack(); //回退
							}
						});
			}
		});
	});