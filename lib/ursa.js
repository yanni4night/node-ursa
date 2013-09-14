/**
 * ursa.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */

var systemUrl=require('url');
var server=require("./http/server");
var handler=require("./handler");
var Request=require("./http/request");
var Response=require("./http/response");

var _ursa={
    routers:[],
    listen:function(port){
        var self=this;
        //todo:ugly
        return server.run(port,function(req,res){self._route.call(self,req,res)});
    },
    _route:function(req,res){
        var pathname=req.pathname;
        var routersLen=this.routers.length;
        for(var i=0;i<routersLen;++i){
            var router=this.routers[i];
            //忽略参数，直接比较pathname
            if(router.pattern.constructor==RegExp){
                var tested=router.pattern.test(pathname);
            }else{
                var tested=(router.pattern===pathname);
            }

            if(tested){
                //todo:仅支持单拦截器
                return router.handler(req,res);
            }
        }
        //未有任何拦截
        return handler.none(req,res);
    },
    /**
     * 注册路由回调，不区分GET和POST。
     * @param  {[RegExp|String]}   path     [description]
     * @param  {Function} handler [description]
     */
    register:function(path,handler){
        if (!path||!(path.constructor==RegExp||typeof path==='string'||path.constructor==String)) {
            console.error("path must be a regexp or a string");
            return false;
        }
        this.routers.push({
            pattern:path,
            handler:handler
        });
        return true;
    }
};

//注册路由
_ursa.register('/',handler.index);
_ursa.register(/\.ut$/,handler.tpl);
_ursa.register(/\.m$/,handler.m);
_ursa.register(/data\.so$/,handler.data_so);

module.exports.getInstance=function(){
    return _ursa;
};