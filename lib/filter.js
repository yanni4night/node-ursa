/**
 * filter.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.2
 */
var path=require('path');
var config = require("./config");
var utils = require("./utils");
var logger = require("./tool/logger");


/**
 * 替换文本中"@@"标记。
 * 搜索位置为默认为manifest.json中的直接对象，否则为其子对象。
 *
 * 注意"@date@"为特殊值，为当前的Unix时间戳。
 *
 * @param  {String} content  要进行处理的文本
 * @param  {String|null} proj    标记搜索位置=>manifest.json
 * @param  {String|null} attachment 备用值，在配置文件中找不到可以在这里搜索
 * @see  ./config.js
 * @todo 直接其它标记
 */
module.exports = function(content, proj, attachment) {
	attachment = attachment || {}
	if(typeof content!=='string'||(content&&(content.constructor!=String)))
	{
		logger.logError("content MUST BE a string,but it's a %s.".error,typeof content);
		return content;
	}
	//替换@@，变量名为1~32个字母数字下划线
	return content.replace(/@(.+)@/g, function(key) {
		var r = RegExp.$1;
		//@date@=>UNIX timestamp
		if ('date' === r) {
			return +new Date;
		}else if(/^tm:(.+)/.test(r)){
			//@tm:/test/test.ext@ => timestamp
			return utils.getTimeStamp(path.join(".",RegExp.$1));
		}
		//找不到则不替换
		var ret = config.get(r, proj) || config.get(r, null) || attachment[r] || key;
		//替换{num}随机量
		if (/\{num\}/.test(ret)) {
			return ret.replace(/\{num\}/g, function() {
				var max = +config.get("num", proj)|| +attachment["num"] || 10;
				if(max<=0){
					logger.logWarn("num should be defined as a number gt > 0,but it equals %d.10 will be used instead.".warn,max);
					max=10;
				}
				return  (max * Math.random()) | 0;
			});
		}
		return ret;
	});
};