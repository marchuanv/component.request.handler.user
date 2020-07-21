const requestHandlerDeferred = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("Request Handler User");
module.exports = { 
    handle: (options ) => {
        delegate.register(`component.request.handler.user`, "user", async (request) => {
            if (options.privatePort === request.privatePort){
                let { username, fromhost, fromport } = request.headers;
                if ( username && fromhost && !isNaN(fromport)) {
                    request.headers.fromhost = fromhost;
                    request.headers.fromport = Number(fromport);
                    request.headers.username = username;
                    let results = await delegate.call({context: "component.request.handler.secure.authenticate"}, request);
                    if (results.statusCode === 200){
                        return await delegate.call({context: "component.request.handler.secure"}, request);
                    } else {
                        return results;
                    }
                } else {
                    const message = "missing headers: username, fromport and fromhost";
                    return { 
                        headers: { 
                            "Content-Type":"text/plain", 
                            "Content-Length": Buffer.byteLength(message)
                        },
                        statusCode: 400,
                        statusMessage: "Bad Request",
                        data: message
                    };
                }
            }
        });
        requestHandlerDeferred.handle(options);
    }
};