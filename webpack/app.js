var baseUrl = '/tyscshop/',rootUrl='http://106.15.126.197';
// var baseUrl = '/plshshop/',rootInfo={};
/* -------------------------------
  0.0 App
------------------------------- */
adminApp.controller('appController', ['$rootScope', '$scope','$state','$http',function($rootScope, $scope,$state,$http) {
    $scope.$on('$includeContentLoaded', function() {
        App.initComponent();
    });
    $scope.$on('$viewContentLoaded', function() {
        App.initComponent();
        App.initLocalStorage();
    });
    $scope.$on('$stateChangeStart', function() {
        App.scrollTop();
        $('.pace .pace-progress').addClass('hide');
        $('.pace').removeClass('pace-inactive');
    });
    $scope.$on('$stateChangeSuccess', function(){
        Pace.restart();
        App.initPageLoad();
        App.initSidebarSelection();
        App.initLocalStorage();
        App.initSidebarMobileSelection();
    });
    $scope.$on('$stateNotFound', function() {
        Pace.stop();
    });
    $scope.$on('$stateChangeError', function() {
        Pace.stop();
    });
}]);
/* -------------------------------
 1.0 shopType
 ------------------------------- */
adminApp.controller('checkShop', ['$rootScope', '$scope','$state','$http',function($rootScope, $scope,$state,$http) {
    $scope.init=function () {
        App.initSidebar();
        $scope.userType = false;
        $scope.hasInfo=false;
        $scope.hadOpen=false;
        $scope.shopName='我的店铺'
        $scope.getInfo();
        $scope.getUserInfo();
    };
    $scope.getUserInfo =function () {
        $rootScope.request.getlist(baseUrl+'user/getUserInfo','POST').then(function (data) {
            if (data.code == 1000) {
                $scope.userInfo = data.data.user.phone
                App.setCookie('token',data.data.user.token)
                App.setCookie('phone',data.data.user.phone)
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.getInfo =function () {
        $rootScope.request.getlist(baseUrl+'storeInfo/applyState','POST').then(function (data) {
            if (data.code == 1000) {
                if(data.data.userroleType == 2){
                    $scope.userType = true
                } else {
                    $scope.userType = false
                }
                if(data.data.storeinfo.length==0){
                    $scope.hasInfo=false;
                    $rootScope.layerMethod.layerAlert('info','你还没有店铺信息需要去开设店铺',function () {
                        $rootScope.$state.go('app.shopinfo.openShop');
                    });
                }else{
                    if(data.data.storeinfo[0].state==1){
                        $rootScope.layerMethod.layerAlert('info','店铺审核中请耐心等待',function () {
                            $rootScope.$state.go('app.shopinfo.shopInfo');
                            $scope.hasInfo=false;
                        });
                    }
                    if(data.data.storeinfo[0].state==3){
                        $rootScope.layerMethod.layerAlert('info','店铺审核不通过,请重新编辑',function () {
                            $rootScope.$state.go('app.shopinfo.shopInfo');
                            $scope.hasInfo=false;
                        });
                    }
                    if(data.data.storeinfo[0].state==2){
                        $scope.shopName=data.data.storeinfo[0].storename;
                        App.setCookie('storeid',data.data.storeinfo[0].id)
                        App.setCookie('strongholdid',data.data.storeinfo[0].strongholdid)
                        $scope.hasInfo=true;
                        $scope.hadOpen=true;
                    }
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.loginOut = function () {
        App.showMask();
        var url = "/plshshop/user/quit";
        $http.post(url).success(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $state.go('account.login');
            } else {
                alert(data.message);
            }
        }).error(function (data) {
            App.hideMask();
            alert(data);
        });
    };
    $scope.init();
}]);
/* -------------------------------
   3.0 Header
------------------------------- */
adminApp.controller('headerController', ['$rootScope', '$scope','$state','$http',function($rootScope, $scope, $state,$http) {

}]);
/* -------------------------------
   4.0 Page Loader
------------------------------- */
adminApp.controller('pageLoaderController', ['$rootScope', '$scope','$state',function($rootScope, $scope, $state) {
    App.initPageLoad();
}]);

/* -------------------------------
 5 登陆
 ------------------------------- */
adminApp.controller('login',['$scope','$rootScope','$state','$http',function($scope, $rootScope, $state,$http) {
    $scope.form ={};
    $scope.codeImg = baseUrl + 'user/getCode?v='+Math.random();
    $scope.status= false;
    $scope.errorInfo='';
    // 获取验证码
    $scope.getCode=function (){
        $scope.codeImg=baseUrl + 'user/getCode?v='+Math.random();
    };
    // 用户登陆
    $scope.submitForm=function () {
        $scope.status= false;
        if(!$scope.form.account){
            $scope.errorInfo='请输入用户名！';
            $scope.status =true;
            return false
        }
        if(!$scope.form.password){
            $scope.errorInfo='请输入密码！';
            $scope.status =true;
            return false
        }
        if(!$scope.form.code){
            $scope.errorInfo='请输入验证码！';
            $scope.status =true;
            return false
        }
        App.showMask();
        var param = {
            "phone": $scope.form.account,
            "pwd": $scope.form.password,
            "msg": $scope.form.code,
        };
        $rootScope.request.getlist(baseUrl + 'user/doLogin','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                App.setCookie('hxusername',data.data.user.hxusername);
                $rootScope.$state.go('app.index');
            } else {
                $scope.errorInfo=data.message;
                $scope.status =true;
            }
        },function (data) {
            App.hideMask();
            $scope.errorInfo=data.message;
            $scope.status =true;
        });
    }
}]);
/* -------------------------------
 6 注册
 ------------------------------- */
adminApp.controller('register', ['$scope', '$rootScope','$state','$http','$interval', function($scope, $rootScope, $state,$http,$interval) {
    $scope.form ={};
    $scope.status= false;
    $scope.errorInfo='';
    $scope.message = '获取验证码(60s)';
    $scope.forbidden = false;
    $('.login-content input').change(function () {
        $scope.status= false;
    });
    $scope.getCode=function(){
        if($rootScope.checkMethod.isEmpty($scope.form.account)){
            $scope.errorInfo='请输入手机号码！';
            $scope.status =true;
            return false
        };
        var time =$rootScope.Format.dateTime("yyyy-MM-dd hh:mm:ss"),nonce_str=$scope.randomString(6);
        var hm5string="nonce_str="+nonce_str+"&phone="+$scope.form.account+"&time="+time+"&type=1&key=seEhyHEF";
        console.log(hm5string);
        var sign=hex_md5(hm5string).toUpperCase();
        var t = 59, param = {phone: $scope.form.account, type: 1,time:time,nonce_str:nonce_str,sign:sign};
        $rootScope.request.getlist(baseUrl + 'user/sendCode','POST', param).then(function (data) {
            $scope.forbidden = true;
            App.hideMask();
            if(data.code==1000){
                $rootScope.layerMethod.layerAlert('ih nfo','验证码已发送',function () {
                    console.log('success')
                })
                var timer = $interval(function () {
                    $scope.message = '重新发送（' + t + 's）';
                    t--;
                    if (t == 0) {
                        t = 10;
                        $scope.forbidden = false;
                        $scope.message = '获取验证码';
                        $interval.cancel(timer);
                    }
                }, 1000);
            }else{
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $scope.forbidden = false;
                });
                $scope.forbidden = false;
            }
        },function (data) {
            App.hideMask();
            $scope.errorInfo=data.message;
            $scope.status =true;
        });
    };
    $scope.randomString=function(len){
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
    // 注册
    $scope.submitForm=function (form) {
        if($rootScope.checkMethod.isEmpty($scope.form.account)){
            $scope.errorInfo='请输入手机号码！';
            $scope.status =true;
            return false
        }
        if(!$rootScope.checkMethod.isMobile($scope.form.account)){
            $scope.errorInfo='不合法手机号！';
            $scope.status =true;
            return false
        }
        if($rootScope.checkMethod.isEmpty($scope.form.password)){
            $scope.errorInfo='请输入密码！';
            $scope.status =true;
            return false
        };
        if(!$rootScope.checkMethod.enoughLength($scope.form.password,6)){
            $scope.errorInfo='密码不得少于6位数！';
            $scope.status =true;
            return false
        }
        if(!$scope.form.checkPassword){
            $scope.errorInfo='请输入确认密码！';
            $scope.status =true;
            return false
        };
        if(!$rootScope.checkMethod.isEqual($scope.form.password,$scope.form.checkPassword)){
            $scope.errorInfo='两次输入密码不相同！';
            $scope.status =true;
            return false
        }
        if($rootScope.checkMethod.isEmpty($scope.form.code)){
            $scope.errorInfo='请输入验证码！';
            $scope.status =true;
            return false
        }
        App.showMask();
        var param = {
            "phone": $scope.form.account,
            "pwd": $scope.form.password,
            "code": $scope.form.code,
        };
        $rootScope.request.getlist(baseUrl + 'user/register','POST', param).then(function (data) {
            $scope.forbidden = true;
            App.hideMask();
            if(data.code==1000){
                $rootScope.layerMethod.layerAlert('info','注册成功',function () {
                    $rootScope.$state.go('^.login')
                });
            }else{
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $scope.forbidden = false;
                });
                $scope.forbidden = false;
            }
        },function (data) {
            App.hideMask();
            $scope.errorInfo=data.message;
            $scope.status =true;
        });
    };
}]);
/* -------------------------------
 7 找回密码
 ------------------------------- */
adminApp.controller('findpwd',['$scope','$rootScope','$state','$http',function($scope, $rootScope, $state,$http) {
    $scope.form ={};
    $scope.status= false;
    $scope.errorInfo='';
    $scope.message = '获取验证码(60s)';
    $scope.forbidden = false;
    $('.login-content input').change(function () {
        $scope.status= false;
    });
    $scope.getCode=function(){
        if($rootScope.checkMethod.isEmpty($scope.form.account)){
            $scope.errorInfo='请输入手机号码！';
            $scope.status =true;
            return false
        };
        var time =$rootScope.Format.dateTime("yyyy-MM-dd hh:mm:ss"),nonce_str=$scope.randomString(6);
        var hm5string="nonce_str="+nonce_str+"&phone="+$scope.form.account+"&time="+time+"&type=2&key=seEhyHEF";
        console.log(hm5string);
        var sign=hex_md5(hm5string).toUpperCase();
        var t = 59, param = {phone: $scope.form.account, type: 2,time:time,nonce_str:nonce_str,sign:sign};
        $rootScope.request.getlist(baseUrl + 'user/sendCode','POST', param).then(function (data) {
            $scope.forbidden = true;
            App.hideMask();
            if(data.code==1000){
                $rootScope.layerMethod.layerAlert('ih nfo','验证码已发送',function () {
                    console.log('success')
                })
                var timer = $interval(function () {
                    $scope.message = '重新发送（' + t + 's）';
                    t--;
                    if (t == 0) {
                        t = 10;
                        $scope.forbidden = false;
                        $scope.message = '获取验证码';
                        $interval.cancel(timer);
                    }
                }, 1000);
            }else{
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $scope.forbidden = false;
                });
                $scope.forbidden = false;
            }
        },function (data) {
            App.hideMask();
            $scope.errorInfo=data.message;
            $scope.status =true;
        });
    };
    $scope.randomString=function(len){
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
    // 注册
    $scope.submitForm=function (form) {
        if($rootScope.checkMethod.isEmpty($scope.form.account)){
            $scope.errorInfo='请输入手机号码！';
            $scope.status =true;
            return false
        }
        if(!$rootScope.checkMethod.isMobile($scope.form.account)){
            $scope.errorInfo='不合法手机号！';
            $scope.status =true;
            return false
        }
        if($rootScope.checkMethod.isEmpty($scope.form.password)){
            $scope.errorInfo='请输入密码！';
            $scope.status =true;
            return false
        };
        if(!$rootScope.checkMethod.enoughLength($scope.form.password,6)){
            $scope.errorInfo='密码不得少于6位数！';
            $scope.status =true;
            return false
        }
        if(!$scope.form.checkPassword){
            $scope.errorInfo='请输入确认密码！';
            $scope.status =true;
            return false
        };
        if(!$rootScope.checkMethod.isEqual($scope.form.password,$scope.form.checkPassword)){
            $scope.errorInfo='两次输入密码不相同！';
            $scope.status =true;
            return false
        }
        if($rootScope.checkMethod.isEmpty($scope.form.code)){
            $scope.errorInfo='请输入验证码！';
            $scope.status =true;
            return false
        }
        App.showMask();
        var param = {
            "phone": $scope.form.account,
            "pwd": $scope.form.password,
            "code": $scope.form.code,
        };
        $rootScope.request.getlist(baseUrl + 'user/forgetPassword','POST', param).then(function (data) {
            $scope.forbidden = true;
            App.hideMask();
            if(data.code==1000){
                $rootScope.layerMethod.layerAlert('info','密码修改成功',function () {
                    $rootScope.$state.go('^.login')
                });
            }else{
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $scope.forbidden = false;
                });
                $scope.forbidden = false;
            }
        },function (data) {
            App.hideMask();
            $scope.errorInfo=data.message;
            $scope.status =true;
        });
    };
}]);

/* -------------------------------
   6.1 首页
------------------------------- */
adminApp.controller('mainPageController', ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.getInfo();
    };
    //获取信息
    $scope.getInfo =function () {
        $rootScope.request.getlist(baseUrl+'storeInfo/dashboard','POST').then(function (data) {
            if (data.code == 1000) {
                $scope.info=data.data;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.init();
    // console.log(type);
}]);

/* -------------------------------
 8.1 商品分类列表
 ------------------------------- */
adminApp.controller('goodsClassifyList',  ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    //设置分页的参数
    $scope.option = {
        curr: 1, //当前页数
        all: 8, //总页数
        count: 5, //最多显示的页数，默认为10
        //点击页数的回调函数，参数page为点击的页数
        click: function (page) {
            console.log(page);
            //这里可以写跳转到某个页面等...
        }
    };
    $scope.showModal=function(type){
        $('#modal-classify').modal({'backdrop':'static','keybord':false})
    }
    $scope.deleteClassify=function(type){
        $rootScope.layerMethod.layerConfirm('确定要要删除该分类？',function () {
            console.log('确认删除');
        },function () {
            console.log('取消删除')
        },'忍痛删除','再考虑一下')
    }
    $scope.goDetails=function(){
        $rootScope.$state.go('app.goods.goodsList')
    }
    $scope.goAdd=function(){
        $rootScope.$state.go('app.goods.addGoods')
    }
}]);
/* -------------------------------
 8.2 商品列表
 ------------------------------- */
adminApp.controller('goodsList', ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state,$stateParams) {
    //初始化
    $scope.init=function(){
        $scope.pageInfo={
            'nowPage':1,
            'pageSize':10,
            'pages':1,
            'totalNum':1
        };
        $stateParams.nowpage?$scope.pageInfo.nowPage=$stateParams.nowpage:$scope.pageInfo.nowPage=1;
        $scope.searchName=$stateParams.goodsname;
        $scope.searchKeyword=$stateParams.keyword;
        $scope.searchStatus=$stateParams.status;
        $scope.sort = 'id'
        $scope.order = 2,
            $scope.shopInfo();
        $scope.setPageNation();
    };
    //分页信息
    $scope.setPageNation =function () {
        //设置分页的参数
        $scope.option = {
            curr: $scope.pageInfo.nowPage, //当前页数
            all: $scope.pageInfo.pages, //总页数
            count: 5, //最多显示的页数，默认为10
            click: function (page) {
                $scope.pageInfo.nowPage = page;
                $scope.getInfo();
            }
        };
    };
    // 重置
    $scope.doSort = function (type) {
        $scope.sort = type
        $scope.order == 1 ? $scope.order = 2 : $scope.order = 1
        $scope.getInfo()
    }
    $scope.doReset = function () {
        $scope.nowPage = 1
        $scope.sort = 'id'
        $scope.order = 1
        $scope.searchName= ''
        $scope.searchKeyword = ''
        $scope.searchStatus = ''
        $scope.getInfo();
    }
    //获取店铺信息
    $scope.shopInfo =function () {
        $rootScope.request.getlist(baseUrl+'storeInfo/applyState','POST').then(function (data) {
            if (data.code == 1000) {
                $scope.storeid = data.data.storeinfo[0].id;
                $scope.getInfo();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    // 获取商品列表
    $scope.getInfo=function(){
        var param={
            'sort': $scope.sort,
            'order': $scope.order,
            'storeid':$scope.storeid,
            'nowPage':$scope.pageInfo.nowPage,
            'pageSize':$scope.pageInfo.pageSize,
            'name':$scope.searchName,
            'keyword':$scope.searchKeyword,
            'status':$scope.searchStatus
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsManager/queryGoodsInfo','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.list=data.data.goodsInfo;
                $scope.pageInfo =data.data.pageInfo;
                $scope.pageInfo={
                    'nowPage':data.data.pageInfo.nowPage,
                    'pageSize':data.data.pageInfo.pageSize,
                    'pages':data.data.pageInfo.pages,
                    'totalNum':data.data.pageInfo.totalNum
                };
                $scope.setPageNation();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //检索
    $scope.doSearch=function () {
        $scope.pageInfo.nowPage=1;
        $scope.pageInfo.pages=1;
        $scope.getInfo();
    };
    //模态框
    $scope.showModal=function(type){
        $('#modal-classify').modal({'backdrop':'static','keybord':false})
    };
    //删除按钮
    $scope.delete=function(goodsId){
        $rootScope.layerMethod.layerConfirm('确定要删除该商品？',function () {
            console.log('确认删除');
            $scope.pageInfo.nowPage=1;
            $scope.deleteGoods(goodsId);
        },function () {
            console.log('取消删除')
        },'忍痛删除','再考虑一下')
    };
    //上架按钮
    $scope.doUp=function(goodsId){
        $rootScope.layerMethod.layerConfirm('确定要上架该商品？',function () {
            $scope.upGoods(goodsId);
        },function () {
        },'确定','取消')
    };
    //下架按钮
    $scope.doDown=function(goodsId){
        $rootScope.layerMethod.layerConfirm('确定要下架商品？',function () {
            console.log('确认删除');
            $scope.downGoods(goodsId);
        },function () {
            console.log('取消删除')
        },'确定','取消')
    };
    //删除请求
    $scope.deleteGoods=function(goodsId){
        App.showMask();
        var param={
            'id': goodsId
        };
        $rootScope.request.getlist(baseUrl + 'goodsManager/deleteGoodsById','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','删除成功！',function () {
                    $scope.getInfo();
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //上架请求
    $scope.upGoods=function(goodsId){
        App.showMask();
        var param={
            'ids': goodsId
        };
        $rootScope.request.getlist(baseUrl + 'goodsManager/upGoodsInfo','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','上架成功！',function () {
                    $scope.getInfo();
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //下架请求
    $scope.downGoods=function(goodsId){
        App.showMask();
        var param={
            'ids': goodsId
        };
        $rootScope.request.getlist(baseUrl + 'goodsManager/withdrawGoodsInfo','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','下架成功！',function () {
                    $scope.getInfo();
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //去添加商品
    $scope.goDetails=function(){
        $rootScope.$state.go('app.goods.addGoods')
    };
    //去编辑商品
    $scope.doEdit=function(goodsId){
        $rootScope.$state.go('^.editGoods',({'goodsId':goodsId,
            'goodsname':$scope.searchName,
            'keyword':$scope.searchKeyword,
            'status':$scope.searchStatus,
            'nowpage':$scope.pageInfo.nowPage,
        }))
    };
    //去编辑规格
    $scope.editSpecification=function(goodsId,catid){
        $rootScope.$state.go('^.editEpecification',({
            'goodsId':goodsId,
            'catid':catid,
            'goodsname':$scope.searchName,
            'keyword':$scope.searchKeyword,
            'status':$scope.searchStatus,
            'nowpage':$scope.pageInfo.nowPage,
        }))
    };
    $scope.doFreeEdit=function(goodsId,catid){
        $rootScope.$state.go('^.editFree',({
            'goodsId':goodsId,
            'catid':catid,
            'goodsname':$scope.searchName,
            'keyword':$scope.searchKeyword,
            'status':$scope.searchStatus,
            'nowpage':$scope.pageInfo.nowPage,
        }))
    };
    $scope.init();
    //Enter 检索
    $scope.keyboardSearch=function($event){
        if($event.keyCode==13){
            $scope.doSearch();
        }
    }
}]);
/* -------------------------------
 8.3 添加商品
 ------------------------------- */
adminApp.controller('addGoods', ['$scope','$rootScope','$state', '$compile',function($scope, $rootScope, $state,$compile) {
    $scope.init=function(){
        $scope.hasFirst=false;
        $scope.hasSecond=false;
        $scope.formData={};
        $scope.formData.onecatid='';
        $scope.formData.twocatid='';
        $scope.formData.catid='';
        $scope.formData.specialid='';
        $scope.formData.imgurl='';
        $scope.formData.photos=[];
        $scope.formData.rebatetype=2;
        $scope.formData.storagetype=1;
        $scope.formData.iscoupon=1;
        $scope.getThemeList();
        $scope.getFirstClassify();
        $scope.getInfo();
    };
    $scope.getInfo =function () {
        $rootScope.request.getlist(baseUrl+'storeInfo/applyState','POST').then(function (data) {
            if (data.code == 1000) {
                $scope.storeid=data.data.storeinfo[0].id;
                // $scope.getWarehouseInfo();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    //获取仓库
    $scope.getWarehouseInfo =function () {
        var param={
            'storeid':$scope.storeid
        };
        $rootScope.request.getlist(baseUrl+'goodsManager/selectWarehouseByStoreid','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.warehouseList=data.data.list;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    //获取专题列表
    $scope.getThemeList=function(){
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsManager/selectAllSpecial','POST').then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.themeList =data.data.list;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })

    };
    //获取一级列表
    $scope.getFirstClassify=function () {
        var param={
            'type':1
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsCategory/queryOneLevelCategory','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.firstList =data.data.oneLevelCategory;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //获取二级分类
    $scope.getScondClassify=function(){
        var param={
            'pid': $scope.formData.onecatid
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsCategory/queryCategoryByPid','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.secondtList =data.data.categoryByPid;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //获取三级分类
    $scope.getThirdClassify=function(){
        var param={
            'pid': $scope.formData.twocatid
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsCategory/queryCategoryByPid','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.thirdList =data.data.categoryByPid;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    $scope.selectScondClassify=function(){
        $scope.hasFirst=true;
        $scope.hasSecond=false;
        $scope.getScondClassify();
    };
    $scope.selectThirdClassify=function(){
        if(!$scope.formData.twocatid){
            return;
        }
        $scope.hasSecond=true;
        $scope.getThirdClassify();
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(fileId =='uploadMult') {
            $scope.formData.photos = $scope.getPhotos();
            if($scope.formData.photos.length ==5){
                $rootScope.layerMethod.layerAlert('info','最多上传5张图片',function () {});
                return;
            }
        }
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.formData.imgurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadMult'){
                    var imgHtml='';
                    imgHtml+='<li>';
                    imgHtml+='<img src="./assets/img/delete.png" class="delete-btn" alt="" ng-click="deleteImg($event,1)">';
                    imgHtml+='<img ng-src="'+data.data.imgsUrls+'" alt="photos" style="border:1px solid #e5e5e5">';
                    imgHtml+='</li>';
                    var $html = $compile(imgHtml)($scope); //ng-click方法动态绑定
                    $('#'+fileId).val("");
                    $('#multBox').append($html);
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.formData.imgurl='';
        }else {
            $(i.target).parent().remove();
        }
    };
    $scope.getPhotos=function () {
        var photos=[];
        var $imgs = $('#multBox').find('[alt="photos"]');
        angular.forEach($imgs, function(value, key) {
            photos.push($imgs[key].src)
        });
        return  photos;
    };
    $scope.selectThis=function(i){
        $scope.formData.warehouse=i;
    }
    //富文本编辑器
    window.editor = KindEditor.create('textarea[name="goodsdetail"]', {
        allowFileManager: true,
        resizeMode: 0,
        width: 720,
        cssPath: '/plshmanger/jslib/kindeditor/plugins/code/prettify.css',
        uploadJson: '/plshmanger/jslib/kindeditor/jsp/upload_json.jsp',
        fileManagerJson: '/plshmanger/jslib/kindeditor/jsp/file_manager_json.jsp'
    });
    $scope.init();
    $scope.doSubmit=function(form){
        $scope.formData.photos = $scope.getPhotos();
        $scope.formData.operateType=1;
        $scope.formData.imgname='goodsImg';
        $scope.formData.type=1;
        $scope.formData.detail=window.editor.html();
        console.log( $scope.formData)
        // $scope.formData.operateType=1;
        // $scope.formData.name='name';
        // $scope.formData.keyword='keyword';
        // $scope.formData.onecatid=1;
        // $scope.formData.twocatid=1;
        // $scope.formData.catid=1;
        // $scope.formData.specialid=1;
        // $scope.formData.sprice=11;
        // $scope.formData.svipprice=111;
        // $scope.formData.introduce='introduce';
        // $scope.formData.sort=1;
        // $scope.formData.rebatetype=1;
        // $scope.formData.rebate=0;
        // $scope.formData.viprebate=0;
        // $scope.formData.surplusnum=1111;
        // $scope.formData.sellnum=111;
        // $scope.formData.weight=1111;
        // $scope.formData.serve='serve';
        $scope.formData.extenratio= 0;
        if(!$scope.formData.imgurl){
            $rootScope.layerMethod.layerAlert('info','请上传图片缩略图',function () {});
            return;
        }
        if($scope.formData.photos.length == 0){
            $rootScope.layerMethod.layerAlert('info','请上传商品图片',function () {});
            return;
        }else {
            $scope.formData.photos=$scope.formData.photos.join(',');
            console.log($scope.formData.photos);
        }
        if(!$scope.formData.detail){
            $rootScope.layerMethod.layerAlert('info','请输入商品详情',function () {});
            return;
        }
        if(form.$valid){
            var param1={
                'operateType':1,
                'name':'',
                'onecatid':'',
                'twocatid':'',
                'catid':'',
                'specialid':'',
                'sprice':'',
                'svipprice':'',
                'imgurl':'',
                'imgname':'goodsImg',
                'introduce':'',
                'surplusnum':'',
                'sellnum':'',
                'detail':'',
                'keyword':'',
                'photos':'',
                'weight':'',
                'type':1,
                'iscoupon':'',
                'serve':'',
                'rebatetype':'',
                'rebate':'',
                'viprebate':'',
                'sort':'',
            };
            $rootScope.request.getlist(baseUrl + 'goodsManager/motifyGoodsInfo','POST',$scope.formData).then(function (data) {
                App.hideMask();
                if (data.code == 1000) {
                    $rootScope.layerMethod.layerAlert('info','恭喜你添加成功',function () {
                        $state.go('app.goods.goodsList')
                    });
                }else if(data.code == 1009){
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {
                        $state.go('account.login')
                    });
                }else {
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                }
            },function (data) {
                App.hideMask();
            })
        }else{
            $rootScope.layerMethod.layerAlert('info','请完善表单信息',function () {});
        }
    };
}]);
/* -------------------------------
 8.4 编辑商品
 ------------------------------- */
adminApp.controller('editGoods', ['$scope','$rootScope','$state', '$compile','$stateParams',function($scope, $rootScope, $state,$compile,$stateParams) {
    var goodsname,status,keyword,nowpage;
    $scope.init=function(){
        goodsname=$stateParams.goodsname;
        status=$stateParams.status;
        keyword=$stateParams.keyword;
        nowpage=$stateParams.nowpage;
        $scope.hasFirst=true;
        $scope.hasSecond=true;
        $scope.formData={};
        $scope.formData.id=$stateParams.goodsId;
        $scope.formData.photos=[];
        window.editor = KindEditor.create('textarea[name="goodsdetail"]', {
            allowFileManager: true,
            resizeMode: 0,
            width: 720,
            cssPath: '/plshmanger/jslib/kindeditor/plugins/code/prettify.css',
            uploadJson: '/plshmanger/jslib/kindeditor/jsp/upload_json.jsp',
            fileManagerJson: '/plshmanger/jslib/kindeditor/jsp/file_manager_json.jsp',
            afterCreate: function() {
                $scope.getInfo();
                $scope.getGoodsInfoById();
                $scope.getThemeList();
                $scope.getFirstClassify();
            }
        });
    };
    $scope.getInfo =function () {
        $rootScope.request.getlist(baseUrl+'storeInfo/applyState','POST').then(function (data) {
            if (data.code == 1000) {
                $scope.storeid=data.data.storeinfo[0].id;
                // $scope.getWarehouseInfo();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    //获取商品信息
    $scope.getGoodsInfoById=function () {
        App.showMask();
        var param={
            'id': $scope.formData.id
        };
        $rootScope.request.getlist(baseUrl + 'goodsManager/getGoodsInfoById','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.formData=data.data.goodsInfo;
                $scope.formData.photos=$scope.formData.photos.split(",");
                window.editor.html($scope.formData.detail);
                $scope.getScondClassify();
                $scope.getThirdClassify();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    $scope.getWarehouseInfo =function () {
        var param={
            'storeid':$scope.storeid
        };
        $rootScope.request.getlist(baseUrl+'goodsManager/selectWarehouseByStoreid','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.warehouseList=data.data.list;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    //获取专题列表
    $scope.getThemeList=function(){
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsManager/selectAllSpecial','POST').then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.themeList =data.data.list;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })

    };
    //获取一级列表
    $scope.getFirstClassify=function () {
        var param={
            'type':1
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsCategory/queryOneLevelCategory','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.firstList =data.data.oneLevelCategory;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //获取二级分类
    $scope.getScondClassify=function(){
        var param={
            'pid': $scope.formData.onecatid
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsCategory/queryCategoryByPid','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.secondtList =data.data.categoryByPid;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //获取三级分类
    $scope.getThirdClassify=function(){
        var param={
            'pid': $scope.formData.twocatid
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsCategory/queryCategoryByPid','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.thirdList =data.data.categoryByPid;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    $scope.selectScondClassify=function(){
        $scope.hasFirst=true;
        $scope.hasSecond=false;
        $scope.getScondClassify();
    };
    $scope.selectThirdClassify=function(){
        $scope.hasSecond=true;
        $scope.getThirdClassify();
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(fileId =='uploadMult') {
            var photos = $scope.getPhotos();
            if(photos.length ==5){
                $rootScope.layerMethod.layerAlert('info','最多上传5张图片',function () {});
                return;
            }
        }
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.formData.imgurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadMult'){
                    var imgHtml='';
                    imgHtml+='<li>';
                    imgHtml+='<img src="./assets/img/delete.png" class="delete-btn" alt="" ng-click="deleteImg($event,1)">';
                    imgHtml+='<img ng-src="'+data.data.imgsUrls+'" alt="photos" style="border:1px solid #e5e5e5">';
                    imgHtml+='</li>';
                    var $html = $compile(imgHtml)($scope); //ng-click方法动态绑定
                    $('#'+fileId).val("");
                    $('#multBox').append($html);
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.formData.imgurl='';
        }else {
            $(i.target).parent().remove();
        }
    };
    $scope.getPhotos=function () {
        var photos=[];
        var $imgs = $('#multBox').find('[alt="photos"]');
        angular.forEach($imgs, function(value, key) {
            photos.push($imgs[key].src)
        });
        return  photos;
    };
    $scope.selectThis=function(i){
        $scope.formData.warehouse=i;
    }
    $scope.init();
    $scope.doSubmit=function(form){
        var subPhotos = $scope.getPhotos();
        $scope.formData.operateType=2;
        $scope.formData.imgname='goodsImg';
        $scope.formData.type=1;
        $scope.formData.detail=window.editor.html();
        if(!$scope.formData.imgurl){
            $rootScope.layerMethod.layerAlert('info','请上传图片缩略图',function () {});
            return;
        }
        if(subPhotos.length == 0){
            $rootScope.layerMethod.layerAlert('info','请上传商品图片',function () {});
            return;
        }
        if(!$scope.formData.detail){
            $rootScope.layerMethod.layerAlert('info','请输入商品详情',function () {});
            return;
        }
        if(form.$valid){
            var param={
                'id':$scope.formData.id,
                'operateType':2,
                'name':$scope.formData.name,
                'onecatid':$scope.formData.onecatid,
                'twocatid':$scope.formData.twocatid,
                'catid':$scope.formData.catid,
                'specialid':$scope.formData.specialid,
                'sprice':$scope.formData.sprice,
                'svipprice':$scope.formData.svipprice,
                'imgurl': $scope.formData.imgurl,
                'imgname':'goodsImg',
                'introduce':$scope.formData.introduce,
                'surplusnum':$scope.formData.surplusnum,
                'sellnum':$scope.formData.sellnum,
                'detail':$scope.formData.detail,
                'keyword':$scope.formData.keyword,
                'photos':subPhotos.join(','),
                'weight':$scope.formData.weight,
                'type':1,
                'iscoupon':$scope.formData.iscoupon,
                'serve':$scope.formData.serve,
                'rebatetype':$scope.formData.rebatetype,
                'rebate':$scope.formData.rebate,
                'viprebate':$scope.formData.viprebate,
                'sort':$scope.formData.sort,
                'extenratio':$scope.formData.extenratio,
                'warehouse':$scope.formData.warehouse,
                'specginfo': $scope.formData.specginfo,
                'shortername':$scope.formData.shortername,
                'code': $scope.formData.code,
                'freshtime':  $scope.formData.freshtime,
                'storagetype':  $scope.formData.storagetype
            };
            $rootScope.request.getlist(baseUrl + 'goodsManager/motifyGoodsInfo','POST',param).then(function (data) {
                App.hideMask();
                if (data.code == 1000) {
                    $rootScope.layerMethod.layerAlert('info','修改成功!',function () {
                        $rootScope.$state.go('^.goodsList',({
                            'goodsname':goodsname,
                            'keyword':keyword,
                            'status':status,
                            'nowpage':nowpage,
                        }));
                    });
                }else if(data.code == 1009){
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {
                        $state.go('account.login')
                    });
                }else {
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                }
            },function (data) {
                App.hideMask();
            });
        }else{
            $rootScope.layerMethod.layerAlert('info','请完善表单信息',function () {});
        }
    };
    $scope.goBack=function(){
        $rootScope.$state.go('^.goodsList',({
            'goodsname':goodsname,
            'keyword':keyword,
            'status':status,
            'nowpage':nowpage,
        }))
    };
}]);
/* -------------------------------
 8.5 编辑商品规格
 ------------------------------- */
adminApp.controller('editEpecification', ['$scope','$rootScope','$state', '$compile','$stateParams',function($scope, $rootScope, $state,$compile,$stateParams) {
    var goodsname,status,keyword,nowpage;
    $scope.init=function(){
        goodsname=$stateParams.goodsname;
        status=$stateParams.status;
        keyword=$stateParams.keyword;
        nowpage=$stateParams.nowpage;
        $scope.id=$stateParams.goodsId;
        $scope.catid=$stateParams.catid;
        $scope.modal={};
        $scope.getSpec();
        $scope.getGoodsInfoById();
        $scope.getGoodsSpecList();
        $scope.selectCount=[];
        $scope.modal.specids=[];
        $scope.modal.specname=[];
        $scope.modal.edit={};
    };
    //获取商品信息
    $scope.getGoodsInfoById=function () {
        App.showMask();
        var param={
            'id': $scope.id
        };
        $rootScope.request.getlist(baseUrl + 'goodsManager/getGoodsInfoById','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.goodsInfo=data.data.goodsInfo;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    }
    //获取规格分类
    $scope.getSpec=function(){
        var param={
            'catid':$scope.catid
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'spec/getSpec','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.specInfo=data.data.specInfo;
                angular.forEach($scope.specInfo, function(value, i) {
                    angular.forEach(value.specValList, function(value, t) {
                        value.isChecked=false;
                    });
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //获取商品规格信息
    $scope.getGoodsSpecList=function(){
        var param={
            'gid':$scope.id
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'spec/getSpecGoodsList','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.specGoods=data.data.specGoods;
                // angular.forEach($scope.specGoods, function(value, i) {
                //     value.svnames =value.svnames.split(',')
                // });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //添加商品规格
    $scope.addSpc=function(specid,name){
        //prompt层
        layer.prompt({ title: '向【' + name + '】添加新规格', formType: 0 }, function(newSpecVal, index) {
            var param = { "specid": specid, "specval": newSpecVal };
            App.showMask();
            $rootScope.request.getlist(baseUrl + 'spec/addSpecVal','POST',param).then(function (data) {
                App.hideMask();
                if (data.code == 1000) {
                    $rootScope.layerMethod.layerAlert('info','添加成功',function () {
                        $scope.getSpec()
                    });
                    layer.close(index)
                }else if(data.code == 1009){
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {
                        $state.go('account.login')
                    });
                }else {
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                }
            },function (data) {
                App.hideMask();
            })
            return false
        });
    };
    //删除规格
    $scope.deleteSpc =function (id) {
        var param={
            'ids':id
        }
        App.showMask();
        $rootScope.layerMethod.layerConfirm('确定要删除该商品？',function () {
            $rootScope.request.getlist(baseUrl + 'spec/deleteSpecVal','POST',param).then(function (data) {
                App.hideMask();
                if (data.code == 1000) {
                    $rootScope.layerMethod.layerAlert('info','添加成功',function () {
                        $scope.getSpec()
                    });
                }else if(data.code == 1009){
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {
                        $state.go('account.login')
                    });
                }else {
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                }
            },function (data) {
                App.hideMask();
            })
        },function () {
            App.hideMask();
            console.log('取消删除')
        },'确定','取消')

    };
    //删除商品规格
    $scope.deleteOne =function(id,$event){
        if(id){
            var param={
                'ids':id
            }
            App.showMask();
            $rootScope.layerMethod.layerConfirm('确定要删除该商品？',function () {
                $rootScope.request.getlist(baseUrl + 'spec/deleteSpecGoods','POST',param).then(function (data) {
                    App.hideMask();
                    if (data.code == 1000) {
                        $rootScope.layerMethod.layerAlert('info','删除成功',function () {
                            $scope.getGoodsSpecList();
                        });
                    }else if(data.code == 1009){
                        $rootScope.layerMethod.layerAlert('info',data.message,function () {
                            $state.go('account.login')
                        });
                    }else {
                        $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                    }
                },function (data) {
                    App.hideMask();
                })
            },function () {
                App.hideMask();
                console.log('取消删除')
            },'确定','取消')
        }else{
            $($event.target).parent().parent().remove();
        }

    };
    $scope.init();
    //弃用
    // $scope.doSubmit=function(){
    //     if($scope.specGoods.length==0){
    //         $rootScope.layerMethod.layerAlert('info','请完善信息',function () {});
    //         return ;
    //     }
    //     App.showMask();
    //     var param={
    //         'specGoodsInfo':JSON.stringify($scope.specGoods)
    //     };
    //     $rootScope.request.getlist(baseUrl + 'spec/addMultiSpecGoods','POST',param).then(function (data) {
    //         App.hideMask();
    //         if (data.code == 1000) {
    //             $rootScope.layerMethod.layerAlert('info','添加成功',function () {
    //                 $('#modal-classify').modal('hide');
    //
    //             });
    //         }else if(data.code == 1009){
    //             $rootScope.layerMethod.layerAlert('info',data.message,function () {
    //                 $state.go('account.login')
    //             });
    //         }else {
    //             $rootScope.layerMethod.layerAlert('info',data.message,function () {});
    //         }
    //     },function (data) {
    //         App.hideMask();
    //     })
    // };
    //添加模态框
    //添加模态框
    $scope.addModal=function(){
        $('#modal-classify').modal({'backdrop':'static','keybord':false})
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                $scope.$apply(function () {
                    $scope.mulitimg=data.data.imgsUrls;
                    $scope.modal.mulitimg=data.data.imgsUrls;
                    $scope.edit.imgurl=data.data.imgsUrls;
                });
                $('#'+fileId).val('');
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doAdd=function(){
        $scope.modal.specids=[];
        $scope.modal.specname=[];
        angular.forEach($scope.selectCount, function(v, i) {
            $scope.modal.specids.push(v.id);
            $scope.modal.specname.push(v.specval);
        });
        if($scope.modal.specids.length==0){
            $rootScope.layerMethod.layerAlert('info','请选择分类',function () {});
            return ;
        }
        var specids=$scope.filerArry($scope.modal.specids).join(',');
        var specname=$scope.filerArry($scope.modal.specname).join(',');
        if(!$scope.modal.multPrice){
            $rootScope.layerMethod.layerAlert('info','请输入价格',function () {});
            return ;
        }
        if(!$scope.modal.multVipPrice){
            $rootScope.layerMethod.layerAlert('info','请会员价格',function () {});
            return ;
        }
        if(!$scope.modal.multCount){
            $rootScope.layerMethod.layerAlert('info','请输入库存',function () {});
            return ;
        }
        if(!$scope.modal.multSaleCount){
            $rootScope.layerMethod.layerAlert('info','请输入销售量',function () {});
            return ;
        }
        if(!$scope.modal.mulitimg){
            $rootScope.layerMethod.layerAlert('info','请选择规格图片',function () {});
            return ;
        }
        var param=[
            {
                'gid':$scope.id,
                'svids':specids,
                'svnames':specname,
                'sprice':$scope.modal.multPrice,
                'svipprice':$scope.modal.multVipPrice,
                'surplusnum':$scope.modal.multCount,
                'sellnum':$scope.modal.multSaleCount,
                'imgurl':$scope.modal.mulitimg
            }
        ];
        $scope.doSubmitSpc(param)
    };
    //保存规格请求
    $scope.doSubmitSpc=function(i){
        var param={
            'specGoodsInfo':JSON.stringify(i)
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'spec/addMultiSpecGoods','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','操作成功',function () {
                    $scope.getGoodsSpecList();
                    $('#modal-classify').modal('hide');
                    $('#modal-edit').modal('hide');
                    $scope.init();
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })

    };
    //选择规格
    $scope.selectSpc=function (i,specid) {
        var param = {
            'specid':specid,
            'id':i.id,
            'specval':i.specval,
        };
        if($scope.selectCount.length==0){
            $scope.selectCount.push(param);
        }
        angular.forEach($scope.selectCount, function(v, i) {
            if(v.specid == specid){
                v.id=param.id,
                    v.specval=param.specval;
            }else {
                $scope.selectCount.push(param);
            }
        });
    };
    //编辑规格模态框
    $scope.doEdit=function (i) {
        $('#modal-edit').modal({'backdrop':'static','keybord':false});
        $scope.edit=i
    };
    //保存编辑
    $scope.saveEdit=function(){
        if(!$scope.edit.sprice){
            $rootScope.layerMethod.layerAlert('info','请输入价格',function () {});
            return ;
        }
        if(!$scope.edit.svipprice){
            $rootScope.layerMethod.layerAlert('info','请会员价格',function () {});
            return ;
        }
        if(!$scope.edit.surplusnum){
            $rootScope.layerMethod.layerAlert('info','请输入库存',function () {});
            return ;
        }
        var param=[
            {
                'gid':$scope.edit.gid,
                'id':$scope.edit.id,
                'svids':$scope.edit.svids,
                'svnames':$scope.edit.svnames,
                'sprice':$scope.edit.sprice,
                'svipprice':$scope.edit.svipprice,
                'surplusnum':$scope.edit.surplusnum,
                'sellnum':$scope.edit.sellnum,
                'imgurl':$scope.edit.imgurl
            }
        ];
        $scope.doSubmitSpc(param);
    };
    //添加和主规格相同的数据
    $scope.pushSameStatic=function(){
        $scope.modal.multPrice = $scope.goodsInfo.sprice;
        $scope.modal.multVipPrice = $scope.goodsInfo.svipprice;
        $scope.modal.multCount = $scope.goodsInfo.surplusnum;
        $scope.modal.multSaleCount = $scope.goodsInfo.sellnum;
        $scope.modal.mulitimg=$scope.goodsInfo.imgurl;
    };
    $('#modal-classify').on('hidden.bs.modal',function(){
        $scope.modal.multPrice = '';
        $scope.modal.multVipPrice = '';
        $scope.modal.multCount = '';
        $scope.modal.multSaleCount = '';
        $scope.modal.mulitimg='';
        $scope.modal.specids=[];
        $scope.modal.specname=[];
    });
    $scope.filerArry = function(arry){
        var res = [];
        var json = {};
        for(var i = 0; i < arry.length; i++){
            if(!json[arry[i]]){
                res.push(arry[i]);
                json[arry[i]] = 1;
            }
        }
        return res;
    };
    //返回上级
    $scope.goBack=function(){
        $rootScope.$state.go('^.goodsList',({
            'goodsname':goodsname,
            'keyword':keyword,
            'status':status,
            'nowpage':nowpage,
        }))
    };

}]);
/* -------------------------------
 /* -------------------------------
 8.5 编辑商品规格
 ------------------------------- */
adminApp.controller('editFree',  ['$scope','$rootScope','$state', '$compile','$stateParams',function($scope, $rootScope, $state,$compile,$stateParams) {
    var goodsname,status,keyword,nowpage;
    $scope.init=function(){
        goodsname=$stateParams.goodsname;
        status=$stateParams.status;
        keyword=$stateParams.keyword;
        nowpage=$stateParams.nowpage;
        $scope.id=$stateParams.goodsId;
        $scope.catid=$stateParams.catid;
        $scope.isedit=2;
        $scope.getGoodsInfoById();
        $scope.getGoodsSpecList();
    };
    //获取商品信息
    $scope.getGoodsInfoById=function () {
        App.showMask();
        var param={
            'id': $scope.id
        };
        $rootScope.request.getlist(baseUrl + 'goodsManager/getGoodsInfoById','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.goodsInfo=data.data.goodsInfo;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    }
    //获取商品规格信息
    $scope.getGoodsSpecList=function(){
        var param={
            'gid':$scope.id
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'spec/getSpecGoodsList','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.specGoods=data.data.specGoods;
                // angular.forEach($scope.specGoods, function(value, i) {
                //     value.svnames =value.svnames.split(',')
                // });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //添加商品规格
    $scope.doEdit=function(i,type){
        var desc;
        if(type==1){
            desc='商品入库'
        }
        if(type==2){
            desc='商品出库'
        }
        //prompt层
        layer.prompt({ title: desc, formType: 0 }, function(newSpecVal, index) {
            if(type==2){
                newSpecVal=-newSpecVal;
            }
            var param = { "specgid": i.id, "price": i.sprice,'vipprice':i.svipprice,'surplusnum':newSpecVal,'isedit':2 };
            $rootScope.request.getlist(baseUrl + 'goodsManager/updateInfoByUp','POST',param).then(function (data) {
                App.hideMask();
                if (data.code == 1000) {
                    $rootScope.layerMethod.layerAlert('info','修改成功',function () {
                        $scope.getGoodsSpecList()
                    });
                    layer.close(index)
                }else if(data.code == 1009){
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {
                        $state.go('account.login')
                    });
                }else {
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                }
            },function (data) {
                App.hideMask();
            })
            return false
        });
    };
    $scope.doEditPrice=function(i){
        $('#modal-edit').modal('show');
        $scope.spcid=i.id
        $scope.modalSprice=i.sprice;
        $scope.modalSvipprice=i.svipprice;
    };
    $scope.editRequest=function () {
        var param = { "specgid": $scope.spcid, "price": $scope.modalSprice,'vipprice':$scope.modalSvipprice,'surplusnum':0,'isedit':$scope.isedit };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsManager/updateInfoByUp','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','修改成功',function () {
                    $scope.getGoodsSpecList();
                    $scope.getGoodsInfoById();
                    $('#modal-edit').modal('hide');
                    $scope.isedit=2;
                    $scope.modalSprice='';
                    $scope.modalSvipprice='';
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    }
    $scope.init();
    //返回上级
    $scope.goBack=function(){
        $rootScope.$state.go('^.goodsList',({
            'goodsname':goodsname,
            'keyword':keyword,
            'status':status,
            'nowpage':nowpage,
        }))
    };

}]);
/* -------------------------------
 10.1 订单列表
 ------------------------------- */
adminApp.controller('orderList', ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.page={
            'nowPage':1,
            'pageSize':5,
            'pages':1,
            'totalNum':1
        };
        $scope.sort = 1;
        $scope.order = 2;
        $scope.dateSelect = []
        $scope.setPageNation();
        $scope.getInfo();
        $scope.getStrongholdTime()
        $scope.stateList =[
            {'id': "13",'status':"已取消"},
            {'id': "1",'status':"待付款"},
            {'id': "2",'status':"待配送"},
            {'id': "6", 'status':"配送中"},
            {'id': "16", 'status':"待自提"},
            {'id': "7", 'status':"待评价"},
            {'id': "15", 'status':"已完成"}
        ];
        $scope.selectPhone='';
        $scope.selectState='';
        $scope.selectNum='';
        $scope.remind='';
        $scope.strongholdtime = ''
    };
    $('#start_time').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#end_time').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.showWeekOneMore = function (week) {
        var moreweek
        switch (week) {
            case 1:
                return moreweek = '周一'
                break;
            case 2:
                return moreweek = '周二'
                break;
            case 3:
                return moreweek = '周三'
                break;
            case 4:
                return moreweek = '周四'
                break;
            case 5:
                return moreweek = '周五'
                break;
            case 6:
                return moreweek = '周六'
                break;
            case 7:
                return moreweek = '周日'
                break;
            case 8:
                return moreweek = '周一'
                break;
            case 9:
                return moreweek = '周二'
                break;
            case 10:
                return moreweek = '周三'
                break;
            default:
                return moreweek = 'error'
                break

        }
        return moreweek
    }
    $scope.getStrongholdTime = function () {
        var param = {strongholdid: $scope.strongholdid}
        App.showMask();
        $rootScope.request.getlist(baseUrl + '/storeInfo/findStrongholdtime','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                var stongholdtime = data.data
                var td = new Date()
                // var mounth = td.getMonth() + 1
                var week = td.getDay()
                for (var i = 1; i < 4 ; i++) {
                    var tweek = week + i
                    var mtime = $scope.addMouth(i) + '月' + ($scope.addDay(i)) + '日 ' + $scope.showWeekOneMore(tweek) + ' 上午' +stongholdtime.morningtime
                    var atime = $scope.addMouth(i) + '月' + ($scope.addDay(i)) + '日 ' + $scope.showWeekOneMore(tweek) + ' 下午' +stongholdtime.afternoontime
                    $scope.dateSelect.push(mtime)
                    $scope.dateSelect.push(atime)
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            console.log(data)
        })
    }
    $scope.addMouth = function(time) {
        var startDate =  Date.parse(new Date());
        startDate = startDate + 1000*60*60*24*time;
        startDate = new Date(startDate);
        var nextStartDate = startDate.getMonth()+1
        return nextStartDate;
    }
    $scope.addDay = function(time) {
        var startDate =  Date.parse(new Date());
        startDate = startDate + 1000*60*60*24*time;
        startDate = new Date(startDate);
        var nextStartDate = startDate.getDate();
        return nextStartDate;
    }
    $scope.doReset = function () {
        $scope.nowPage = 1
        $scope.selectPhone='';
        $scope.selectState='';
        $scope.selectNum='';
        $('#start_time').val('')
        $('#end_time').val('')
        $scope.getInfo();
    }
    $scope.doSort = function (type) {
        $scope.page.nowPage = 1;
        $scope.sort = type;
        ( $scope.order == 1 ) ? $scope.order = 2 : $scope.order = 1
        $scope.getInfo()
    };
    $scope.doSearch = function(){
        $scope.getInfo()
    };
    $scope.goPage=function(id){
        $rootScope.$state.go('app.order.orderDetail',({'id':id}))
    };
    $scope.setPageNation =function () {
        //设置分页的参数
        $scope.option = {
            curr: $scope.page.nowPage, //当前页数
            all: $scope.page.pages, //总页数
            count: $scope.page.pageSize, //最多显示的页数，默认为10
            click: function (page) {
                $scope.page.nowPage = page;
                $scope.getInfo();
            }
        };
    };
    $scope.getInfo=function(){
        var param={
            'page':$scope.page.nowPage,
            'rows':$scope.page.pageSize,
            'state':$scope.selectState,
            'phone':$scope.selectPhone,
            'number':$scope.selectNum,
            'starttime': $('#start_time').val(),
            'endtime': $('#end_time').val(),
            'sort': $scope.sort,
            'order': $scope.order,
            'type':1,
            'remind':$scope.remind,
            'timeinfo': $scope.strongholdtime
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'indent/indentList','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.list=data.data.indentList;
                $scope.page =data.data.pageInfo;
                $scope.page={
                    'nowPage':data.data.page.nowPage,
                    'pageSize':data.data.page.pageSize,
                    'pages':data.data.page.pages,
                    'totalNum':data.data.page.totalNum
                };
                $scope.setPageNation();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            console.log(data)
        })
    };
    $scope.sendGoods =function (i) {
        $scope.indentid = i.indentid;
        $scope.orderNumber = i.number;
        $('#modal-sendGoods').modal({'backdrop':'static','keybord':false});
        $scope.getDelivery();
    };
    // 执行发货
    $scope.saveSend=function(){
        // if(!$scope.deliverycode){
        //     $rootScope.layerMethod.layerAlert('info','请选择快递公司',function () {});
        //     return ;
        // }
        // if(!$scope.deliverynum){
        //     $rootScope.layerMethod.layerAlert('info','请输入快递单号',function () {});
        //     return ;
        // }
        var param ={
            'indentid':$scope.indentid,
            'type':1,
            'deliverycode':$scope.deliverycode,
            'deliveryname':$scope.deliveryname,
            'deliverynum': $scope.deliverynum
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'indent/deliverGoods','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','发货成功',function () {
                    $scope.getInfo();
                    $scope.indentid='';
                    $scope.deliverynum='';
                    $('#modal-sendGoods').modal('hide');
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //获取快递信息
    $scope.getDelivery = function() {
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'delivery/queryDelivery','POST').then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.deliveryList = data.data.deliveryList;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    $scope.selectDelivery=function(){
        if($scope.deliveryObj){
            $scope.deliveryname=$scope.deliveryObj.name;
            $scope.deliverycode=$scope.deliveryObj.code;
        }
    };
    $scope.init();
    // var elem = document.querySelector('#switchery');
    // var init = new Switchery(elem);
    // elem.onchange = function() {
    //     if(elem.checked){
    //         $scope.remind=1;
    //         $scope.getInfo();
    //     }else {
    //         $scope.remind='';
    //         $scope.getInfo();
    //     }
    // };
}]);
/* -------------------------------
 10.2 售后服务
 ------------------------------- */
adminApp.controller('afterSaleList', ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.salseState = ''
        $scope.orderNum = ''
        $scope.page={
            'nowPage':1,
            'pageSize':10,
            'pages':1,
            'totalNum':1
        };
        $scope.setPageNation();
        $scope.getInfo();
    };
    $scope.goPage=function(id){
        $rootScope.$state.go('app.order.refoundDetail',({'id':id}))
    };
    $scope.setPageNation =function () {
        //设置分页的参数
        $scope.option = {
            curr: $scope.page.nowPage, //当前页数
            all: $scope.page.pages, //总页数
            count: $scope.page.pageSize, //最多显示的页数，默认为10
            click: function (page) {
                $scope.page.nowPage = page;
                $scope.getInfo();
            }
        };
    }
    $scope.doSearch = function () {
        $scope.getInfo()
    }
    $scope.getInfo=function(){
        var param={
            'page':$scope.page.nowPage,
            'rows':$scope.page.pageSize,
            'state': $scope.salseState,
            'number': $scope.orderNum
        };
        $rootScope.request.getlist(baseUrl + 'indent/selectRefundList','POST', param).then(function (data) {
            if (data.code == 1000) {
                $scope.list=data.data.list;
                $scope.page =data.data.pageInfo;
                $scope.page={
                    'nowPage':data.data.pages.nowPage,
                    'pageSize':data.data.pages.pageSize,
                    'pages':data.data.pages.pages,
                    'totalNum':data.data.pages.totalNum
                };
                $scope.setPageNation();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            console.log(data)
        })
    };
    $scope.init();
}]);
/* -------------------------------
 10.3 退款订单详情
 ------------------------------- */
adminApp.controller('refoundDetail', ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state,$stateParams) {
    $scope.init=function(){
        $scope.getInfo();
        $scope.reason='';
        $scope.address='';
    };
    //获取商品信息
    $scope.getInfo=function () {
        App.showMask();
        var param={
            'refundid': $stateParams.id
        };
        $rootScope.request.getlist(baseUrl + 'indent/selectRefundInfo','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.IndentDetails=data.data.refundInfo;
                if($scope.IndentDetails.refundimg){
                    $scope.IndentDetails.refundimg=$scope.IndentDetails.refundimg.split(',');
                }
                if($scope.IndentDetails.deliveryimg){
                    $scope.IndentDetails.deliveryimg=$scope.IndentDetails.deliveryimg.split(',');
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    $scope.refuse=function(type){
        if(type==2){
            $scope.refundState=3;
            $rootScope.layerMethod.layerConfirm('确定要拒绝改申请？',function () {
                layer.prompt({ title: '拒绝理由', formType: 0 }, function(reason, index) {
                    $scope.address.id='',
                        $scope.reason=reason;
                    $scope.doRefuse();
                    layer.close(index);
                });
            },function () {
            },'确定','取消')
        }
        if(type==1){
            $scope.refundState=2;
            $rootScope.layerMethod.layerConfirm('确定要通过退款申请？',function () {
                $scope.address.id='',
                    $scope.doRefuse();
            },function () {
                console.log('取消')
            },'确定','取消')
        }
        if(type==3){
            $scope.refundState=2;
            $('#modal-refund').modal({'backgroud':'static','keybord':false});
            $scope.getRefundAdderssList();
        }
        if(type==4){
            $rootScope.layerMethod.layerConfirm('确定要退款？',function () {
                $scope.address.id='',
                    $scope.doRefuseMoney();
            },function () {
                console.log('取消')
            },'确定','取消')
        }
    };
    $scope.doRefuse=function(){
        var param={
            'indentid': $scope.IndentDetails.indentid,
            'state':$scope.refundState,
            'remark':$scope.reason,
            'addressid':$scope.address.id
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'indent/handleRefund','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','操作成功',function () {
                    $scope.getInfo();
                    $('#modal-refund').modal('hide');
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    $scope.doRefuseMoney=function(){
        var param={
            'refundid': $scope.IndentDetails.id,
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'indent/returnMoney','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','操作成功',function () {
                    $scope.getInfo();
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    $scope.getRefundAdderssList =function(){
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'shoppingAdress/getAddressList','POST').then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.adressList=data.data.shoppingAddresses;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    $scope.doRefuseGoods=function(){
        if(!$scope.address){
            $rootScope.layerMethod.layerAlert('info','请选择收货地址',function(){});
            return;
        }
        $scope.doRefuse();
    };
    $scope.init();
}]);
/* -------------------------------
 10.3 订单详情
 ------------------------------- */
adminApp.controller('orderDetail', ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state,$stateParams) {
    $scope.init=function(){
        $scope.getInfo();
    }
    //获取商品信息
    $scope.getInfo=function () {
        App.showMask();
        var param={
            'indentid': $stateParams.id
        };
        $rootScope.request.getlist(baseUrl + 'indent/indentDetails','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.IndentDetails=data.data.IndentDetails;
                if (data.data.IndentDetails.paytime) {
                    $scope.IndentDetails.paytime = App.formatDate(data.data.IndentDetails.paytime)
                }
                if (data.data.IndentDetails.addtime) {
                    $scope.IndentDetails.addtime = App.formatDate(data.data.IndentDetails.addtime)
                }

                // if($scope.IndentDetails.deliverynum){
                //     $scope.getDeliverInfo();
                // }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    $scope.getDeliverInfo=function () {
        var param={
            'com':$scope.IndentDetails.deliverycode,
            'nu':$scope.IndentDetails.deliverynum,
        };
        $rootScope.request.getlist('/plshshop/indent/postageInfo','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.deliverInfo=JSON.parse(data.data.res);
                console.log($scope.deliverInfo.data);
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
        })
    };
    $scope.init();
}]);
//退货地址列表
adminApp.controller("refundAdressList", ['$scope','$rootScope','$state','$http', '$stateParams',function($scope,$rootScope, $http,$state,$stateParams) {
    $scope.init=function(){
        $scope.hasPro =false;
        $scope.hasCity=false;
        $scope.actionType=2;
        $scope.modal={};
        $scope.modal.proid =0;
        $scope.modal.cityid=0;
        $scope.modal.disid =0;
        $scope.modal.editid ='';
        $scope.getRefundAdderssList();
    };
    //获取退货地址列表
    $scope.getRefundAdderssList =function(){
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'shoppingAdress/getAddressList','POST').then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.adressList=data.data.shoppingAddresses;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    $scope.init();
    //获取省列表
    $scope.getProList = function() {
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getPro','POST').then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.proList = data.data.provinces;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //获取市列表
    $scope.getCityList = function(proid) {
        var param = { "proid": proid };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getCity','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.cityList = data.data.cities;
                $scope.hasPro =true;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //获取区列表
    $scope.getDisList = function(proId,cityId) {
        var param = {
            "proid": proId,
            "cityid": cityId
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getDis','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.disList = data.data.districts;
                $scope.hasCity =true;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    $scope.getProList();
    //编辑 && 添加
    $scope.doEdit=function(type,item){
        $scope.actionType = type;
        if($scope.actionType ==2){
            $scope.modal.id =''
        }
        if($scope.actionType ==1){
            $scope.modal=item;
            $scope.hasCity =true;
            $scope.hasPro =true;
            $scope.getCityList(item.proid);
            $scope.getDisList(item.proid,item.cityid);
        }
        $('#modalAdress').modal({ 'backdrop': 'static', 'keyboard': false });
    };
    //删除
    $scope.doDelete=function(item){
        layer.confirm('确定要删除该地址么？', {btn: ['是','否']}, function(index){
            App.showMask();
            $rootScope.request.getlist(baseUrl + 'shoppingAdress/deleteShoppingAdress','POST', {'id':item.id}).then(function (data) {
                App.hideMask();
                if (data.code == 1000) {
                    layer.alert('删除成功', {icon: 1, skin: 'layer-ext-moon'},function(i){
                        layer.close(i);
                        $('#modalAdress').modal('hide');
                        $scope.getRefundAdderssList();
                    });
                    layer.close(index);
                }else if(data.code == 1009){
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {
                        $state.go('account.login')
                    });
                }else {
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                }
            },function (data) {
                App.hideMask();
            });
        }, function(){
            console.log('no');
        });
    };
    //设置默认
    $scope.setDefult=function(item){
        layer.confirm('确定将该地址么设为默认地址？', {btn: ['是','否']}, function(index){
            App.showMask();
            $rootScope.request.getlist(baseUrl + 'shoppingAdress/setDefault','POST', {'id':item.id}).then(function (data) {
                App.hideMask();
                if (data.code == 1000) {
                    layer.alert('设置成功', {icon: 1, skin: 'layer-ext-moon'},function(i){
                        layer.close(i);
                        $('#modalAdress').modal('hide');
                        $scope.getRefundAdderssList();
                    });
                    layer.close(index);
                }else if(data.code == 1009){
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {
                        $state.go('account.login')
                    });
                }else {
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                }
            },function (data) {
                App.hideMask();
            });
        }, function(){
            console.log('no')
        });
    };
    $scope.doSave =function(){
        if(!$scope.modal.name){
            layer.alert('请填写联系人姓名', {icon: 2, skin: 'layer-ext-moon'});
            return false
        }
        if(!$scope.modal.phone){
            layer.alert('请填写联系人电话', {icon: 2, skin: 'layer-ext-moon'});
            return false
        }
        if(!$rootScope.checkMethod.isMobile($scope.modal.phone)){
            layer.alert('请输入合法手机号', {icon: 2, skin: 'layer-ext-moon'});
            return false
        }
        if(!$scope.modal.proid){
            layer.alert('请选择省份', {icon: 2, skin: 'layer-ext-moon'});
            return false
        }
        if(!$scope.modal.cityid){
            layer.alert('请选择所在城市', {icon: 2, skin: 'layer-ext-moon'});
            return false
        }
        if(!$scope.modal.disid){
            layer.alert('请选择所在街道', {icon: 2, skin: 'layer-ext-moon'});
            return false
        }
        if(!$scope.modal.detail){
            layer.alert('请填写详细地址', {icon: 2, skin: 'layer-ext-moon'});
            return false
        }
        angular.forEach($scope.proList, function(v, k) {
            if (v.id == $scope.modal.proid) {
                $scope.modal.proname =v.name;
            }
        });
        angular.forEach($scope.cityList, function(v, k) {
            if (v.id == $scope.modal.cityid) {
                $scope.modal.cityname =v.name;
            }
        });
        angular.forEach($scope.disList, function(v, k) {
            if (v.id == $scope.modal.disid) {
                $scope.modal.disname =v.name;
            }
        });
        var param={
            'id':$scope.modal.id,
            'name':$scope.modal.name,
            'phone':$scope.modal.phone,
            'proid':$scope.modal.proid,
            'proname':$scope.modal.proname,
            'cityid':$scope.modal.cityid,
            'cityname':$scope.modal.cityname,
            'disid':$scope.modal.disid,
            'disname':$scope.modal.disname,
            'detail':$scope.modal.detail,
            'type':$scope.actionType
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'shoppingAdress/updateAndAddAddress','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                layer.alert('编辑成功', {icon: 1, skin: 'layer-ext-moon'},function(i){
                    layer.close(i);
                    $('#modalAdress').modal('hide');
                    $scope.getRefundAdderssList();
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    $('#modalAdress').on('hidden.bs.modal',function(){
        $scope.modal={};
        $scope.modal.proid =0;
        $scope.modal.cityid=0;
        $scope.modal.disid =0;
        $scope.hasCity =false;
        $scope.hasPro =false;
    });
}]);
/* -------------------------------
 11.1 开店
 ------------------------------- */
adminApp.controller('openshop',  ['$scope','$rootScope','$state', '$compile',function($scope, $rootScope, $state,$compile) {
    $scope.init=function(){
        $scope.hasFirst=false;
        $scope.hasSecond=false;
        $scope.HasProvinceid=false;
        $scope.HasCityid=false;
        $scope.formData={};
        $scope.formData.provinceid=0;
        $scope.formData.cityid=0;
        $scope.formData.districtid=0;
        $scope.formData.papertype=1;
        $scope.getFirstClassify();
        $scope.getProList();
    };
    $('.input-daterange').datepicker({
        todayHighlight: true,
        language:'zh-CN',
        format: 'yyyy-mm-dd',
        autoclose: true
    });
    //获取一级列表
    $scope.getFirstClassify=function () {
        var param={
            'pid':-1,
            'type':1
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'storeInfo/getStoreCategory','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.firstList =data.data.list;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //获取二级分类
    $scope.getScondClassify=function(){
        var param={
            'pid': $scope.formData.topStoreClassId,
            'type':1
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'storeInfo/getStoreCategory','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.secondtList =data.data.list;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //获取三级分类
    $scope.selectScondClassify=function(){
        $scope.hasFirst=true;
        $scope.hasSecond=false;
        $scope.getScondClassify();
    };
    //获取省列表
    $scope.getProList = function() {
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getPro','POST').then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.proList = data.data.provinces;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //获取市列表
    $scope.getCityList = function(proid) {
        var param = { "proid": proid };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getCity','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.cityList = data.data.cities;
                $scope.HasProvinceid=true;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //获取区列表
    $scope.getDisList = function(proId,cityId) {
        var param = {
            "proid": proId,
            "cityid": cityId
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getDis','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.disList = data.data.districts;
                $scope.HasCityid=true;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadLogo'){
                    $scope.formData.logourl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadBuslicense'){
                    $scope.formData.buslicenseurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadLeagalcardface'){
                    $scope.formData.legalface=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadLeagalcardback'){
                    $scope.formData.legalback=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,name) {
        $(i.target).parent().remove();
        $scope.formData[name]='';
    };
    $scope.init();
    $scope.doSubmit=function(form){
        console.log($scope.formData);
        if(!$scope.formData.logourl){
            $rootScope.layerMethod.layerAlert('info','请上传店铺logo',function () {});
            return ;
        }
        if(!$scope.formData.buslicenseurl){
            $rootScope.layerMethod.layerAlert('info','请上传营业执照',function () {});
            return ;
        }
        if(!$('#startTime').val()){
            $rootScope.layerMethod.layerAlert('info','请选择执照有效期开始时间',function () {});
            return ;
        }
        if(!$('#endTime').val()){
            $rootScope.layerMethod.layerAlert('info','请选择执照有效期结束时间',function () {});
            return ;
        }
        if(!$scope.formData.legalface){
            $rootScope.layerMethod.layerAlert('info','请选身份证正面照片',function () {});
            return ;
        }
        if(!$scope.formData.legalback){
            $rootScope.layerMethod.layerAlert('info','请选身份证反面照片',function () {});
            return ;
        }
        if(form.$valid){
            $scope.formData.type=1;
            $scope.formData.buslicensestart=$('#startTime').val();
            $scope.formData.buslicenseend=$('#endTime').val();
            $rootScope.request.getlist(baseUrl + 'storeInfo/applyShop','POST',$scope.formData).then(function (data) {
                App.hideMask();
                if (data.code == 1000) {
                    $rootScope.layerMethod.layerAlert('info','提交成功请耐心等待审核',function () {
                        $state.go('app.shopinfo.shopInfo')
                    });
                }else if(data.code == 1009){
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {
                        $state.go('account.login')
                    });
                }else {
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                }
            },function (data) {
                App.hideMask();
            })
        }else{
            $rootScope.layerMethod.layerAlert('info','请完善表单信息',function () {});
        }
    };
}]);
/* -------------------------------
 11.2 店铺信息详情
 ------------------------------- */
adminApp.controller('shopInfo',  ['$scope','$rootScope','$state', '$compile',function($scope, $rootScope, $state,$compile) {
    $scope.init=function(){
        $scope.formData={};
        $scope.getInfo();
    };
    //获取店铺信息
    $scope.getInfo =function () {
        $rootScope.request.getlist(baseUrl+'storeInfo/applyState','POST').then(function (data) {
            if (data.code == 1000) {
                // console.log(data)
                if(data.data.storeinfo.length>0){
                    $scope.formData=data.data.storeinfo[0];
                    $scope.getProList();
                    $scope.getCityList($scope.formData.provinceid);
                    $scope.getDisList($scope.formData.provinceid,$scope.formData.cityid);
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    //获取省列表
    $scope.getProList = function() {
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getPro','POST').then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.proList = data.data.provinces;
                angular.forEach($scope.proList, function(v, k) {
                    if (v.id == $scope.formData.provinceid) {
                        $scope.proName=v.name
                    }
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //获取市列表
    $scope.getCityList = function(proid) {
        var param = { "proid": proid };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getCity','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.cityList = data.data.cities;
                angular.forEach($scope.cityList, function(v, k) {
                    if (v.id == $scope.formData.cityid) {
                        $scope.cityName =v.name;
                    }
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //获取区列表
    $scope.getDisList = function(proId,cityId) {
        var param = {
            "proid": proId,
            "cityid": cityId
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getDis','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.disList = data.data.districts;
                angular.forEach($scope.disList, function(v, k) {
                    if (v.id == $scope.formData.districtid) {
                        $scope.disName =v.name;
                    }
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //上传图片
    $scope.init();
    $scope.goEdit=function () {
        $rootScope.$state.go('app.shopinfo.editinfo');
    }
}]);
/* -------------------------------
 11.3 店铺信息编辑
 ------------------------------- */
adminApp.controller('editinfo', ['$scope','$rootScope','$state', '$compile',function($scope, $rootScope, $state,$compile) {
    $scope.init=function(){
        $scope.hasFirst=true;
        $scope.HasProvinceid=false;
        $scope.HasCityid=false;
        $scope.formData={};
        $scope.formData.provinceid=0;
        $scope.formData.cityid=0;
        $scope.formData.districtid=0;
        $scope.formData.papertype=1;
        $scope.getInfo();
    };
    //获取店铺信息
    $scope.getInfo =function () {
        $rootScope.request.getlist(baseUrl+'storeInfo/applyState','POST').then(function (data) {
            if (data.code == 1000) {
                // console.log(data)
                if(data.data.storeinfo.length>0){
                    $scope.formData=data.data.storeinfo[0];
                    $scope.formData.topStoreClassId=$scope.formData.pid;
                    $scope.getFirstClassify();
                    $scope.getScondClassify();
                    $scope.getProList();
                    $scope.getCityList($scope.formData.provinceid);
                    $scope.getDisList($scope.formData.provinceid,$scope.formData.cityid);

                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $('.input-daterange').datepicker({
        todayHighlight: true,
        language:'zh-CN',
        format: 'yyyy-mm-dd',
        autoclose: true
    });

    //获取一级列表
    $scope.getFirstClassify=function () {
        var param={
            'pid':-1,
            'type':1
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'storeInfo/getStoreCategory','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.firstList =data.data.list;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //获取二级分类
    $scope.getScondClassify=function(){
        var param={
            'pid': $scope.formData.topStoreClassId,
            'type':1
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'storeInfo/getStoreCategory','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.secondtList =data.data.list;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //获取三级分类
    $scope.selectScondClassify=function(){
        $scope.hasFirst=true;
        $scope.hasSecond=false;
        $scope.getScondClassify();
    };
    //获取省列表
    $scope.getProList = function() {
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getPro','POST').then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.proList = data.data.provinces;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //获取市列表
    $scope.getCityList = function(proid) {
        var param = { "proid": proid };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getCity','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.cityList = data.data.cities;
                $scope.HasProvinceid=true;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //获取区列表
    $scope.getDisList = function(proId,cityId) {
        var param = {
            "proid": proId,
            "cityid": cityId
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'system/getDis','POST', param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.disList = data.data.districts;
                $scope.HasCityid=true;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        });
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadLogo'){
                    $scope.formData.logourl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadBuslicense'){
                    $scope.formData.buslicenseurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadLeagalcardface'){
                    $scope.formData.legalface=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadLeagalcardback'){
                    $scope.formData.legalback=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,name) {
        $(i.target).parent().remove();
        $scope.formData[name]='';
    };
    $scope.init();
    $scope.doSubmit=function(form){
        if(!$scope.formData.logourl){
            $rootScope.layerMethod.layerAlert('info','请上传店铺logo',function () {});
            return ;
        }
        if(!$scope.formData.buslicenseurl){
            $rootScope.layerMethod.layerAlert('info','请上传营业执照',function () {});
            return ;
        }
        if(!$('#startTime').val()){
            $rootScope.layerMethod.layerAlert('info','请选择执照有效期开始时间',function () {});
            return ;
        }
        if(!$('#endTime').val()){
            $rootScope.layerMethod.layerAlert('info','请选择执照有效期结束时间',function () {});
            return ;
        }
        if(!$scope.formData.legalface){
            $rootScope.layerMethod.layerAlert('info','请选身份证正面照片',function () {});
            return ;
        }
        if(!$scope.formData.legalback){
            $rootScope.layerMethod.layerAlert('info','请选身份证反面照片',function () {});
            return ;
        }
        if(form.$valid){
            $scope.formData.type=1;
            $scope.formData.buslicensestart=$('#startTime').val();
            $scope.formData.buslicenseend=$('#endTime').val();
            var param={
                'storename':$scope.formData.storename,
                'logourl':$scope.formData.logourl,
                'scid':$scope.formData.scid,
                'topStoreClassId':$scope.formData.topStoreClassId,
                'type':1,
                'provinceid':$scope.formData.provinceid,
                'cityid':$scope.formData.cityid,
                'districtid':$scope.formData.districtid,
                'address':$scope.formData.address,
                'username':$scope.formData.username,
                'phone':$scope.formData.phone,
                'email':$scope.formData.email,
                'emergencyname':$scope.formData.emergencyname,
                'emergencyphone':$scope.formData.emergencyphone,
                'legalname':$scope.formData.legalname,
                'legalphone':$scope.formData.legalphone,
                'organizationcode':$scope.formData.organizationcode,
                'buslicenseurl':$scope.formData.buslicenseurl,
                'buslicensestart':$scope.formData.buslicensestart,
                'buslicenseend':$scope.formData.buslicenseend,
                'introduce':$scope.formData.introduce,
                'papertype':$scope.formData.papertype,
                'legalcard':$scope.formData.legalcard,
                'legalface':$scope.formData.legalface,
                'legalback':$scope.formData.legalback,
            }
            $rootScope.request.getlist(baseUrl + 'storeInfo/applyShop','POST',param).then(function (data) {
                App.hideMask();
                if (data.code == 1000) {
                    $rootScope.layerMethod.layerAlert('info','提交成功,请耐心等待审核',function () {
                        $state.go('app.shopinfo.shopInfo');
                    });
                }else if(data.code == 1009){
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {
                        $state.go('account.login');
                    });
                }else {
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                }
            },function (data) {
                App.hideMask();
            })
        }else{
            $rootScope.layerMethod.layerAlert('info','请完善表单信息',function () {});
        }
    };
}]);
/* -------------------------------
 12.1 包邮设置
 ------------------------------- */
adminApp.controller('postageBase', ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.isfree=2;
        $scope.editBase=false;
        $scope.editFree=false;
        $scope.getInfo();
    };
    //获取店铺信息
    $scope.getInfo =function () {
        $rootScope.request.getlist(baseUrl+'storeInfo/applyState','POST').then(function (data) {
            if (data.code == 1000) {
                $scope.storeid=data.data.storeinfo[0].id
                $scope.getPostInfo();
                $scope.getDefultInfo();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    // 获取包邮信息
    $scope.getPostInfo =function () {
        var param={
            storeid:$scope.storeid
        }
        $rootScope.request.getlist(baseUrl+'postage/selectFreeShipping','POST',param).then(function (data) {
            if (data.code == 1000) {
                if(data.data.freeshipping){
                    $scope.freight=parseInt(data.data.freeshipping.sfreight);
                    $scope.isfree=data.data.freeshipping.isfree
                }else {
                    $scope.editFree=true;
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    //获取默认邮费
    $scope.getDefultInfo =function () {
        var param={
            storeid:$scope.storeid
        }
        $rootScope.request.getlist(baseUrl+'postage/selectDefaultPostage','POST',param).then(function (data) {
            if (data.code == 1000) {
                if(data.data.defaultpostage){
                    $scope.postage=parseInt(data.data.defaultpostage.spostage);
                }else {
                    $scope.editBase=true;
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doSave=function(type){
        if(type==1){
            if(!$scope.postage){
                $rootScope.layerMethod.layerAlert('info','请输入默认邮费',function () {});
                return;
            }
            $scope.saveDefult()
        }
        if(type==2){
            if(!$scope.freight){
                $rootScope.layerMethod.layerAlert('info','请输入包邮价格',function () {});
                return;
            }
            $scope.saveBase()
        }
    };
    $scope.doEdit=function(type){
        if(type==1){
            $scope.editBase=true;
        }
        if(type==2){
            $scope.editFree=true;
        }
    };
    $scope.doCancle=function(type){
        if(type==1){
            $scope.editBase=false;
        }
        if(type==2){
            $scope.editFree=false;
        }
    };
    // 获取包邮信息
    $scope.saveBase =function () {
        var param={
            storeid:$scope.storeid,
            isfree:$scope.isfree,
            freight:$scope.freight
        }
        $rootScope.request.getlist(baseUrl+'postage/saveFreeShipping','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.editFree=false;
                $scope.getPostInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    // 获取包邮信息
    $scope.saveDefult =function () {
        var param={
            storeid:$scope.storeid,
            postage:$scope.postage,
        }
        $rootScope.request.getlist(baseUrl+'postage/saveDefaultPostage','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.editBase=false;
                $scope.getDefultInfo();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.init();
}]);
/* -------------------------------
 12.2 运费设置
 ------------------------------- */
adminApp.controller('postageModel', ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.checked = [];
        $scope.getInfo();
    };
    //获取店铺信息
    $scope.getInfo =function () {
        $rootScope.request.getlist(baseUrl+'storeInfo/applyState','POST').then(function (data) {
            if (data.code == 1000) {
                $scope.storeid=data.data.storeinfo[0].id;
                $scope.getDefultInfo();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    //获取默认邮费
    $scope.getDefultInfo =function () {
        var param={
            storeid:$scope.storeid
        }
        $rootScope.request.getlist(baseUrl+'postage/selectPostageList','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.list
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    //获取默认邮费
    $scope.getProvinceInfo =function () {
        var param={
            storeid:$scope.storeid
        };
        $rootScope.request.getlist(baseUrl+'postage/selectProvinceByPostage','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.ProLinst=data.data.list;
                angular.forEach($scope.ProLinst, function(value, key) {
                    value.isChecked=false;
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.showModal=function(){
        $scope.getProvinceInfo();
        $('#modal_add').modal('show');
    };
    $scope.selectAll = function () {
        if($scope.select_all) {
            $scope.checked = [];
            angular.forEach($scope.ProLinst, function (i) {
                i.isChecked = true;
                $scope.checked.push(i.id);
            })
        }else {
            angular.forEach($scope.ProLinst, function (i) {
                i.isChecked = false;
                $scope.checked = [];
            })
        }
    };
    $scope.selectLeft = function () {
        $scope.select_all=false;
        $scope.checked = [];
        angular.forEach($scope.ProLinst, function (i) {
            if(i.isChecked){
                i.isChecked = false;
            }else {
                i.isChecked = true;
                $scope.checked.push(i.id);
            }
        })
    };
    $scope.selectOne = function () {
        angular.forEach($scope.ProLinst , function (i) {
            var index = $scope.checked.indexOf(i.id);
            if(i.isChecked && index === -1) {
                $scope.checked.push(i.id);
            } else if (!i.isChecked && index !== -1){
                $scope.checked.splice(index, 1);
            };
        })
        if ($scope.ProLinst.length === $scope.checked.length) {
            $scope.select_all = true;
        } else {
            $scope.select_all = false;
        }
    };
    $scope.addpostage=function () {
        if($scope.checked.length==0){
            $rootScope.layerMethod.layerAlert('info','请选择省份',function () {});
            return;
        }
        if(!$scope.postage){
            $rootScope.layerMethod.layerAlert('info','请输入运费价格',function () {});
            return;
        }
        var param={
            storeid:$scope.storeid,
            proids:$scope.checked.join(','),
            postage:$scope.postage
        };
        $rootScope.request.getlist(baseUrl+'postage/insertPostage','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.postage='';
                $scope.proids='';
                $scope.checked = [];
                $scope.getDefultInfo();
                $('#modal_add').modal('hide');
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.edit=function(i){
        layer.prompt({ title: '修改【' + i.proname + '】运费价格', formType: 0 }, function(price, index) {
            var param = { "id": i.id, "postage": price };
            App.showMask();
            $rootScope.request.getlist(baseUrl + 'postage/updatePostage','POST',param).then(function (data) {
                App.hideMask();
                if (data.code == 1000) {
                    $scope.getDefultInfo();
                    layer.close(index)
                }else if(data.code == 1009){
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {
                        $state.go('account.login')
                    });
                }else {
                    $rootScope.layerMethod.layerAlert('info',data.message,function () {});
                }
            },function (data) {
                App.hideMask();
            })
            return false
        });
    };
    $scope.delete=function(i){
        var param={
            id:i.id,
        };
        $rootScope.request.getlist(baseUrl+'postage/deletePostage','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getDefultInfo();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.init();
}]);
/* -------------------------------
 13.1 店员管理
 ------------------------------- */
adminApp.controller('memberlist', ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.pphone = App.getCookie('phone');
        $scope.modalType = 1
        $scope.getInfo();
    };
    //获取店员列表
    $scope.getInfo =function () {
        var param={
            token:$scope.token,
            page:1,
            rows:10,
            nickname:''
        }
        $rootScope.request.getlist(baseUrl+'user/seluserlistbyshopId','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.list
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该员工？',function () {
            var ids = id
            $scope.doDelete(ids)
        },function () {},'忍痛删除','再考虑一下')
    };
    $scope.doDelete = function(id){
        var param = {
            token: $scope.token,
            ids:id
        }
        $rootScope.request.getlist(baseUrl+'user/updatestatus','POST',param).then(function (data) {
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','删除成功',function () {
                    $scope.getInfo()
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.showModal = function (type,item) {
        $scope.nickname = '';
        $scope.pwd = '';
        $scope.phone = '';
        if(type==1){
            $('#modal_add').modal({'backdrop':'static','keybord':false})
        }
        if(type==2){
            $('#modal_edit').modal({'backdrop':'static','keybord':false})
            console.log(item)
            $scope.odlphone = item.phone
            $scope.editnickname = item.nickname
            $scope.editphone = item.phone
            $scope.editpwd = ''
            $scope.editid = item.id
        }
    };
    $scope.doAdd=function(){
        if(!$scope.nickname){
            $rootScope.layerMethod.layerAlert('info','请输入昵称',function () {});
            return
        }
        if(!$scope.pwd){
            $rootScope.layerMethod.layerAlert('info','请输入密码',function () {});
            return
        }
        if(!$rootScope.checkMethod.isMobile($scope.phone)){
            $rootScope.layerMethod.layerAlert('info','请输入正确的手机号',function () {});
            return
        }
        var param = {
            token: $scope.token,
            pphone:$scope.pphone,
            nickname: $scope.nickname,
            pwd:$scope.pwd,
            phone: $scope.phone
        }
        App.showMask()
        $rootScope.request.getlist(baseUrl+'user/adduser','POST',param).then(function (data) {
            App.hideMask()
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','添加成功',function () {
                    $('#modal_add').modal('hide')
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.doEdit=function(){
        if(!$scope.editnickname){
            $rootScope.layerMethod.layerAlert('info','请输入昵称',function () {});
            return
        }
        if(!$scope.pwd){
            $rootScope.layerMethod.layerAlert('info','请输入密码',function () {});
            return
        }
        if(!$rootScope.checkMethod.isMobile($scope.editphone)){
            $rootScope.layerMethod.layerAlert('info','请输入正确的手机号',function () {});
            return
        }
        var param = {
            token: $scope.token,
            id:$scope.editid,
            oldphone:$scope.odlphone,
            nickname: $scope.editnickname,
            pwd:$scope.editpwd,
            phone: $scope.editphone
        }
        App.showMask()
        $rootScope.request.getlist(baseUrl+'user/updateuserinfo','POST',param).then(function (data) {
            App.hideMask()
            if (data.code == 1000) {
                $rootScope.layerMethod.layerAlert('info','修改成功',function () {
                    $('#modal_edit').modal('hide');
                    $scope.getInfo();
                });
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.init();
}]);

/* -------------------------------
 14.1 活动管理
------------------------------- */
adminApp.controller('activitylist', ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.storeid = App.getCookie('storeid');
        $scope.nowPage = 1
        $scope.noMore = false
        $scope.previewUrl = ''
        $scope.previewId = ''
        $scope.getInfo();
        $scope.actstatus = ''
        $scope.statuslist = [
            {id: '', name: '全部'},
            {id: 1, name: '进行中'},
            {id: 2, name: '结束'},
            {id: 3, name: '未开始'},
        ]
    };

    //获取活动列表
    $scope.getInfo = function () {
        var param={
            token:$scope.token,
            nowPage: $scope.nowPage,
            pageSize:10,
            actstatus: $scope.actstatus,
            storeid: $scope.storeid
        }
        App.showMask()
        $rootScope.request.getlist(baseUrl+'actspec/selectActSpecList','POST',param).then(function (data) {
            App.hideMask()
            if (data.code == 1000) {
                $scope.list = data.data.list
                if($scope.list.length < 10){
                    $scope.noMore  = true
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    // 翻页
    $scope.PrePage = function (nowpage) {
        $scope.nowPage = nowpage
        if ($scope.nowPage === 0) {
            return false
        } else {
            $scope.noMore = false
            $scope.getInfo()
        }
    }
    $scope.NextPage = function (nowpage) {
        $scope.nowPage = nowpage
        if ($scope.nowPage === 0) {
            return false
        } else if ($scope.noMore) {
            alert('没有更多数据了')
        } else {
            $scope.getInfo()
        }
    }
    //删除
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该活动？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    //删除请求
    $scope.doDeleted = function (id) {
        var param = {
            token: $scope.token,
            flag: 1,
            ids: id
        }
        $rootScope.request.getlist(baseUrl+'actspec/editActSpecBatch','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.goList = function (id, type) {
        if(type== 1){
            $rootScope.$state.go('^.hotactivitylist',({
                'id':id,
            }))
        }
        if (type==2) {
            $rootScope.$state.go('^.floorlist',({
                'id':id,
            }))
        }
    }
    $scope.edit = function (i) {
        window.localStorage.setItem('goodsActInfo', JSON.stringify(i))
        $rootScope.$state.go('^.editactivity',({
            'id': i.id,
        }))
    }
    $scope.preview = function (id) {
        $('#modal_preview').modal({'backdrop':'static','keybord':false})
        $scope.previewId = id
        $scope.previewUrl = 'http://106.15.126.197/sx/#/theme?from=preview&id=' + id
    }
    $('#modal_preview').on('shown.bs.modal', function (e) {
        $('#previewBox').attr('src', rootUrl + '/sx/#/theme?from=preview&id=' + $scope.previewId)
    })
    $('#modal_preview').on('hidden.bs.modal', function (e) {
        $('#previewBox').attr('src', rootUrl + '/sx/#/theme' + $scope.previewId)
    })
    $scope.selectStatus = function () {
        $scope.getInfo()
    }
    $scope.setUrl = function (id) {
        var param = {
            token: $scope.token,
            id: id,
            acturl: rootUrl + '/sx/#/theme?from=app&id=' + id,
            flag: 'edit',
            storeid: $scope.storeid
        }
        $rootScope.request.getlist(baseUrl+'actspec/addOrEditActSpec','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.init();
}]);
/* -------------------------------
 14.2 添加活动管理
 ------------------------------- */
adminApp.controller('addactivity', ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.storeid = App.getCookie('storeid');
        $scope.firstList =[]
        $scope.list = []
        $scope.getInfo();
        $scope.getFirstClassify();
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#actbackcolor').colorpicker({format: 'hex'});
    $('#trolleybuttoncolor').colorpicker({format: 'hex'});
    $('#trolleybuttonfontcolor').colorpicker({format: 'hex'});
    $scope.getInfo = function(){
    };
    //获取一级列表
    $scope.getFirstClassify=function () {
        var param={
            'type':1
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsCategory/queryOneLevelCategory','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.firstList =data.data.oneLevelCategory;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle_actheadurl'){
                    $scope.actheadurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadSingle_actfooturl'){
                    $scope.actfooturl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadSingle_actbannerurl'){
                    $scope.actbannerurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadSingle_backheadurl'){
                    $scope.backheadurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            if ($(i.target).parent().parent().attr('id') == 'singleImg_actheadurl') {
                $scope.actheadurl='';
            }
            if ($(i.target).parent().parent().attr('id') == 'singleImg_actfooturl') {
                $scope.actfooturl='';
            }
            if ($(i.target).parent().parent().attr('id') == 'singleImg_actbannerurl') {
                $scope.actbannerurl='';
            }
            if ($(i.target).parent().parent().attr('id') == 'singleImg_backheadurl') {
                $scope.backheadurl='';
            }
        }else {
            $(i.target).parent().remove();
        }
    };
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime =$('#endTime').val();
        $scope.actbackcolor = $('#actbackcolor').val();
        $scope.trolleybuttoncolor = $('#trolleybuttoncolor').val();
        $scope.trolleybuttonfontcolor = $('#trolleybuttonfontcolor').val();
        var param = {
            token: $scope.token,
            acttitle: $scope.acttitle,
            acturl: $scope.acturl,
            actheadurl: $scope.actheadurl,
            actbackcolor: $scope.actbackcolor,
            trolleybuttoncolor: $scope.trolleybuttoncolor,
            trolleybuttonfontcolor: $scope.trolleybuttonfontcolor,
            backheadurl: $scope.backheadurl,
            actfooturl: $scope.actfooturl,
            gcid: $scope.gcid,
            sort: $scope.sort,
            actbannerurl: $scope.actbannerurl,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            flag: 'add',
            storeid: $scope.storeid
        }
        if (!param.actbackcolor) {
            $rootScope.layerMethod.layerAlert('info','请输入背景颜色',function () {
            });
            return
        }
        if (!param.actbannerurl) {
            $rootScope.layerMethod.layerAlert('info','请输入活动banner',function () {
            });
            return
        }
        if (!param.actheadurl) {
            $rootScope.layerMethod.layerAlert('info','请选择头部海报',function () {
            });
            return
        }
        if (!param.acttitle) {
            $rootScope.layerMethod.layerAlert('info','请输入活动标题',function () {
            });
            return
        }
        // if (!param.acturl) {
        //     $rootScope.layerMethod.layerAlert('info','请输入活动链接',function () {
        //     });
        //     return
        // }
        if (!param.backheadurl) {
            $rootScope.layerMethod.layerAlert('info','请选择返回图片',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        if (!param.gcid) {
            $rootScope.layerMethod.layerAlert('info','请选择分类',function () {
            });
            return
        }
        if (!param.sort) {
            $rootScope.layerMethod.layerAlert('info','请输入排序',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.trolleybuttoncolor) {
            $rootScope.layerMethod.layerAlert('info','请输入按钮颜色',function () {
            });
            return
        }
        if (!param.trolleybuttonfontcolor) {
            $rootScope.layerMethod.layerAlert('info','请输入按钮文字颜色',function () {
            });
            return
        }
        console.log(param)
        $rootScope.request.getlist(baseUrl+'actspec/addOrEditActSpec','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.activity.activitylist')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.activity.activitylist')
    }
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该活动？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted = function (id) {
        var param = {
            token: $scope.token,
            flag: 1,
            ids: id
        }
        $rootScope.request.getlist(baseUrl+'actspec/editActSpecBatch','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    //获取店员列表
    $scope.init();
}]);
adminApp.controller('editactivity', ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.storeid = App.getCookie('storeid');
        $scope.firstList =[]
        $scope.info = ''
        $scope.getFirstClassify();
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#actbackcolor').colorpicker({format: 'hex'});
    $('#trolleybuttoncolor').colorpicker({format: 'hex'});
    $('#trolleybuttonfontcolor').colorpicker({format: 'hex'});
    $scope.getInfo = function(){
        var info = JSON.parse(window.localStorage.getItem('goodsActInfo'))
        $scope.id = info.id
        $scope.acttitle= info.acttitle
        $scope.acturl= info.acturl
        $scope.actheadurl= info.actheadurl
        $scope.backheadurl= info.backheadurl
        $scope.actfooturl= info.actfooturl
        $scope.gcid= info.gcid
        $scope.sort= info.sort
        $scope.actbannerurl= info.actbannerurl
        $scope.starttime= info.starttime
        $scope.endtime= info.endtime
        $('#startTime').val(info.starttime)
        $('#endTime').val(info.endtime)
        $('#actbackcolor').val(info.actbackcolor)
        $('#trolleybuttoncolor').val(info.trolleybuttoncolor)
        $('#trolleybuttonfontcolor').val(info.trolleybuttonfontcolor)
    };
    //获取一级列表
    $scope.getFirstClassify=function () {
        var param={
            'type':1
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsCategory/queryOneLevelCategory','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.firstList =data.data.oneLevelCategory;
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle_actheadurl'){
                    $scope.actheadurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadSingle_actfooturl'){
                    $scope.actfooturl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadSingle_actbannerurl'){
                    $scope.actbannerurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadSingle_backheadurl'){
                    $scope.backheadurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            if ($(i.target).parent().parent().attr('id') == 'singleImg_actheadurl') {
                $scope.actheadurl='';
            }
            if ($(i.target).parent().parent().attr('id') == 'singleImg_actfooturl') {
                $scope.actfooturl='';
            }
            if ($(i.target).parent().parent().attr('id') == 'singleImg_actbannerurl') {
                $scope.actbannerurl='';
            }
            if ($(i.target).parent().parent().attr('id') == 'singleImg_backheadurl') {
                $scope.backheadurl='';
            }
        }else {
            $(i.target).parent().remove();
        }
    };
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime =$('#endTime').val();
        $scope.actbackcolor = $('#actbackcolor').val();
        $scope.trolleybuttoncolor = $('#trolleybuttoncolor').val();
        $scope.trolleybuttonfontcolor = $('#trolleybuttonfontcolor').val();
        var param = {
            token: $scope.token,
            id: $scope.id,
            acttitle: $scope.acttitle,
            acturl: $scope.acturl,
            actheadurl: $scope.actheadurl,
            actbackcolor: $scope.actbackcolor,
            trolleybuttoncolor: $scope.trolleybuttoncolor,
            trolleybuttonfontcolor: $scope.trolleybuttonfontcolor,
            backheadurl: $scope.backheadurl,
            actfooturl: $scope.actfooturl,
            gcid: $scope.gcid,
            sort: $scope.sort,
            actbannerurl: $scope.actbannerurl,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            flag: 'edit',
            storeid: $scope.storeid
        }
        if (!param.actbackcolor) {
            $rootScope.layerMethod.layerAlert('info','请输入背景颜色',function () {
            });
            return
        }
        if (!param.actbannerurl) {
            $rootScope.layerMethod.layerAlert('info','请输入活动banner',function () {
            });
            return
        }
        if (!param.actheadurl) {
            $rootScope.layerMethod.layerAlert('info','请选择头部海报',function () {
            });
            return
        }
        if (!param.acttitle) {
            $rootScope.layerMethod.layerAlert('info','请输入活动标题',function () {
            });
            return
        }
        // if (!param.acturl) {
        //     $rootScope.layerMethod.layerAlert('info','请输入活动链接',function () {
        //     });
        //     return
        // }
        if (!param.backheadurl) {
            $rootScope.layerMethod.layerAlert('info','请选择返回图片',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        if (!param.gcid) {
            $rootScope.layerMethod.layerAlert('info','请选择分类',function () {
            });
            return
        }
        if (!param.sort) {
            $rootScope.layerMethod.layerAlert('info','请输入排序',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.trolleybuttoncolor) {
            $rootScope.layerMethod.layerAlert('info','请输入按钮颜色',function () {
            });
            return
        }
        if (!param.trolleybuttonfontcolor) {
            $rootScope.layerMethod.layerAlert('info','请输入按钮文字颜色',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'actspec/addOrEditActSpec','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.activity.activitylist')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.activity.activitylist')
    }
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该活动？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted = function (id) {
        var param = {
            token: $scope.token,
            flag: 1,
            ids: id
        }
        $rootScope.request.getlist(baseUrl+'actspec/editActSpecBatch','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    //获取店员列表
    $scope.init();
}]);
/* -------------------------------
 14.3 热门商品列表
 ------------------------------- */
adminApp.controller('hotactivitylist',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.id = $stateParams.id
        $scope.list = []
        $scope.getInfo();
    };
    $scope.getInfo = function(){
        var param={
            token:$scope.token,
            nowPage:1,
            pageSize:10,
            actspecid: $scope.id
        }
        $rootScope.request.getlist(baseUrl+'actspec/selectHotGoodsList','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.list
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.goAddHot =function () {
        $rootScope.$state.go('^.hotgoodslist',({
            'id': $scope.id
        }))
    }
    $scope.showModal = function (type) {
        $('#modal_add').modal({'backdrop':'static','keybord':false})
    };
    $scope.doAdd = function () {
        var param = {
            token: $scope.token,
            actspecid: $scope.id,
            gids: 28,
            type: 1,
            flag: 'add'
        }
        $rootScope.request.getlist(baseUrl+'actspec/addOrEditActSpecGoods','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo();
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该热销商品？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted  = function (id) {
        var param = {
            token: $scope.token,
            ids: id,
            flag: 2
        }
        $rootScope.request.getlist(baseUrl+'actspec/editActSpecBatch','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.init();
}]);
adminApp.controller('hotgoodslist',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.storeid = App.getCookie('storeid');
        $scope.id = $stateParams.id
        $scope.nowPage = 1
        $scope.searchName= ''
        $scope.searchCatid = ''
        $scope.list = []
        $scope.firstList = []
        $scope.getInfo();
        $scope.getFirstClassify()
    };
    $scope.getInfo = function(){
        var param={
            token:$scope.token,
            storeid: $scope.storeid,
            nowPage: $scope.nowPage,
            pageSize:10,
            goodsname: $scope.searchName,
            catid: $scope.searchCatid,
            actspecid: $scope.id,
            type: 1
        }
        $rootScope.request.getlist(baseUrl+'actspec/selectGoodsListByCon','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.list
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doSearch = function () {
        $scope.nowPage = 1;
        $scope.getInfo();
    };
    $scope.PrePage = function (nowpage) {
        $scope.nowPage = nowpage
        if ($scope.nowPage === 0) {
            return false
        } else {
            $scope.noMore = false
            $scope.getInfo()
        }
    }
    $scope.NextPage = function (nowpage) {
        $scope.nowPage = nowpage
        if ($scope.nowPage === 0) {
            return false
        } else if ($scope.noMore) {
            alert('没有更多数据了')
        } else {
            $scope.getInfo()
        }
    }
    //获取一级列表
    $scope.getFirstClassify=function () {
        var param={
            'type':1
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsCategory/queryOneLevelCategory','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.firstList =data.data.oneLevelCategory;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.hotimg=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.hotimg='';
        }else {
            $(i.target).parent().remove();
        }
    };
    $scope.setHot = function (i) {
        $scope.setInfo = i
        $('#modal_add').modal({'backdrop':'static','keybord':false})
    };
    $scope.goBack = function () {
        $rootScope.$state.go('^.hotactivitylist',({
            'id':$scope.id,
        }))
    }
    $scope.doAdd = function (id) {
        var param = {
            token: $scope.token,
            actspecid: $scope.id,
            bannerurl: $scope.hotimg,
            gids: id,
            type: 1,
            flag: 'add'
        }
        App.showMask()
        $rootScope.request.getlist(baseUrl+'actspec/addOrEditActSpecGoods','POST',param).then(function (data) {
            App.hideMask()
            if (data.code == 1000) {
                $scope.getInfo();
                $('#modal_add').modal('hide')
                $scope.hotimg=''
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.init();
    $scope.keyboardSearch = function (e) {
        if (e.keyCode === 13) {
            $scope.doSearch()
        }
    }
}]);
/* -------------------------------
 14.4 楼层列表
 ------------------------------- */
adminApp.controller('floorlist',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.id = $stateParams.id
        $scope.list = []
        $scope.getInfo();
    };
    $scope.getInfo = function(){
        var param={
            token:$scope.token,
            nowPage:1,
            pageSize:10,
            actspecid: $scope.id
        }
        App.showMask()
        $rootScope.request.getlist(baseUrl+'actspec/selectFloorGoodsList','POST',param).then(function (data) {
            App.hideMask()
            if (data.code == 1000) {
                $scope.list = data.data.list
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.showModal = function (type,i) {
        if (type == 1) {
            $scope.modal_add_floorname = ''
            $scope.modal_add_sort = ''
            $scope.modal_add_img = ''
            $('#modal_add').modal({'backdrop':'static','keybord':false})
        }
        if (type == 2) {
            $scope.modal_edit_floorname = i.floorname
            $scope.modal_edit_sort = i.sort
            $scope.modal_edit_img = i.bannerurl
            $scope.edit_id = i.id
            $('#modal_edit').modal({'backdrop':'static','keybord':false})
        }
    };
    $scope.goList = function (id) {
        $rootScope.$state.go('^.floorgoodslist',({
            'floorid':id,
            'actspecid': $stateParams.id
        }))
    }
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.modal_add_img=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
                if(fileId =='uploadSingle_Edit'){
                    $scope.modal_edit_img=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.modal_add_img='';
            $scope.modal_edit_img='';
        }else {
            $(i.target).parent().remove();
        }
    };
    $scope.doAdd = function () {
        if (!$scope.modal_add_floorname) {
            $rootScope.layerMethod.layerAlert('info','请输入楼层名称',function () {});
            return;
        }
        if (!$scope.modal_add_sort) {
            $rootScope.layerMethod.layerAlert('info','请输入排序',function () {});
            return;
        }
        if (!$scope.modal_add_img) {
            $rootScope.layerMethod.layerAlert('info','请上传楼层图片',function () {});
            return;
        }
        var param = {
            token: $scope.token,
            floorname: $scope.modal_add_floorname,
            actspecid: $scope.id,
            bannerurl: $scope.modal_add_img,
            type: 2,
            sort: $scope.modal_add_sort,
            flag: 'add'
        }
        $rootScope.request.getlist(baseUrl+'actspec/addOrEditActSpecGoods','POST',param).then(function (data) {
            if (data.code == 1000) {
                $('#modal_add').modal('hide')
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doEdit = function () {
        if (!$scope.modal_edit_floorname) {
            $rootScope.layerMethod.layerAlert('info','请输入楼层名称',function () {});
            return;
        }
        if (!$scope.modal_edit_sort) {
            $rootScope.layerMethod.layerAlert('info','请输入排序',function () {});
            return;
        }
        if (!$scope.modal_edit_img) {
            $rootScope.layerMethod.layerAlert('info','请上传楼层图片',function () {});
            return;
        }
        var param = {
            token: $scope.token,
            id: $scope.edit_id,
            floorname: $scope.modal_edit_floorname,
            actspecid: $scope.id,
            bannerurl: $scope.modal_edit_img,
            type: 2,
            sort: $scope.modal_edit_sort,
            flag: 'edit'
        }
        $rootScope.request.getlist(baseUrl+'actspec/addOrEditActSpecGoods','POST',param).then(function (data) {
            if (data.code == 1000) {
                $('#modal_edit').modal('hide')
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该楼层？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted  = function (id) {
        var param = {
            token: $scope.token,
            flag: 2,
            ids: id
        }
        $rootScope.request.getlist(baseUrl+'actspec/editActSpecBatch','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    //获取店员列表
    $scope.init();
}]);
/* -------------------------------
 14.5 楼层商品列表
 ------------------------------- */
adminApp.controller('floorgoodslist',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.storeid = App.getCookie('storeid');
        $scope.floorid = $stateParams.floorid
        $scope.actspecid = $stateParams.actspecid
        $scope.goodsInfo = []
        $scope.list = []
        $scope.firstList = []
        $scope.getInfo();
        $scope.getFirstClassify()
    };
    $scope.getInfo = function(){
        var param={
            token:$scope.token,
            nowPage:1,
            pageSize:10,
            actspecid: $scope.actspecid,
            actspecgoodsid: $scope.floorid,
            type: 3,
            storeid: 1
        }
        $rootScope.request.getlist(baseUrl+'actspec/selectGoodsListByCon','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.list
                // console.log($scope.list)
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doSearch = function () {
        $scope.getGoodsInfo();
    };
    $scope.showModal = function () {
        $scope.getGoodsInfo()
        $('#modal_add').modal({'backdrop':'static','keybord':false})
    };
    $scope.setFloorGoods = function (id) {
        var param = {
            token: $scope.token,
            floorid: $scope.floorid,
            actspecid: $scope.actspecid,
            gids: id
        }
        App.showMask()
        $rootScope.request.getlist(baseUrl+'actspec/batchActSpecFloor','POST',param).then(function (data) {
            App.hideMask()
            if (data.code == 1000) {
                $scope.getGoodsInfo()
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.getGoodsInfo = function(){
        var param={
            token:$scope.token,
            storeid: $scope.storeid,
            nowPage:1,
            pageSize:10,
            actspecid: $scope.actspecid,
            actspecgoodsid: $scope.floorid,
            goodsname: $scope.searchName,
            catid: $scope.searchCatid,
            type: 2
        }
        $rootScope.request.getlist(baseUrl+'actspec/selectGoodsListByCon','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.goodsInfo = data.data.list
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    //获取一级列表
    $scope.getFirstClassify=function () {
        var param={
            'type':1
        };
        App.showMask();
        $rootScope.request.getlist(baseUrl + 'goodsCategory/queryOneLevelCategory','POST',param).then(function (data) {
            App.hideMask();
            if (data.code == 1000) {
                $scope.firstList =data.data.oneLevelCategory;
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        },function (data) {
            App.hideMask();
        })
    };
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该楼层商品？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted  = function (id) {
        var param = {
            token: $scope.token,
            ids: id,
            flag: 3
        }
        $rootScope.request.getlist(baseUrl+'actspec/editActSpecBatch','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.goBack = function () {
        $rootScope.$state.go('^.floorlist',({
            'id':$scope.actspecid,
        }))
    }
    //获取店员列表
    $scope.init();
}]);

/* -------------------------------
 15.1 首页设置
------------------------------- */
adminApp.controller('settinglist',  ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.pageInfo={
            'nowPage':1,
            'pageSize':10,
            'pages':1,
            'totalNum':1
        };
        $scope.checkAll = false
        $scope.runstatusList = [
            {id: '', desc: '全部'},
            {id: '1', desc: '运行中'},
            {id: '2', desc: '已关闭'},
            {id: '3', desc: '即将生效'},
            {id: '4', desc: '已过期'}
        ]
        $scope.runstatus = ''
        $scope.getInfo();
        $scope.setPageNation();
    };
    //分页信息
    $scope.setPageNation =function () {
        //设置分页的参数
        $scope.option = {
            curr: $scope.pageInfo.nowPage, //当前页数
            all: $scope.pageInfo.pages, //总页数
            count: 5, //最多显示的页数，默认为10
            click: function (page) {
                $scope.pageInfo.nowPage = page;
                $scope.getInfo();
            }
        };
    };
    $scope.changeStatustype = function () {
        console.log($scope.runstatus)
        $scope.getInfo()
    }
    //获取活动列表
    $scope.getInfo =function () {
        var param={
            token:$scope.token,
            strongholdid: $scope.strongholdid,
            runstatus: $scope.runstatus
        }
        $rootScope.request.getlist(baseUrl+'actbusiness/selectActBussinessList','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.list
                $scope.list.forEach(function(i,k){
                    i.checked = false
                    if (i.actstatus == 1) {
                        i.status = true
                    } else {
                        i.status = false
                    }
                })
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该楼层？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted = function (id) {
        var param = {
            token: $scope.token,
            flag: 1,
            ids: id
        }
        $rootScope.request.getlist(baseUrl+'actbusiness/removeActBusinessOrFloor','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.goList = function (id, type) {
        $rootScope.$state.go('^.floordetail',({
            'floorid':id,
            'floortype': type
        }))
    }
    $scope.edit = function (i) {
        window.localStorage.setItem('indexfloor', JSON.stringify(i))
        $rootScope.$state.go('^.editfloor',({
            'floorid': i.id
        }))
    }
    $scope.changeStatus = function (id,status) {
        var param = {
            token: $scope.token,
            id: id,
            flag: 'edit',
        }
        if (status == 1) {
            param.actstatus = 2
        }
        if (status == 2) {
            param.actstatus = 1
        }
        App.showMask()
        $rootScope.request.getlist(baseUrl+'actbusiness/addOrEditActBusiness','POST',param).then(function (data) {
            App.hideMask()
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.checkAllFunc = function () {
        if ($scope.checkAll) {
            $scope.list.forEach(function(i,k){
                i.checked = true
            })
        } else {
            $scope.list.forEach(function(i,k){
                i.checked = false
            })
        }
    }
    $scope.changeOne = function (i) {
        if (!i){
            $scope.checkAll = false
        }
    }
    $scope.preview = function () {
        $scope.ids = []
        $scope.list.forEach(function(i,k){
            if (i.checked) {
                $scope.ids.push(i.id)
            }
        })
        if ($scope.ids.length === 0) {
            $rootScope.layerMethod.layerAlert('info','请选择要预览的内容',function () {
            });
        } else {
            console.log($scope.ids)
            $('#modal_preview').modal({'backdrop':'static','keybord':false})
        }
    }
    $('#modal_preview').on('shown.bs.modal', function (e) {
        $('#previewBox').attr('src', rootUrl + '/sx/#/indexpreview?from=preview&id=5&ids=' + $scope.ids.join(',') + '&strongholdid=' + $scope.strongholdid)
    })
    $('#modal_preview').on('hidden.bs.modal', function (e) {
        $('#previewBox').attr('src', '')
    })
    $scope.init();
}]);
adminApp.controller('addfloor',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.storeid = App.getCookie('storeid');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.showTitle = true
        $scope.showSubTitle = true
        $scope.addShooCart = false
        $scope.classList = []
        $scope.modelType = 1
        $scope.getStoreClass()
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.getStoreClass = function () {
        var param={
            token:$scope.token,
            storeid: $scope.storeid
        }
        $rootScope.request.getlist(baseUrl+'actbusiness/selectHomeCategoryList','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.classList = data.data.list
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime =$('#endTime').val();
        var param = {
            token: $scope.token,
            homecategoryid: $scope.homecategoryid,
            acttitle: $scope.title,
            actsubtitle: $scope.subtitle,
            modeltype: $scope.modelType,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            showtitle: $scope.showTitle?1:2,
            showsubtitle: $scope.showSubTitle?1:2,
            toppadding: $scope.marginTop,
            bottompadding: $scope.marginBottom,
            sort: $scope.sort,
            flag: 'add',
            strongholdid: $scope.strongholdid,
            roundness: $scope.radius,
            acttitleimg: $scope.imgurl,
            showgoodscnt: $scope.shownum,
            clickstatus: $scope.addShooCart ? 1 : 2
        }
        if (!param.homecategoryid) {
            $rootScope.layerMethod.layerAlert('info','请输入首页id',function () {
            });
            return
        }
        if (!param.acttitle) {
            $rootScope.layerMethod.layerAlert('info','请输入标题',function () {
            });
            return
        }
        if (!param.actsubtitle) {
            $rootScope.layerMethod.layerAlert('info','请输入副标题',function () {
            });
            return
        }
        if (!param.modeltype) {
            $rootScope.layerMethod.layerAlert('info','请选择排版种类',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        if (!param.toppadding && (param.toppadding !== 0)) {
            $rootScope.layerMethod.layerAlert('info','请输入上边距',function () {
            });
            return
        }
        if (!param.bottompadding && (param.bottompadding !== 0)) {
            $rootScope.layerMethod.layerAlert('info','请输入下边距',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'actbusiness/addOrEditActBusiness','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.indexsetting.settinglist')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.imgurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.imgurl='';
        }else {
            $(i.target).parent().remove();
        }
    };
    $scope.doCancel = function () {
        $state.go('app.indexsetting.settinglist')
    }
    //获取店员列表
    $scope.init();
}]);
adminApp.controller('editfloor',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.showTitle = true
        $scope.showSubTitle = true
        $scope.modelType = 1
        $scope.getStoreClass()
        $scope.getInfo()
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.getStoreClass = function () {
        var param={
            token:$scope.token,
            storeid: $scope.storeid
        }
        $rootScope.request.getlist(baseUrl+'actbusiness/selectHomeCategoryList','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.classList = data.data.list
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.getInfo = function () {
        var info = JSON.parse(window.localStorage.getItem('indexfloor'))
        $scope.homecategoryid = info.homecategoryid
        $scope.floorid = info.id
        $scope.title = info.acttitle
        $scope.subtitle = info.actsubtitle
        $scope.modelType = info.modeltype
        $('#startTime').val(info.starttime)
        $('#endTime').val(info.endtime)
        $scope.showTitle = (info.showtitle == 1)? true:false
        $scope.showSubTitle = (info.showsubtitle == 1)? true:false
        $scope.marginTop = info.toppadding
        $scope.marginBottom = info.bottompadding
        $scope.sort = info.sort,
            $scope.radius = info.roundness,
            $scope.imgurl = info.acttitleimg,
            $scope.shownum = info.showgoodscnt,
            $scope.addShooCart = info.clickstatus == 1  ? true : false
    }
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime =$('#endTime').val();
        var param = {
            token: $scope.token,
            id: $scope.floorid,
            homecategoryid: $scope.homecategoryid,
            acttitle: $scope.title,
            actsubtitle: $scope.subtitle,
            modeltype: $scope.modelType,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            showtitle: $scope.showTitle?1:2,
            showsubtitle: $scope.showSubTitle?1:2,
            toppadding: $scope.marginTop,
            bottompadding: $scope.marginBottom,
            sort: $scope.sort,
            flag: 'edit',
            strongholdid: $scope.strongholdid,
            roundness: $scope.radius,
            acttitleimg: $scope.imgurl,
            showgoodscnt: $scope.shownum,
            clickstatus: $scope.addShooCart ? 1 : 2
        }
        if (!param.homecategoryid) {
            $rootScope.layerMethod.layerAlert('info','请输入首页id',function () {
            });
            return
        }
        if (!param.acttitle) {
            $rootScope.layerMethod.layerAlert('info','请输入标题',function () {
            });
            return
        }
        if (!param.actsubtitle) {
            $rootScope.layerMethod.layerAlert('info','请输入副标题',function () {
            });
            return
        }
        if (!param.modeltype) {
            $rootScope.layerMethod.layerAlert('info','请选择排版种类',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        if (!param.toppadding && (param.toppadding !== 0)) {
            $rootScope.layerMethod.layerAlert('info','请输入上边距',function () {
            });
            return
        }
        if (!param.bottompadding && (param.bottompadding !== 0)) {
            $rootScope.layerMethod.layerAlert('info','请输入下边距',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'actbusiness/addOrEditActBusiness','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.indexsetting.settinglist')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.indexsetting.settinglist')
    }
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.imgurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.imgurl='';
        }else {
            $(i.target).parent().remove();
        }
    };
    //获取店员列表
    $scope.init();
}]);
adminApp.controller('floordetail',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.floorid = $stateParams.floorid
        $scope.floortype = $stateParams.floortype
        $scope.entrelength = 0
        $scope.getInfo();
    };
    //获取活动列表
    $scope.getInfo =function () {
        var param={
            token:$scope.token,
            actbusinessid: $scope.floorid
        }
        $rootScope.request.getlist(baseUrl+'actbusiness/selectActBussinessFloorList','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.list
                $scope.entrelength =  data.data.list.length
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该入口？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted = function (id) {
        var param = {
            token: $scope.token,
            flag: 2,
            ids: id
        }
        $rootScope.request.getlist(baseUrl+'actbusiness/removeActBusinessOrFloor','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.edit = function (i) {
        window.localStorage.setItem('floorgoods', JSON.stringify(i))
        $rootScope.$state.go('^.editgoods',({
            'floorid': $scope.floorid,
            'floortype': $scope.floortype
        }))
    }
    $scope.goAdd = function () {
        if ($scope.floortype == 1)  {
            if  ( $scope.entrelength == 0) {
                $rootScope.$state.go('^.addgoods',({
                    'floorid': $scope.floorid,
                    'floortype': $scope.floortype
                }))
            } else {
                $rootScope.layerMethod.layerAlert('info','超过限制不能再添加',function () {
                });
                return
            }
        } else if ($scope.floortype == 2) {
            if  ( $scope.entrelength < 2) {
                $rootScope.$state.go('^.addgoods',({
                    'floorid': $scope.floorid,
                    'floortype': $scope.floortype
                }))
            } else {
                $rootScope.layerMethod.layerAlert('info','超过限制不能再添加',function () {
                });
                return
            }
        } else if ($scope.floortype == 6) {
            if  ( $scope.entrelength < 8) {
                $rootScope.$state.go('^.addgoods',({
                    'floorid': $scope.floorid,
                    'floortype': $scope.floortype
                }))
            } else {
                $rootScope.layerMethod.layerAlert('info','超过限制不能再添加',function () {
                });
                return
            }
        } else if ($scope.floortype == 7) {
            $rootScope.$state.go('^.addgoods',({
                'floorid': $scope.floorid,
                'floortype': $scope.floortype
            }))
        } else {
            if  ( $scope.entrelength < 3) {
                $rootScope.$state.go('^.addgoods',({
                    'floorid': $scope.floorid,
                    'floortype': $scope.floortype
                }))
            } else {
                $rootScope.layerMethod.layerAlert('info','超过限制不能再添加',function () {
                });
                return
            }
        }
    }
    $scope.init();
}]);
adminApp.controller('addgoods',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.floorid = $stateParams.floorid
        $scope.floortype = $stateParams.floortype
        $stateParams.floortype == 6 ||  $stateParams.floortype == 7 ?  $scope.modelType = 3: $scope.modelType = 1
    };
    $scope.doSave = function () {
        var param = {
            token: $scope.token,
            actbusinessid: $scope.floorid,
            floortitle: $scope.title,
            floortype: $scope.modelType,
            bannerurl: $scope.imgurl,
            typeid: $scope.typeid,
            imgsize: $scope.imgsize,
            sort: $scope.sort,
            flag: 'add',
        }
        if ($scope.floortype !=6 && $scope.floortype != 7) {
            if (!param.floortitle) {
                $rootScope.layerMethod.layerAlert('info','请输入入口标题',function () {
                });
                return
            }
            if (!param.floortype) {
                $rootScope.layerMethod.layerAlert('info','请选择进入类型',function () {
                });
                return
            }
            if (!param.bannerurl) {
                $rootScope.layerMethod.layerAlert('info','请选择图片',function () {
                });
                return
            }
        }
        if ($scope.modelType != 4) {
            if (!param.typeid) {
                $rootScope.layerMethod.layerAlert('info','请输入对应id',function () {
                });
                return
            }
        }
        if (!param.sort) {
            $rootScope.layerMethod.layerAlert('info','请输入排序',function () {
            });
            return
        }
        console.log(param)
        App.showMask()
        $rootScope.request.getlist(baseUrl+'actbusiness/addOrEditActBusinessFloor','POST',param).then(function (data) {
            App.hideMask()
            if (data.code == 1000) {
                $rootScope.$state.go('^.floordetail',({
                    'floorid': $scope.floorid,
                    'floortype': $scope.floortype
                }))
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.doCancel = function () {
        $rootScope.$state.go('^.floordetail',({
            'floorid': $scope.floorid,
            'floortype': $scope.floortype
        }))
    }
    $scope.goBack = function () {
        $rootScope.$state.go('^.floordetail',({
            'floorid': $scope.floorid,
            'floortype': $scope.floortype
        }))
    }
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.imgurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.imgurl='';
        }else {
            $(i.target).parent().remove();
        }
    };
    $scope.init();
}]);
adminApp.controller('editgoods', ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.floorid = $stateParams.floorid
        $scope.floortype = $stateParams.floortype
        $scope.getInfo()
    };
    $scope.getInfo = function () {
        var info = JSON.parse(window.localStorage.getItem('floorgoods'))
        $scope.id = info.id
        $scope.title = info.floortitle
        $scope.modelType = info.floortype
        $scope.imgurl = info.bannerurl
        $scope.typeid = info.typeid
        $scope.imgsize = info.imgsize
        $scope.sort = info.sort
    }
    $scope.doSave = function () {
        var param = {
            token: $scope.token,
            id: $scope.id,
            actbusinessid: $scope.floorid,
            floortitle: $scope.title,
            floortype: $scope.modelType,
            bannerurl: $scope.imgurl,
            typeid: $scope.typeid,
            imgsize: $scope.imgsize,
            sort: $scope.sort,
            flag: 'edit',
        }
        if ($scope.floortype !=6 && $scope.floortype != 7) {
            if (!param.floortitle) {
                $rootScope.layerMethod.layerAlert('info','请输入入口标题',function () {
                });
                return
            }
            if (!param.floortype) {
                $rootScope.layerMethod.layerAlert('info','请选择进入类型',function () {
                });
                return
            }
            if (!param.bannerurl) {
                $rootScope.layerMethod.layerAlert('info','请选择图片',function () {
                });
                return
            }
        }
        if ($scope.modelType != 4) {
            if (!param.typeid) {
                $rootScope.layerMethod.layerAlert('info','请输入对应id',function () {
                });
                return
            }
        }
        if (!param.sort) {
            $rootScope.layerMethod.layerAlert('info','请输入排序',function () {
            });
            return
        }
        console.log(param)
        App.showMask()
        $rootScope.request.getlist(baseUrl+'actbusiness/addOrEditActBusinessFloor','POST',param).then(function (data) {
            App.hideMask()
            if (data.code == 1000) {
                $rootScope.$state.go('^.floordetail',({
                    'floorid': $scope.floorid,
                    'floortype': $scope.floortype
                }))
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.doCancel = function () {
        $rootScope.$state.go('^.floordetail',({
            'floorid': $scope.floorid,
            'floortype': $scope.floortype
        }))
    }
    $scope.goBack = function () {
        $rootScope.$state.go('^.floordetail',({
            'floorid': $scope.floorid,
            'floortype': $scope.floortype
        }))
    }
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.imgurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.imgurl='';
        }else {
            $(i.target).parent().remove();
        }
    };
    //获取店员列表
    $scope.init();
}]);

/* -------------------------------
 15.1 轮播图设置
------------------------------- */
adminApp.controller('bannersetting',  ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.pageInfo={
            'nowPage':1,
            'pageSize':10,
            'pages':1,
            'totalNum':1
        };
        $scope.checkAll = false
        $scope.getInfo();
        $scope.setPageNation();
    };
    //分页信息
    $scope.setPageNation =function () {
        //设置分页的参数
        $scope.option = {
            curr: $scope.pageInfo.nowPage, //当前页数
            all: $scope.pageInfo.pages, //总页数
            count: 5, //最多显示的页数，默认为10
            click: function (page) {
                $scope.pageInfo.nowPage = page;
                $scope.getInfo();
            }
        };
    };
    //获取活动列表
    $scope.getInfo =function () {
        var param={
            token:$scope.token
        }
        $rootScope.request.getlist(baseUrl+'actbusinesstab/selectActBussinessTabList','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.list
                $scope.list.forEach(function(i,k){
                    i.sttime =  Date.parse(i.starttime);
                    i.etime =  Date.parse(i.endtime);
                    i.nowtime = Date.parse(new Date());
                    if (i.nowtime < i.sttime) {
                        i.timestatus = 1
                    } else if (i.nowtime > i.etime){
                        i.timestatus = 2
                    } else {
                        i.timestatus = 3
                    }
                    i.checked = false
                    if (i.actstatus === '1') {
                        i.showStatus = true
                    } else {
                        i.showStatus = false
                    }
                })
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.changeStatus = function (id,status) {
        console.log(status)
        var param = {
            token: $scope.token,
            id: id,
            flag: 'edit'
        }
        if (status == 1) {
            param.actstatus = 2
        }
        if (status == 2) {
            param.actstatus = 1
        }
        App.showMask()
        $rootScope.request.getlist(baseUrl+'actbusinesstab/addOrEditActBusinessTab','POST',param).then(function (data) {
            App.hideMask()
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该轮播图？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted = function (id) {
        var param = {
            token: $scope.token,
            ids: id
        }
        $rootScope.request.getlist(baseUrl+'actbusinesstab/removeActBusinessTab','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.edit = function (i) {
        window.localStorage.setItem('bannerInfo', JSON.stringify(i))
        $rootScope.$state.go('^.banneredit')
    }
    $scope.checkAllFunc = function () {
        if ($scope.checkAll) {
            $scope.list.forEach(function(i,k){
                i.checked = true
            })
        } else {
            $scope.list.forEach(function(i,k){
                i.checked = false
            })
        }
    }
    $scope.changeOne = function (i) {
        if (!i){
            $scope.checkAll = false
        }
    }
    $scope.init();
}]);
adminApp.controller('banneradd',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.storeid = App.getCookie('storeid');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.classList = []
        $scope.floortype = 1
        // $scope.bannerurl = 'https://huizhong58.oss-cn-shanghai.aliyuncs.com/3690083ee82e55b898924bac7e5662f1.png'
        $scope.getStoreClass()
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.getStoreClass = function () {
        var param={
            token:$scope.token,
            storeid: $scope.storeid
        }
        $rootScope.request.getlist(baseUrl+'actbusiness/selectHomeCategoryList','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.classList = data.data.list
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime = $('#endTime').val();
        var param = {
            token: $scope.token,
            homecategoryid: $scope.homecategoryid,
            floortype: $scope.floortype,
            typeid: $scope.typeid,
            bannerurl: $scope.bannerurl,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            sort: $scope.sort,
            strongholdid: $scope.strongholdid,
            tabtitle: $scope.tabtitle,
            flag: 'add',
        }
        if (!param.homecategoryid) {
            $rootScope.layerMethod.layerAlert('info','请选择首页id',function () {
            });
            return
        }
        if (!param.floortype) {
            $rootScope.layerMethod.layerAlert('info','请选择跳转类型',function () {
            });
            return
        }
        if (!param.typeid) {
            $rootScope.layerMethod.layerAlert('info','请输入跳转Id',function () {
            });
            return
        }
        if (!param.bannerurl) {
            $rootScope.layerMethod.layerAlert('info','请选择图片',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        if (!param.sort) {
            $rootScope.layerMethod.layerAlert('info','请选输入排序',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'actbusinesstab/addOrEditActBusinessTab','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.banner.setting')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.banner.setting')
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.bannerurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.bannerurl='';
        }else {
            $(i.target).parent().remove();
        }
    };
    $scope.init();
}]);
adminApp.controller('banneredit',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.getStoreClass()
        $scope.getInfo()
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.getStoreClass = function () {
        var param={
            token:$scope.token,
            storeid: $scope.storeid
        }
        $rootScope.request.getlist(baseUrl+'actbusiness/selectHomeCategoryList','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.classList = data.data.list
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.getInfo = function () {
        var info = JSON.parse(window.localStorage.getItem('bannerInfo'))
        $scope.tabtitle = info.tabtitle
        $scope.homecategoryid = info.homecategoryid
        $scope.floortype = info.floortype
        $scope.typeid = info.typeid
        $scope.bannerurl = info.bannerurl
        $('#startTime').val(info.starttime)
        $('#endTime').val(info.endtime)
        $scope.sort = info.sort
        $scope.bannerid = info.id
    };
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime = $('#endTime').val();
        var param = {
            id: $scope.bannerid,
            token: $scope.token,
            homecategoryid: $scope.homecategoryid,
            floortype: $scope.floortype,
            typeid: $scope.typeid,
            bannerurl: $scope.bannerurl,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            sort: $scope.sort,
            tabtitle: $scope.tabtitle,
            flag: 'edit',
        }
        if (!param.homecategoryid) {
            $rootScope.layerMethod.layerAlert('info','请选择首页id',function () {
            });
            return
        }
        if (!param.floortype) {
            $rootScope.layerMethod.layerAlert('info','请选择跳转类型',function () {
            });
            return
        }
        if (!param.typeid) {
            $rootScope.layerMethod.layerAlert('info','请输入跳转Id',function () {
            });
            return
        }
        if (!param.bannerurl) {
            $rootScope.layerMethod.layerAlert('info','请选择图片',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        if (!param.sort) {
            $rootScope.layerMethod.layerAlert('info','请选输入排序',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'actbusinesstab/addOrEditActBusinessTab','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.banner.setting')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.banner.setting')
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.bannerurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.bannerurl='';
        }else {
            $(i.target).parent().remove();
        }
    };
    //获取店员列表
    $scope.init();
}]);
/* -------------------------------
 11.1 运费设置
 ------------------------------- */
adminApp.controller('couponManager',  ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
}]);


/* -------------------------------
 11.1 优惠券管理
 ------------------------------- */
adminApp.controller('couponlist', ['$scope','$rootScope','$state', function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.usertypelist = [{id:'', name: '全部'},{id:6, name: '商品满减券'},{id:7, name: '运费券'},{id:8, name: '折扣券'}]
        $scope.statuslist = [{id:'', name: '全部'},{id:1, name: '进行中'},{id:2, name: '尚未开始'},{id:3, name: '已过期'}]
        $scope.statustype = ''
        $scope.usetype = ''
        $scope.nowPage = 1
        $scope.PageSize = 10
        $scope.noMore = false
        $scope.checkAll = false
        $scope.getInfo();
    };
    // 翻页
    $scope.PrePage = function (nowpage) {
        $scope.nowPage = nowpage - 1
        if ($scope.nowPage == 0) {
            $scope.nowPage = 1
            return false
        } else {
            $scope.getInfo()
        }
    }
    $scope.NextPage = function (nowpage) {
        $scope.nowPage = nowpage + 1
        if ($scope.noMore) {
            alert('没有更多数据了')
        } else {
            $scope.getInfo()
        }
    }
    // 查询
    $scope.changeUsetype = function () {
        $scope.getInfo()
    }
    $scope.changeStatustype = function () {
        $scope.getInfo()
    }
    $scope.doReset = function () {
        $scope.statustype = ''
        $scope.usetype = ''
        $scope.getInfo();
    }
    //获取活动列表
    $scope.getInfo =function () {
        var param={
            token:$scope.token,
            strongholdid: $scope.strongholdid,
            page: $scope.nowPage,
            rows: $scope.PageSize,
            statustype: $scope.statustype,
            usetype: $scope.usetype,
            memberstatus: 1
        }
        $rootScope.request.getlist(baseUrl+'couponGrant/queryCoupon','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.couponList
                if (data.data.couponList.length < $scope.PageSize) {
                    $scope.noMore = true
                }
                $scope.list.forEach(function(i,k){
                    i.checked = false
                    if (i.actstatus == 1) {
                        i.status = true
                    } else {
                        i.status = false
                    }
                })
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该优惠券？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted = function (id) {
        var param = {
            token: $scope.token,
            flag: 1,
            ids: id
        }
        $rootScope.request.getlist(baseUrl+'couponGrant/deleteCouponByIds','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.edit = function (i) {
        window.localStorage.setItem('couponInfo', JSON.stringify(i))
        $rootScope.$state.go('^.couponedit')
    }
    $scope.checkAllFunc = function () {
        if ($scope.checkAll) {
            $scope.list.forEach(function(i,k){
                i.checked = true
            })
        } else {
            $scope.list.forEach(function(i,k){
                i.checked = false
            })
        }
    }
    $scope.changeOne = function (i) {
        if (!i){
            $scope.checkAll = false
        }
    }
    $scope.init();
}]);
adminApp.controller('couponadd',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.storeid = App.getCookie('storeid');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.classList = []
        $scope.type = -1
        $scope.usetype = 6
        $scope.getStoreClass()
        $scope.showTip = false
    };
    $scope.vilatePoint = function (e) {
        if (e.keyCode === 190) {
            $scope.showTip = true
        } else if ($scope.isPositiveInteger($scope.money)) {
            $scope.showTip = false
        } else {
            $scope.showTip = true
        }
    }
    $scope.isPositiveInteger = function(s){//是否为正整数
        var re = /^[0-9]+$/ ;
        return re.test(s)
    }
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.getStoreClass = function () {
        var param={
            'type':1
        }
        $rootScope.request.getlist(baseUrl+'goodsCategory/queryOneLevelCategory','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.classList = data.data.oneLevelCategory
                $scope.classList.unshift({id: -1, name: '全场通用'})
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime = $('#endTime').val();
        if ($scope.type == -1) {
            $scope.coupontype = 1
        } else {
            $scope.coupontype = 2
            $scope.goodscatalogid = $scope.type
        }
        var param = {
            token: $scope.token,
            usetype: $scope.usetype,
            name: $scope.name,
            storeid: $scope.storeid,
            num: $scope.num,
            minprice: $scope.condition,
            val: $scope.money,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            strongholdid: $scope.strongholdid,
            coupontype: $scope.coupontype,
            goodscatalogid: $scope.goodscatalogid,
            flag: 'add',
            memberstatus: 1
        }
        if  ($scope.usetype == 6) {
            if (!param.name) {
                $rootScope.layerMethod.layerAlert('info','请输入优惠券名称',function () {
                });
                return
            }
            if (!param.minprice) {
                $rootScope.layerMethod.layerAlert('info','请输入满减条件',function () {
                });
                return
            }

        }
        if  ($scope.usetype == 7) {
            param.name = '运费券'
        }
        if (!param.val) {
            $rootScope.layerMethod.layerAlert('info','请输入优惠券面额',function () {
            });
            return
        }
        if (!$scope.isPositiveInteger(param.val)) {
            $rootScope.layerMethod.layerAlert('info','请输入整数面额',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        if (!param.num) {
            $rootScope.layerMethod.layerAlert('info','请输入优惠券数量',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'couponGrant/addOrEditCouponGrant','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.coupon.couponlist')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.coupon.couponlist')
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.bannerurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.bannerurl='';
        }else {
            $(i.target).parent().remove();
        }
    };
    //获取店员列表
    $scope.init();
}]);
adminApp.controller('couponedit',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.canEdit = true
        $scope.getStoreClass()
        $scope.getInfo()
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.getStoreClass = function () {
        var param={
            'type':1
        }
        $rootScope.request.getlist(baseUrl+'goodsCategory/queryOneLevelCategory','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.classList = data.data.oneLevelCategory
                $scope.classList.unshift({id: -1, name: '全场通用'})
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.getInfo = function () {
        var info = JSON.parse(window.localStorage.getItem('couponInfo'))
        // console.log((new Date()).getTime() < (new Date(info.starttime)).getTime())
        if ((new Date()).getTime() < (new Date(info.starttime)).getTime()) {
            $scope.canEdit = true
        } else {
            $scope.canEdit = false
        }
        $scope.name = info.name
        $scope.num = info.num
        $scope.condition = info.minprice
        $scope.money = info.val
        $scope.usetype = info.usetype
        if (info.coupontype === '1') {
            $scope.type = -1
        } else {
            $scope.type = info.goodscatalogid
        }
        $('#startTime').val(info.starttime)
        $('#endTime').val(info.endtime)
        $scope.couponid = info.id
    };
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime = $('#endTime').val();
        if ($scope.type == -1) {
            $scope.coupontype = 1
        } else {
            $scope.coupontype = 2
            $scope.goodscatalogid = $scope.type
        }

        var param = {
            id: $scope.couponid,
            token: $scope.token,
            usetype:  $scope.usetype,
            name: $scope.name,
            num: $scope.num,
            minprice: $scope.condition,
            val: $scope.money,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            goodscatalogid: $scope.goodscatalogid,
            coupontype: $scope.coupontype,
            flag: 'edit',
        }
        if ($scope.usetype == 6) {
            if (!param.name) {
                $rootScope.layerMethod.layerAlert('info','请输入优惠券名称',function () {
                });
                return
            }
            if (!param.minprice) {
                $rootScope.layerMethod.layerAlert('info','请输入满减条件',function () {
                });
                return
            }
        }
        if (!param.val) {
            $rootScope.layerMethod.layerAlert('info','请输入优惠券面额',function () {
            });
            return
        }
        if (!$scope.isPositiveInteger(param.val)) {
            $rootScope.layerMethod.layerAlert('info','请输入整数面额',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        if (!param.num) {
            $rootScope.layerMethod.layerAlert('info','请输入优惠券数量',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'couponGrant/addOrEditCouponGrant','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.coupon.couponlist')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.coupon.couponlist')
    };
    //上传图片
    $scope.uploadImgAjax = function (i) {
        var fileId = $(i).attr('id');
        if(!i.files[0]){
            return false
        }
        var filetype = i.files[0].type;
        var reg=/video/;
        if(filetype =='image/gif'){
            $rootScope.layerMethod.layerAlert('warning','对不起不支持gif上传',function () {
            });
            return false
        }
        if(reg.exec(filetype)){
            $rootScope.layerMethod.layerAlert('warning','请上传图片',function () {
            });
            return false
        }
        $rootScope.upFile.uploadImg(fileId, function (data) {
            App.hideMask();
            if(data.code==1000){
                if(fileId =='uploadSingle'){
                    $scope.bannerurl=data.data.imgsUrls;
                    $scope.$apply();
                    $('#'+fileId).val("");
                }
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.deleteImg=function (i,type) {
        if(type==0){
            $scope.bannerurl='';
        }else {
            $(i.target).parent().remove();
        }
    };
    //获取店员列表
    $scope.init();
}]);
adminApp.controller('vipcouponlist',  ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.usertypelist = [{id:'', name: '全部'},{id:6, name: '商品满减券'},{id:7, name: '运费券'},{id:8, name: '折扣券'}]
        $scope.statuslist = [{id:'', name: '全部'},{id:1, name: '进行中'},{id:2, name: '尚未开始'},{id:3, name: '已过期'}]
        $scope.memeberlevellist = [{id:'', name: '全部'},{id:1, name: '一级'},{id:2, name: '二级'},{id:3, name: '三级'},{id:4, name: '四级'},{id:5, name: '五级'}]
        $scope.memeberlevel = ''
        $scope.statustype = ''
        $scope.usetype = ''
        $scope.nowPage = 1
        $scope.PageSize = 10
        $scope.noMore = false
        $scope.checkAll = false
        $scope.getInfo();
    };
    // 翻页
    $scope.PrePage = function (nowpage) {
        $scope.nowPage = nowpage - 1
        if ($scope.nowPage == 0) {
            $scope.nowPage = 1
            return false
        } else {
            $scope.getInfo()
        }
    }
    $scope.NextPage = function (nowpage) {
        $scope.nowPage = nowpage + 1
        if ($scope.noMore) {
            alert('没有更多数据了')
        } else {
            $scope.getInfo()
        }
    }
    // 查询
    $scope.changeUsetype = function () {
        $scope.getInfo()
    }
    $scope.changeStatustype = function () {
        $scope.getInfo()
    }
    $scope.changeLevel = function () {
        $scope.getInfo()
    }
    $scope.doReset = function () {
        $scope.statustype = ''
        $scope.usetype = ''
        $scope.memeberlevel = ''
        $scope.getInfo();
    }
    //获取活动列表
    $scope.getInfo =function () {
        var param={
            token:$scope.token,
            strongholdid: $scope.strongholdid,
            page: $scope.nowPage,
            rows:  $scope.PageSize,
            memberstatus: 2,
            statustype: $scope.statustype,
            usetype: $scope.usetype,
            memeberlevel: $scope.memeberlevel
        }
        $rootScope.request.getlist(baseUrl+'couponGrant/queryCoupon','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.couponList
                if (data.data.couponList.length < $scope.PageSize) {
                    $scope.noMore = true
                }
                $scope.list.forEach(function(i,k){
                    i.checked = false
                    if (i.actstatus == 1) {
                        i.status = true
                    } else {
                        i.status = false
                    }
                })
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该优惠券？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted = function (id) {
        var param = {
            token: $scope.token,
            flag: 1,
            ids: id
        }
        $rootScope.request.getlist(baseUrl+'couponGrant/deleteCouponByIds','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.edit = function (i) {
        window.localStorage.setItem('vipCouponInfo', JSON.stringify(i))
        $rootScope.$state.go('^.vipcouponedit')
    }
    $scope.checkAllFunc = function () {
        if ($scope.checkAll) {
            $scope.list.forEach(function(i,k){
                i.checked = true
            })
        } else {
            $scope.list.forEach(function(i,k){
                i.checked = false
            })
        }
    }
    $scope.changeOne = function (i) {
        if (!i){
            $scope.checkAll = false
        }
    }
    $scope.init();
}]);
adminApp.controller('vipcouponadd',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.storeid = App.getCookie('storeid');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.classList = []
        $scope.type = -1
        $scope.usetype = 6
        $scope.getStoreClass()
        $scope.viplvl = []
        $scope.lvl = 1
        $scope.showTip = false
        $scope.getLevelList()
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.vilatePoint = function (e) {
        if (e.keyCode === 190) {
            $scope.showTip = true
        } else if ($scope.isPositiveInteger($scope.money)) {
            $scope.showTip = false
        } else {
            $scope.showTip = true
        }
    }
    $scope.isPositiveInteger = function(s){//是否为正整数
        var re = /^[0-9]+$/ ;
        return re.test(s)
    }
    $scope.getStoreClass = function () {
        var param={
            'type':1
        }
        $rootScope.request.getlist(baseUrl+'goodsCategory/queryOneLevelCategory','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.classList = data.data.oneLevelCategory
                $scope.classList.unshift({id: -1, name: '全场通用'})
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.getLevelList = function () {
        var param={
            'type':1
        }
        $rootScope.request.getlist(baseUrl+'couponGrant/findMemberLevel','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.viplvl = data.data.list.map(function(i){
                    var desc = ''
                    switch (i) {
                        case 1:
                            desc = '一级会员'
                            break;
                        case 2:
                            desc = '二级会员'
                            break;
                        case 3:
                            desc = '三级会员'
                            break;
                        case 4:
                            desc = '四级会员'
                            break;
                        case 5:
                            desc = '五级会员'
                            break;
                    }
                    return {id:i, desc: desc}
                })
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime = $('#endTime').val();
        if ($scope.type == -1) {
            $scope.coupontype = 1
        } else {
            $scope.coupontype = 2
            $scope.goodscatalogid = $scope.type
        }
        var param = {
            token: $scope.token,
            usetype: $scope.usetype,
            name: $scope.name,
            storeid: $scope.storeid,
            num: $scope.num,
            minprice: $scope.condition,
            val: $scope.money,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            strongholdid: $scope.strongholdid,
            coupontype: $scope.coupontype,
            goodscatalogid: $scope.goodscatalogid,
            flag: 'add',
            memeberlevel: $scope.lvl,
            memberstatus: 2
        }
        if  ($scope.usetype == 6) {
            if (!param.name) {
                $rootScope.layerMethod.layerAlert('info','请输入优惠券名称',function () {
                });
                return
            }
            if (!param.minprice) {
                $rootScope.layerMethod.layerAlert('info','请输入满减条件',function () {
                });
                return
            }

        }
        if  ($scope.usetype == 7) {
            param.name = '运费券'
        }
        if (!param.val) {
            $rootScope.layerMethod.layerAlert('info','请输入优惠券面额',function () {
            });
            return
        }
        if (!$scope.isPositiveInteger(param.val)) {
            $rootScope.layerMethod.layerAlert('info','请输入整数面额',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        if (!param.num) {
            $rootScope.layerMethod.layerAlert('info','请输入优惠券数量',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'couponGrant/addOrEditCouponGrant','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.coupon.vipcouponlist')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.coupon.vipcouponlist')
    };
    //获取店员列表
    $scope.init();
}]);
adminApp.controller('vipcouponedit',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.canEdit = true
        $scope.getStoreClass()
        $scope.viplvl = []
        $scope.lvl = 1
        $scope.getLevelList()
        $scope.getInfo()
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.vilatePoint = function (e) {
        if (e.keyCode === 190) {
            $scope.showTip = true
        } else if ($scope.isPositiveInteger($scope.money)) {
            $scope.showTip = false
        } else {
            $scope.showTip = true
        }
    }
    $scope.isPositiveInteger = function(s){//是否为正整数
        var re = /^[0-9]+$/ ;
        return re.test(s)
    }

    $scope.getStoreClass = function () {
        var param={
            'type':1
        }
        $rootScope.request.getlist(baseUrl+'goodsCategory/queryOneLevelCategory','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.classList = data.data.oneLevelCategory
                $scope.classList.unshift({id: -1, name: '全场通用'})
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.getLevelList = function () {
        var param={
            'type':1
        }
        $rootScope.request.getlist(baseUrl+'couponGrant/findMemberLevel','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.viplvl = data.data.list.map(function(i){
                    var desc = ''
                    switch (i) {
                        case 1:
                            desc = '一级会员'
                            break;
                        case 2:
                            desc = '二级会员'
                            break;
                        case 3:
                            desc = '三级会员'
                            break;
                        case 4:
                            desc = '四级会员'
                            break;
                        case 5:
                            desc = '五级会员'
                            break;
                    }
                    return {id:i, desc: desc}
                })
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.getInfo = function () {
        var info = JSON.parse(window.localStorage.getItem('vipCouponInfo'))
        // if ((new Date()).getTime() < (new Date(info.starttime)).getTime()) {
        //     $scope.canEdit = true
        // } else {
        //     $scope.canEdit = false
        // }
        $scope.name = info.name
        $scope.num = info.num
        $scope.condition = info.minprice
        $scope.money = info.val
        $scope.usetype = info.usetype
        $scope.lvl = info.memeberlevel
        if (info.coupontype === '1') {
            $scope.type = -1
        } else {
            $scope.type = info.goodscatalogid
        }
        $('#startTime').val(info.starttime)
        $('#endTime').val(info.endtime)
        $scope.couponid = info.id
    };
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime = $('#endTime').val();
        if ($scope.type == -1) {
            $scope.coupontype = 1
        } else {
            $scope.coupontype = 2
            $scope.goodscatalogid = $scope.type
        }

        var param = {
            id: $scope.couponid,
            token: $scope.token,
            usetype:  $scope.usetype,
            name: $scope.name,
            num: $scope.num,
            minprice: $scope.condition,
            val: $scope.money,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            goodscatalogid: $scope.goodscatalogid,
            coupontype: $scope.coupontype,
            flag: 'edit',
            memeberlevel: $scope.lvl
        }
        if ($scope.usetype == 6) {
            if (!param.name) {
                $rootScope.layerMethod.layerAlert('info','请输入优惠券名称',function () {
                });
                return
            }
            if (!param.minprice) {
                $rootScope.layerMethod.layerAlert('info','请输入满减条件',function () {
                });
                return
            }
        }
        if (!param.val) {
            $rootScope.layerMethod.layerAlert('info','请输入优惠券面额',function () {
            });
            return
        }
        if (!$scope.isPositiveInteger(param.val)) {
            $rootScope.layerMethod.layerAlert('info','请输入整数面额',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        if (!param.num) {
            $rootScope.layerMethod.layerAlert('info','请输入优惠券数量',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'couponGrant/addOrEditCouponGrant','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.coupon.vipcouponlist')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.coupon.vipcouponlist')
    };
    //获取店员列表
    $scope.init();
}]);



/* -------------------------------
 12.1 储蓄卡管理
 ------------------------------- */
adminApp.controller('cardlist',  ['$scope','$rootScope','$state',function($scope, $rootScope, $state) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.getInfo();
    };
    //分页信息
    //获取活动列表
    $scope.getInfo =function () {
        var param={
            token:$scope.token,
            strongholdid: $scope.strongholdid,
        }
        $rootScope.request.getlist(baseUrl+'cardtype/findCardTypeList','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.list = data.data.list
                $scope.list.forEach(function(i,k){
                    i.sttime =  Date.parse(i.starttime);
                    i.etime =  Date.parse(i.endtime);
                    i.nowtime = Date.parse(new Date());
                    if (i.nowtime < i.sttime) {
                        i.timestatus = 1
                    } else if (i.nowtime > i.etime){
                        i.timestatus = 2
                    } else {
                        i.timestatus = 3
                    }
                    i.checked = false
                    if (i.actstatus == 1) {
                        i.status = true
                    } else {
                        i.status = false
                    }
                })
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.delete = function (id) {
        $rootScope.layerMethod.layerConfirm('确定要删除该优惠券？',function () {
            $scope.doDeleted(id)
        },function () {
            console.log('取消删除')
        },'删除','再考虑一下')
    }
    $scope.doDeleted = function (id) {
        var param = {
            token: $scope.token,
            flag: 1,
            ids: id
        }
        $rootScope.request.getlist(baseUrl+'cardtype/removeCardType','POST',param).then(function (data) {
            if (data.code == 1000) {
                $scope.getInfo()
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    }
    $scope.edit = function (i) {
        window.localStorage.setItem('cardInfo', JSON.stringify(i))
        $rootScope.$state.go('^.cardedit')
    }
    $scope.init();
}]);
adminApp.controller('cardadd',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.strongholdid = App.getCookie('strongholdid')
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime = $('#endTime').val();
        var param = {
            token: $scope.token,
            money: $scope.money,
            realmoney: $scope.realmoney,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            strongholdid: $scope.strongholdid,
            flag: 'add',
        }
        if (!param.money) {
            $rootScope.layerMethod.layerAlert('info','请输入面额',function () {
            });
            return
        }
        if (!param.realmoney) {
            $rootScope.layerMethod.layerAlert('info','请输入购买金额',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'cardtype/addOrEditCardType','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.card.cardlist')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.card.cardlist')
    };
    //获取店员列表
    $scope.init();
}]);
adminApp.controller('cardedit',  ['$scope','$rootScope','$state', '$stateParams',function($scope, $rootScope, $state, $stateParams) {
    $scope.init=function(){
        $scope.token = App.getCookie('token');
        $scope.strongholdid = App.getCookie('strongholdid')
        $scope.getInfo()
    };
    $('#startTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $('#endTime').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd hh:ii:ss',
        autoclose: true,
        todayBtn: true
    });
    $scope.getInfo = function () {
        var info = JSON.parse(window.localStorage.getItem('cardInfo'))
        $scope.money = info.money
        $scope.realmoney = info.realmoney
        $('#startTime').val(info.starttime)
        $('#endTime').val(info.endtime)
        $scope.cardid = info.id
    };
    $scope.doSave = function () {
        $scope.starttime = $('#startTime').val();
        $scope.endtime = $('#endTime').val();
        var param = {
            id: $scope.cardid,
            token: $scope.token,
            money: $scope.money,
            realmoney: $scope.realmoney,
            starttime: $scope.starttime,
            endtime: $scope.endtime,
            strongholdid: $scope.strongholdid,
            flag: 'edit',
        }
        if (!param.money) {
            $rootScope.layerMethod.layerAlert('info','请输入面额',function () {
            });
            return
        }
        if (!param.realmoney) {
            $rootScope.layerMethod.layerAlert('info','请输入购买金额',function () {
            });
            return
        }
        if (!param.starttime) {
            $rootScope.layerMethod.layerAlert('info','请选择开始时间',function () {
            });
            return
        }
        if (!param.endtime) {
            $rootScope.layerMethod.layerAlert('info','请选择结束时间',function () {
            });
            return
        }
        $rootScope.request.getlist(baseUrl+'cardtype/addOrEditCardType','POST',param).then(function (data) {
            if (data.code == 1000) {
                $state.go('app.card.cardlist')
            }else if(data.code == 1009){
                $rootScope.layerMethod.layerAlert('info',data.message,function () {
                    $state.go('account.login')
                });
            }else {
                $rootScope.layerMethod.layerAlert('info',data.message,function () {});
            }
        })
    };
    $scope.doCancel = function () {
        $state.go('app.card.cardlist')
    };
    //获取店员列表
    $scope.init();
}]);
