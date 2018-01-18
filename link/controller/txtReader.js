/**
 * Created by hx on 2017/2/28.
 */
angular.module('app')
.controller('txtReader',function ($scope,$rootScope,$stateParams,$injector) {
    $scope.$stateParams = $stateParams;
    //文件二进制流
    var filepath = $rootScope.share.itf.download + "?shareid=" + $stateParams.id
    //TODO 请求失败异常处理
    $injector.get('$http').get(filepath)
        .success(function(text){
            $scope.text = text;
        });

    $scope.toggle = function(){
        $scope.showMenu = !$scope.showMenu;
    };
});