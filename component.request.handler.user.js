const utils = require("utils");
const component = require("component");
let userSessions = [];

component.load(module).then(async({ requestHandlerUser }) => {
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
        if (userSession) {
            if (userSession.lastRequestId !== request.requestId) { //new request from the same user
                if (!userSession.token) { //security layer should have created a session authorisation token by now
                    return { 
                        headers: { "Content-Type":"text/plain" },
                        statusCode: 500,
                        statusMessage: "Internal Server Error",
                        data: "failed to create session authorisation token"
                    };
                }
                //need to reassure that the token is still in the headers
                if (userSession.token !== request.headers.token) {
                    return {
                        headers: { 
                            "Content-Type":"text/plain"
                        },
                        statusCode: 400,
                        statusMessage:"Bad Request",
                        data: "missing or invalid token in the request headers"
                    };
                }
            }
            userSession.lastRequestId = request.requestId,
            
            //clear headers everything should be on the session
            delete request.headers["username"];
            delete request.headers["token"];
            delete request.headers["fromhost"];
            delete request.headers["fromport"];
            delete request.headers["sessionid"];

            await requestHandlerUser.log(`session ${userSession.Id} Id found for ${userSession.username}`);
            const results = await requestHandlerUser.publish({ session: userSession, request });
            if (results && results.headers) {
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
                date: new Date(),
                token: null,
                publicKey: null,
                privateKey: null,
                encryptionkey: null,
                hashedPassphrase: null,
                lastRequestId: request.requestId
            });
            await requestHandlerUser.log(`session created for ${username}`);
            return await ensureSession(request);
        }
        await requestHandlerUser.log(`failed to find or create session`);
        return { 
            headers: { "Content-Type":"text/plain" },
            statusCode: 400,
            statusMessage: "Bad Request",
            data: "failed to create session, make sure the { username, fromport, fromhost } headers are present."
        };
    };
    requestHandlerUser.subscribe(ensureSession);
});