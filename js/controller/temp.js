var PREVIEW = {
	/** 初始加载office
	 * 
	 */
	initOfficePicture: function(){
		for(var i=0;i<params.num,i<limit;i++){ //根据图片数量创建这么多的div
			var obj = {};
			if(i <= 1){ //加载2张图片
				var inParams;
				if(params.type == "link"){
					obj.src = service.imgPath_link(1,params.id,i);
				}else{
					inParams = {
						pan: "ppan",
						id: params.id,
						num: i
					};
				}
				obj.src = $$resource.getOfficePicture(inParams);
			}
			obj.scale = 1;
			obj.index = i;
			imgList.push(obj);
		}
	}
}