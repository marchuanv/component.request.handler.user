const requestHandlerDeferred = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("Request Handler User");
module.exports = { 
    handle: (options ) => {
        requestHandlerDeferred.handle(options);
        const name = `${options.port}${options.path}`;
        delegate.register(`component.request.handler.user`, name, async (request) => {
            let { username, fromhost, fromport } = request.headers;
            if ( username && fromhost && !isNaN(fromport)) {
                request.headers.fromhost = fromhost;
                request.headers.fromport = Number(fromport);
                request.headers.username = username;
                return await delegate.call({ context: `component.request.handler.secure.authenticate`, name }, request);
            } else {
                return { 
                    headers: { "Content-Type":"text/plain" },
                    statusCode: 400,
                    statusMessage: "Bad Request",
                    data: "missing headers: username, fromport and fromhost"
                };
            }
        });
    }
};