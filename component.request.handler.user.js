const requestHandlerDeferred = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("Request Handler User");
module.exports = { 
    handle: (callingModule, options ) => {
        const thisModule = `component.request.handler.user.${options.path.replace(/\//g,"")}.${options.publicPort}`;
        delegate.register(thisModule, async (request) => {
            let { username, fromhost, fromport } = request.headers;
            if ( username && fromhost && !isNaN(fromport)) {
                request.headers.fromhost = fromhost;
                request.headers.fromport = Number(fromport);
                request.headers.username = username;
                return await delegate.call(callingModule, request);
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
        });
        requestHandlerDeferred.handle(thisModule, options);
    }
};