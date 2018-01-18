/**
 * 文本阅读
 */
angular.module('app')
.controller('txtReader',function($scope,$rootScope,$stateParams,$sce,$injector,$RESOURCE){
	$scope.$stateParams = $stateParams;
	/**
	 * 加载文本内容
	 */
	$scope.loadText = function () {
        var filepath;
		if($stateParams.shareid){ //针对link资源
            filepath = $injector.get('$$share').LINK.download($stateParams.shareid);
            //关闭modal
            $rootScope.modal.hide();
        }else{
            var params = {
                id: $stateParams.id,
                folderid: $stateParams.folderid
            };
            filepath = $RESOURCE.RESOURCE.download(params);
        }
		$injector.get('$http').get(filepath)
			.success(function(text){
			    if(typeof text === 'string'){
                    $scope.text = text;
                }
			});
	};
	$scope.toggle = function(){
		$scope.showMenu = !$scope.showMenu;
	};
	/**
	 * 视图进入
	 */
	$scope.$on('$ionicView.enter',function () {
		if(!$scope.txt){
			$scope.loadText();
		}
	});
	/**
	 * 视图离开
	 */
	$scope.$on('$ionicView.beforeLeave',function () {
		//退出预览回掉(针对外部打开预览)
		if($rootScope.previewCallBack){
			$rootScope.previewCallBack();
			delete $rootScope.previewCallBack;
		}
	});
});