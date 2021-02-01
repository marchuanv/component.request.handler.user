const requestHandler = require("./component.request.handler.user.js");
const request = require("component.request");
const delegate = require("component.delegate");
(async()=>{ 
    delegate.register("component.request.handler.secure.authenticate", "3000/test", () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    await requestHandler.handle({
        path: "/test",
        host: "localhost",
        port: 3000
    });
    await request.send({ host: "localhost", port: 3000, path: "/test", method: "GET", headers: {username: "marchuanv", fromhost: "localhost", fromport: 6000 }, data: "", retryCount: 1  });
})().catch((err)=>{
    console.error(err);
});