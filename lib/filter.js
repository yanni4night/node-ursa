/**
 * filter.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */
var config = require("./config");

module.exports = function(content, file) {
    //替换@@
    return content.replace(/@(.*?)@/g, function(key) {
        var r = key.replace(/@/g, '');
        if ('date' === r) {
            return +new Date;
        }
        return config.get(r) || key;
    });
};