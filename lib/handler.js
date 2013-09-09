/**
 * handler.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */
var fs = require("fs");
var mime = require('mime');
var systemPath = require('path');
var config = require('./config');
var utils=require('./utils');


module.exports={
    /**
     * 显示模板列表
     * @param  {[Request]} req [description]
     * @param  {[Response]} res [description]
     * @see ./http/Request
     * @see ./http/Response
     */
    index:function(req,res){
        var htmlFiles = config.get('require_html_modules') || [];

        //Index page
       var indexFile=systemPath.join(__dirname,"../","template/index.tpl");


        htmlFiles.forEach(function(file, index) {
            var realPath = systemPath.join(config.templateDir, file+"."+config.templateSuffix);
            if (!fs.existsSync(realPath)) {
                console.warn("%s does not exist".warn ,realPath);
                htmlFiles.splice(index, 1);
            } else {
                htmlFiles[index] = file;//realPath.replace(systemPath.join(".",config.templateDir),"");
            }
        });

       return res.send(utils.renderFile({tpls:htmlFiles},indexFile));
    },

    /**
     * 处理后缀ut的请求，输出模板。
     * @param  {[Request]} req [description]
     * @param  {[Response]} res [description]
     * @see ./http/Request
     * @see ./http/Response
     */
    tpl:function(req,res){
        var startTime=+new Date;
        var url=req.url;
        var tplFile=systemPath.join(config.templateDir,url.replace(/ut$/,config.templateSuffix));
        var dataFile=systemPath.join(config.dataDir,url.replace(/ut$/,'json'));
        if(!fs.existsSync(tplFile)){
            return res.send(404,tplFile+" does not exist!");
        }

        var data={};
        try{
            //支持_data注释
            data=JSON.parse(fs.readFileSync(dataFile,'utf-8').replace(/\/\*[\s\S]*?\*\//g,''));
        }catch(e){
             console.warn("%s read failed".warn,dataFile);
        }
        var ret="Render file failed:"+tplFile;
        try{
            ret=utils.renderFile(data,tplFile);
        }catch(e){
            console.error(String(e).error);
        }

        res.send(ret);
        console.log("200 %s %dbytes %dms".info,tplFile,ret.length,new Date-startTime);
        return ;
    },
    /**
     * 输出模板数据，以供修改.
     * @param  {[Request]} req [description]
     * @param  {[Response]} res [description]
     * @see ./http/Request
     * @see ./http/Response
     */
    m: function(req, res) {
        var pathname = req.pathname;
        var dataFile =systemPath.join(config.dataDir,pathname.replace(/m$/, 'json'));
        //Index page
       var mgrFile= systemPath.join(__dirname,"../","template/mgr.tpl");

        return fs.readFile(dataFile, function(err, content) {
            content = content || "";
            return res.send(utils.renderFile({
                data: content,
                tpl: systemPath.join(".",pathname.replace(/m$/, 'json'))
            },mgrFile));
        });

    },
    /**
     * 保存提交来的json数据。
     * @param  {[Request]} req [description]
     * @param  {[Response]} res [description]
     * @see ./http/Request
     * @see ./http/Response
     */
    data_so:function(req,res){
        if(req.method!=='POST')
        {
            return res.send(405,"GET is not supported");
        }
        var tpl=req.body.tpl;
        var data=req.body.data;

        if(!tpl||!data){
            return res.send("Lack of parameters!");
        }

        //校验格式
        try {JSON.parse(data)} catch (e) {  
            return res.send("JSON failure");
        };
        //写入文件
        return fs.writeFile(systemPath.join(config.dataDir,tpl),data,function(err){
            if(err){
                return res.send("Save failed");
            }else{
                return res.redirect('/');
            }
        });
    },
    /**
     * 处理其它请求，如图片、脚本、样式表
     * @param  {[Request]} req [description]
     * @param  {[Response]} res [description]
     * @see ./http/Request
     * @see ./http/Response
     */
    none:function(req,res){
        var startTime=+new Date;
        var pathname=req.pathname;
        var file=systemPath.join(".",pathname);

        //Check exists
       return fs.exists(file,function(exists){
            if(exists)
            {
                 var contentType=mime.lookup(file);
                 //Read file
                return  fs.readFile(file,function(err,content){
                    if(err)
                    {
                        return res.send(500,file+" cannot be read");
                    }else{
                         res.send({
                                    'Content-Type': contentType,
                                    'Content-Length': content.length
                                },content);

                        console.log("200 %s %dbytes %dms".info,pathname,content.length,+new Date-startTime);
                        return;
                    }
                 });
            }else {
                 return res.send(404,file+' not found!')
            }
        });
    }
};