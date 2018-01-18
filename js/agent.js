/** 浏览器 **/
/*(function(){
	var agent = window.navigator.userAgent.toLowerCase();
	var regStr_ie = /msie [\d.]+;/gi ;
	var regStr_ff = /firefox\/[\d.]+/gi;
	var regStr_chrome = /chrome\/[\d.]+/gi ;
	var regStr_saf = /safari\/[\d.]+/gi ;
	
	if(agent.indexOf("msie") >0){	//IE
		var version = (agent.match(regStr_ie) + "").replace(/[^0-9.]/ig,"");
		if(parseInt(version) <10){
			alert("当前IE浏览器版本太低,请使用Chrome、Firefox、IE10+，推荐使用Chrome 30+。");
		}
	}
})();*/
var IsPc = function(){  
	var userAgentInfo = navigator.userAgent;  
	var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
	var flag = true;  
	for (var v = 0; v < Agents.length; v++) {  
	    if (userAgentInfo.indexOf(Agents[v]) > 0) { 
	    	flag = false; 
	    	break; 
	    }  
	}  
	return flag;  
};

/**
 * 判断客户端类型和平台属性
 * 我们的app要在初始化webview时加入个性化userAgent: 
 * 命名规则： zhangwen/Android/M/1.2
 * 分段说明：1:zhangwen保留字，必须以zhangwen开始， 2:Android|iOS ,3: M|HD 表示手机或PAD， 4:版本号
 * 
 * userPlatform使用说明：
 * 属性: 
 * userType会返回以下注释的值
 * agent 存储 userAgent的完整的值
 * 版本号会返回app版本或浏览器版本
 * 方法：
 * 
 * is(str): 该函数判断当前的userAgent是否满足传入的参数，参数可以是: WEB.HD | WEB | HD | APP.M | MSIE | Firefox | Windows | Mac 等，可任意顺序，其它依次类推
 * agentIs(str): 该函数判断传入的参数是否是 userAgent的子串，可以用"MSIE", "WINDOWS NT"，"FireFox"等值来判断 
 * 
 */
var userPlatform = {
	userType: '', // 目前可能会用到三个值：WEB.HD(大屏幕浏览器，如PC浏览器，PAD浏览器), WEB.M(手机浏览器),ZW.APP.M(掌文手机app，包括ios和Android), 以后可扩展： ZW.EXE(PC端可执行文件), ZW.APP.HD(pad版app) 
	version: 0, // 版本
	is:function(str){
		var arr = str.toLowerCase().split(".");
	    var i = 0;
	    var j = 0;
	    for (i=0; i<arr.length; i++)
	    {
	        for (j = 0; j<this.typeLength; j++)
	        {
	           if(arr[i] == this.userTypes[j])
	              break;
	        }
	        if (j == this.typeLength)
	           return false;
	    }
	    return true;
	},
	agentIs:function(str){
		return (this.agent.indexOf(str)>-1);
	},
	init:function(){
		this.userTypes = [];
		this.agent = navigator.userAgent;
		var reg = /zhangwen\/(\w+)\/(\w+)\/(\w.+)/;
		var r = this.agent.match(reg);
		if (r){
			this.userTypes = ["zw","app"];
			this.userTypes[2] = r[1].toLowerCase(); // ios | android
			this.userTypes[3] = r[2].toLowerCase(); // M | HD
			this.version = r[3];
		}else{
			this.userTypes = ["web"];
			// 1: 浏览器， 2：操作系统， 3: M|HD

			// 先判断操作系统
			if (this.agent.indexOf("Windows NT")>-1){
				this.userTypes[2] = "windows";
				this.userTypes[3] = "hd";
			}else if(this.agent.indexOf("iPhone")>-1){
				this.userTypes[2] = "ios";
				this.userTypes[3] = "m";
			}else if(this.agent.indexOf("iPad")>-1){
				this.userTypes[2] = "ios";
				this.userTypes[3] = "hd";
			}else if(this.agent.indexOf("Android")>-1){
				this.userTypes[2] = "android";
				this.userTypes[3] = "m";
			}else if(this.agent.indexOf("Macintosh")>-1){
				this.userTypes[2] = "mac";
				this.userTypes[3] = "hd";
			}
			// 在判断浏览器
			if (r = this.agent.match(/MSIE ([0-9]+)/)){
				this.userTypes[1] = "ie";
				this.version = r[1];
			}else if (r = this.agent.match(/Firefox\/([0-9]+)/)){
				this.userTypes[1] = "firefox";
				this.version = r[1];
			}else if (r = this.agent.match(/Chrome\/([0-9]+)/)){
				this.userTypes[1] = "chrome";
				this.version = r[1];
			}else if (r = this.agent.match(/Safari\/([0-9]+)/)){
				this.userTypes[1] = "safari";
				this.version = r[1];
			}
		}
		this.typeLength = this.userTypes.length;
		this.userType = this.userTypes.join(".");
	}
};
var UPF = userPlatform;
userPlatform.init();
