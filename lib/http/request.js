/**
 * request.js
 * @author:yinyong@sogou-inc.com
 * @version 0.0.1
 */

 

var _request_proto = {
    /**
     * 获取参数
     * @param  {String} key [description]
     * @return {String}     [description]
     */
    param:function(key){
        return this.body[key];
    }
};

var Request=function(request){
    this.request=request;
};

Request.prototype=_request_proto;

module.exports=Request;