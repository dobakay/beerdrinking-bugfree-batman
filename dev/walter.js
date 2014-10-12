var http = require('http');
var router = require('./router');
// require json parser
// require https
// require config parser

var walter = (function() {
    'use strict';

    var walter = {};

    ///////////////////////////////////
    // Generic Walter Exception Def  //
    ///////////////////////////////////

    function ServerException (message, innerType, internalMessage) {
        this.type = 'ServerException';
        this.innerType = innerType || 'innerServerException';
        this.message = message;
        this.internalMessage = internalMessage || null;
    }

    //////////////////////
    // Helper Functions //
    //////////////////////

    function isFullRequest (flag) {
        if(flag || flag === undefined) {
            return true;
        }
        if(flag === false) {
            return false;
        }
        else {
            throw new ServerException('Incorrect request flag. Flag Value:' + flag);
        }
    }

    /**
     * Converts a json object to an array of values without the keys
     * @param  {JSON} jsonObj
     * @return {argsArray}
     */
    function convertJsonToArguments (jsonObj) {
        return Object.keys(jsonObj).map(function (key) {return jsonObj[key]});
    }

    function returnErrorResponse (response, statusCode, error) {
        response.writeHead(statusCode, error.message, {'Content-Type': 'text/html'});
        response.end();
    }

    ////////////////////////
    // Walter Routing API //
    ////////////////////////

    walter.get = function (url, callback, waitForFullRequest) {
        if(isFullRequest(waitForFullRequest)) {
            router.get(url, callback);
        }
        else {
            router.getAsync(url, callback);
        }
    }

    walter.post = function (url, callback, waitForFullRequest) {
        if(isFullRequest(waitForFullRequest)) {
            router.post(url, callback);
        }
        else {
            router.postAsync(url, callback);
        }
    }

    walter.put = function (url, callback, waitForFullRequest) {
        if(isFullRequest(waitForFullRequest)) {
            router.put(url, callback);
        }
        else {
            router.putAsync(url, callback);
        }
    }

    walter.delete = function (url, callback, waitForFullRequest) {
        if(isFullRequest(waitForFullRequest)) {
            router.delete(url, callback);
        }
        else {
            router.deleteAsync(url, callback);
        }
    }

    walter.process = function (request, response, async, data) {
        try {
            router.executeCallback(request, response, async, data);
        }
        catch(err) {
            console.log(err.type);
            console.log(err.message);
            console.log(err.internalMessage);
            if(err.innerType === 'pageNotFoundException') {
                returnErrorResponse(response, 404, "Page not found.");
            }
            else {
                returnErrorResponse(response, 500, "Could not handle that Error: " + err.message);
            }
        }
    }

    walter.serve = function (port) {
        var server = http.createServer(function (request, response) {
            var payload = '';
            request.on('data', function (chunk) {
                payload += chunk;
                walter.process(request, response, true, chunk);
            });

            request.on('end', function () {
                walter.process(request, response, false, payload);
            });
        });

        server.listen(port);
    }

    return walter;

}());


module.exports = walter;
