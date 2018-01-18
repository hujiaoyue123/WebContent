/**
 * 媒体服务类
 */
angular.module('app')
	.factory('media',function($injector){
		var media = {
			/** 应用内的音效*/
			audioList: {
				"sendAudio": "media/sendAudio.wav", //发送语音
				"beforeRecord": "media/beforeRecord.wav", //开始录音
				"playend": "media/playend.wav", //语音播放完毕
				"press": "media/press.wav" //消息点击
			},
			/**
			 * 预加载应用内部音效
			 */
			preload: function(){
				//由于预加载会关闭其他应用声音播放，就先不加载
				//return;
				if($injector.has('$cordovaNativeAudio')){
					for(var key in this.audioList){
						$injector.get('$cordovaNativeAudio').preloadSimple(key,this.audioList[key]);
					}
				}
			},
			/** audio实例*/
			audioInstance: null,
			/**
			 * audio 构造函数
			 * @param url 文件路径
			 */
			audio: function(url){
				if(UPF.is('web')){
					if(this.audioInstance){
						this.audioInstance.src = url;
						return this.audioInstance;
					}else{
						this.audioInstance = document.createElement('audio');
						this.audioInstance.src = url;
						return this.audioInstance;
					}
				}
			},
			/**
			 * 内置音效
			 * @param id audioList的key
			 * @param successCallback 成功回调
			 */
			audioEffects: function(id,successCallback){
				if(UPF.is('app')){
					if($injector.has('$cordovaNativeAudio')){
						$injector.get('$cordovaNativeAudio').play(id).then(successCallback);
					}
				}else if(UPF.is('web')){
					for(var key in this.audioList){
						if(key == id){
							this.audio(this.audioList[id]).play();
							break;
						}
					}
				}
			}
		};
		//预载音效
		media.preload();
		
		return media;
	});