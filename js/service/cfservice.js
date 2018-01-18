angular.module("app").factory("cfservice",function($rootScope){
	var defaultDomain = '';
	//拼接静态接口
	var makeITF = function(array,str){
		if(typeof array === "object"){
			angular.forEach(array,function(value,key){
				if(typeof value === "object"){
					makeITF(value,str);
				}else if(typeof value === "string"){
					array[key] = str + value;
				}
			});
		}
	};
	/** 初始化接口配置*/
	var initITF = function(){
		if(config && !$rootScope.CONFIG){
			var copiedConfig = angular.copy(config);
			var model = copiedConfig.model; //产品模式
			copiedConfig.address = copiedConfig[model].client; //客户端地址
			copiedConfig.server = copiedConfig[model].server; //服务器地址
			//配置接口  地址+接口
			makeITF(copiedConfig.itf,copiedConfig[model].server + "/rest");
			$rootScope.CONFIG = copiedConfig;
			//默认域名
			defaultDomain = copiedConfig[model].server + "/rest";
		}
	};
	//动态配置提取接口函数
	var makeITFFn = function(obj){
		if(typeof obj === "object"){
			angular.forEach(obj,function(value,key){
				if(typeof value === "object"){
					makeITFFn(value);
				}else if(typeof value === "string"){
					(function(obj,key,value){
						obj[key] = function (domain) {
							if(domain){
								return domain + '/api/rest' + value;
							}else{
								return defaultDomain + value;
							}
						};
					})(obj,key,value);
				}
			});
		}
	};
	var initITFFn = function () {
		if(config && !$rootScope.dynamicITF){
			var itf = angular.copy(config.itf);
			makeITFFn(itf);
			$rootScope.dynamicITF = itf;
		}
	};
	//老式静态接口
	initITF();
	//动态接口函数
	initITFFn();

	return {
		initITF: initITF, //数据接口
		initITFFn: initITFFn
	};
});