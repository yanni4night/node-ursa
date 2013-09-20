/**
 * logger.js
 *
 * changelog
 * 2013/09/20:create
 *
 * @author yinyong#sogou-inc.com
 * @version 0.0.1
 */
var config = require("../config");
var utils = require("../utils");
var assert = require("assert");

module.exports = {
    log_level: {
        info: false,
        warn: false,
        error: false
    },
    init: function() {
        if (this._initialized) return;

        var levels = ["info", "warn", "error"];
        var ll = config.get("log_level") || "info";

        assert(utils.isString(ll), "log_level MUST BE a string");

        if (levels.indexOf(ll) >= 0) {
            this.log_level[ll] = true;
        } else {
            this.log_level[levels[0]] = true;
            console.warn("log_level should be one of the following:%s".warn, levels.join());
        }

        this._initialized = true;
    },
    logInfo: function() {
        !this._initialized&&this.init();
        this.log_level.info && console.log.apply(console, arguments);
    },
    logWarn: function() {
        !this._initialized&&this.init();
        (this.log_level.warn||this.log_level.info) && console.warn.apply(console, arguments);
    },
    logError: function() {
        !this._initialized&&this.init();
         console.error.apply(console, arguments);
    },
};