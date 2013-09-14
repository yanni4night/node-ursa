/**
 * build.js
 * This file MUST NOT be used in server.
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */

var fs = require('fs');
var config = require('./config');
var sysPath = require('path');
var sysUrl = require('url');
var mkdirp = require('mkdirp');
var filter = require('./filter');
var swig = require('swig');
var utils = require('./utils');
var util = require('util');

var Stamp = require('./tool/timestamp');
var Render = require('./tool/render');
var execSync = require('exec-sync');


var YCPATH = sysPath.join(__dirname, "/../cli/yuicompressor.jar");
var RJSPATH = sysPath.join(__dirname, "/../cli/r.js");
var RPLJSPATH = sysPath.join(__dirname, "/../cli/rpl.js"); //todo

var timeStampName = config.get("timestamp_name") || "t";

/**
 * [makeCss description]
 * @param  {[type]} project  [description]
 * @param  {[type]} compress [description]
 */

function makeCss(project, compress) {
    console.log("[INFO]Handling CSS files.".info);
    var cssFiles = config.get('require_css_modules') || [];

    if (!util.isArray(cssFiles)) {
        cssFiles = [];
        //如果cssFiles未定义或不合法，搜索所有样式表文件。
        utils.walkSync("./static/css", cssFiles);
    }

    var buildCssPath = "./build/static/css/";

    var stamp = new Stamp("./build");

    cssFiles.forEach(function(file, index) {
        //配置文件中文件名相对于static/css/目录，并且不包括不包含
        //扩展名，这里要构建完整路径。
        var source = sysPath.join("./static/css", /\.css$/i.test(file) ? file : (file + ".css"));

        console.log("Compiling %s".data,source);
        //不存在则跳过
        if (!fs.existsSync(source)) {
            console.error(source + ' does not exist'.error);
            return;
        }

        var target = sysPath.join(buildCssPath, /\.css$/i.test(file) ? file : (file + ".css"));
        //仅创建必要目录
        if (!fs.existsSync(sysPath.dirname(target))) {
            mkdirp.sync(sysPath.dirname(target));
        }
        //首先合并
        execSync('node ' + RJSPATH + ' -o cssIn=' + source + ' out=' + target);
        //读取文件
        var content = fs.readFileSync(target, 'utf-8');
        //加时间戳
        content = stamp.addToCssUrl(content, sysPath.dirname(target));
        //替换/过滤处理
        content = filter(content, project);

        fs.writeFileSync(target, content);
        if (compress) {
            //最后压缩
            execSync('java -jar ' + YCPATH + ' --type css --charset utf-8 ' + target + ' -o ' + target);
        }

    });

    console.log("[INFO]CSS files done.".info);
}

/**
 * [makeJs description]
 * @param  {[type]} project  [description]
 * @param  {[type]} compress [description]
 */

function makeJs(project, compress) {

    console.log("[INFO]Handling javascript files.".info);

    //require_modules 用于兼容 https://github.com/sogou-ufo/ursa 工程
    if (undefined !== config.get('require_modules')) {
        console.warn("[DEPRECATED]you should use require_js_modules instead of require_modules.".warn);
    }

    var jsFiles = config.get('require_modules') || config.get('require_js_modules') || [];

    //检查是否是数组
    if (!util.isArray(jsFiles) ) {
        jsFiles = []; //jsFiles 必须由用户定义，默认不搜索所有脚本文件！
    }

    var buildJsPath = "./build/static/js/";

    jsFiles.forEach(function(file, index) {

        var source = sysPath.join("./static/js/", /\.js/i.test(file) ? file : (file + ".js"));

        console.log("Compiling %s".data,source);
        //不存在则跳过
        if (!fs.existsSync(source)) {
            console.error('[NOTFOUND]%s does not exist.'.error, source);
            return;
        }

        var target = sysPath.join(buildJsPath, /\.js/i.test(file) ? file : (file + ".js"));
        //仅创建必要目录
        if (!fs.existsSync(sysPath.dirname(target))) {
            mkdirp.sync(sysPath.dirname(target));
        }
        //先合并
        execSync('node ' + RJSPATH + ' -o name=' + source + ' out=' + target + ' optimize=none');

        var content = fs.readFileSync(source, 'utf-8');
        content = filter(content, project);
        //todo:js有其它过滤需求么
        fs.writeFileSync(target, content);

        if (compress) {
            execSync('java -jar ' + YCPATH + ' --type js --charset utf-8 ' + target + ' -o ' + target);
        }

    });
    console.log("[INFO]JavaScript files done.".info);

}

/**
 * [makeHtml description]
 * @param  {[type]} project [description]
 * @todo 处理
 */

function makeHtml(project) {
    console.log("[INFO]Handling html files.".info);

    var htmlFiles = config.get('require_html_modules');
    if (!util.isArray(htmlFiles)) {
        //如果htmlFiles未定义或不合法，搜索所有模板。
        htmlFiles = [];
        utils.walkSync(config.templateDir, htmlFiles);
    }

    var buildHtmlPath = "./build/html/"
    var buildTplPath = "./build/template/";
    var stamp = new Stamp('./build');

    htmlFiles.forEach(function(file, index) {

        var fileName=/\.html$/i.test(file)?file:(file + ".html");

        console.log("Compiling %s".data,fileName);

        var target = sysPath.join(buildHtmlPath, fileName);
        if (!fs.existsSync(sysPath.dirname(target))) {
            mkdirp.sync(sysPath.dirname(target));
        }

        var render = new Render(buildTplPath);//buildTplPath IS the source dir
        var content = render.render(file);
        fs.writeFileSync(target, content);
        return;
    });

    console.log("[INFO]Html files done.".info);
}

/**
 * Make templates
 */

function makeTpl(project) {
    console.log("[INFO]Handling templates.".info);
    var tplBuildDir = "./build/template/"
    var tpls = [];
    var stamp = new Stamp("./build");

    //
    utils.walkSync(tplBuildDir, tpls);

    tpls.forEach(function(tpl, index) {
        console.log("Compiling %s".data,tpl);
        var content = fs.readFileSync(tpl, 'utf-8');
        content = stamp.addToHtmlLink(content);
        content = stamp.addToHtmlScript(content);
        content = stamp.addToCssUrl(content, ".");
        content = filter(content, project);
        fs.writeFileSync(tpl, content);
    });

    console.log("[INFO]Templates done.".info);
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
            console.error("[FATAL]%s does not exist! Build failed!".error, noLackFile[i]);
            return;
        }
    }

    var startTime=process.hrtime();
    console.log("[INFO]Copy files.".info);

    execSync("rm -rf ./build");
    execSync("mkdir ./build");
    execSync("cp -R ./static ./build/"); //拷贝整个静态文件目录
    execSync("rm -rf ./build/static/js"); //先删除，等后续生成必要文件时才创建
    execSync("rm -rf ./build/static/css"); //先删除，等后续生成必要文件时才创建
    execSync("cp -R ./template ./build/"); //拷贝模板文件目录

    if(config.get("always_add_timestamp")){
        console.warn("[WARN]You set always_add_timestamp to TRUE.".warn);
    }

    //顺序很重要：先压缩静态文件
    makeCss(project, compress);
    makeJs(project, compress);
    makeTpl(project);

    if (html) {
        makeHtml(project);
    }

    var diff=process.hrtime(startTime);
    console.log("[INFO]All done.Cost %ds.".info,(diff[0]+diff[1]/1e9));

};