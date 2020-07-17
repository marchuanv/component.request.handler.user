const requestHandler = require("./component.request.handler.user.js");
const delegate = require("component.delegate");
(async()=>{ 
    const callingModule = "component.request.handler.secure.login";
    delegate.register(callingModule, () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    await requestHandler.handle(callingModule, { 
        path: "/test", 
        publicHost: "localhost", 
        publicPort: 80, 
        privateHost: "localhost",
        privatePort: 3000
    });
})().catch((err)=>{
    console.error(err);
});