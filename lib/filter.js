/**
 * filter.js
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */
var config = require("./config");
/**
 * 替换文本中"@@"标记。
 * 搜索位置为默认为manifest.json中的直接对象，否则为其子对象。
 *
 * 注意"@date@"为特殊值，为当前的Unix时间戳。
 *
 * @param  {[String]} content  要进行处理的文本
 * @param  {[String|null]} proj    标记搜索位置=>manifest.json
 * @param  {[String|null]} attachment
 * @see  ./config.js
 * @todo 直接其它标记
 */
module.exports = function(content, proj, attachment) {
	attachment = attachment || {}
	//替换@@
	return content.replace(/@(.*?)@/g, function(key) {
		var r = RegExp.$1;
		//@date@=>UNIX timestamp
		if ('date' === r) {
			return +new Date;
		}
		//找不到则不替换
		return config.get(r, proj)||attachment[r]|| key;
	});
};