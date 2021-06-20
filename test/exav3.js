
"use strict";

const assert = require('assert');
var express = require('express');
var uniqid = require('uniqid');

        var app = express();


app.all('*', function(req, res, next) {
        res.header("Content-Type", "text/plain");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "xtoken");
        next();
});

//DIGI
// const connection = {
//     port: 4254,
//     host: '127.0.0.1',
//     user: "multichainrpc",
//     pass: "gCvF1UgDnTLKWjM4GatTBGJGrZVLNbi4zqnerjLK7h5"
// }


//LOCAL
const connection = {
    port: 8002,
    host: 'localhost',
    user: "multichainrpc",
    pass: "79fiBbXJJdNWtMDREwYfdMsmjzzDdPk4oh2uerBA3Jja"
}

const multichain = require("../index.js")(connection);
//create a server object:
var server = app.listen(8000, function() {
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

    app.get('/getListStreamKeyItems', function(req, res){
        var kisaanStreamKey = req.query.keyID;
            multichain.listStreamKeyItems({
                stream: "Land_Registry",
                key: kisaanStreamKey,
                verbose: true

            }, (err, results) => {
                if(err){

                    res.send(JSON.stringify(err));
                    return res.end();
                }
                              if(results.length===0){
                                                          let dataString = {
                                                                                          "message":"Invalid MID"
                                                                                      }
                                                          res.send(dataString);

                                                      }else{


                                                                                  let dataString = Buffer.from(results[results.length - 1].data, 'hex').toString();
                                                                                  results[results.length - 1].data = JSON.parse(dataString);
                                                                                  res.send(JSON.stringify(results[results.length - 1]));
                                                                                  return res.end();
                                                                              }

            })
        });


        app.get('/landRegisterKisaanUser', function(req, res){

            var okisaanUserData ={
                "kisaan_account": [
                {
                        "kisaan_id":"KISAAN_" + req.query.adhar_num,
                        "adharnum":req.query.adhar_num,
                        "fullname":req.query.fullname,
                        "homenum":req.query.house_num,
                        "street":req.query.street_name,
                        "state" :req.query.state,
                        "city":req.query.city,
                        "country":req.query.country,
                        "zipcode":req.query.pincode,
                        "phonenum":req.query.phone_num
                }
                ],
                "kisaan_shared_info_with_lekhpal":[
        
                ],
                "kisaan_shared_info_with_bank":[
        
                    ],
                "kisaan_shared_info_with_innscomp":[
        
                    ]
            };
        
            let dataHex = Buffer.from(JSON.stringify(okisaanUserData), 'utf8').toString('hex');
                multichain.publish({stream:"Land_Registry",key: "KISAAN_"+req.query.adhar_num , data: dataHex }, (err, results) => {
                   // console.log(res)"KISAAN_"+req.query.adhar_num
                    if(err){
                        res.send(JSON.stringify(err));
                        return res.end();
                    }else{
                        res.send(results);
                        return res.end();
                    }
                })
                });

                
                app.get('/postKisaanformlandInfoToLekhpal', function(req, res){
                    var kisaanStreamKey = req.query.kisaan_id;
                    multichain.listStreamKeyItems({
                        stream: "Land_Registry",
                        key: kisaanStreamKey,
                        verbose: true
                    }, (err, results) => {
                        if(err){
                            res.send(JSON.stringify(err));
                            return res.end();
                        }
                        if(results.length !== 0) {
                        let dataString = Buffer.from(results[results.length - 1].data, 'hex').toString();
                        results[results.length - 1].data = JSON.parse(dataString);
                       var oKisaanInfo = results[results.length - 1].data.kisaan_account[0];
                       const uniqidNew = uniqid.time();
                      var uniqueIDLekhPal=oKisaanInfo.kisaan_id+"L_"+uniqidNew;
                       var oAddFarmlandInfoForLakhpalApproval ={};
                           oAddFarmlandInfoForLakhpalApproval.kisaan_lekpal_id = uniqueIDLekhPal;
                           oAddFarmlandInfoForLakhpalApproval.farmland_Name = req.query.farmland_Name;
                           oAddFarmlandInfoForLakhpalApproval.farmland_desc = req.query.farmland_desc;
                           oAddFarmlandInfoForLakhpalApproval.farmland_size = req.query.farmland_size;
                           oAddFarmlandInfoForLakhpalApproval.farmland_size_unit = req.query.farmland_size_unit;
                           oAddFarmlandInfoForLakhpalApproval.state = req.query.state;
                           oAddFarmlandInfoForLakhpalApproval.city = req.query.city;
                           oAddFarmlandInfoForLakhpalApproval.country = req.query.country;
                           oAddFarmlandInfoForLakhpalApproval.zipcode = req.query.zipcode;
                           oAddFarmlandInfoForLakhpalApproval.phonenum = oKisaanInfo.phonenum;
                           oAddFarmlandInfoForLakhpalApproval.phonenum = oKisaanInfo.fullname;
                           oAddFarmlandInfoForLakhpalApproval.lekhpal_approval_status = "Pending";
                           oAddFarmlandInfoForLakhpalApproval.lekhpal_cmt = "Pending with Your Lekhpal";
                           oAddFarmlandInfoForLakhpalApproval.lon = 0;
                           oAddFarmlandInfoForLakhpalApproval.lat = 0;
                           oAddFarmlandInfoForLakhpalApproval.shared_with_bank = "no";
                           oAddFarmlandInfoForLakhpalApproval.shared_with_inns_company = "no";
    
                        results[results.length - 1].data.kisaan_shared_info_with_lekhpal.push(oAddFarmlandInfoForLakhpalApproval);

                        let dataHex = Buffer.from(JSON.stringify(results[results.length - 1].data), 'utf8').toString('hex');
                        multichain.publish({stream:"Land_Registry",key: oKisaanInfo.kisaan_id , data: dataHex }, (err, results) => {
                            if(err){
                                res.send(JSON.stringify(err));
                                return res.end();
                            }else{
                                var obj ={};
                                obj.uniqueIDLekhPal = uniqueIDLekhPal;
                                obj.txid = results;
                                res.send(JSON.stringify(obj));
                                return res.end();
                            }
                        })
                    }
                    })
        });

        

        app.get('/setApprovalStatusByLekhpal', function(req, res){
            var kisaanStreamKey = req.query.kisaan_id;
            multichain.listStreamKeyItems({
                stream: "Land_Registry",
                key: kisaanStreamKey,
                verbose: true
            }, (err, results) => {
                if(err){
                    res.send(JSON.stringify(err));
                    return res.end();
                }
                if(results.length !== 0) {
                let dataString = Buffer.from(results[results.length - 1].data, 'hex').toString();
                results[results.length - 1].data = JSON.parse(dataString);
               var oKisaanFarmlandandInfo = results[results.length - 1].data.kisaan_shared_info_with_lekhpal;

            results[results.length - 1].data.kisaan_shared_info_with_lekhpal.forEach(element => {
                if(element.kisaan_lekpal_id==req.query.kisaan_lekhpal_id){
                    element.lekhpal_approval_status = req.query.lekhpal_approval_status;
                    element.lekhpal_cmt = req.query.lekhpal_cmt;
                    element.lon = req.query.lon;
                    element.lat = req.query.lat;
                }

                 });
           console.log("data=========================",JSON.stringify(results[results.length - 1].data))

                let dataHex = Buffer.from(JSON.stringify(results[results.length - 1].data), 'utf8').toString('hex');
                multichain.publish({stream:"Land_Registry",key: req.query.kisaan_id  , data: dataHex }, (err, results) => {
                    if(err){
                        res.send(JSON.stringify(err));
                        return res.end();
                    }else{
                        res.send(JSON.stringify(results));
                        return res.end();
                    }
                })
            }
            })
        });


//====================Get New Address, Provide send receved permission, issue initial SBC====
app.get('/getNewAddress', function(req, res){
    
    multichain.getNewAddress((err, newAddress) => {
        if(err){
            res.send(JSON.stringify(err));
            return res.end();
        }
            newAddrObj.newAddress = newAddress;
            grantNewAddress(newAddress);
            sendInitialCoins(newAddress);
        res.send(JSON.stringify(newAddrObj));
        return res.end();    
        
    })
    });
    function grantNewAddress(newaddress){  
        multichain.grant({
            addresses: newaddress,
            permissions: "send,receive"
        }, (err, grantTxid) => {
            if(err){
                res.send(JSON.stringify(err));
                return res.end();
            }   
           
            newAddrObj.grantTxid = grantTxid;   
            
        })
      }
    
        function sendInitialCoins(newaddress){  
        multichain.sendAssetFrom({
                from: adminAddress,
                to: newaddress,
                asset: "SBC",
                qty: 0
            }, (err, initalCoinTxid) => {
                if(err){
                    res.send(JSON.stringify(err));
                    return res.end();
                }    
                newAddrObj.initalCoinTxid = initalCoinTxid;    
                
            })  
    }
//================================end====================================
//====================issue Assets Admin from list only=====================
app.get('/issueAssets', function(req, res){
    multichain.issue({address: adminAddress, asset: {"name":"Rice","open":true}, qty: 0, units: 0.001}, (err, info) => {
        if(err){
            res.send(JSON.stringify(err));
        return res.end();
        }
        res.send(JSON.stringify(info));
        return res.end();  
        
    })
    });
//========================end============================================
//=====================issue assets by user from available list of assets============
app.get('/issueMoreFrom', function(req, res){
    var someAddress=  "146nguSsuFwpDUaxDgNE3Z5XjpGAu3QEM5Tgm3";
    multichain.issueMoreFrom({
        from: adminAddress, 
        to: someAddress,
        asset: "Rice",    
        qty: 50,  
        details:{
            "OwnerName":"Raju Kumar",
            "OwnerPanNo":"RGFD0869U",
            "Location":"Gorakhpur",
            "IssueDate":"22-04-2018",
            "Unit":"Kg",
            "Currency":"INR",
            "Price":"22"
        }
    }, (err, info) => {
        if(err){
            res.send(JSON.stringify(err));
        return res.end();
        }
        res.send(JSON.stringify({"txid":info}));
        return res.end();  
        
    })
    });
//==========================end================================
//====================issue user address and location=====================
app.get('/issueAddress', function(req, res){
    var someAddress=  "146nguSsuFwpDUaxDgNE3Z5XjpGAu3QEM5Tgm3";
    multichain.issueFrom({
        from: adminAddress, 
        to: someAddress,
        asset: {"name":"100100100102","open":true}, 
        qty: 1, 
        units: 1,
        details:{
            "fullname":"Shesh Agrahari",
            "address1":"H. No. 71",
            "streetname":"Pachrukhiya",
            "city":"Gorakhpur",
            "State":"Uttar Pradesh",
            "country":"India",
            "pincode":"273302",
            "lat":"",
            "lon":"",
            "blocknetworkAddress":"146nguSsuFwpDUaxDgNE3Z5XjpGAu3QEM5Tgm3"    
        }
    }, (err, info) => {
        if(err){
            res.send(JSON.stringify(err));
        return res.end();
        }
        res.send(JSON.stringify({"txid":info}));
        return res.end();  
        
    })
    });
    app.get('/issueMoreAddress', function(req, res){
        var someAddress=  "146nguSsuFwpDUaxDgNE3Z5XjpGAu3QEM5Tgm3";
        multichain.issueMoreFrom({
            from: adminAddress, 
            to: someAddress,
            asset: "100100100102",
        qty: 1,
        details:{
            "fullname":"Shesh Agrahari",
            "address1":"H. No. 56",
            "streetname":"Dhrampur",
            "city":"Maharajganj",
            "State":"Uttar Pradesh",
            "country":"India",
            "pincode":"273303",
            "lat":"",
            "lon":"",
            "blocknetworkAddress":"146nguSsuFwpDUaxDgNE3Z5XjpGAu3QEM5Tgm3"    
        }
        }, (err, info) => {
            if(err){
                res.send(JSON.stringify(err));
            return res.end();
            }
            res.send(JSON.stringify({"txid":info}));
            return res.end();  
            
        })
        });
//========================end============================================
//==========================get list of assets per users and details====================
app.get('/listAddressTransactions', function(req, res){
    var someAddress=  "146nguSsuFwpDUaxDgNE3Z5XjpGAu3QEM5Tgm3";
    multichain.listAddressTransactions({
        address: someAddress,
        count : 100
        }, (err, info) => {
            if(err){
                res.send(JSON.stringify(err));
            return res.end();
            }
        res.send(JSON.stringify(info));
        return res.end();  
        
    })
    });
//=====================end===================================================
//==========================search assets====================
app.get('/searchAssets', function(req, res){
    var adhar = req.param("query");
   // var addhar=  "1001001001021";
    multichain.listAssets({
        asset: adhar
        }, (err, info) => {
        if(err){
        res.send(JSON.stringify(err));
        return res.end();
        }
        res.send(JSON.stringify(info));
        return res.end();  
        
    })
    });
//=====================end===================================================
//==========================transfer assets from each others====================
app.get('/transferAssets', function(req, res){
    var address1=  "146nguSsuFwpDUaxDgNE3Z5XjpGAu3QEM5Tgm3";
    var address2="16pfQUuTPai6nDMpneG2KHXWnepJH6U2Y5LQcT";
    multichain.sendAssetFrom({
        from: address1,
        to: address2,
        asset: "Rice",
        qty: 10
    }, (err, info) => {
        if(err){
            res.send(JSON.stringify(err));
        return res.end();
        }
        res.send(JSON.stringify({"txid":info}));
        return res.end();    
        
    }) 
});
