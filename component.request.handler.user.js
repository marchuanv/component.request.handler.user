const requestHandler = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const fs = require("fs");
const logging = require("logging");
const utils = require("utils");
logging.config.add("Request Handler User");
const thisModule  = "component.request.handler.user";
module.exports = { 
    handle: ({ callingModule, port, path }) => {
        delegate.register(thisModule, async (request) => {
            let results = { headers: {}, statusCode: -1, statusMessage: "" };
            let { username, passphrase, fromhost, fromport } = request.headers;
            if(!fromhost || !fromport || !username || !passphrase ){
                results.statusCode = 200;
                results.statusMessage = "success";
                results.contentType = "text/html";
                const htmlTemplate = fs.readFileSync(`${__dirname}/user.html`,"utf8");
                results.data = htmlTemplate.replace("[path]", request.path);
                return results;
            } else {
                const { hashedPassphrase, salt } = utils.hashPassphrase(passphrase);
                request.headers.passphrase = hashedPassphrase;
                request.headers.salt = salt;
                return await delegate.call(callingModule, request);
            }
        });
        requestHandler.handle({ callingModule: thisModule, port, path });
    }
};