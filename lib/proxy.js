/**
 * proxy.js
 *
 * changelog
 * 2013/09/17:create
 *
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */

var sysUrl = require('url');
var utils = require('./utils');
var logger = require('./tool/logger');

module.exports = {
	 proxys : [{
		test: function(pattern, redirectUrl, req) {
			if (!/^regex:/i.test(pattern)) return false;
			var reg;
			try {
				reg = new RegExp(pattern.slice(6), 'i');
			} catch (e) {
				logger.logError("%s is not a valid regexp pattern.".error, pattern.slice(6));
				return false;
			}
			return reg.test(req.url);
		},
		constructUrl: function(pattern, redirectUrl, req) {
			var reg = new RegExp(pattern.slice(6), 'i');
			var directUrl = redirectUrl;

			if (reg.exec(req.url)) {
				var pas = {};
				for (var i = 0; i < 10; ++i) {
					pas["$" + i] = RegExp["$" + i];
				}

				directUrl = directUrl.replace(/(\$\d)/g, pas["$1"] || "");
			}

			var parsedReqUrl = sysUrl.parse(req.url, true);
			var parsedDirUrl = sysUrl.parse(directUrl, true);

			for (var e in parsedReqUrl.query) {
				parsedDirUrl.query[e] = parsedReqUrl.query[e];
			}
			//以query组建
			delete parsedDirUrl.search;
			return sysUrl.format(parsedDirUrl);
		}

	}, {
		test: function(pattern, redirectUrl, req) {
			return /^exact:/i.test(pattern) && (pattern.slice(6) == req.url);
		},
		constructUrl: function(pattern, redirectUrl, req) {
			return redirectUrl;
		}
	}, {
		test: function(pattern, redirectUrl, req) {
			return req.url.indexOf(pattern) > 0;
		},
		constructUrl: function(pattern, redirectUrl, req) {
			return redirectUrl;
		}
	}]
};