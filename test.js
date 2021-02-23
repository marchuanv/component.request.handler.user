const requestHandler = require("./component.request.handler.user.js");
const unsecureRequest = require("component.request.unsecure");
const delegate = require("component.delegate");
(async()=>{
    
    const newUnsecureRequest = { host: "localhost", port: 3000, path: "/test" };
    delegate.register("component.request.handler.secure.authenticate", `${newUnsecureRequest.port}${newUnsecureRequest.path}`, (data) => {
        return { statusCode: 200, statusMessage: "Test Passed", headers: {}, data: "Test Passed" };
    });
    await requestHandler.handle(newUnsecureRequest);

    // let results = await unsecureRequest.send({
    //     host: newUnsecureRequest.host,
    //     port: newUnsecureRequest.port,
    //     path: newUnsecureRequest.path,
    //     method: "GET",
    //     headers: {
    //         username: "marchuanv",
    //         fromhost: "localhost",
    //         fromport: 6000
    //     },
    //     data: ""
    // });
    // if (results.statusCode !== 200 || results.statusMessage !== "Test Passed"){
    //     throw new Error("user identification test failed for port 3000");
    // }
   
    // results = await unsecureRequest.send({
    //     host: newUnsecureRequest.host,
    //     port: newUnsecureRequest.port,
    //     path: newUnsecureRequest.path,
    //     method: "GET",
    //     headers: {
    //         username: "marchuanv",
    //         fromhost: "localhost",
    //         fromport: 6000,
    //         sessionid: results.headers.sessionid
    //     },
    //     data: ""
    // });
    // if (results.statusCode !== 200 || results.statusMessage !== "Test Passed"){
    //     throw new Error("user identification test failed for port 3000");
    // }
    
    // results = await unsecureRequest.send({
    //     host: newUnsecureRequest.host,
    //     port: newUnsecureRequest.port,
    //     path: newUnsecureRequest.path,
    //     method: "GET",
    //     headers: {
    //         username: "marchuanv",
    //         fromhost: "localhost",
    //         fromport: 6000
    //     },
    //     data: ""
    // });
    // if (results.statusCode !== 400 || results.statusMessage !== "Bad Request"){
    //     throw new Error("user identification test failed for port 3000");
    // }

    // process.exit();

})().catch((err)=>{
    console.error(err);
});