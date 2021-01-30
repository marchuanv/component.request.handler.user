const requestHandler = require("./component.request.handler.user.js");
const delegate = require("component.delegate");
(async()=>{ 
    delegate.register("component.request.handler.secure.authenticate", "3000/test", () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    delegate.register("component.request.handler.secure.authenticate", "3000/authenticate", () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    await requestHandler.handle({
        path: "/test",
        host: "localhost",
        port: 3000
    });
    await requestHandler.handle({
        path: "/authenticate",
        host: "localhost",
        port: 3000
    });
})().catch((err)=>{
    console.error(err);
});