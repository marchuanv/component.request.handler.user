const requestHandler = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const logging = require("logging");
const utils = require("utils");
logging.config.add("Request Handler User");
const thisModule  = "component.request.handler.user";
module.exports = { 
    handle: ({ callingModule, port, path }) => {
        delegate.register(thisModule, async (request) => {
            let results = { headers: {}, statusCode: -1, statusMessage: "" };
            let { username, passphrase } = request.headers;
            if (!username){
                request.headers.username = "anonymous";
            }
            if (!passphrase){
                const { hashedPassphrase, salt } = utils.hashPassphrase("anonymous");
                request.headers.passphrase = hashedPassphrase;
                request.headers.salt = salt;
            }
            return await delegate.call(callingModule, request);
        });
        requestHandler.handle({ callingModule: thisModule, port, path });
    }
};