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

//DIGI
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
var server = app.listen(4000, function() {
    console.log('Listening on port %d', server.address().port);
    console.log('Press Ctrl-C to terminate');
    });
    app.get('/getInfo', function(req, res){
        multichain.getInfo((err, info) => {
          if(err){
              throw err;
          }
          console.log(info);
            res.send(JSON.stringify(info));
                          return res.end();
      })
      
    });
    



    app.get('/registerDevice', function(req, res){
        var Key = req.query.DeviceID+"_"+req.query.ID;
        var DeviceData ={
            "DeviceInfo": [
            {
                    "ID":req.query.ID,
                    "DeviceID":req.query.DeviceID,
                    "NAME":req.query.NAME,
                    "TYPE":req.query.TYPE	
            }
            ],
            "SensorData":[
                
                ]
        };
    
        multichain.listStreamKeyItems({
            stream: "bane",
            key: Key,
            verbose: true
        }, (err, results) => {
            if(err){
                res.send(JSON.stringify(err));
                return res.end();
            }
            if(results.length === 0) {
                let dataHex = Buffer.from(JSON.stringify(DeviceData), 'utf8').toString('hex');
                multichain.publish({stream:"bane",key: Key , data: dataHex }, (err, results) => {
                   // console.log(res)
                    if(err){
                        res.send(JSON.stringify(err));
                        return res.end();
                    }else{
                        res.send(results);
                        return res.end();
                    }
                })
        }else{

            var response ={
                "message":"Device Already Registered in Blockchain Network"
            };
            res.send(JSON.stringify(response));
            return res.end();
        }
        }) 



            




    });
    
    app.get('/postSMDDataToBC', function(req, res){
        var Key = req.query.DeviceID+"_"+req.query.ID;
        multichain.listStreamKeyItems({
            stream: "bane",
            key: Key,
            verbose: true
        }, (err, results) => {
            if(err){
                res.send(JSON.stringify(err));
                return res.end();
            }
            if(results.length !== 0) {
            let dataString = Buffer.from(results[results.length - 1].data, 'hex').toString();
            results[results.length - 1].data = JSON.parse(dataString);
           var oDeviceInfo = results[results.length - 1].data.DeviceInfo[0];
        //    const uniqidNew = uniqid.time();
        //    uniqueIDLekhPal=oKisaanInfo.kisaan_id+"L_"+uniqidNew;
           var oSensorData ={};
           oSensorData.ID = req.query.ID;
           oSensorData.STATUS = req.query.STATUS;
           oSensorData.LATITUDE = req.query.LATITUDE;
           oSensorData.LONGITUDE = req.query.LONGITUDE;
           oSensorData.DATE = req.query.DATE;
           oSensorData.TIME = req.query.TIME;
           oSensorData.DeviceID = req.query.DeviceID;

            results[results.length - 1].data.SensorData.push(oSensorData);

            let dataHex = Buffer.from(JSON.stringify(results[results.length - 1].data), 'utf8').toString('hex');
            multichain.publish({stream:"bane",key: req.query.DeviceID+"_"+req.query.ID, data: dataHex }, (err, results) => {                       
                if(err){
                    res.send(JSON.stringify(err));
                    return res.end();
                }else{
                    var obj ={};
                    obj.statusCode = 200;
                    obj.txid = results;
                    obj.deviceInfo = oDeviceInfo;
                    res.send(JSON.stringify(obj));
                    return res.end();
                }
            }) 
        }else{

            var response ={
                "message":"Device Not Registered in Blockchain Network"
            };
            res.send(JSON.stringify(response));
            return res.end();
        }
        }) 
    });

    app.get('/postGasDataToBC', function(req, res){
        var Key = req.query.DeviceID+"_"+req.query.ID;
        multichain.listStreamKeyItems({
            stream: "bane",
            key: Key,
            verbose: true
        }, (err, results) => {
            if(err){
                res.send(JSON.stringify(err));
                return res.end();
            }
            if(results.length !== 0) {
            let dataString = Buffer.from(results[results.length - 1].data, 'hex').toString();
            results[results.length - 1].data = JSON.parse(dataString);
           var oDeviceInfo = results[results.length - 1].data.DeviceInfo[0];
        //    const uniqidNew = uniqid.time();
        //    uniqueIDLekhPal=oKisaanInfo.kisaan_id+"L_"+uniqidNew;
           var oSensorData ={};
           oSensorData.ID = req.query.ID;
           oSensorData.TEMPERATURE = req.query.TEMPERATURE;
           oSensorData.PRESSURE = req.query.PRESSURE;
           oSensorData.HUMIDITY = req.query.HUMIDITY;
           oSensorData.IAQ = req.query.IAQ;
           oSensorData.DeviceID = req.query.DeviceID;

            results[results.length - 1].data.SensorData.push(oSensorData);

            let dataHex = Buffer.from(JSON.stringify(results[results.length - 1].data), 'utf8').toString('hex');
            multichain.publish({stream:"bane",key: req.query.DeviceID+"_"+req.query.ID, data: dataHex }, (err, results) => {                       
                if(err){
                    res.send(JSON.stringify(err));
                    return res.end();
                }else{
                    var obj ={};
                    obj.statusCode = 200;
                    obj.txid = results;
                    obj.deviceInfo = oDeviceInfo;
                    res.send(JSON.stringify(obj));
                    return res.end();
                }
            }) 
        }else{

            var response ={
                "message":"Device Not Registered in Blockchain Network"
            };
            res.send(JSON.stringify(response));
            return res.end();
        }
        }) 
    });

    app.get('/postWaterProbeDataToBC', function(req, res){
        var Key = req.query.DeviceID+"_"+req.query.ID;
        multichain.listStreamKeyItems({
            stream: "bane",
            key: Key,
            verbose: true
        }, (err, results) => {
            if(err){
                res.send(JSON.stringify(err));
                return res.end();
            }
            if(results.length !== 0) {
            let dataString = Buffer.from(results[results.length - 1].data, 'hex').toString();
            results[results.length - 1].data = JSON.parse(dataString);
           var oDeviceInfo = results[results.length - 1].data.DeviceInfo[0];
        //    const uniqidNew = uniqid.time();
        //    uniqueIDLekhPal=oKisaanInfo.kisaan_id+"L_"+uniqidNew;
           var oSensorData ={};
           oSensorData.ID = req.query.ID;
           oSensorData.TEMPERATURE = req.query.TEMPERATURE;
           oSensorData.PH = req.query.PH;
           oSensorData.CONDUCTIVITY = req.query.CONDUCTIVITY;
           oSensorData.DeviceID = req.query.DeviceID;

            results[results.length - 1].data.SensorData.push(oSensorData);

            let dataHex = Buffer.from(JSON.stringify(results[results.length - 1].data), 'utf8').toString('hex');
            multichain.publish({stream:"bane",key: req.query.DeviceID+"_"+req.query.ID, data: dataHex }, (err, results) => {                       
                if(err){
                    res.send(JSON.stringify(err));
                    return res.end();
                }else{
                    var obj ={};
                    obj.statusCode = 200;
                    obj.txid = results;
                    obj.deviceInfo = oDeviceInfo;
                    res.send(JSON.stringify(obj));
                    return res.end();
                }
            }) 
        }else{

            var response ={
                "message":"Device Not Registered in Blockchain Network"
            };
            res.send(JSON.stringify(response));
            return res.end();
        }
        }) 
    });

    app.get('/getDeviceDataFromBC', function(req, res){
        var Key = req.query.DeviceID+"_"+req.query.ID;
        multichain.listStreamKeyItems({
            stream: "bane",
            key: Key,
            verbose: true
        }, (err, results) => {
            if(err){
                res.send(JSON.stringify(err));
                return res.end();
            }
            if(results.length !== 0) {
            let dataString = Buffer.from(results[results.length - 1].data, 'hex').toString();
            results[results.length - 1].data = JSON.parse(dataString);
           var oSensorData = results[results.length - 1].data.SensorData[results[results.length - 1].data.SensorData.length - 1];
           var oDeviceInfo = results[results.length - 1].data.DeviceInfo[0];

           var finalobj = {
               "deviceInfo":oDeviceInfo,
               "sensorData":oSensorData
           };
           res.send(JSON.stringify(finalobj));
        return res.end();
        }else{

            var response ={
                "message":"Device Not Registered in Blockchain Network"
            };
            res.send(JSON.stringify(response));
            return res.end();
        }
        }) 
    });

    app.get('/getDeviceDataTrackingHistory', function(req, res){
        var Key = req.query.DeviceID+"_"+req.query.ID;
        multichain.listStreamKeyItems({
            stream: "bane",
            key: Key,
            verbose: true
        }, (err, results) => {
            if(err){
                res.send(JSON.stringify(err));
                return res.end();
            }
            if(results.length !== 0) {
            let dataString = Buffer.from(results[results.length - 1].data, 'hex').toString();
            results[results.length - 1].data = JSON.parse(dataString);
           var oDeviceInfo = results[results.length - 1].data;
           res.send(JSON.stringify(oDeviceInfo));
        return res.end();
        }else{

            var response ={
                "message":"Device Not Registered in Blockchain Network"
            };
            res.send(JSON.stringify(response));
            return res.end();
        }
        }) 
    });

    


