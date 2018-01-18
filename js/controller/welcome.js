/**
 * Created by hx on 2017/5/18.
 */
angular.module('app')
    .controller('welcome',function ($scope,$rootScope,$state) {
        /**
         * 进入掌文
         */
        $scope.enterApp = function () {
            if($rootScope.USER){
                $state.go('tab.ppan');
            }else{
                if(UPF.is('app')){
                    $state.go('loginMobile');
                }else{
                    $state.go('loginPc');
                }
            }
        };
    });