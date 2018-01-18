/** 数据处理*/
angular.module("app")
	.factory("$$data",function($rootScope,$$util){
		
		/** 文件体*/
		var FILE = {
			/** 文件格式
			 * file
			 */
			type: function(file){
				if(file.fileext){
					var filetype = angular.lowercase(file.fileext); //小写化
					//文件类型
					var doc = ["doc","docx"];
					var ppt = ["ppt","pptx"];
					var xls= ["xls","xlsx"];
					var pkg = ["rar","zip","jar","ios","tar"];
					var audio = ["mp3","wma","wav","ogg"];
					var video = ["mp4","avi","mov","wmv","3gp","m4v",'webm',"mkv","3gp"];
					//常见格式: mp4,m4v,mkv,webm,mov,ogg,wmv,flv,vob,avi,rm,rmvb,mpg|mpeg,3gp
					//支持 mp4[h264],m4v,mkv,webm,mov,ogg,3gp
					//不支持 flv,vob,avi,rm,rmvb,mpg|mpeg,mp4[其它编码],wmv
					var image = ["jpg","png","bmp","jpeg","gif"];
					//添加iontype属性
					if(filetype == "folder"){ //folder
						file.iontype = "folder";
					}else if(filetype == "txt"){ //txt
						file.iontype = "txt";
						file.preview = 'txt';
					}else if(filetype == "pdf"){ //pdf
						file.iontype = "pdf";
						file.preview = "pdf";
					}else if(filetype == "apk"){ //apk
						file.iontype = "apk";
					}else if(filetype == "html"){ //html
						file.iontype = "html";
					}else if(filetype == "bt"){ //bt
						file.iontype = "bt";
					}else if(pkg.indexOf(filetype) != -1){ //pkg
						file.iontype = "pkg";
					}else if(audio.indexOf(filetype) != -1){ //audio
						file.iontype = "audio";
						file.preview = 'audio';
					}else if(video.indexOf(filetype) != -1){ //video
						file.iontype = "video";
						file.preview = "video";
					}else if(image.indexOf(filetype) != -1){ //image
						file.iontype = "image";
						file.preview = "image";
					}else if(doc.indexOf(filetype) != -1){ //doc
						file.iontype = "doc";
						file.preview = "office";
					}else if(ppt.indexOf(filetype) != -1){ //ppt,pptx
						file.iontype = "ppt";
						file.preview = "office";
					}else if(xls.indexOf(filetype) != -1 ){ //xls,xlsx
						file.iontype = "xls";
						file.preview = "office";
					}
					//掌文文件
					else if(filetype == 'zlt'){
						file.iontype = 'zlt';
						file.preview = 'zlt';
					}else{ //未知文件
						file.iontype = "unknown";
					}
					return file;
				}
			},
			/** 文件大小
			 * file
			 */
			size: function(file){
				if(file.filesize){
					file.filesize = $$util.bytesToSize(file.filesize);
					return file;
				}
			},
			/** 文件时间
			 * file
			 */
			date: function(file){
				//修改时间
				if(file.updatetime){
					file.updatetime = DATE.format(new Date(parseInt(file.updatetime)),"yyyy-MM-dd");
				}
				//创建时间
				if(file.createtime){
					file.createtime = DATE.format(new Date(parseInt(file.createtime)),"yyyy-MM-dd");
				}
				//分享时间
				if(file.sharetime){
					file.sharetime = DATE.format(new Date(parseInt(file.sharetime)),"yyyy-MM-dd");
				}
				//审核时间
				if(file.audittime){
					file.audittime = DATE.format(new Date(parseInt(file.audittime)),"yyyy-MM-dd");
				}
				return file;
			},
			/** 文件图标
			 * resource
			 */
			icon: function(resource){
				if(resource.iontype == "image"){
					resource.src = $rootScope.dynamicITF.resource.imageMinPreview($rootScope.getCurrentDomainAddress()) + "/" + resource.id +"/" + $rootScope.USER.sessionid;
				}else{
					resource.src = "img/filetype/" + resource.iontype + ".png";
				}
			},
			/** 文件 一条龙处理
			 * file 文件列
			 * type 个人、企业、链接
			 */
			oneDragon: function(file){
				if(file){
					FILE.type(file); //文件格式
					FILE.size(file);	//文件大小
					FILE.date(file);	//文件时间
					FILE.icon(file);
					return file;
				}
				return null;
			},
			/** 文件集合  一条龙处理
			 * fileList 文件列
			 * type 个人、企业、链接
			 */
			oneDragonList: function(fileList){
				if(fileList){
					angular.forEach(fileList,function(value,key){
						FILE.type(value); //文件格式
						FILE.size(value);	//文件大小
						FILE.date(value);	//文件时间
						FILE.icon(value);
					});
					return fileList;
				}
				return null;
			}
		};
		
		/** 日期体*/
		var DATE = {
			/** 日期转换
			 * date 日期对象
			 * format yyyy-MM-dd hh:mm:ss
			 */
			format: function(date,format){
				var o = {
					"M+" : date.getMonth()+1, //month
					"d+" : date.getDate(), //day
					"h+" : date.getHours(), //hour
					"m+" : date.getMinutes(), //minute
					"s+" : date.getSeconds(), //second
					"q+" : Math.floor((date.getMonth()+3)/3), //quarter
					"S" : date.getMilliseconds() //millisecond
				};
				if(/(y+)/.test(format)){
					format=format.replace(RegExp.$1,(date.getFullYear()+"").substr(4 - RegExp.$1.length));
				}
				for(var k in o){
					if(new RegExp("("+ k +")").test(format)){
						format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
					}
				}
				return format;
			},
			/** 人性化时间
			 * milliseconds
			 */
			humanize: function(milliseconds){
				var date = new Date();
				if(milliseconds){
					date.setTime(milliseconds);
				}
				var time = DATE.format(date,"yyyy年MM月dd日 hh:mm");
				var num = time.split(" ")[1].split(":")[0];
				var hour;
				var array = ["凌晨","上午","中午","下午","晚上"];
				if(num >= 0 && num < 6){
					hour = array[0];
				}else if(num >=6 && num < 12){
					hour = array[1];
				}else if(num >= 12 && num < 14){
					hour = array[2];
				}else if(num >= 14 && num < 18){
					hour = array[3];
				}else if(num >=18 && num <= 24){
					hour = array[4];
				}
				return time.replace(" "," "+hour);
			},
			chatTime:function(ms){
				var cd = new Date();
				var td = new Date();
				td.setTime(ms);
				var f = '';
				if (cd.getFullYear() != td.getFullYear()){
					f = 'yyyy-MM-dd hh:mm';
				}else if (cd.getMonth() != td.getMonth() || cd.getDate() != td.getDate()){
					f = 'MM-dd hh:mm';
				}else{
					f = 'hh:mm';
				}
				return this.format(td, f);
			}
		};
		/**
		 * 根据文件后缀名判定文件类型
		 * @param suffix
		 * @returns {*}
		 */
		var getFileType = function(suffix){
				var filetype = angular.lowercase(suffix); //小写化
				//文件类型
				var doc = ["doc","docx"];
				var ppt = ["ppt","pptx"];
				var xls= ["xls","xlsx"];
				var pkg = ["rar","zip","jar","ios","tar",'war'];
				var audio = ["mp3","wma","wav","ogg"];
				var video = ["mp4","avi","mov","wmv","3gp","m4v",'webm',"mkv","3gp","ogg","flv",'vob','rm','rmvb','mpg'];
				var image = ["jpg","png","bmp","jpeg","gif"];
				//添加iontype属性
				 if(filetype == "txt"){ //txt
					return "txt";
				}else if(filetype == "pdf"){ //pdf
					return "pdf";
				}else if(filetype == "apk"){ //apk
					return "apk";
				}else if(filetype == "html"){ //html
					 return "html";
				}else if(filetype == "bt"){ //bt
					 return "bt";
				}else if(pkg.indexOf(filetype) != -1){ //pkg
					 return "pkg";
				}else if(audio.indexOf(filetype) != -1){ //audio
					 return "audio";
				}else if(video.indexOf(filetype) != -1){ //video
					 return "video";
				}else if(image.indexOf(filetype) != -1){ //image
					 return "image";
				}else if(doc.indexOf(filetype) != -1){ //doc
					 return "doc";
				}else if(ppt.indexOf(filetype) != -1){ //ppt,pptx
					 return "ppt";
				}else if(xls.indexOf(filetype) != -1 ){ //xls,xlsx
					 return "xls";
				}else if(filetype == 'zlt'){ //掌文文件
					return 'zlt';
				}else{ //未知文件
					return "unknown";
				}
		};
		return {
			type: FILE.type, //文件类型
			size: FILE.size, //文件大小
			date: FILE.date, //文件时间
			icon: FILE.icon, //文件图标
			oneDragon: FILE.oneDragon, //一条龙服务
			oneDragonList: FILE.oneDragonList, //一条龙服务
			DATE: DATE, //日期
			FILE: FILE,
			getFileType: getFileType
		};
	});