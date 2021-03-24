const utils = require("utils");
const component = require("component");
let userSessions = [];

component.register({ moduleName: "component.request.handler.user" }).then( async ({ requestHandlerUser }) => {

    const { config } = await component.load({ moduleName: "component.request.handler.route" });
    const { routes, port } = config.requestHandlerRoute;
    for(const route of routes){
        const name = `${port}${route.path}`;
        const ensureSession = async (request) => {
            let { username, fromhost, fromport, sessionid } = request.headers;
            if (!username && sessionid){
                username = userSessions.find(s => s.Id === sessionid).username;
            }

            const hasMultipleSessions = userSessions.filter(s => s.username === username).length > 1;
            if (hasMultipleSessions){
                await requestHandlerUser.log(`ending older sessions, more than one session found for ${username}`);
                const latestedSession = userSession.filter(s => s.username === username).sort((a, b) => b.date - a.date)[0];
                userSessions = userSessions.filter(s => s.username === username && s.Id !==  latestedSession.Id);
            }
        
            let userSession = userSessions.find(s => s.username === username); //should only be one session after clearing
            if (userSession){
                delete request.headers["username"];
                delete request.headers["fromhost"];
                delete request.headers["fromport"];
                delete request.headers["sessionid"];
                await requestHandlerUser.log(`session ${userSession.Id} Id found for ${userSession.username}`);
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
                userSessions.push({
                    Id: utils.generateGUID(),
                    fromhost,
                    fromport: Number(fromport),
                    username,
                    date: new Date()
                });
                await requestHandlerUser.log(`session created for ${username}`);
                return await ensureSession(request);
            }

            return { 
                headers: { "Content-Type":"text/plain" },
                statusCode: 400,
                statusMessage: "Bad Request",
                data: "failed to create session, make sure the { username, fromport, fromhost } headers are present."
            };
        };
        requestHandlerUser.subscribe( { name }, ensureSession );
    };
});