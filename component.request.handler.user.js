const requestHandler = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("Request Handler User");
const thisModule  = "component.request.handler.user";
module.exports = { 
    handle: (callingModule, options = {} ) => {
        delegate.register(thisModule, async (request) => {
            let results = { headers: {}, statusCode: -1, statusMessage: "" };
            let { username, passphrase, fromhost, fromport } = request.headers;
            if(  ( ( username && passphrase && fromhost && !isNaN(fromport) ) || ( options.username && options.passphrase && options.fromhost && !isNaN(options.fromport) ) )) {
                request.headers.fromhost = fromhost || options.fromhost;
                request.headers.fromport = Number(fromport || options.fromport);
                request.headers.username = username || options.username;
                request.headers.passphrase = passphrase || options.passphrase;
                return await delegate.call(callingModule, request);
            } else {
                results.statusCode = 400;
                results.statusMessage = "Bad Request";
                results.contentType = "text/plain";
                results.data = "missing headers: username, fromport, fromhost and passphrase ";
                return results;
            }
        });
        requestHandler.handle({ callingModule: thisModule, port: options.port, path: options.path });
    }
};