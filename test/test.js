"use strict";

const assert = require('assert');

const connection = {
    port: 4254,
    host: '127.0.0.1',
    user: "multichainrpc",
    pass: "gCvF1UgDnTLKWjM4GatTBGJGrZVLNbi4zqnerjLK7h5"
}

const multichain = require("../index.js")(connection);

//create a server object:
var server = app.listen(4000, function() {
    console.log('Listening on port %d', server.address().port);
    console.log('Press Ctrl-C to terminate');
    });


    // multichain.getInfo((err, info) => {
    //     if(err){
    //         throw err;
    //     }
    //     console.log(info);
    // })
    app.get('/getListStreamKeyItems', function(req, res){
        var kisaanStreamKey = req.query.keyID;
            multichain.listStreamKeyItems({
                stream: "bane",
                key: kisaanStreamKey,
                verbose: true
                
            }, (err, results) => {
                if(err){
                    res.send(JSON.stringify(err));
                    return res.end();
                } 
                let dataString = Buffer.from(results[results.length - 1].data, 'hex').toString();
                results[results.length - 1].data = JSON.parse(dataString);
                res.send(JSON.stringify(results[results.length - 1]));
                return res.end();
                
            }) 
        });

        app.get('/getListStreamItems', function(req, res){
                multichain.listStreamItems({
                    stream: "bane",
                    verbose: false
                    
                }, (err, results) => {
                    if(err){
                        res.send(JSON.stringify(err));
                        return res.end();
                    }  
            });
    
        });

