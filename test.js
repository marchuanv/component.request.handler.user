const requestHandler = require("./component.request.handler.user.js");
const unsecureRequest = require("component.request.unsecure");
const delegate = require("component.delegate");
(async()=>{
    
    const newUnsecureRequest = { host: "localhost", port: 3000, path: "/test" };
    delegate.register("component.request.handler.secure.authenticate", `${newUnsecureRequest.port}${newUnsecureRequest.path}`, (data) => {
        return { statusCode: 200, statusMessage: "Test Passed", headers: {}, data: "Test Passed" };
    });
    await requestHandler.handle("component.request.handler.secure.authenticate", newUnsecureRequest);

    //User Identification Pass Test
    let results = await unsecureRequest.send({
        host: newUnsecureRequest.host,
        port: newUnsecureRequest.port,
        path: newUnsecureRequest.path,
        method: "GET",
        username: "marchuanv",
        fromhost: "localhost",
        fromport: 6000,
        data: ""
    });
    if (results.statusCode !== 200 || results.statusMessage !== "Test Passed"){
        throw new Error("User Identification Pass Test Failed");
    }
    
    //User Identification Fail Test
    results = await unsecureRequest.send({
        host: newUnsecureRequest.host,
        port: newUnsecureRequest.port,
        path: newUnsecureRequest.path,
        method: "GET",
        fromhost: "localhost",
        fromport: 6000,
        data: ""
    });
    if (results.statusCode !== 400 || results.statusMessage !== "Bad Request"){
        throw new Error("User Identification Fail Test Failed");
    }

    process.exit();

})().catch((err)=>{
    console.error(err);
});