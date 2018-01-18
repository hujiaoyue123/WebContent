﻿var config = {
	"model": "release",
	"release": {
		"client": "https://web.zhangwin.com",
		"server": "https://api.zhangwin.com/WSS_1"
	},
	"develop": {
		"client": "http://test.zhangwin.com/web",
		"server": "https://test.zhangwin.com/api"
	},
	"defaultOrgPhoto":"img/icon/org.png",
	"defaultDeptPhoto":"img/icon/dept.png",
	"defaultGroupPhoto":"img/icon/group.png",
	"defaultUserPhoto":"img/user.png",
	"defaultLink":"img/link.png",
	"errorImg":"img/picerror.png",
	"chat":{
		"sysNotice":"zhangwinsystemmsg",
		"apiUrl":"https://a1.easemob.com",
		"xmppURL":"wss://im-api.easemob.com/ws/",
		"appKey":"zhangwen#zhangwenapp",
		"https" : true
	},
	"offline": true,
	"internet": true, //互联网模式/纯内网
	"page": {
		"resource": {
			"pageSize": 20
		},
		"search": {
			"pageSize": 20
		},
		"contact": {
			"pageSize": 20
		},
		"mcontacts": {
			"pageSize": 20
		},
		"notice": {
			"pageSize": 20
		},
		"topRead": {
			"pageSize": 20
		},
		"auditFile": {
			"pageSize": 20
		}
	},
	"zhangShow":{
//		"tbUrl":"http://h5.m.taobao.com/awp/core/detail.htm?id=524054624149",
//		"tbUrl": "https://h5.m.taobao.com/awp/core/detail.htm?wp_pk=shop/index_2858003106_&wp_m=item_rank_list_-2&from=inshop&id=537563705390&wp_app=weapp&wp_p=1",
		"tbUrl": "https://item.taobao.com/item.htm?spm=a1z10.1-c.w4023-14956291997.2.lVTXPA&id=537563705390",
		"zsetting":{
			"getCurrWlan0AP":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupCheckDeviceStatus:WLAN0",		//
			"getVideoDeviceStatus":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupCheckDeviceStatus:VIDEO",
			"getSystemDeviceName":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetSystemDeviceName",		//
			"getSoftAPStatus":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetSoftAPStatus",
			"getMenuLanguageList":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetMenuLanguageList",		//
			"getMenuLanguage":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetMenuLanguage",				//
			"getTextEncodingList":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetTextEncodingList",
			"getAudioNightMode":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetAudioNightMode",
			"getVideoAspectRatio":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetVideoAspectRatio",
			"getVideoAspectRatioList":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetVideoAspectRatioList",
			"getVideoZoom":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetVideoZoom",
			"get4by3UI":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGet4by3UI",
			"getTvSystemList":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetTvSystemList",
			"getTvSystem":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetTvSystem",
			"getForce5G":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetForce5G",
			"getFWVersion":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetVersionInfo",					//
			"getEth0Status":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetEth0Status",
			"getWlan0Status":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupGetWlan0Status",
			"getWlanApList":"/cgi-bin/IpodCGI.cgi?id=0&command=wlanGetApList",							//
			"setMenuLanguage":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupSetMenuLanguage:",				//
			"wlanConnectAp":"/cgi-bin/IpodCGI.cgi?id=0&command=wlanConnectAp:",							//
			"wlanDisconnect":"/cgi-bin/IpodCGI.cgi?id=0&command=wlanDisconnect",						//
			"setVideoZoom":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupSetVideoZoom:",
			"resetToDefault":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupResetToDefault",				//
			"set4by3UI":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupSet4by3UI:",
			"setSystemDeviceName":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupSetSystemDeviceName:",		//
			"setVideoAspectRatio":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupSetVideoAspectRatio:",
			"checkDevice":"/cgi-bin/IpodCGI.cgi?id=0&command=check",									//
			"updateSystem":"/cgi-bin/web.cgi",															//
			"setForce5G":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetupSetForce5G:",						//
			//"switchsoftapmode":"/cgi-bin/IpodCGI.cgi?id=0&command=switchsoftapmode",
			"switchWifiRadioBand":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSwitchWifiRadioBand",			//
			"getWifiRadioBand":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiGetWifiRadioBand",					//
			"getMacAddress":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiGetMacAddressInfo",					//	
			"setDeviceWifiPassword":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiSetApKey:",
			"getDeviceWifiPassword":"/cgi-bin/IpodCGI.cgi?id=0&command=CgiGetApKey"
		}
	},
	"itf": {
		"system":{
			"getDictionaryData":"/SystemService/getDictionaryData",
			"getWelcomeHtml": "/SystemService/getWelcomeHtml" //获取欢迎页
		},
		"search":{
			"search":"/SearchService/search"
		},	    
		"user": {
			"login": "/UserService/login",
			"register":"/UserService/register",
			"updateUser": "/UserService/updateUser",
			"getUserInfo": "/UserService/getUserInfo",
			"getUserPhoto": "/UserService/getUserPhoto", //用户缩略头像
			"getUserPreviewPhoto": "/UserService/getUserPreviewPhoto", //用户预览头像
			"getPhoto": "/UserService/getPhoto", //企业,部门,群组头像
			"updateUserPhoto": "/UserService/updateUserPhoto",
			"pushVerificationCode": "/UserService/pushVerificationCode",
			"verifyAndLogin": "/UserService/verifyAndLogin",
			"newInvite":"/UserService/newInvite",
			"deleteFriend":"/UserService/deleteFriend",
			"getInvite":"/UserService/getInvite", //will be deprecated
			"getInvitePage":"/UserService/getInvitePage",
			"deleteInvite":"/UserService/deleteInvite",
			"acceptInvite":"/UserService/acceptInvite",
			"adminRegister":"/UserService/adminRegister",
			"getUserByDeptId": "/GroupService/getUserByDeptId",
			"addGroup":"/GroupService/addGroup",
			"addUserToGroup":"/GroupService/addUserToGroup",
			"deleteUserToGroup":"/GroupService/deleteUserToGroup",
			"getGroupProperties":"/GroupService/getGroupProperties",
			"loadContact":"/GroupService/getUserByDeptId",
			"updateGroupName":"/GroupService/updateGroupName",
			"setManager":"/GroupService/setManager",
			"transfer":"/GroupService/transfer",
			"updateGroupPhoto": "/GroupService/updateGroupPhoto",
			"deleteGroup":"/GroupService/deleteGroup",
			"updateGroupProp":"/GroupService/updateGroupProp",
			"getUpgradeEnt":"/UpgradeEntService/getUpgradeEnt",
			"saveUpgradeEnt":"/UpgradeEntService/saveUpgradeEnt",
			"uploadUpgrade":"/UpgradeEntService/uploadUpgrade",
			"getLicenseOrCard":"/UpgradeEntService/getLicenseOrCard",
			"updateUserPassword":"/UserService/updateUserPassword",
			"updateFriendWeight":"/UserService/updateFriendWeight",
			"chatLoginFail":"/UserService/chatLoginFail",
			"updateChatGroup":"/GroupService/updateChatGroup",
			"getGroupByHxid":"/GroupService/getGroupByHxid",
			"getImportTemplet":"/AdminUserService/getImportTemplet",
			"uploadUserExcel":"/AdminUserService/uploadUserExcel",
			"saveMobileFriend":"/UserService/saveMobileFriend",
			"releaseHelp":"/AdminUserService/releaseHelp",
			"validChatPeer":"/UserService/validChatPeer",
			"getAllUserIdByDeptId": "/GroupService/getAllUserIdByDeptId",
			"tokenLogin": "/UserService/tokenLogin",
			"terminateContract": "/GroupService/terminateContract",
			"addGroupAnnounce": "/GroupService/addGroupAnnounce",
			"getListGroupAnnounce": "/GroupService/getListGroupAnnounce",
			"getGroupAnnounce": "/GroupService/getGroupAnnounce",
			"deleteGroupAnnounce": "/GroupService/deleteGroupAnnounce",
			"getAllGroupAnnounce": "/GroupService/getAllGroupAnnounce",
			"getNewestGA": "/GroupService/getNewestGA",
			"getUserTags": "/UserService/getUserTags", //查询标签
			"setUserTags": "/UserService/setUserTags", //设置用户标签
			"getUserDomain": "/UserService/getUserDomain", //获取用户域名服务
			"setUserMedal":"/UserService/setUserMedal" //设置勋章
		},
		"folder": {
			"getFolder": "/FolderService/getFolder",
			"getDeptFolder": "/FolderService/getDeptFolder", //获取部门文件夹
			"getFolderInfo": "/FolderService/getFolderInfo", //获取文件夹详情
			"getFolderImage": "/FolderService/getFolderImage",
			"newFolder": "/FolderService/newFolder",
			"updateFolder": "/FolderService/updateFolder",
			"deleteFolder": "/FolderService/deleteFolder",
			"copyFile": "/FolderService/copyFile",
			"recoverFolder": "/FolderService/recoverFolder", //从回收站还原文件夹
			"getUserCloudSpace": '/FolderService/getUserCloudSpace',
			"getGroupCloudSpace": "/FolderService/getGroupCloudSpace"
		},
		"resource": {
			"getResource": "/ResourceService/getResource",
			"getResourceRepeat": "/ResourceService/getResourceRepeat", //查询资源名称是否重复
			"getResourceAuditCount": "/ResourceService/getResourceAuditCount", //获取未审核文件条目数
			"getResourceAudits": "/ResourceService/getResourceAudits", //获取未审核文件列表
			"addResource": "/ResourceService/addResource",
			"deleteResource": "/ResourceService/deleteResource",
			"updateResource": "/ResourceService/updateResource",
			"recoverResource": "/ResourceService/recoverResource", //从回收站还原文件
			"download": "/ResourceService/download",
			"imageMinPreview": "/ResourceService/imageMinPreview",
			"previewResource": "/ResourceService/previewResource",
			"readResource": "/ResourceService/readResource",
			"readStats": "/ResourceService/readStats"
		},
		"zwfile": {
			"addResource": "/ListViewService/addResource",
			"getResourceData": "/ListViewService/getResourceData",
			"getTemplate": "/ListViewService/getTemplate"
		},
		"share": {
			"addShare": "/ShareService/addShare",
			"addLinkShare": "/ShareService/addLinkShare",
			"getShareMeTo": "/ShareService/getShareMeTo",
			"deleteShareRes": "/ShareService/deleteShareRes",
			"getFriendShare": "/ShareService/getFriendShare",
			"link": {
				"getTicket": "/ShareService/getTicket",
				"getShare": "/ShareService/getShare",
				"imageMinPreview": "/ShareService/imageMinPreview",
				"download": "/ShareService/download",
				"previewResource": "/ShareService/previewResource"
			}
		},
		"contact": {
			"getUserByDeptId":"/GroupService/getUserByDeptId",
			"deleteFriend":"/UserService/deleteFriend",
			"updateGroupPhoto": "/GroupService/updateGroupPhoto"
		},
		"about": {
			"getUserByDeptId": "/UserProxy/getUserByDeptId",
			"getUserById": "/UserProxy/getUserInfo"
		},
		"url":{
			"updateUrl":"/UrlService/updateUrl",
			"getUrlInfo":"/UrlService/getUrlInfo"
		},
		"app": {
			"getAppNewVersion": "/Down/getAppNewVersion",
			"getZsNewVersion": "/Down/getZsNewVersion",
			"getApp": "/Down/getApp",
			"ppan": {
				"mobileAddResource": "/ResourceService/mobileAddResource"
			},
			"cpan": {
				"mobileResourceCreate": "/OrgResourceProxy/orgMobileResourceCreate"
			}
		}
	}
};