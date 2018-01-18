/**
 * Created by hx on 2017/2/23.
 */
angular.module('mediaplayer',[])
    .controller('mediaPlayer',function($scope,$filter){
        //初始化数据
        $scope.player = {};
        $scope.playing = false;
        $scope.buffering = false;
        $scope.currentTime = '00:00';
        $scope.durationTime = '00:00';
        $scope.isFullScreen = false;
        $scope.showControlBar = true;
        $scope.showBottomTimeline = false;
        var lastTime = 0; //上次的播放位置
        //初始化
        $scope.initPlayer = function(player){
            player.preload = 'metadata'; //只获取元数据(例如媒体长度)
            player.src = $scope.source.src;
            player.type = $scope.source.type;
            //绑定事件
            bindEvent(player);
            $scope.player = player;
            //自动播放
            if($scope.source.autoplay){
                $scope.togglePlayback();
            }
            //封面
            if($scope.source.poster){
                player.poster = $scope.source.poster;
            }
        };
        //绑定事件
        var bindEvent = function(player){
            //播放
            player.onplay = function(){
                $scope.playing = true;
                $scope.$apply();
            };
            //暂停
            player.onpause = function(){
                $scope.playing = false;
                $scope.$apply();
            };
            //开始加载
            player.onloadstart = function(){
                $scope.buffering = true;
                $scope.$apply();
            };
            //加载完成
            player.onloadeddata = function(){
                update();
                $scope.$apply();
            };
            //监听时间
            player.ontimeupdate = function(){
                grabStatistics();
            };
            //正在下载媒体
            player.onprogress = function(evt){
                if(evt.target.buffered.length){
                   var bufferEnd = evt.target.buffered.end(evt.target.buffered.length - 1); //缓存截止时间
                    $scope.bufferedBarWidth = bufferEnd / $scope.player.duration * 100 + '%';
                    $scope.$apply();
                }
            };
            //结束
            player.onended = function(){
            };
            //出错
            player.onerror = function (error) {
                console.log('mediaplayer error',error);
            };

        };
        //统计
        var grabStatistics = function(){
            var player = $scope.player;
            //不能播放,缓冲中
            if (lastTime === player.currentTime && !player.paused) {
                $scope.buffering = true;
            }else{
                lastTime = player.currentTime;
                $scope.buffering = false;
            }
            update();
            $scope.$apply();
        };
        //刷新
        var update = function(){
            // 播放进度
            $scope.processBarWidth = $scope.player.currentTime / $scope.player.duration * 100 + '%';
            //当前播放时间
            if($scope.player.currentTime){
                $scope.currentTime = $filter('mediaTime')($scope.player.currentTime);
            }
            //总时长
            if($scope.player.duration){
                $scope.durationTime = $filter('mediaTime')($scope.player.duration);
            }
        };
        //切换播放/暂停
        $scope.togglePlayback = function(){
            if($scope.playing){
                $scope.player.pause();
            }else{
                if($scope.requestPlay){
                    $scope.requestPlay(function (isAllow) {
                        if(isAllow){
                            $scope.player.play();
                        }
                    });
                }else{
                    $scope.player.play();
                }
            }
        };
        //打开/关闭满屏
        $scope.toggleFullScreen = function () {
            if(!$scope.isFullScreen){
                //开启全屏
                if ($scope.mediaPlayer.requestFullscreen){// W3C.
                    $scope.mediaPlayer.requestFullscreen();
                }else if($scope.mediaPlayer.msRequestFullscreen){ //IE
                    $scope.mediaPlayer.msRequestFullscreen();
                }else if ($scope.mediaPlayer.mozRequestFullScreen) { //Mozilla
                    $scope.mediaPlayer.mozRequestFullScreen();
                }else if ($scope.mediaPlayer.webkitRequestFullscreen){ //Webkit.
                    $scope.mediaPlayer.webkitRequestFullscreen();
                }
            }else{
                //关闭全屏
                var document = window.document;
                if (document.exitFullscreen) {// W3C.
                    document.exitFullscreen();
                }else if(document.msExitFullscreen){ //ms
                    document.msExitFullscreen();
                }else if (document.mozCancelFullScreen){ // Mozilla.
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen){// Webkit.
                    document.webkitExitFullscreen();
                }
            }
        };
        /**
         * 监听切换全屏变化事件
         * @param element
         */
        $scope.registerFullscreenEvent = function (element) {
            element.addEventListener('webkitfullscreenchange',function () {
                $scope.isFullScreen = !$scope.isFullScreen;
                //向上广播
                if($scope.isFullScreen){
                    $scope.$emit('mediaplayer:requestFullscreen');
                }else{
                    $scope.$emit('mediaplayer:cancelFullscreen');
                }
            });
        };
        //快进(设置当前媒体时间)
        $scope.setCurrentTime = function(milliseconds){
            $scope.player.currentTime = milliseconds;
            $scope.$apply();
        };
        //暂停
        $scope.clearMedia = function () {
            $scope.player && $scope.player.pause && $scope.player.pause();
        };
        //监视试图离开
        $scope.$on('$stateChangeStart',function () {
            $scope.clearMedia();
        });
        //modal移除
        $scope.$on('modal.removed',function () {
            $scope.clearMedia();
        });
    })
    /**
     *
     */
    .directive('mediaPlayer',function ($templateRequest,$compile) {
        return {
            restrict: 'E',
            scope: {
                source: '=',
                requestPlay: '='
            },
            controller: 'mediaPlayer',
            link: function (scope,element) {
                //TODO 监视
                if(scope.source){
                    if(scope.source.type){
                        var type = scope.source.type;
                        if(type.indexOf('video/') != -1 || type.indexOf('application/') != -1){
                            if(UPF.is('ios')){
                                loadSimpleVideo(scope.initPlayer);
                            }else{
                                loadVideoTemplate(scope.initPlayer);
                            }
                        }else if(type.indexOf('audio/') != -1){
                            loadAudioTemplate(scope.initPlayer);
                        }
                    }
                }
                //精简版video模板
                function loadSimpleVideo(cb) {
                    var template = '<div class="screen"><video controls></video></div>';
                    element.append($compile(template)(scope));

                    //video元素
                    var player = element.find('video')[0];
                    typeof cb === 'function' && cb(player);
                }
                //加载video模板
                function loadVideoTemplate(cb){
                    $templateRequest('lib/mediaplayer/template/video-template.html')
                        .then(function(html){
                            //编译并嵌入模板
                            element.append($compile(html)(scope));
                            //video元素
                            var player = element.find('video')[0];
                            //video容器
                            scope.mediaPlayer = element.find('video-container')[0];
                            scope.registerFullscreenEvent(scope.mediaPlayer);
                             typeof cb === 'function' && cb(player);
                        });
                }
                //加载audio模板
                function loadAudioTemplate(cb){
                    $templateRequest('lib/mediaplayer/template/audio-template.html')
                        .then(function(html){
                            //编译并嵌入模板
                            element.append($compile(html)(scope));
                            //video元素
                            var player = document.createElement('audio');
                            typeof cb === 'function' && cb(player);
                        });
                }
                //阻止冒泡
                element.bind('click',function(e){
                    e.stopPropagation();
                });
            }
        }
    })
    /**
     * seek
     */
    .directive('seekBar',function($document){
        return {
            restrict: 'A',
            link: function(scope,element){
                var clientWidth;
                //设置跳转时间
                var setCurrentTime = function(x){
                    var percentage = Math.round(x/clientWidth*100)/100;
                    var player = scope.player;
                    var currentTime = Math.round(player.duration*percentage);
                    scope.setCurrentTime(currentTime);
                };
                //PC按下
                var onMouseDown = function(event) {
                    clientWidth = element[0].clientWidth;
                    var originalX = event.clientX;
                    var offsetX = event.offsetX;
                    //第一次
                    setCurrentTime(offsetX);
                    $document.bind('mousemove',function(event){
                        var distance = event.clientX-originalX;
                        var currentX = offsetX+distance;
                        if(currentX > clientWidth){
                            return;
                        }
                        setCurrentTime(currentX);
                    });
                    $document.bind('mouseup',function(){
                        $document.off('mousemove');
                        $document.off('mouseup');
                    });
                };
                element.bind("mousedown", onMouseDown);

                var getOffset = function getOffset(event) {
                    var el = event.target,
                        x = 0;
                    while (el && !isNaN(el.offsetLeft)) {
                        x += el.offsetLeft - el.scrollLeft;
                        el = el.offsetParent;
                    }
                    return event.clientX - x;
                };
                //Mobile
                var touchstart = function(event) {
                    var offsetX = getOffset(event.touches[0]);
                    clientWidth = element[0].clientWidth;
                    var originalX = event.targetTouches[0].clientX;
                    //第一次
                    setCurrentTime(offsetX);
                    $document.bind('touchmove',function(event){
                        var distance = event.targetTouches[0].clientX - originalX;
                        var currentX = offsetX+distance;
                        if(currentX > clientWidth){
                            return;
                        }
                        setCurrentTime(currentX);
                    });
                    $document.bind('touchend',function(){
                        $document.off('touchmove');
                        $document.off('touchend');
                    });
                };
                element.bind("touchstart", touchstart);
            }
        }
    })
    /**
     *
     */
    .directive('videoHideBar',function () {
        return{
            restrict: 'A',
            scope: {
                videoHideBar: '=',
                position: '@'
            },
            link: function(scope,element){
                var transition = ["transition","-webkit-transition","-moz-transition","-ms-transition"];
                var transform = ["transform","-webkit-transform","-moz-transform","-ms-transform"];
                for(var key in transition){
                    element.css(transition[key], "transform 600ms ease");
                }
                //监听
                scope.$watch("videoHideBar",function(newVal){
                    var distance = 0;
                    if(scope.position == "top"){
                        distance = -element[0].clientHeight;
                    }else if(scope.position == "down"){
                        distance = element[0].clientHeight;
                    }
                    for(var key in transform){
                        element.css(transform[key], newVal ? "translate(0,0)" : "translate(0,"+ distance +"px)");
                    }
                })
            }
        }
    })
    /**
     * 旋转封面
     */
    .directive('rotateCover',function(){
        return {
            restrict: 'A',
            link: function(scope,element){
                var req = 0;
                var deg = 0;
                function rotate(){
                    if(deg>=360){
                        deg = 0;
                    }
                    deg++;
                    element.css('transform','rotate('+ deg+'deg)');
                    req = window.requestAnimationFrame(rotate);
                }
                scope.$watch(function () {
                    return scope.playing && !scope.buffering;
                },function(newVal){
                    if(newVal){
                        req = window.requestAnimationFrame(rotate);
                    }else{
                        window.cancelAnimationFrame(req);
                    }
                });
            }
        }
    })
    /**
     * 将秒数转为mm:ss
     */
    .filter('mediaTime',function () {
        return function (seconds) {
            if(typeof seconds === 'number'){
                var time = "";
                //分钟
                var minuter = parseInt(seconds/60);
                if(minuter<10){
                    time += '0'+minuter;
                }else{
                    time = minuter;
                }
                time += ':';
                //秒
                var second = parseInt(seconds%60);
                if(second<10){
                    time+='0'+second;
                }else{
                    time += second;
                }
                return time;
            }
            return '00:00';
        };
    })
;
