/** 显示一个页面*/
angular.module("app")
	.controller("showPage",function($scope,$rootScope,$sce,$stateParams, $$user, $$chat, $state, $$widget,$injector){
		$scope.isIos = UPF.is("ios");
		var url = $stateParams.url;
		$scope.title = $stateParams.title;
		$scope.params = {
				id: $stateParams.id, 
				url: decodeURIComponent(url)
			}; 

		$scope.targetUrl = $sce.trustAsResourceUrl($scope.params.url);
		//当前链接
		var currentLink = decodeURIComponent($stateParams.url);
		var param = {
			url: $scope.params.url,
			method:'POST',
			action:'url.updateUrl'
		} ;

		$$user.callService(param, function(r){
			if (r.result == "1"){
				$scope.title = r.url.title;
				$scope.urlObject = r.url;
			}
		});

		$scope.operate = function(inParam){
			action = inParam.action;
			if (action == "topMenu"){
				$$widget.POPOVER.topMenu("showPageMenu",$scope,"topMenu",inParam.event);
			}else if (action == "sendFriend"){
				$$widget.POPOVER.hide();
				var initParam = {
					excludes: $rootScope.USER.id,
					range: "all"
				};
				$$widget.MODAL.selectUser(initParam, function(data){
					if (data && data.length && data.length>0){
						var peer = data[0];
						peer.type = peer.type || 'user';
						if (peer.type == 'user'){
							peer.type = 'chat';
							peer.name = peer.username;
							peer.peerId = peer.id;
						}else{
							peer.type= 'groupchat';
							peer.peerId = peer.hxid;
						}
						var message = {
	    		    		to: peer.peerId,
	    		    		from:$rootScope.USER.id,
	    		    		msg:"[url]",
	    		    		msgType : "url",
	    		    		type:peer.type,
	    		    		ext:{ext:{
	    		    			url:$scope.params.url,
	    		    			img:$scope.urlObject.img,
	    		    			title:$scope.urlObject.title,
	    		    			digest:$scope.urlObject.digest
	    		    		}}
	    		    	};
	    		    	$$chat.sendMsg(message);
	    		    	$$chat.addMsg(message);
	    		    	var param = {
	    		    		type:peer.type,
	    		    		name:peer.name
	    		    	}
	    		    	if (peer.type == 'chat'){
	    		    		param.id = peer.peerId;
	    		    	}else if(peer.type == 'groupchat'){
	    		    		param.hxid = peer.peerId;
	    		    	}
	    		    	$state.go("chat", param);
					}
				})
			}
		};
		/**
		 * 复制链接
		 */
		$scope.copyLink = function(){
			try {
				if(UPF.is("APP")){
					$injector.get('$cordovaClipboard').copy(currentLink);
				}else{
					$injector.get('clipboard').copyText(currentLink);
				}
				$injector.get('toastr').success('链接已复制');
			} catch (e) {
				$injector.get('toastr').error('复制链接失败');
			}finally{
				$$widget.POPOVER.hide(); //关闭popover
			}
		};
		/**
		 * 在浏览器中打开
		 */
		$scope.openInBrower = function(){
			if(UPF.is('app')){
				$injector.get('$cordovaInAppBrowser').open(currentLink,'_system');
			}else{
				window.open(currentLink,'_blank')
			}
			$$widget.POPOVER.hide(); //关闭popover
		};
//		window.frameLoad = function(f){
//			var c = "showPage";
//			var appElement = document.querySelector('[ng-controller='+c+']');
//			var $scope = angular.element(appElement).scope();
//			
//			$scope.load();
//		};
//		
//		$scope.load = function(){
//			
//		};
//		
//		
		
	});