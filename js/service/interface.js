/**
 * Created by hx on 2017/3/8.
 */
angular.module('app')
    .factory('ITF',function () {
        var defaultDomain;
        //动态配置
        var makeITF = function(obj){
            if(typeof obj === "object"){
                angular.forEach(obj,function(value,key){
                    if(typeof value === "object"){
                        makeITF(value);
                    }else if(typeof value === "string"){
                        (function(obj,key,value){
                            obj[key] = function (domain) {
                                if(domain){
                                    return domain + value;
                                }else{
                                    return defaultDomain + value;
                                }
                            };
                        })(obj,key,value);
                    }
                });
            }
        };
        var itf = angular.copy(config.itf);
        makeITF(itf);
        console.log(itf);
        return itf;
    });
