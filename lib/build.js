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
var Stamp = require('./tool/timestamp');
var Render = require('./tool/render');
var execSync = require('exec-sync');


var YCPATH = systemPath.join(__dirname, "/../cli/yuicompressor.jar");
var RJSPATH = systemPath.join(__dirname, "/../cli/r.js");
var RPLJSPATH = systemPath.join(__dirname, "/../cli/rpl.js"); //@todo

var timeStampName=config.get("timestamp_name") || "t" ;

/**
 * [makeCss description]
 * @param  {[type]} project  [description]
 * @param  {[type]} compress [description]
 */
function makeCss(project,compress) {
    console.log("Handling css files...".info);
    var cssFiles = config.get('require_css_modules') || [];

    if(Object.prototype.toString.apply(cssFiles)!=='[object Array]')
    {
        cssFiles=[];
        //如果cssFiles未定义或不合法，搜索所有样式表文件。
        utils.walkSync("./static/css",cssFiles);
    }

    var buildCssPath = "./build/static/css/";

    var stamp=new Stamp("./build");

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
        content = stamp.addToCssUrl(content,systemPath.dirname(target));
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
    
    //require_modules 用于兼容 https://github.com/sogou-ufo/ursa 工程
    if(undefined!==config.get('require_modules'))
    {
        console.warn("[DEPRECATED]you should use require_js_modules instead of require_modules.".warn);
    }

    var jsFiles = config.get('require_modules')||config.get('require_js_modules') || [];

    //检查是否是数组
    if(Object.prototype.toString.apply(jsFiles)!=='[object Array]')
    {
        jsFiles=[];//jsFiles 必须由用户定义，默认不搜索所有脚本文件！
    }

    var buildJsPath = "./build/static/js/";

    jsFiles.forEach(function(file, index) {

        var source = systemPath.join("./static/js/", file + ".js");
        //不存在则跳过
        if (!fs.existsSync(source)) {
            console.error('[NOTFOUND]%s does not exist.'.error,source);
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

    var htmlFiles = config.get('require_html_modules') ;
    if(Object.prototype.toString.apply(htmlFiles)!=='[object Array]')
    {
        //如果htmlFiles未定义或不合法，搜索所有模板。
        htmlFiles=[];
        utils.walkSync(config.templateDir,htmlFiles);
    }

    var buildHtmlPath="./build/html/"
    var buildTplPath="./build/template/";
    var stamp=new Stamp('./build');

    htmlFiles.forEach(function(file, index) {
        var target =systemPath.join( buildHtmlPath ,file + ".html");
         if(!fs.existsSync(systemPath.dirname(target)))
        {
            mkdirp.sync(systemPath.dirname(target));
        }

        var render=new Render('./build/template/');
        var content=render.render(file);
        content=stamp.addToHtmlLink(content);
        content=stamp.addToHtmlScript(content);
        content=stamp.addToCssUrl(content,".");
        //I have to do the filter at last,because of the path detect
        content=filter(content,project);
        fs.writeFileSync(target, content);
        return;
    });

    console.log("html files done.".info);
}

/**
 * Make templates
 */
function makeTpl(project)
{   
    var tplBuildDir="./build/template/"
    var tpls=[];
    var stamp=new Stamp("./build");
    console.log("Handling templates...".info);
    //
    utils.walkSync(tplBuildDir,tpls);

    tpls.forEach(function(tpl,index){
        console.log(tpl);
        var content=fs.readFileSync(tpl,'utf-8');
        content=stamp.addToHtmlLink(content);
        content=stamp.addToHtmlScript(content);
        content=stamp.addToCssUrl(content,".");
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
            console.error("%s does not exist! Build failed!".error,noLackFile[i] );
            return;
        }
    }

    //@todo:MS Windows cannot work
    execSync("rm -rf ./build");
    execSync("mkdir ./build");
    execSync("cp -R ./static ./build/");//拷贝整个静态文件目录
    execSync("rm -rf ./build/js/*");//先删除，等后续生成必要文件时才创建
    execSync("rm -rf ./build/css/*");//先删除，等后续生成必要文件时才创建
    execSync("cp -R ./template ./build/");//拷贝模板文件目录

    //顺序很重要：先压缩静态文件
    makeCss(project,compress);
    makeJs(project,compress);
    makeTpl(project);

    if (html) {
        makeHtml(project);
    }

    console.log("All done".info);

};