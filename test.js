const requestHandler = require("./component.request.handler.user.js");
const delegate = require("component.delegate");
(async()=>{ 
    const callingModule = "component.request.handler.secure";
    delegate.register(callingModule, (callback) => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    await requestHandler.handle(callingModule, { 
        port: 3000, 
        path: "/test", 
        publicHost: "localhost", 
        publicPort: 4000, 
        username: "anonymous", 
        hashedPassphrase: "anonymous", 
        hashedPassphraseSalt:123124124, 
        fromhost: "localhost", 
        fromport: 6000 
    });
})().catch((err)=>{
    console.error(err);
});