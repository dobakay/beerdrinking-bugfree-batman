var router = (function() {
    'use strict';

    var router = {};

    var requests = {};

    ///////////////////////////////////
    // Generic Router Exception Def  //
    ///////////////////////////////////

    function RouterException (message, innerType, internalMessage) {
        this.type = 'RouterException';
        this.innerType = innerType || 'innerServerException';
        this.message = message;
        this.internalMessage = internalMessage || null;
    }

    ////////////////////////
    // Internal Functions //
    ////////////////////////

    function returnErrorResponse (response, statusCode, error) {
        response.writeHead(statusCode, error.message, {'Content-Type': 'text/html'});
        response.end();
    }

    /**
     * Adds a HTTP Method with the corresponding, url the handler for it.
     * There can be one HTTP Method with many urls.
     * @param {GET/POST/PUT/DELETE}   method   HTTP Method
     * @param {URL String}   url      URL String gotten from the request object
     * @param {Function} callback Handler that makes a call to the "hard-core" logic of the server
     */
    function addMethod (method, url, callback) {
        if(!requests[method]) {
            requests[method] = {
                callbacks: {}
            }
        }
        requests[method].callbacks[url] = callback;
    }

    /**
     * Executes one of the predefined actions depending on the given parameters object in the process function.
     * @param  {[type]} method       'GET/POST/PUT/DELETE'
     * @param  {[type]} url          '/example/url'. Url that we get from the http request object.
     * @param  {[type]} callbackArgs callbackArgs[0] is always a http response object.
     *                               The rest are fields of the json object passed with the request (if such an object
     *                               was passed)
     */
    function executeCallback (method, url, response, callbackArgs) {
        if(!requests[method]) {
            throw new RouterException('HTTP Method not found.');
        }
        else {
            if(!requests[method].callbacks[url]) {
                throw new RouterException('HTTP Method with url "' + url + '" was not found.', 'pageNotFoundException');
            }
            if(!callbackArgs) {
                requests[method].callbacks[url](response);
            }
            else {
                callbackArgs.unshift(response);
                requests[method].callbacks[url].apply(null, callbackArgs);
            }
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

    ////////////////////////////////
    // EXPRESS-like API functions //
    ////////////////////////////////

    router.get = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod('GET', url, callback);
    }

    router.post = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod('POST', url, callback);
    }

    router.put = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod('PUT', url, callback);
    }

    router.delete = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod('DELETE', url, callback);
    }


    /**
     * Handles synchronously a request and invokes the correct HTTP Method with the request
     * parameters. If an unhandled error occurs returns a generic 404 Error response.
     * @param  {Object} request
     */
    router.process = function (request) {
        var method = request.method,
            url = request.url,
            response = request.response,
            data = request.body, //unparsed JSON string or undefined
            args = null;

        if(!!data ) {
            console.log(data);
            data = JSON.parse(data);
            args = convertJsonToArguments(data);
        }

        try {
            executeCallback(method, url, response, args);
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

    return router;

}());


module.exports = router;
