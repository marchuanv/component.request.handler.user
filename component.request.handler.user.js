const requestHandler = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const fs = require("fs");
const logging = require("logging");
logging.config.add("Request Handler User");
const thisModule  = "component.request.handler.user";
module.exports = { 
    handle: ({ callingModule, port, path, loginHtmlFilePath }) => {
        delegate.register(thisModule, async (request) => {
            let results = { headers: {}, statusCode: -1, statusMessage: "" };
            let { username, passphrase, fromhost, fromport } = request.headers;
            if( fromhost && !isNaN(fromport) && username && passphrase ) {
                request.headers.fromport = Number(fromport);
                return await delegate.call(callingModule, request);
            } else if ( fromhost && username && passphrase && isNaN(fromport)){
                results.statusCode = 400;
                results.statusMessage = "fromport is not a number";
                results.contentType = "text/plain";
                results.data = results.statusMessage;
                return results;
            } else if (loginHtmlFilePath) {
                results.statusCode = 200;
                results.statusMessage = "success";
                results.contentType = "text/html";
                results.data = s.readFileSync(loginHtmlFilePath,"utf8");
                return results;
            } else {
                results.statusCode = 400;
                results.statusMessage = "Bad Request";
                results.contentType = "text/plain";
                results.data = "missing headers: username, fromport, fromhost and passphrase ";
                return results;
            }
        });
        requestHandler.handle({ callingModule: thisModule, port, path });
    }
};