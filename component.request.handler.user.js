const requestHandlerDeferred = require("component.request.handler.deferred");
const delegate = require("component.delegate");
const logging = require("logging");
const utils = require("utils");
logging.config.add("Request Handler User");
const userSessions = [];
module.exports = { 
    handle: (context, options) => {
        requestHandlerDeferred.handle(options);
        const name = `${options.port}${options.path}`;
        delegate.register(`component.request.handler.user`, name, async (request) => {
            
            let { username, fromhost, fromport, sessionid } = request.headers;
            
            delete request.headers["username"];
            delete request.headers["fromhost"];
            delete request.headers["fromport"];
            delete request.headers["sessionid"];

            let userSession = userSessions.find(s => s.Id === sessionid);
            if (userSession){
                return await delegate.call({ context, name }, {
                    session: userSession,
                    headers: request.headers,
                    data: request.data
                });
            }
            
            userSession = userSessions.find(s => s.username === username);
            if (userSession) {
                const results = await delegate.call({ context, name }, {
                    session: userSession,
                    headers: request.headers,
                    data: request.data
                });
                if (results && results.headers){
                    results.headers.sessionid = userSession.Id;
                }
                return results;
            }
            if (username && fromhost && !isNaN(fromport)) {
                userSession = { 
                    Id: utils.generateGUID(),
                    fromhost,
                    fromport: Number(fromport),
                    username
                };
                userSessions.push(userSession);
                const results = await delegate.call({ context, name }, {
                    session: userSession,
                    headers: request.headers,
                    data: request.data
                });
                if (results && results.headers){
                    results.headers.sessionid = userSession.Id;
                }
                return results;
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