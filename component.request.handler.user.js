const utils = require("utils");
const component = require("component");
let userSessions = [];

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
                await requestHandlerUser.log(`${userSession.sessionid} found for ${userSession.username}`);
                return await requestHandlerUser.publish({ name }, {
                    session: userSession,
                    headers: request.headers,
                    data: request.data
                });
            }
            
            if (userSessions.filter(s => s.username === username).length > 1){
                await requestHandlerUser.log(`ending older sessions, more than one session found for ${userSession.username}`);
                const sortedUserSessions = userSession.sort((a, b) => b.date - a.date);
                userSessions = userSessions.filter(s => s.username === username && s.Id !==  sortedUserSessions[0].Id);
            }

            userSession = userSessions[0];
            if (userSession) {
                await requestHandlerUser.log(`${userSession.sessionid} found for ${userSession.username}`);
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
                await requestHandlerUser.log(`creating session for ${username}`);
                userSession = { 
                    Id: utils.generateGUID(),
                    fromhost,
                    fromport: Number(fromport),
                    username,
                    date: new Date()
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