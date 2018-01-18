angular.module("app")
	.controller("guide",function($rootScope,$scope,$stateParams){
	
	$scope.name = $stateParams.name;
	$scope.dataimg ="";
	$scope.datadesc ="";
	$scope.title = "";
	$scope.slideIndex = 0;
	$scope.length;
	$scope.guideData = {
		huawei:[
		        {img:"img/guide/huawei_1.jpg",desc:"1.打开华为手机管家,点击右上角设置按钮"},
		        {img:"img/guide/huawei_2.jpg",desc:"2.点击 受保护应用"},
		        {img:"img/guide/huawei_3.jpg",desc:"3.将掌文勾选为受保护应用"}
		],
		samsung:[
		         {img:"img/guide/samsung_1.jpg",desc:"1.在智能管理器中，点击电池模块"},
		         {img:"img/guide/samsung_2.jpg",desc:"2.点击应用程序优化中详情按钮"},
		         {img:"img/guide/samsung_3.jpg",desc:"3.找到掌文并禁用优化"}
		],
		xiaomi:[
		        {img:"img/guide/xiaomi_1.png",desc:"1.点击进入安全中心"},
		        {img:"img/guide/xiaomi_2.png",desc:"2.点击制授权管理"},
		        {img:"img/guide/xiaomi_3.png",desc:"3.进入自启动管理"},
		        {img:"img/guide/xiaomi_4.png",desc:"4.选择掌文，允许其自启动"},
		        {img:"img/guide/xiaomi_5.png",desc:"5.返回制空权管理界面，进入应用权限管理"},
		        {img:"img/guide/xiaomi_6.png",desc:"6.选择掌文应用"},
		        {img:"img/guide/xiaomi_7.png",desc:"7.给掌文应用权限"},
		        {img:"img/guide/xiaomi_8.png",desc:"8.进入设置，进行其他高级设置"},
		        {img:"img/guide/xiaomi_9.png",desc:"9.点击电量与性能"},
		        {img:"img/guide/xiaomi_10.png",desc:"10.点击神隐落模式"},
		        {img:"img/guide/xiaomi_11.png",desc:"11.点击应用配置"},
		        {img:"img/guide/xiaomi_12.png",desc:"12.选择掌文应用"},
		        {img:"img/guide/xiaomi_13.png",desc:"13.自定义配置中选择保持联网与保持定位可用"},
		        {img:"img/guide/xiaomi_14.png",desc:"14.点击设置中的WLAN"},
		        {img:"img/guide/xiaomi_15.png",desc:"15.选择下角高级设置"},
		        {img:"img/guide/xiaomi_16.png",desc:"16.设置始终保持wlan连接以及随时可扫描"}
		],
		safe360:[
		        {img:"img/guide/safe360_1.png",desc:"1.点击清理加速"}, 
		        {img:"img/guide/safe360_2.png",desc:"2.点击强力手机加速"}, 
		        {img:"img/guide/safe360_3.png",desc:"3.安全清理的进程中,取消掌文的勾选"}
		],
		clear360:[
		        {img:"img/guide/clear360_1.jpg",desc:"1.点击手机加速"}, 
		        {img:"img/guide/clear360_2.jpg",desc:"2.点击右上角菜单中内存忽略名单项"}, 
		        {img:"img/guide/clear360_3.png",desc:"3.点击添加"}, 
		        {img:"img/guide/clear360_4.jpg",desc:"4.勾选掌文，并确定"} 
		],
		manager:[
			    {img:"img/guide/manager_1.jpg",desc:"1.点击右上角用户按钮"}, 
			    {img:"img/guide/manager_2.jpg",desc:"2.点击设置按钮"}, 
			    {img:"img/guide/manager_3.jpg",desc:"3.点击清理加速保护名单"}, 
			    {img:"img/guide/manager_4.png",desc:"4.选择加速保护名单"}, 
			    {img:"img/guide/manager_5.jpg",desc:"5.点击添加"}, 
			    {img:"img/guide/manager_6.jpg",desc:"6.勾选掌文，并确定"}
		]
	};
	
	/**
	 * 上一页
	 */
	$scope.slidePrevious = function(){
		var length = $scope.repeatData.length;
		if($scope.slideIndex >0 ){
			$scope.slideIndex--;
			$scope.dataimg = $scope.repeatData[$scope.slideIndex].img;
			$scope.datadesc = $scope.repeatData[$scope.slideIndex].desc;
		}
	}
	
	/**
	 * 下一页
	 */
	$scope.slideNext = function(){
		var length = $scope.repeatData.length;
		if($scope.slideIndex<length-1 ){
			$scope.slideIndex++;
			$scope.dataimg = $scope.repeatData[$scope.slideIndex].img;
			$scope.datadesc = $scope.repeatData[$scope.slideIndex].desc;
		}
	}
	/**
	 * 初始化页面数据
	 */
	$scope.init = function(){
		console.log($scope.name);
		$scope.slideIndex = 0;
		if($scope.name){
			if($scope.name == "huawei"){
				$scope.title = "华为";
				$scope.repeatData = $scope.guideData.huawei;
			}else if($scope.name == "samsung"){
				$scope.title = "三星";
				$scope.repeatData = $scope.guideData.samsung;
			}else if($scope.name == "xiaomi"){
				$scope.title = "小米";
				$scope.repeatData = $scope.guideData.xiaomi;
			}else if($scope.name == "safe360"){
				$scope.title = "360安全卫士";
				$scope.repeatData = $scope.guideData.safe360;
			}else if($scope.name == "clear360"){
				$scope.title = "360清理大师";
				$scope.repeatData = $scope.guideData.clear360;
			}else if($scope.name == "manager"){
				$scope.title = "腾讯手机管家";
				$scope.repeatData = $scope.guideData.manager;
			}
			$scope.length = $scope.repeatData.length;
			$scope.dataimg = $scope.repeatData[$scope.slideIndex].img;
			$scope.datadesc = $scope.repeatData[$scope.slideIndex].desc;
		}
	}
	
	/** VIEW enter*/
	$scope.$on("$ionicView.enter",function(){
		/** 初始化执行*/
		$scope.init();
	});
	
});