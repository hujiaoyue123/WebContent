angular.module("app")
.factory("$$data",function($$util){
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
				var video = ["mp4","avi","mov","asf","wmv","3gp","flv","fmvb","navi"];
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
					file.preview = 'video';
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
			if(file.updatetime){
				file.updatetime = DATE.format(new Date(parseInt(file.updatetime)),"yyyy-MM-dd hh:mm");
			}
			if(file.createtime){
				file.createtime = DATE.format(new Date(parseInt(file.createtime)),"yyyy-MM-dd hh:mm");
			}
			if(file.sharetime){
				file.sharetime = DATE.format(new Date(parseInt(file.sharetime)),"yyyy-MM-dd hh:mm");
			}
			return file;
		},
		/** 文件图标
		 * resource
		 */
		icon: function(resource){
			resource.src = "../img/filetype/" + resource.iontype + ".png";
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
			}
			
	}
	return {
		FILE: FILE,
		DATE: DATE
	};	
});