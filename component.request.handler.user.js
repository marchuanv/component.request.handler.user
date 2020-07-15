const requestHandler = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("Request Handler User");
const thisModule  = "component.request.handler.user";
module.exports = { 
    handle: (callingModule, options = {} ) => {
        delegate.register(thisModule, async (request) => {
            let { username, passphrase, hashedpassphrase, hashedpassphrasesalt, fromhost, fromport } = request.headers;
            if ( username && fromhost && !isNaN(fromport)) {
                request.headers.fromhost = fromhost;
                request.headers.fromport = Number(fromport);
                request.headers.username = username;
                request.headers.passphrase = passphrase;
                request.headers.hashedpassphrase = hashedpassphrase;
                request.headers.hashedpassphrasesalt = hashedpassphrasesalt;
                return await delegate.call(callingModule, request);
            } else {
                const message = "missing headers: username, fromport or fromhost";
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
        requestHandler.handle(thisModule, { port: options.port, path: options.path });
    }
};