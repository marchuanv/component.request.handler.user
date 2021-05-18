const utils = require("utils");
const component = require("component");
let userSessions = [];

component.load(module).then(async({ requestHandlerUser }) => {
    const ensureSession = async (messageBusMessage) => {
        const { headers, data } = messageBusMessage;
        let { username, fromhost, fromport, sessionid } = headers;
        delete headers["username"];
        delete headers["fromhost"];
        delete headers["fromport"];
        delete headers["sessionid"];
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
            headers.sessionid = userSession.Id;
            await requestHandlerUser.log(`session ${userSession.Id} Id found for ${userSession.username}`);
            await requestHandlerUser.publish({ headers, data });
            return { 
                success: true,
                headers,
                statusCode: 200,
                statusMessage: "Success",
                data: "Success"
            };
        }
        if (username && fromhost && !isNaN(fromport)) {
            userSessions.push({ Id: utils.generateGUID(), fromhost, fromport: Number(fromport), username, date: new Date() });
            await requestHandlerUser.log(`session created for ${username}`);
            return await ensureSession(messageBusMessage);
        }
        await requestHandlerUser.log(`failed to find or create session`);
        return {
            success: false,
            headers: { "Content-Type":"text/plain" },
            statusCode: 400,
            statusMessage: "Bad Request",
            data: "failed to create session, make sure the { username, fromport, fromhost } headers are present."
        };
    };
    requestHandlerUser.subscribe(ensureSession);
});