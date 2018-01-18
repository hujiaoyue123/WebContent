/** 数据 */
angular.module("app")
	.service("dbservice",function(cfservice,service){//fileservice
		/** 初始化
		 * 创建本地库、表
		 */
		this.init = function(){
			service.promiseProxy(function(promise){
				cfservice.getDB(promise); //获取数据库配置信息
			},function(result){
				if(result){
					_openDB().transaction(function(tx){
						for(var table in result){
							//清空数据表
//							tx.executeSql("DROP TABLE " + table);
							//创建表
							tx.executeSql(getCreateSql(table,result[table]));
						}
					});
				}
			});
		};
		/** 打开/创建数据库
		 */
		this.openDB = _openDB = function(){
			return openDatabase("zwdb","1.0","",5*1024*1024); //数据库、版本、描述、大小
		};
		/**创建表
		 */
		var initTable = function(tables){
			_openDB().transaction(function(tx){
				for(var table in tables){
					console.log(table);
				}
				//tx.executeSql(sql);
			});
		};
		/**创建表
		 */
		this.createTable = _createTable = function(sql){
			_openDB().transaction(function(tx){
				tx.executeSql(sql);
			});
		};
		/** 查询
		 */
		this.execute = _execute = function(sql,varible){
			_openDB().transaction(function(tx){
				tx.executeSql(sql,varible,function(tx,results){
					console.log(results.rows);
				});
			});
		};
		/** SQL-创建表*/
		var getCreateSql = function(table,fields){
			var sql = "CREATE TABLE IF NOT EXISTS " + table + "(";
			for(var key in fields){
				sql += key + " " + fields[key] + ",";
			}
			return sql.slice(0,sql.length-1) + ")";
		};
		/**
		 * 
		 */
		this.ppan = function(data){
			//查询sql
			var sql1 = "SELECT * FROM ppan WHERE id=?";
			//插入sql
			var sql2 = "INSERT INTO ppan (id,parentid,userid,title,src,createdate,type,filetype,iontype,filesize,imagenumber,sharetype) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
			//修改sql
			var sql3 = "UPDATE ppan SET parentid=?,userid=?,title=?,src=?,createdate=?,type=?,filetype=?,iontype=?,filesize=?,imagenumber=?,sharetype=? WHERE id=?";
			//删除sql
			var sql4 = "DELETE FROM ppan WHERE id=?";
			//打开DB
			var DB = _openDB();
			if(data){
				DB.transaction(function(tx){
					//父目录
					execute(data);
					//子目录
					if(data.sub && data.sub.length>0){
						for(var index in data.sub){
							var file = data.sub[index];
							if(typeof file === "object"){
								/*
								//图片文件
								if(file.iontype == "image"){
									downloaImage(file); //缩略图
									previewImage(file); //预览图
								}
								//office、pdf
								else if(file.preview == "pdf"){
									
								}
								else{
									execute(file);
								}*/
								execute(file);
							}
						}
					}
				});
			}
			/** 执行sql
			 * file: 文件对象
			 */
			var execute = function(file){
				DB.transaction(function(tx){
					//根据文件id查询数据
					tx.executeSql(sql1,[file.id],function(tx,results){
						//没有记录--添加记录
						if(results.rows.length == 0){ //插入
							console.log("["+file.title+"]" + "执行【添加】库操作");
							tx.executeSql(sql2,getVaribles(file)); //执行插入
						}
						//有一条记录--修改
						else if(results.rows.length == 1){ 
							console.log("["+file.title+"]" + "执行【修改】库操作");
							tx.executeSql(sql3,getUpdateVaribles(file)); //执行修改
						}
						//其他情况
						else{
							console.log("异常查询!!!");
						}
					});
				});
			};
			/** 下载缩略图
			 * file 文件对象
			 */
			var downloaImage = function(file){
				service.promiseProxy(function(promise){
					fileservice.download(promise,file.src,file.id,file.title);
				},function(success){
					console.log("缩略图"+file.src+"已下载");
					file.src = success.nativeURL;
					execute(file);
				},function(error){
					console.log("缩略图"+file.src+"下载失败!");
					console.log(error);
				});
			};
			/** 下载大图
			 * file 文件对象
			 */
			var previewImage = function(file){
				service.promiseProxy(function(promise){
					var imgUrl = service.imgPath_other("ppanCtrl",file.id);
					fileservice.download(promise,imgUrl,file.id,file.id+".jpg");
				},function(success){
					console.log(success.nativeURL);
				},function(error){
					console.log(error);
				});
			};
			/** office、pdf图片集
			 * file 文件对象
			 */
			var officeImage = function(file){
				for(var i=0;i<file.imagenumber;i++){
					doIt(i);
				}
				//Li-Ning： just do it...
				var doIt = function(num){
					service.promiseProxy(function(promise){
						var imgUrl = service.imgpath_office("ppanCtrl",file.id,num);
						fileservice.download(promise,imgUrl,file.id,num+".jpg");
					},function(success){
						console.log(success.nativeURL);
					},function(error){
						console.log(error);
					});
				}
			};
			//有效参数
			var getVaribles = function(obj){
				var varibles = [obj["id"],obj["parentid"],obj["userid"],obj["title"],obj["src"],obj["createdate"],obj["type"],obj["filetype"],obj["iontype"],obj["filesize"],obj["imagenumber"],obj["sharetype"]];
				for(var key in varibles){
					if(!varibles[key]){
						varibles[key] = "null";
					}
				}
				console.log(varibles);
				return varibles;
			};
			//修改参数
			var getUpdateVaribles = function(obj){
				var array = getVaribles(obj);
				array.push(array[0]);
				array.shift();
				return array;
			};
		};
		/** 个人盘查询
		 */
		this.ppanSelect = function(promise,id,userid){
			//查询sql
			var sql1 = "SELECT * FROM ppan WHERE id=? AND userid=?";
			var sql2 = "SELECT * FROM ppan WHERE parentid = ? AND userid = ?";
//			var sql2 = "SELECT * FROM ppan";
			//获取用户
			var getUserId = function(){
				if(userid){
					return userid;
				}else{
					var user = service.getUser();
					if(user && user.id){
						console.log("用户id"+user.id);
						return user.id;
					}else{
						return;
					}
				}
			};
			//打开DB
			var DB = _openDB();
			if(id){ //子目录
				console.log(123);
				DB.transaction(function(tx){
					//查询父目录
					tx.executeSql(sql1,[id,getUserId()],function(tx,results){
						console.log(results);
						if(results.rows.length == 1){
							var result = results.rows[0]; //父目录
							////查询该id的所有子目录
							tx.executeSql(sql2,[result.id,getUserId()],function(tx,results){
								result.sub = [];
								var rows = results.rows;
								for(var i=0;i<rows.length;i++){
									result.sub.push(results.rows[i]);
								}
								//返回本地库的数据
								promise.resolve(result);
							});
						}
					});
				});
			}else{ //根目录
				console.log(456);
				DB.transaction(function(tx){
					//查询root目录
					tx.executeSql(sql2,['0',getUserId()],function(tx,results){
//					tx.executeSql(sql2,[],function(tx,results){
						console.log(results);
						if(results.rows.length == 1){
							var result = results.rows[0]; //父目录
							//查询该id的所有子目录
							tx.executeSql(sql2,[result.id,getUserId()],function(tx,results){
								result.sub = [];
								var rows = results.rows;
								for(var i=0;i<rows.length;i++){
									result.sub.push(results.rows[i]);
								}
								//返回本地库的数据
								promise.resolve(result);
							});
						}
					});
				});
			}
		};
		/** 企业盘查询
		 */
		this.cpanSelect = function(promise,id){
			//查询sql
			var sql1 = "SELECT * FROM cpan WHERE id=?";
			var sql2 = "SELECT * FROM cpan WHERE parentid = ?";
			//打开DB
			var DB = _openDB();
			if(id){ //子目录
				DB.transaction(function(tx){
					tx.executeSql(sql1,[id],function(tx,results){
						if(results.rows.length == 1){
							var result = results.rows[0]; //父目录
							tx.executeSql(sql2,[result.id],function(tx,results){
								result.sub = [];
								var rows = results.rows;
								for(var i=0;i<rows.length;i++){
									result.sub.push(results.rows[i]);
								}
								promise.resolve(result);
							});
						}
					});
				});
			}else{ //根目录
				DB.transaction(function(tx){
					tx.executeSql(sql2,['0'],function(tx,results){
						if(results.rows.length == 1){
							var result = results.rows[0]; //父目录
							tx.executeSql(sql2,[result.id],function(tx,results){
								result.sub = [];
								var rows = results.rows;
								for(var i=0;i<rows.length;i++){
									result.sub.push(results.rows[i]);
								}
								promise.resolve(result);
							});
						}
					});
				});
			}
		};
		/** 企业盘
		 * 
		 */
		this.cpan = function(data){
			//查询sql
			var sql1 = "SELECT * FROM cpan WHERE id=?";
			//插入sql
			var sql2 = "INSERT INTO cpan (id,parentid,createid,title,createdate,type,filetype,filesize,imagenumber,sharetype) VALUES (?,?,?,?,?,?,?,?,?,?)";
			//修改sql
			var sql3 = "UPDATE cpan SET parentid=?,createid=?,title=?,createdate=?,type=?,filetype=?,filesize=?,imagenumber=?,sharetype=? WHERE id=?";
			//删除sql
			var sql4 = "DELETE FROM cpan WHERE id=?";
			//打开DB
			var DB = _openDB();
			if(data){
				DB.transaction(function(tx){
					//父目录
					execute(tx,data);
					//子目录
					if(data.sub && data.sub.length>0){
						for(var index in data.sub){
							if(typeof data.sub[index] === "object"){
								execute(tx,data.sub[index]);
							}
						}
					}
				});
			}
			/** 执行sql
			 * tx: 事物
			 * file: 文件对象
			 */
			var execute = function(tx,file){
				tx.executeSql(sql1,[file.id],function(tx,results){
					if(results.rows.length == 0){ //插入
						tx.executeSql(sql2,getVaribles(file)); //执行插入
					}else{ //修改
						tx.executeSql(sql3,getUpdateVaribles(file)); //执行修改
					}
				});
			};
			//有效参数
			var getVaribles = function(obj){
				return [obj["id"],obj["parentid"],obj["createid"],obj["title"],obj["createdate"],obj["type"],obj["filetype"],obj["filesize"],obj["imagenumber"],obj["sharetype"]];
			};
			//修改参数
			var getUpdateVaribles = function(obj){
				var array = getVaribles(obj);
				array.push(array[0]);
				array.shift();
				return array;
			};
		};
		/** 用户表
		 */
		var user = "CREATE TABLE IF NOT EXISTS user (id varchar(36),loginname varchar(50),username varchar(100),password varchar(100),mobile varchar(100),email varchar(100),sex varchar(4),state varchar(10))";
		var sql1 = "INSERT INTO user (username) VALUES ('呵呵')";
		var sql2 = "SELECT * FROM user";
		var sql3 = "UPDATE user SET sex = '男' WHERE username = '呵呵'";
		var sql4 = "DELETE FROM user WHERE sex = '男'";
	});