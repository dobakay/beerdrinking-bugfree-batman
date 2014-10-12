var router = (function() {
    'use strict';

    var router = {};
    var httpMethods = {
        get: 'GET',
        post: 'POST',
        put: 'PUT',
        delete: 'DELETE'
    }
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

    /**
     * Adds a HTTP Method with the corresponding, url the handler for it.
     * There can be one HTTP Method with many urls.
     * @param {GET/POST/PUT/DELETE}   method   HTTP Method
     * @param {URL String}   url      URL String gotten from the request object
     * @param {Function} callback Handler that makes a call to the "hard-core" logic of the server
     * @param {Bool} async Defines where to store the callback function
     */
    function addMethod (method, url, callback, async) {
        if(!requests[method]) {
            requests[method] = {
                callbacks: {},
                asyncCallbacks: {}
            }
        }
        if(!async) {
            requests[method].callbacks[url] = callback;
        }
        else {
            requests[method].asyncCallbacks[url] = callback;
        }
    }

    //////////////////////////
    // Router API functions //
    //////////////////////////

    // SYNC

    router.get = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod(httpMethods.get, url, callback);
    }

    router.post = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod(httpMethods.post, url, callback);
    }

    router.put = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod(httpMethods.put, url, callback);
    }

    router.delete = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod(httpMethods.delete, url, callback);
    }

    // ASYNC

    router.getAsync = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod(httpMethods.get, url, callback, true);
    }

    router.postAsync = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod(httpMethods.post, url, callback, true);
    }

    router.putAsync = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod(httpMethods.put, url, callback, true);
    }

    router.deleteAsync = function (url, callback) {
        if(!url && !callback) {
            throw new RouterException('Url, or callback is undefined or null.');
        }
        addMethod(httpMethods.delete, url, callback, true);
    }

    /**
     * Executes one of the predefined actions depending on the given parameters object in the process function.
     * @param  {[type]} method       'GET/POST/PUT/DELETE'
     * @param  {[type]} url          '/example/url'. Url that we get from the http request object.
     */
    router.executeCallback = function (request, response, async) {
        var method = request.method,
            url = request.url;
        if(!requests[method]) {
            throw new RouterException('HTTP Method not found.');
        }
        else {
            var callBackToBeExecuted = (!async)? requests[method].callbacks[url] : requests[method].asyncCallbacks[url];
            if(!!callBackToBeExecuted) {
                callBackToBeExecuted(request, response);
            }
        }
    }

    return router;

}());


module.exports = router;
