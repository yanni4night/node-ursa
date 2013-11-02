/**
 * Http Server for ursa.
 * @author yinyong#soguo-inc.com
 * @version 0.0.1
 */

var http = require("http");
var https = require("https");
var sysPath = require("path");
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");
var Request = require("./request");
var Response = require("./response");
var utils=require("../utils");
var config = require("../config");

var run = function(port, callback) {

    var onRequest = function(req, res) {
        //仅支持POST和GET
        switch (req.method.toLowerCase()) {
            case 'get':
                var request = new Request(req);
                var response = new Response(res);
                var parsedUrl = url.parse(req.url, true);

                utils.cloneIgnoreFunction(req,request);

                request.body = parsedUrl.query;
                request.path = parsedUrl.path;
                request.pathname = parsedUrl.pathname;
                request.search = parsedUrl.search;

                callback(request, response);
                break;
            case 'post':
                var request = new Request(req);
                var response = new Response(res);
                var info = "";
                var parsedUrl = url.parse(req.url, true);

                req.on('data', function(chunk) {
                    info += chunk;
                    if (info.length > 1e6) { //超过1MB的数据则丢弃
                        req.connection.destroy();
                    }
                });

                req.on('end', function() {

                     utils.cloneIgnoreFunction(req,request);

                    request.body = querystring.parse(info);

                    request.pathname = parsedUrl.pathname;
                    request.path = parsedUrl.path;
                    request.search = parsedUrl.search;
                    callback(request, response);
                });
                break;
            default:
                res.writeHeader('405', req.method + 'is not supported')
                res.end('');
        }

    };

    try {
        //HTTPS证书文件
        var options = {
            key: fs.readFileSync(sysPath.join(__dirname, "../../", '/cer/privatekey.pem')),
            cert: fs.readFileSync(sysPath.join(__dirname, "../../", '/cer/certificate.pem'))
        };
        var server = config.get("https") ? https.createServer(options, onRequest) : http.createServer(onRequest);

        server.listen(port);
        console.log("node-ursa is listening at %d in HTTP%s.".info, port, config.get("https") ? "S" : "");
    } catch (e) {
        console.error("%s".error, e);
    }

};


exports.run = run;