const utils = require("utils");
const component = require("component");
const userSessions = [];

component.register({ moduleName: "component.request.handler.user" }).then( async ({ requestHandlerUser }) => {

    const { config } = await component.load({ moduleName: "component.request.handler.route" });
    const { routes, port } = config.requestHandlerRoute;
    for(const route of routes){
        const name = `${port}${route.path}`;
        requestHandlerUser.subscribe( { name }, async (request) => {
            let { username, fromhost, fromport, sessionid } = request.headers;
            
            delete request.headers["username"];
            delete request.headers["fromhost"];
            delete request.headers["fromport"];
            delete request.headers["sessionid"];
        
            let userSession = userSessions.find(s => s.Id === sessionid);
            if (userSession){
                return await requestHandlerUser.publish({ name }, {
                    session: userSession,
                    headers: request.headers,
                    data: request.data
                });
            }
            
            userSession = userSessions.find(s => s.username === username);
            if (userSession) {
                const results = await requestHandlerUser.publish({ name }, {
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
                const results = await requestHandlerUser.publish({ name }, {
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
    };
});