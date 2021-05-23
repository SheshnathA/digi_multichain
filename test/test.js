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
                let dataString = Buffer.from(results[results.length - 1].data, 'hex').toString();
                results[results.length - 1].data = JSON.parse(dataString);
                res.send(JSON.stringify(results[results.length - 1]));
                return res.end();
                
            }) 
        });

        app.get('/getListStreamItems', function(req, res){
                multichain.listStreamItems({
                    stream: "Land_Registry",
                    verbose: false
                    
                }, (err, results) => {
                    if(err){
                        res.send(JSON.stringify(err));
                        return res.end();
                    }  
            });
    
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
           // console.log(res)
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
                   uniqueIDLekhPal=oKisaanInfo.kisaan_id+"L_"+uniqidNew;
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
                var kisaanStreamKey = "KISAAN_100010001011"//req.query.kisaan_id;
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
                    if(element.kisaan_lekpal_id=="KISAAN_100010001011L_jipxmvud"){
                        element.lekhpal_approval_status = "Approved";
                        element.lekhpal_cmt = "I have found the valid data during physical varification";
                        element.lon = 26.944690;
                        element.lat = 83.532125;
                    }
                   
                     });
               
                 
                    let dataHex = Buffer.from(JSON.stringify(results[results.length - 1].data), 'utf8').toString('hex');
                    multichain.publish({stream:"Land_Registry",key: "KISAAN_100010001011" , data: dataHex }, (err, results) => {                       
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



            app.get('/shareKisaanformlandInfoToBank', function(req, res){
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
                   
                   var oAddFarmlandInfoForBankApproval ={};
                //    results[results.length - 1].data.kisaan_shared_info_with_lekhpal.forEach(element => {
                //     if(element.kisaan_lekpal_id==req.query.kisaan_lekpal_id){
                //         element.shared_with_bank = "yes";
                //         element.shared_with_inns_company = "no";
                //     }
                   
                // });
                   results[results.length - 1].data.kisaan_shared_info_with_lekhpal.forEach(element => {
                    if(element.kisaan_lekpal_id==req.query.kisaan_lekpal_id){
                        element.shared_with_bank = "yes";
                        //oAddFarmlandInfoForBankApproval.push(element);
                        oAddFarmlandInfoForBankApproval.farmland_Name = element.farmland_Name;
                        oAddFarmlandInfoForBankApproval.farmland_desc = element.farmland_desc;
                        oAddFarmlandInfoForBankApproval.farmland_size = element.farmland_size;
                        oAddFarmlandInfoForBankApproval.farmland_size_unit = element.farmland_size_unit;
                        oAddFarmlandInfoForBankApproval.state = element.state;
                        oAddFarmlandInfoForBankApproval.city = element.city;
                        oAddFarmlandInfoForBankApproval.country = element.country;
                        oAddFarmlandInfoForBankApproval.zipcode = element.zipcode;
                        oAddFarmlandInfoForBankApproval.lekhpal_approval_status = element.lekhpal_approval_status;
                        oAddFarmlandInfoForBankApproval.lekhpal_cmt = element.lekhpal_cmt;
                        oAddFarmlandInfoForBankApproval.lon = element.lon;
                        oAddFarmlandInfoForBankApproval.lat = element.lat;
                        oAddFarmlandInfoForBankApproval.kisaan_bank_id = oKisaanInfo.kisaan_id+"B_"+uniqidNew;
                        oAddFarmlandInfoForBankApproval.owner_name = oKisaanInfo.fullname;
                        oAddFarmlandInfoForBankApproval.owner_pic = "/img/team/shesh.jpg";
                        oAddFarmlandInfoForBankApproval.bank_name = req.query.bank_name;
                        oAddFarmlandInfoForBankApproval.phonenum = oKisaanInfo.phonenum;
                        oAddFarmlandInfoForBankApproval.loan_amt = req.query.loan_amt;
                        oAddFarmlandInfoForBankApproval.loan_status ="Pending";
                        oAddFarmlandInfoForBankApproval.bank_cmt ="Pending With Loan Officer";
                        oAddFarmlandInfoForBankApproval.loan_txid ="";
                        oAddFarmlandInfoForBankApproval.loan_id = "LOAN_"+uniqidNew;
                        oAddFarmlandInfoForBankApproval.loan_apply_date =req.query.loan_apply_date;
                        oAddFarmlandInfoForBankApproval.loan_start_date ="NA";
                        oAddFarmlandInfoForBankApproval.loan_due_date = "NA";
                        oAddFarmlandInfoForBankApproval.shared_with_bank = "yes";
                        oAddFarmlandInfoForBankApproval.loan_duration =req.query.loan_duration;
                    }
                   
                });
                   results[results.length - 1].data.kisaan_shared_info_with_bank.push(oAddFarmlandInfoForBankApproval);

                    let dataHex = Buffer.from(JSON.stringify(results[results.length - 1].data), 'utf8').toString('hex');
                    multichain.publish({stream:"Land_Registry",key: oKisaanInfo.kisaan_id , data: dataHex }, (err, results) => {                       
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
            app.get('/setLoanApprovalStatusByBank', function(req, res){
                var kisaanStreamKey = "KISAAN_100010001011"//req.query.kisaan_id;
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
              
                results[results.length - 1].data.kisaan_shared_info_with_bank.forEach(element => {
                    if(element.kisaan_bank_id=="KISAAN_100010001011B_B_jipm6z08"){
                        element.loan_status = "Approved";
                        element.bank_cmt = "I have found all the document and information correct during varification";
                        element.loan_start_date ="01/08/2018";
                        element.loan_due_date = "01/08/2019";
                    }
                   
                     });
               
                 
                    let dataHex = Buffer.from(JSON.stringify(results[results.length - 1].data), 'utf8').toString('hex');
                    multichain.publish({stream:"Land_Registry",key: "KISAAN_100010001011" , data: dataHex }, (err, results) => {                       
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

            

            app.get('/shareKisaanformlandInfoToInnsuranceCompany', function(req, res){
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
                   
                   var oAddFarmlandInfoForInnsuranceApproval ={};
                   results[results.length - 1].data.kisaan_shared_info_with_lekhpal.forEach(element => {
                    if(element.kisaan_lekpal_id==req.query.kisaan_lekpal_id){
                        element.shared_with_inns_company = "yes";
                        //oAddFarmlandInfoForBankApproval.push(element);
                        oAddFarmlandInfoForInnsuranceApproval.farmland_Name = element.farmland_Name;
                        oAddFarmlandInfoForInnsuranceApproval.farmland_desc = element.farmland_desc;
                        oAddFarmlandInfoForInnsuranceApproval.farmland_size = element.farmland_size;
                        oAddFarmlandInfoForInnsuranceApproval.farmland_size_unit = element.farmland_size_unit;
                        oAddFarmlandInfoForInnsuranceApproval.state = element.state;
                        oAddFarmlandInfoForInnsuranceApproval.city = element.city;
                        oAddFarmlandInfoForInnsuranceApproval.country = element.country;
                        oAddFarmlandInfoForInnsuranceApproval.zipcode = element.zipcode;
                        oAddFarmlandInfoForInnsuranceApproval.lekhpal_approval_status = element.lekhpal_approval_status;
                        oAddFarmlandInfoForInnsuranceApproval.lekhpal_cmt = element.lekhpal_cmt;
                        oAddFarmlandInfoForInnsuranceApproval.lon = element.lon;
                        oAddFarmlandInfoForInnsuranceApproval.lat = element.lat;
                        oAddFarmlandInfoForInnsuranceApproval.kisaan_inns_comp_id = oKisaanInfo.kisaan_id+"IC_"+uniqidNew;
                        oAddFarmlandInfoForInnsuranceApproval.owner_name = oKisaanInfo.fullname;
                        oAddFarmlandInfoForInnsuranceApproval.owner_pic = "/img/team/shesh.jpg";
                        oAddFarmlandInfoForInnsuranceApproval.inns_company_name = req.query.inns_company_name;
                        oAddFarmlandInfoForInnsuranceApproval.phonenum = oKisaanInfo.phonenum;
                        oAddFarmlandInfoForInnsuranceApproval.inns_amt = req.query.inns_amt;
                        oAddFarmlandInfoForInnsuranceApproval.inns_status ="Pending";
                        oAddFarmlandInfoForInnsuranceApproval.inns_company_cmt ="Pending With Loan Officer";
                        oAddFarmlandInfoForInnsuranceApproval.inns_txid ="";
                        oAddFarmlandInfoForInnsuranceApproval.inns_id = "INNS_"+uniqidNew;
                        oAddFarmlandInfoForInnsuranceApproval.inns_start_date ="20/07/2018";
                        oAddFarmlandInfoForInnsuranceApproval.inns_duration=req.query.inns_duration;
                        oAddFarmlandInfoForInnsuranceApproval.shared_with_bank = "yes";
                        oAddFarmlandInfoForInnsuranceApproval.inns_apply_date =req.query.inns_apply_date;
                    }
                   
                });
                   results[results.length - 1].data.kisaan_shared_info_with_innscomp.push(oAddFarmlandInfoForInnsuranceApproval);

                    let dataHex = Buffer.from(JSON.stringify(results[results.length - 1].data), 'utf8').toString('hex');
                    multichain.publish({stream:"Land_Registry",key: oKisaanInfo.kisaan_id , data: dataHex }, (err, results) => {                       
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



            app.get('/setInnsuranceApprovalStatusByCompany', function(req, res){
                var kisaanStreamKey = "KISAAN_100010001011"//req.query.kisaan_id;
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
              
                results[results.length - 1].data.kisaan_shared_info_with_innscomp.forEach(element => {
                    if(element.kisaan_bank_id=="KISAAN_100010001011IC_jipmmqaj"){
                        element.inns_status = "Approved";
                        element.inns_company_cmt = "I have found all the document and information correct during varification";
                        element.inns_start_date ="01/08/2018";
                    }
                   
                     });
               
                 
                    let dataHex = Buffer.from(JSON.stringify(results[results.length - 1].data), 'utf8').toString('hex');
                    multichain.publish({stream:"Land_Registry",key: "KISAAN_100010001011" , data: dataHex }, (err, results) => {                       
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

    


