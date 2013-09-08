/**
 * config.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */

var fs=require("fs");
var path=require("path");

var _config={
    templateDir:"."+path.sep+"template",
    staticDir:"."+path.sep+"static",
    dataDir:"."+path.sep+"_data",
    templateSuffix:"tpl",
    accessSuffix:"ut",
    manifestFile:"./manifest.json",

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
    get:function (key,proj) {
        try {
            var content = fs.readFileSync(_config.manifestFile, {
                encoding: 'utf-8'
            });
            var json=JSON.parse(content);
            return proj?(json[proj]?json[proj][key]:undefined):json[key];
        } catch (e) {
            console.error(e);
        }

    }
};

module.exports=_config;