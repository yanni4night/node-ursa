/**
 * handler.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */
var fs = require("fs");
var swig = require('swig');
var mime = require('mime');
var systemPath = require('path');
var config = require('./config');
var utils=require('./utils');

//Important:禁止缓存
swig.setDefaults({ cache: false });
 
 function renderFile(data, file) {
    var tpl = swig.compileFile(file);
    return tpl(data);
 }

module.exports={
    /**
     * 显示模板列表
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     */
    index:function(req,res){
        var htmlFiles = config.get('require_html_modules') || [];

        //Index page
       var indexFile=systemPath.join(__dirname,"..","template/index.tpl");


        htmlFiles.forEach(function(file, index) {
            var realPath = systemPath.join(config.templateDir, file+".tpl");
            if (!fs.existsSync(realPath)) {
                console.warn(realPath+" does not exist".warn);
                htmlFiles.splice(index, 1);
            } else {
                htmlFiles[index] = file;//realPath.replace(systemPath.join(".",config.templateDir),"");
            }
        });

       return res.send(new Buffer(renderFile({tpls:htmlFiles},indexFile)));
    },

    /**
     * 处理后缀ut的请求，输出模板。
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     */
    tpl:function(req,res){
        var url=req.url;
        var tplFile=systemPath.join(config.templateDir,url.replace(/ut$/,config.templateSuffix));
        var dataFile=systemPath.join(config.dataDir,url.replace(/ut$/,'json'));
        if(!fs.existsSync(tplFile)){
            return res.send(404,tplFile+" does not exist!");
        }

        console.log(tplFile.debug);
        console.log(dataFile.debug);
        var data={};
        try{
            data=JSON.parse(fs.readFileSync(dataFile,'utf-8'));
        }catch(e){
            console.error(dataFile+" is not a JSON file.".error);
        }
        var ret="Render file failed:"+tplFile;
        try{
            ret=renderFile(data,tplFile);
        }catch(e){
            console.error(String(e).error);
        }

        return res.send(ret);
    },
    /**
     * 输出模板数据，以供修改.
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     */
    m: function(req, res) {
        var pathname = req.pathname;
        var dataFile =systemPath.join(config.dataDir,pathname.replace(/m$/, 'json'));
        //Index page
       var mgrFile= systemPath.join(__dirname,"../","template/mgr.tpl");

        return fs.readFile(dataFile, function(err, content) {
            content = content || "";
            return res.send(renderFile({
                data: content,
                tpl: systemPath.join(".",pathname.replace(/m$/, 'json'))
            },mgrFile));
        });

    },
    /**
     * 保存提交来的json数据。
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
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
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     */
    none:function(req,res){
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
                        //Stat
                        return fs.stat(file,function(err,stat){
                            if(err){
                                return res.send(500,file+" cannot be stated");
                            }else{
                                return res.send({
                                    'Content-Type': contentType,
                                    'Content-Length': stat.size
                                },content);
                            }
                        });
                    }
                 });
            }else {
                 return res.send(404,file+' not found!')
            }
        });
    }
};