const requestHandler = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("Request Handler User");
const thisModule  = "component.request.handler.user";
module.exports = { 
    handle: (callingModule, options = {} ) => {
        delegate.register(thisModule, async (request) => {
            let { username, passphrase, hashedpassphrase, hashedpassphrasesalt, fromhost, fromport } = request.headers;
            if ( username && fromhost && !isNaN(fromport) && ( passphrase || ( hashedpassphrase && hashedpassphrasesalt) ) ) {
                request.headers.fromhost = fromhost;
                request.headers.fromport = fromport;
                request.headers.username = username;
                request.headers.passphrase = passphrase;
                request.headers.hashedpassphrase = hashedpassphrase;
                request.headers.hashedpassphrasesalt = hashedpassphrasesalt;
                return await delegate.call(callingModule, request);
            } else {
                const statusMessage = "400 Bad Request";
                return { 
                    headers: { 
                        "Content-Type":"text/plain", 
                        "Content-Length": Buffer.byteLength(statusMessage)
                    },
                    statusCode: 400,
                    statusMessage,
                    contentType = "text/plain",
                    data = "missing headers: username, fromport, fromhost and passphrase "
                };
            }
        });
        requestHandler.handle({ callingModule: thisModule, port: options.port, path: options.path });
    }
};