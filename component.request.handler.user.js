const requestHandler = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("Request Handler User");
const thisModule  = "component.request.handler.user";
module.exports = { 
    handle: (callingModule, options = {} ) => {
        delegate.register(thisModule, async (request) => {
            let results = { headers: {}, statusCode: -1, statusMessage: "" };
            let { username, passphrase, hashedpassphrase, hashedpassphrasesalt, fromHost, fromPort } = request.headers;
            if ( username && fromHost && !isNaN(fromPort) && ( passphrase || ( hashedPassphrase && hashedPassphraseSalt) ) ) {
                request.headers.fromHost = fromHost;
                request.headers.fromPort = fromPort;
                request.headers.username = username;
                request.headers.passphrase = passphrase;
                request.headers.hashedPassphrase = hashedpassphrase;
                request.headers.hashedPassphraseSalt = hashedpassphrasesalt;
                return await delegate.call(callingModule, request);
            } else if ( options.username && options.fromHost && !isNaN(options.fromPort) && options.hashedPassphrase && options.hashedPassphraseSalt ) {
                request.headers.fromHost = options.fromHost;
                request.headers.fromPort = options.fromPort;
                request.headers.username = options.username;
                request.headers.hashedPassphrase = options.hashedPassphrase;
                request.headers.hashedPassphraseSalt = options.hashedPassphraseSalt;
                return await delegate.call(callingModule, request);
            } else {
                results.statusCode = 400;
                results.statusMessage = "Bad Request";
                results.contentType = "text/plain";
                results.data = "missing headers: username, fromPort, fromHost and passphrase ";
                return results;
            }
        });
        requestHandler.handle({ callingModule: thisModule, port: options.port, path: options.path });
    }
};