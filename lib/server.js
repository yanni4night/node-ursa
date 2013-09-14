/**
 * Http Server for ursa.
 * @author yinyong#soguo-inc.com
 * @version 0.0.1
 */

var http = require("http");
var url = require("url");
var querystring = require("querystring");
var Request = require("./http/request");
var Response = require("./http/response");
require("./utils");

var run = function(port, callback) {

    var server = http.createServer(function(req, res) {
        //仅支持POST和GET
        switch (req.method.toLowerCase()) {
            case 'get':
                var request = new Request(req);
                var response = new Response(res);
                var parsedUrl = url.parse(req.url, true);
                request.url = req.url;
                request.method = 'GET'
                request.body = parsedUrl.query;
                request.pathname = parsedUrl.pathname;
                callback(request, response);
                break;
            case 'post':
                var request = new Request(req);
                var response = new Response(res);
                var info = "";
                req.on('data', function(chunk) {
                    info += chunk;
                    if (info.length > 1e6) {
                        req.connection.destroy();
                    }
                });
                req.on('end', function() {
                    request.url = req.url;
                    request.body = querystring.parse(info);
                    request.method = 'POST';
                    request.pathname = url.parse(req.url).pathname;
                    callback(request, response);
                });
                break;
            default:
                res.writeHeader('405', req.method + 'is not supported')
                res.end('');
        }

    });

    server.listen(port);
    console.log("node-ursa is listening at %d".info , port);

};


exports.run = run;