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
     * 同步方法，实时从manifest中获取配置信息
     * @param  {[String]} key [description]
     * @return {[String|Array|Number]}     [description]
     */
    get:function (key) {
        try {
            var content = fs.readFileSync(_config.manifestFile, {
                encoding: 'utf-8'
            });
            var json=JSON.parse(content);
            content
            return json[key];
        } catch (e) {
            console.error(e);
        }

    }
};

module.exports=_config;