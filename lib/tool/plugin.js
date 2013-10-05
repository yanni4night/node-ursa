/**
 * plugin.js
 *
 * @author yinyong#sogou-inc.com
 * @version 0.01
 */
var util = require('util'),
    sysPath = require('path'),
    config = require('../config'),
    utils = require('../utils'),
    logger = require('./logger');

module.exports = {
    /**
     * 将HTML模板通过插件处理链，无效插件自动忽略，不影响处理流程
     *
     * @param {String} token 模板的唯一标识，相对于template_dir,无后缀
     * @param {String} content 要处理的HTML模板内容
     * @return {String} 处理后的HTML模板内容 
     */
    compilePlugins: function(token, content) {
        var plugins = config.get("serverplugins");
        util.isArray(plugins) && plugins.forEach(function(plugin, index) {
            //plugin名称可以带的js会被忽略
            try {
                //check type
                if(!utils.isString(plugin))
                    throw new Error("plugin MUST BE a string,but it's a "+(typeof plugin));
                content = require(sysPath.join(process.cwd(), plugin.replace(/\.js$/i, ''))).main(token, content);
            } catch (e) {
                logger.logError("%s failed:%s".error, plugin, e)
            }
        });

        return content;
    }

};