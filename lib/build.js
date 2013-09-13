/**
 * build.js
 * This file MUST NOT be used in server.
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */

var fs = require('fs');
var config = require('./config');
var systemPath = require('path');
var sysUrl = require('url');
var mkdirp = require('mkdirp');
var filter = require('./filter');
var swig = require('swig');
var utils = require('./utils');
var execSync = require('exec-sync');


var YCPATH = systemPath.join(__dirname, "/../cli/yuicompressor.jar");
var RJSPATH = systemPath.join(__dirname, "/../cli/r.js");
var RPLJSPATH = systemPath.join(__dirname, "/../cli/rpl.js"); //@todo

var timeStampName=config.get("timestamp_name") || "t" ;

/**
 * 各种替换
 */
var Stamp={
    /**
     * 替换HTML文件中的相对链接
     * @param  {[type]} content [description]
     * @param  {[type]} reg     [description]
     * @return {[type]}         [description]
     */
        _addToHtmlCommon: function(content,reg,res_path) {
        if (typeof content !== 'string' || !content || content.constructor !== String) {
            console.log("HTML content must be a non-empty string".warn);
            return content;
        }

        return content.replace(reg, function(k) {
            //取出文件路径
            var urlBeforeReplace=RegExp.$2;

            var url=filter(urlBeforeReplace);

            var parsedUrl = sysUrl.parse(url, true);

            //有协议的或//开头的(相当于有协议)的不添加时间戳
            if(parsedUrl.protocol||/^\/\//.test(url))
            {
                console.log("%s may be in another server,no timestamp will be added.".warn,url);
                return k;
            }
            //从build里获取静态资源，因为这里的静态资源是生成好的，时间戳准确
            var filePath=systemPath.join(res_path,parsedUrl.pathname);

            var timeStamp="";
            if(!fs.existsSync(filePath)){
                console.log("%s does not exist but added to html".warn,filePath);
            }else{
                timeStamp = utils.getTimeStamp(filePath);
            }
            
            //以t做参数，已存在则不添加
            if (undefined === parsedUrl.query[timeStampName]) {
                //判断是否已经有GET参数
                if (parsedUrl.search) {
                    return k.replace(urlBeforeReplace, urlBeforeReplace + "&" + timeStampName + "=" + timeStamp );
                } else {
                    return k.replace(urlBeforeReplace, urlBeforeReplace + "?" + timeStampName + "=" + timeStamp );
                }
            } else {
                console.log( "%s may already have a timeStamp".warn,parsedUrl.pathname);
            }
            return k;

        });
    },
    /**
     * 向HTML代码中的link添加时间戳。
     * @param {[String]} content HTML代码
     * @return {[String]} 添加完时间戳后的代码
     */
    addToHtmlLink: function(content) {
        var linkReg = /<link.* href=(['"])(.*?\.css.*?)\1/img;
        return this._addToHtmlCommon(content, linkReg,"./build/");
    },
    /**
     * 向HTML代码中的script添加时间戳。
     * @param {[String]} content HTML代码
     * @return {[String]} 添加完时间戳后的代码
     */
    addToHtmlScript:function(content){
        var scriptReg=/<script.* src=(['"])(.*?\.js.*?)\1/img;
        return this._addToHtmlCommon(content,scriptReg,"./build/");
    },
    /**
     * 向CSS代码中的图片URL添加链接。
     * @param {[String]} content CSS代码内容
     * @param {[String]} baseDir CSS的目录，因为图片资源的路径是相对于CSS文件的。
     * @return {[String]} 添加完时间戳后的代码
     */
    addToCssUrl:function(content,baseDir){
        if (typeof content !== 'string' || !content || content.constructor !== String) {
            console.log("content must be a non-empty string".warn);
            return content;
        }
        return content.replace(/url\(['"]?(.*?)['"]?\)/img, function(k) {
            //取出url
            var urlBeforeReplace = RegExp.$1;//k.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");
            //重要：
            //类似@img_prefix@/static/img/s.png之类的
            //路径在替换前后都可能找不到因而不能计算时间戳，
            //但是应用无project的filter是利用manifest.json中
            //对象的直接变量进行替换，应该可能找到源文件。
            var url=filter(urlBeforeReplace);

            //解析URL获取GET参数
            var parsedUrl = sysUrl.parse(url, true);

            //带协议的、about:blank或者是图片base64的均不加时间戳
            if (parsedUrl.protocol || /(^about:blank|^data:image|^\/\/)/i.test(url)) {
                console.log("%s won't add timeStamp".warn, url);
                return k;
            }

            //图片途径相对于CSS文件
            var imgFilePath=systemPath.join(baseDir, parsedUrl.pathname);

            //计算时间戳，文件不存在则置空
            var timeStamp = "";
            if (fs.existsSync(imgFilePath))
                timeStamp = utils.getTimeStamp(imgFilePath);
            else
                console.log("%s does not exist but has been added to css.".warn,imgFilePath)

                //以t做参数，已存在则不添加
            if (undefined === parsedUrl.query[timeStampName]) {
                //判断是否已经有GET参数
                if (parsedUrl.search) {
                    return "url(" + urlBeforeReplace + "&"+ timeStampName +"=" + timeStamp + ")";
                } else {
                    return "url(" + urlBeforeReplace + "?"+ timeStampName +"=" + timeStamp + ")";
                }
            } else {
                console.log( "%s may already have a timeStamp".warn,url );
            }
            return k;
        });
    }
};

/**
 * [makeCss description]
 * @param  {[type]} project  [description]
 * @param  {[type]} compress [description]
 */
function makeCss(project,compress) {
    console.log("Handling css files...".info);
    var cssFiles = config.get('require_css_modules') || [];
    var buildCssPath = "./build/static/css/";

    cssFiles.forEach(function(file, index) {
        //配置文件中文件名相对于static/css/目录，并且不包括不包含
        //扩展名，这里要构建完整路径。
        var source = systemPath.join("./static/css", file + ".css");

        //不存在则跳过
        if (!fs.existsSync(source)) {
            console.error(source + ' does not exist'.error);
            return;
        }
        //仅创建必要目录
        if (!fs.existsSync(buildCssPath)) {
            mkdirp.sync(buildCssPath);
        }
        var target = systemPath.join(buildCssPath, file + ".css");
        //首先合并
        execSync('node ' + RJSPATH + ' -o cssIn=' + source + ' out=' + target);
        //读取文件过滤处理
        var content = fs.readFileSync(target, 'utf-8');
        //加时间戳
        content = Stamp.addToCssUrl(content,systemPath.dirname(target));
        //替换
        content=filter(content,project);

        fs.writeFileSync(target, content);
        if (compress) {
            //最后压缩
            execSync('java -jar ' + YCPATH + ' --type css --charset utf-8 ' + target + ' -o ' + target);
        }

    });

    console.log("css files done.".info);
}

/**
 * [makeJs description]
 * @param  {[type]} project  [description]
 * @param  {[type]} compress [description]
 */
function makeJs(project,compress) {

    console.log("Handling javascript files...".info);

    var jsFiles = config.get('require_js_modules') || [];
    var buildJsPath = "./build/static/js/";

    jsFiles.forEach(function(file, index) {

        var source = systemPath.join("./static/js/", file + ".js");
        //不存在则跳过
        if (!fs.existsSync(source)) {
            console.error(source + ' does not exist'.error);
            return;
        }

        //仅创建必要目录
        if (!fs.existsSync(buildJsPath)) {
            mkdirp.sync(buildJsPath);
        }
        var target = systemPath.join(buildJsPath, file + ".js");
        //先合并
        execSync('node ' + RJSPATH + ' -o name=' + source + ' out=' + target + ' optimize=none');

        var content = fs.readFileSync(target, 'utf-8');
        content = filter(content,project);
        //@todo:js有其它过滤需求么
        fs.writeFileSync(target, content);

        if (compress) {
            execSync('java -jar ' + YCPATH + ' --type js --charset utf-8 ' + target + ' -o ' + target);
        }

    });
    console.log("javascript files done.".info);

}

/**
 * [makeHtml description]
 * @param  {[type]} project [description]
 * @todo 处理
 */
function makeHtml(project) {
    console.log("Handling html files...".info);
    var htmlFiles = config.get('require_html_modules') || [];
    var buildHtmlPath="./build/html/"
    var buildTplPath="./build/tpl/";

    htmlFiles.forEach(function(file, index) {
        //get source tpl files from ./built/tpl!--I cannot switch to Sogou IME in Sublime on my Deepin Linux,SHIT.
        var source =systemPath.join(buildTplPath ,file + "."+config.templateSuffix);
        if(!fs.existsSync(source)){
            console.error(source +"does not exist".error);
            return;
        }
      
        var target =systemPath.join( buildHtmlPath ,file + ".html");
       
        //Create its dir.
        if(!fs.existsSync(systemPath.dirname(target)))
        {
            mkdirp.sync(systemPath.dirname(target));
        }

        var dataFile =systemPath.join(config.dataDir, file + ".json");

        var data = {};
        try {
            data = JSON.parse(fs.readFileSync(dataFile,"utf-8").replace(/\/\*[\S\s]*?\*\//g,''));
        } catch (e) {
            console.warn("%s read failed:%s".warn,dataFile,e);
        }

        var _token=file.replace(/(^\/*|\.\w*$)/g,"").replace(/\//g,'_');
        var tokens=_token.split('_');
        var _folder=tokens[0];
        var _subtoken=tokens.length>0?tokens[1]:"";
        
        data._token=data._token||_token
        data._folder=data._folder||_folder
        data._subtoken=data._subtoken||_subtoken

        var content = utils.renderFile(data, source);
        content=Stamp.addToHtmlLink(content);
        content=Stamp.addToHtmlScript(content);
        content=Stamp.addToCssUrl(content,".");
        //I have to do the filter at last,because of the path detect
        content=filter(content,project);
        fs.writeFileSync(target, content);
    });

    console.log("html files done.".info);
}

/**
 * Make templates
 */
function makeTpl(project)
{   
    var tplBuildDir="./build/tpl/"
    var tpls=[];
    console.log("Handling templates...".info);
    //
    utils.walkSync(tplBuildDir,tpls);

    tpls.forEach(function(tpl,index){
        console.log(tpl);
        var content=fs.readFileSync(tpl,'utf-8');
        content=Stamp.addToHtmlLink(content);
        content=Stamp.addToHtmlScript(content);
        content=Stamp.addToCssUrl(content,".");
        content=filter(content,project);
        fs.writeFileSync(tpl, content);
    });

    console.log("templates done.");
}

/**
 * 生成工程。全部使用了同步方法。
 * 
 * 对静态文件的处理是：直接生成必要的文件到./build/static下，
 * 避免不必要的文件拷贝输出。
 *
 * 对于模板文件，要完整拷贝一份到./build下。
 *
 * 如果要生成html文件，直接使用./template下源文件进行
 * 生成，保存到./build/html中。
 * 
 * @param  {[String|null]} project  定义在manifest.json中的项目
 * @param  {[Boolean]} compress 是否压缩js和css
 * @param  {[Boolean]} html     是否生成html
 */
module.exports = function(project, compress, html) {

    var noLackFile = [config.manifestFile, config.templateDir, config.staticDir, config.dataDir];
    for (var i = 0; i < noLackFile.length; ++i) {
        if (!fs.existsSync(noLackFile[i])) {
            console.error(noLackFile[i] + " does not exist! Build failed!".error);
            return;
        }
    }

    //@todo:MS Windows cannot work
    execSync("rm -rf ./build");
    execSync("mkdir ./build");
    execSync("cp -R ./static ./build/");//拷贝整个静态文件目录
    execSync("rm -rf ./build/js/*");//先删除，等后续生成必要文件时才创建
    execSync("rm -rf ./build/css/*");//先删除，等后续生成必要文件时才创建
    execSync("cp -R ./template ./build/tpl");//拷贝模板文件目录

    //顺序很重要：先压缩静态文件
    makeCss(project,compress);
    makeJs(project,compress);
    makeTpl(project);

    if (html) {
        makeHtml(project);
    }

    console.log("All done".info);

};