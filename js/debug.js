var debug = {
	"model":"hu",
	"local": {
		"client": "http://127.0.0.1:8080/zhangwin",
		"server": "http://127.0.0.1:8080/api"
	},
	"hu": {
		"client": "http://192.168.1.49:8080/dhy_pc",
		"server": "http://192.168.1.49:8080/api"
	},
	"wan_home": {
		"client": "http://192.168.0.113:8080/dhy_pc",
		"server": "http://192.168.0.113:8080/WSS_1"
	},
	"wan_office": {
		"client": "http://192.168.1.211:8080/dhy_pc",
		"server": "http://192.168.1.211:8080/WSS_1"
	},
	"he": {
		"client": "http://192.168.1.10:8080/zhangwin",
		"server": "http://192.168.1.10:8080/WSS_1"
	},
	"he_home": {
		"client": "http://192.168.0.116:8080/zhangwin",
		"server": "http://192.168.0.116:8080/WSS_1"
	},
	"test": {
		"client": "https://dev.zhangwin.com/web",
		"server": "https://dev.zhangwin.com/api"
	}
};
config.model = debug.model;
config[debug.model] = debug[debug.model];
config.chat.appKey = "zhangwen#zhangwintest";
config.chat.apiUrl = "https://a1.easemob.com";
config.chat.https = true;
