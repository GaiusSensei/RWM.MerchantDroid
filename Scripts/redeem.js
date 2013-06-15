$(document).ready(function readyF() {
    // Initialize stuff
    document.addEventListener("backbutton", function backKeyDownF() {
        // Ignore backbutton.
    }, true);
    $('#diaTimeout, #diaNoGood, #diaGood').modal({
        backdrop: 'static',
        show: false
    });
    $(".txtMerchant").text($.totalStorage('username'));
    $("#txtCid, #txtVno").keyup(function testCid(){
        var enable = true;
        if ($("#txtCid").val().length < 10) enable = false;
        if ($.isNumeric($("#txtCid").val()) === false) enable = false;
        if ($("#txtVno").val().length < 4) enable = false;
        if (enable) {
            $("#btnCheck").removeClass("disabled");
        } else {
            $("#btnCheck").addClass("disabled");
        }          
    });
    phoenix.userId = $.totalStorage('userId');
    phoenix.apiKey = $.totalStorage('apiKey');
    // Timeout after 20 minutes
    window.setInterval(function checkCouponsF() {
        $('#diaTimeout').modal('show');
    }, 1200000);
});

var tryScan = function tryScanF() {
    var scanner = cordova.require("cordova/plugin/BarcodeScanner");
    scanner.scan(    
        function scanGoodF(result) {
            if (!result.cancelled) {
                // process result.text
                var ar = result.text.split(' '),
                    rxCid = /2\d{9}/,
                    Cid, Vno, i;
                for (i = 0; i < ar.length; i++) {
                    if (rxCid.test(ar[i])) {
                        Cid = ar[i];
                        break;
                    }        
                }                
                var Cid4 = Cid.substr(Cid.length - 4);
                for (i = 0; i < ar.length; i++) {
                    if ((ar[i] !== Cid) && (ar[i].indexOf(Cid4) !== -1)) {
                        Vno = ar[i];
                        break;
                    }        
                }
                $("#txtCid").val(Cid);
                $("#txtVno").val(Vno);
                if (Cid && Vno) {
                    $("#btnCheck").removeClass("disabled");
                }
            } else {
                alert("Scanning failed: User Cancelled Scanner.");
            }
        },    
        function scanBadF(error) {
            alert("Scanning failed: " + error);
        });
};

var check = function checkF() {
    if ($("#btnRedeem").hasClass("disabled")) return;
    $("#btnCheck").addClass("disabled");
    $("#btnCheck").removeClass("btn-primary");
    $("#btnCheck").addClass("btn-warning");
    $("#btnCheck").text("Please wait..");
    phoenix.send({
        cgrp:'$merchants',
        cmnd:'checkCoupon',
        prms:{
            'serialNo':$("#txtVno").val(),
            'cid':$("#txtCid").val(),
        }
    }, function callbackF(data) {
        var d = JSON.parse(data);
        if (d.exitCode === 0) {
            $("#diaNoGood").modal("show");
        } else {
            $("#txtCnm1").text(d.response.CustomerName);
            $("#txtCnm2").text(d.response.CustomerName);
            $("#txtCidDetail").text($("#txtCid").val());
            $("#txtEntitlement1").text(d.response.Entitlement);
            $("#txtEntitlement2").text(d.response.Entitlement);
            $("#txtEvent").text(d.response.EventName);
            $("#txtTransDate").text(d.response.TransactionDate);
            $("#diaGood").modal("show");            
        }
    });
};

var redeem = function redeemF() {
    if ($("#btnRedeem").hasClass("disabled")) return;
    $("#btnRedeem").addClass("disabled");
    $("#btnRedeem").removeClass("btn-primary");
    $("#btnRedeem").addClass("btn-warning");
    $("#btnRedeem").text("Please wait..");
    phoenix.send({
        cgrp:'$merchants',
        cmnd:'redeemCoupon',
        prms:{
            'serialNo':$("#txtVno").val(),
            'cid':$("#txtCid").val(),
            'pci':$.totalStorage('ProfitCenterId'),
            'acCil':$.totalStorage('AccountingCIL'),
        }
    }, function callbackF(data) {
        var d = JSON.parse(data);
        if (d.exitCode === 0) {
            $("#btnRedeem").removeClass("btn-warning");
            $("#btnRedeem").addClass("btn-error");
            $("#btnRedeem").text(d.response.error);            
        } else {
            $("#btnRedeem").removeClass("btn-warning");
            $("#btnRedeem").addClass("btn-success");
            $("#btnRedeem").text("Successfully Redeemed!");            
        }
    });
};