/** 用户*/
angular.module("app")
	.factory("$$util",function(){
		var ARRAY = {
			isArray: function(obj){
				return Object.prototype.toString.call(obj) === '[object Array]';
			},
			indexOf: function(obj,val){
				if(ARRAY.isArray(obj)){
					for(var i=0; i<obj.length; i++){
						if(obj[i] == val)return i;
					}
				}
				return -1;
			},
			remove: function(obj,val){
				var index = ARRAY.indexOf(obj,val);
				if (index > -1) {
					obj.splice(index,1);
				}
				return obj;
			},
			/** 修改array里某个对象
			 * array
			 * obj
			 */
			update: function(array, obj){
				if(ARRAY.isArray(array)){
					for(var i=0;i<array.length;i++){
						if(array[i].id && obj.id && array[i].id == obj.id){
							array[i] = obj;
						}
					}
				}
			},
			/** array去重追加
			 * array1
			 * array2
			 */
			distinctPush: function(array1,array2){
				var additional = []; //待追加集合,array2不重复的集合
				//提取array2不重复的子集
				for(var i=0;i<array2.length;i++){
					var conflict = false; //是否冲突
					for(var k=0;k<array1.length;k++){
						if(array1[k].id && array2[i].id && array1[k].id == array2[i].id){
							conflict = true;
						}else if(array1[k] == array2[i]){
					    	conflict = true;
					    }
					 }
					 //不冲突则添加
					if(!conflict){
					   additional.push(array2[i]);
					}
				}
				//向array1追加array2不重复的子集
				for(var i=0;i<additional.length;i++){
				  array1.push(additional[i]);
				}
			},
	        indexOfId:function(id, arr){
        		var md = arr;
        		for (var i=0; i<md.length; i++){
        			var u = md[i];
        			if (u.id == id){
        				return i;
        			}
        		}
        		return -1;
        	},
        	findById:function(id, arr){
        		for (var i=0; i<arr.length; i++){
        			var o = arr[i];
        			if (o.id == id){
        				return o;
        			}
        		}
        		return null;
        	}
		};
		var String = {
			verifyMobile : function(mobile){
				if(mobile && (mobile+"").length == 11){
					var myreg = /^((1)+\d{10})$/;
					if(myreg.test(mobile)){
						return true;
		        	}
		        }
				return false;
			},
			verifyHttpUrl: function(url){
				if(url && url!=""){
					var myreg = /^http[s]?:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/;
					if(myreg.test(url)) {
					    return true;
					}
				}
				return false;
			},
			getUrlParams:function(url){
				var p = url.indexOf("?");
				var result = null;
				if (p>-1){
					url = url.substring(p+1);
					var r = url.split("&");
					result = {};
					for(var i in r){
						var item = r[i];
						var t = item.split("=");
						result[t[0]] = t[1]||"";
					}
				}
				return result;			
			},
			verifyEmail: function(email){
				if(email && email!=""){
					var myreg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
					if(myreg.test(email)) {
						return true;
					}
				}
				return false;
			},
			verifyPhone: function(phone){
				if(phone && phone!=""){
					var myreg = /(\(\d{3,4}\)|\d{3,4}-|\s)?\d{8}/;
					if(myreg.test(phone)) {
						return true;
					}
				}
				return false;
			},
			verifyPassword: function(password){
				if(password && password!=''){
				//var regex = /(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,12}/;
					var regex = /(?=.*[0-9])(?=.*[a-zA-Z]).{6,12}/;
					if(regex.test(password)){
						return true;
					}
				}
				return false;
				
			},
			insertText: function(obj, str){
				if (document.selection) {
					obj.focus();
					var sel = document.selection.createRange();
					sel.text = str;
				} else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
					var startPos = obj.selectionStart;
					var endPos = obj.selectionEnd;
					var tmpStr = obj.value;
					obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
					obj.selectionStart = startPos + str.length;
					obj.selectionEnd = obj.selectionStart;
				} else {
					obj.value += str;
				}
			}
		};
		var Browser = {
			getFileURL : function(file) {
		        var url = null;
		        if (window.createObjectURL != undefined) { // basic
		            url = window.createObjectURL(file);
		        } else if (window.URL != undefined) { // mozilla(firefox)
		            url = window.URL.createObjectURL(file);
		        } else if (window.webkitURL != undefined) { // webkit or chrome
		            url = window.webkitURL.createObjectURL(file);
		        }
		        return url;
			}
		};
		/***
		 * 生成guid
		 */
		var guid = function() {
		    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		        return v.toString(16);
		    });
		};
		/**
		 * 判断是否空对象
		 */
		var isEmptyObject = function(obj){
			for(var o in obj){
				if(obj.hasOwnProperty(o)){
					return false;
				}
			}
			return true;
		};
		/** 
		 * 是否同一天(包括,年月日)
		 * date1,date2 时间类型
		 */
		var isSameDate = function(date1,date2){
			//日
			if(date1.getDate() == date2.getDate()){
				//月
				if(date1.getMonth() == date2.getMonth()){
					//年
					if(date1.getFullYear() == date2.getFullYear()){
						return true;
					}else{
						return false;
					}
				}else{
					return false;
				}
			}else{
				return false;
			}
		};
		/**
		 * 获取文件扩展名
		 */
		var getFileext = function(filename){
			if(filename){
				var array = filename.split('.');
				if(array.length>0){
					return array[array.length-1];
				}else{
					return null;
				}
			}else{
				return null;
			}
		};
		var Map = {     
		    keys: new Array(),  
		    data: new Object(),    
		         
		    put : function(key, value) {     
		        if(this.data[key] == null){     
		            this.keys.push(key);     
		        }     
		        this.data[key] = value;     
		    },     
		         
		    get : function(key) {     
		        return this.data[key];     
		    },    
		         
		    remove : function(key) {     
		        this.keys.remove(key);     
		        this.data[key] = null;     
		    },   
		         
		    each : function(fn){     
		        if(typeof fn != 'function'){     
		            return;     
		        }     
		        var len = this.keys.length;     
		        for(var i=0;i<len;i++){     
		            var k = this.keys[i];     
		            fn(k,this.data[k],i);     
		        }     
		    },    
		         
		    entrys : function() {     
		        var len = this.keys.length;     
		        var entrys = new Array(len);     
		        for (var i = 0; i < len; i++) {     
		            entrys[i] = {     
		                key : this.keys[i],     
		                value : this.data[i]     
		            };     
		        }     
		        return entrys;     
		    }, 
		         
		    isEmpty : function() {     
		        return this.keys.length == 0;     
		    },
		         
		    size : function(){     
		        return this.keys.length;     
		    },    
		         
		    toString : function(){     
		        var s = "{";     
		        for(var i=0;i<this.keys.length;i++,s+=','){     
		            var k = this.keys[i];     
		            s += k+"="+this.data[k];     
		        }     
		        s+="}";     
		        return s;     
		    }
		};
		/**
		 * 字节转换
		 */
		var convertSize = function(byte){
			if(byte){
				var kb = byte / 1024; //转换为KB
				if(kb >= 1024){ //转换为MB
					var mb = kb / 1024;
					if(mb >= 1024){ //转化为GB
						var gb = mb / 1024;
						var a = gb.toString().split(".")[0];
						var b = parseInt(gb.toString().split(".")[1].slice(0,1));
						return b != 0 ? a + "." + b + "GB" : a + "GB";
					}else{
						var a = mb.toString().split(".")[0];
						var b = parseInt(mb.toString().split(".")[1].slice(0,1));
						return b != 0 ? a + "." + b + "MB" : a + "MB";
					}
				}else{
					var a = kb.toString().split(".")[0];
					var b = kb.toString().split(".")[1];
					if(a == 0 && b > 0){
						a = 1;
					}
					return a + "KB";
				}
			}else{
				return byte;
			}
		};
		/**
		 * 根据文件路径获取文件名
		 */
		var getFileNameByUri = function(uri){
			if(uri){
				var array = uri.split('/');
				if(array.length){
					var name = array[array.length-1];
					return name;
				}else{
					return null;
				}
			}else{
				return null;
			}
		};
		/**
		 * 字节转换单位
		 * @param bytes
		 * @returns {*}
		 */
		var bytesToSize = function(bytes) {
			if (bytes === 0) return '0 B';
			var k = 1024,
				sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
				i = Math.floor(Math.log(bytes) / Math.log(k));
			return (bytes / Math.pow(k, i)).toPrecision(3) + sizes[i];
		};
		return {
			Map:Map,
			ARRAY:ARRAY, 
			String:String, 
			Browser:Browser,
			guid: guid,
			isEmptyObject: isEmptyObject,
			isSameDate: isSameDate,
			getFileext: getFileext,
			convertSize: convertSize,
			getFileNameByUri: getFileNameByUri,
			bytesToSize: bytesToSize
		}
	});