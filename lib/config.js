/**
 * config.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */

var fs = require("fs");
var path = require("path");
var utils = require("./utils");
//var logger=require("./tool/logger");

var _config = {
    templateDir: "." + path.sep + "template",
    staticDir: "." + path.sep + "static",
    dataDir: "." + path.sep + "_data",
    templateSuffix: "tpl",
    accessSuffix: "ut",
    manifestFile: "./manifest.json",

    /**
     * 同步方法，实时从manifest中获取配置信息。
     * 如果proj为空，从直接对象中取值，否则在其子对象中取值，如：
     * <code>
     * {
     *     "static_prefix":".",
     *     "online":{
     *         "static_prefix":"../"
     *     }
     * }
     * </code>
     *
     * 则get("static_prefix")=="."，而get("static_prefix","online")=="../"。
     * 搜索不到则返回undefined。
     *
     * @param  {[String]} key 配置名称
     * @param  {[String]} proj 搜索位置
     * @return {[Object]}     配置值
     */
    get: function(key, proj) {
        if (!utils.isString(key)) {
            console.error("key MUST BE a string,but it's a %s".error, typeof key);
            return;
        }

        try {
            var content = fs.readFileSync(_config.manifestFile, {
                encoding: 'utf-8'
            }).replace(/\/\*[\s\S]*?\*\//g, ""); //去除注释
            //console.log(content)
            var json = JSON.parse(content);
            //从里向外搜索
            return proj ? (json[proj] ? json[proj][key] : undefined) : json[key];
        } catch (e) {
            console.error("[EMERGENCY]config-get:%s\r\nPlease check your manifest.json.".error, e);
        }

    }
};

module.exports = _config;