"use strict";

const assert = require('assert');
var express = require('express');
        var app = express();
        

app.all('*', function(req, res, next) {
	res.header("Content-Type", "text/plain");
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "xtoken");
	next();
});

DIGI
const connection = {
    port: 4254,
    host: '127.0.0.1',
    user: "multichainrpc",
    pass: "gCvF1UgDnTLKWjM4GatTBGJGrZVLNbi4zqnerjLK7h5"
}


//LOCAL
// const connection = {
//     port: 7198,
//     host: '127.0.0.1',
//     user: "multichainrpc",
//     pass: "GXFyoMgyRNmi4WgLiJsZQnhokUGMdFUSfQwY9LGxZ2Ft"
// }

const multichain = require("../index.js")(connection);

//create a server object:
var server = app.listen(4002, function() {
    console.log('Listening on port %d', server.address().port);
    console.log('Press Ctrl-C to terminate');
    });
    app.get('/getInfo', function(req, res){
        res.send("OK");
                          return res.end();
      
    });
    

    


