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
    get:function (key) {
        try {
            var content = fs.readFileSync('.'+path.sep+'manifest.json', {
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