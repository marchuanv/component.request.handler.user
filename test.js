const requestHandler = require("./component.request.handler.user.js");
const delegate = require("component.delegate");
(async()=>{ 
    delegate.register("component.request.handler.secure", "secure", () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    delegate.register("component.request.handler.secure.authenticate", "secure", () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    await requestHandler.handle({ 
        path: "/test", 
        publicHost: "localhost", 
        publicPort: 80, 
        privateHost: "localhost",
        privatePort: 3000
    });
    await requestHandler.handle({ 
        path: "/authenticate", 
        publicHost: "localhost", 
        publicPort: 80, 
        privateHost: "localhost",
        privatePort: 3000
    });
})().catch((err)=>{
    console.error(err);
});