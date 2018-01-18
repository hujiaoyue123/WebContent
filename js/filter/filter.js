/** 过滤器*/
angular.module("app")
	.filter("nl2br",function($filter){
		return function(data) {
			if (!data) return data;
		    return data.replace(/\n\r?/g, '<br />');
		};
	})
	/** 字符串转时间*/
	.filter('stringToDate',function($$data){
		return function(string){
			var formatString = "yyyy/MM/dd hh:mm:ss";
			return $$data.DATE.format(new Date(string),formatString);
		}
	})
	/**
	 * 字节换成单位
	 */
	.filter('bytesToSize',function ($$util) {
		return function (bytes) {
			if(typeof bytes === 'number'){
				return $$util.bytesToSize(bytes);
			}else{
				return bytes;
			}
		}
	})
	;