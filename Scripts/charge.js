$(document).ready(function readyF() {
    // Initialize stuff
    $('#diaTimeout, #diaCustVerify, #diaCustReceipt').modal({
        backdrop: 'static',
        show: false
    });
    $(".txtMerchant").text($.totalStorage('username'));
    $(".txtTradingDayDate").text($.totalStorage('TradingDayDate'));
    $("#txtTradingDayDate").val($.totalStorage('TradingDayDate'));
    $("#txtCurrentDay").val(getFormattedDate());
    $("#divBalance").on("mousedown touchstart", function balanceShowF() {
        $('#txtOpenBal').text(parseFloat($('#txtHidden').text()).toFixed(2) + " GP");
        $('#txtCloseBal').text(
            (parseFloat($('#txtHidden').text()) - parseFloat($("#txtBillValue").val())).toFixed(2)
            + " GP");
    });
    $("#divBalance").on("mouseup touchend", function balanceHideF() {
        $('#txtOpenBal').text("Touch this box to show.");
        $('#txtCloseBal').text("Touch this box to show.");
    });
    $("#txtCustomerId, #txtBillValue").keyup(function testCustIdF() {
        if ($('#btnCustVerify').text() !== "Customer Verification") {
            $('#btnCustVerify').removeClass('btn-danger');
            $('#btnCustVerify').addClass('btn-primary');
            $('#btnCustVerify').text("Customer Verification");
        }
        if (($('#txtBillValue').val().length > 0) && ($('#txtCustomerId').val().length > 0)) 
            $('#btnCustVerify').removeClass('disabled');
        else $('#btnCustVerify').addClass('disabled');
    });
    $("#txtBillValue").keyup(function updateBillValF() {
        if ($.isNumeric($('#txtBillValue').val())) $(".txtBillTotal").text(
            parseFloat($("#txtBillValue").val()).toFixed(2) + " GP");
    });
    $('#txtCustPIN').keyup(function testCustPINF() {
        if ($('#btnCustPINVerify').text() !== "Verify PIN") {
            $('#btnCustPINVerify').removeClass('btn-warning');
            $('#btnCustPINVerify').removeClass('btn-danger');
            $('#btnCustPINVerify').addClass('btn-primary');
            $('#btnCustPINVerify').text("Verify PIN");
        }
        if (($('#txtCustPIN').val().length === 6) && 
            ($.isNumeric($('#txtCustPIN').val())))
            $('#btnCustPINVerify').removeClass('disabled');
        else $('#btnCustPINVerify').addClass('disabled');
    });
    phoenix.userId = $.totalStorage('userId');
    phoenix.apiKey = $.totalStorage('apiKey');
    // Timeout after 20 minutes
    window.setInterval(function checkCouponsF() {
        $('#diaCustVerify').modal('hide');
        $('#diaCustReceipt').modal('hide');
        $('#diaTimeout').modal('show');
    }, 1200000);
});

var getFormattedDate = function getFormattedDateF() {
    var now = new Date(),
        yyyy = now.getFullYear().toString(),
        mm = (now.getMonth() + 1).toString(), // getMonth() is zero-based
        dd = now.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};

var custVerify = function custVerifyF() {
    if ($('#btnCustVerify').hasClass('disabled')) return;
    $('#btnCustVerify').addClass('disabled');
    if (!$.isNumeric($('#txtBillValue').val())) {
        $('#btnCustVerify').removeClass('btn-primary');
        $('#btnCustVerify').addClass('btn-danger');
        $('#btnCustVerify').text("Bill Value must be numeric.");
        $('#btnCustVerify').removeClass('disabled');
        return;
    }
    if (($('#txtCustomerId').val().length !== 10) || (!$.isNumeric($('#txtCustomerId').val()))) {
        $('#btnCustVerify').removeClass('btn-primary');
        $('#btnCustVerify').addClass('btn-danger');
        $('#btnCustVerify').text("Unrecognized Customer Id.");
        $('#btnCustVerify').removeClass('disabled');
        return;
    }
    $('#btnCustVerify').text("Please wait..");
    phoenix.send({
        cgrp: 'cm',
        cmnd: 'cnq',
        prms: {
            'cid': $('#txtCustomerId').val()
        }
    }, function callbackF(data) {
        var d = JSON.parse(data);
        if (d.exitCode === 0) {
            $('#btnCustVerify').removeClass('btn-primary');
            $('#btnCustVerify').addClass('btn-danger');
            $('#btnCustVerify').text(d.response.error);
            $('#btnCustVerify').removeClass('disabled');
        }
        else {
            $('#custName').text(d.response['cm.cnq.cnm']);
            $('#diaCustVerify').modal('show');
        }
    });
};

var custPINVerify = function custPINVerifyF() {
    if ($('#btnCustPINVerify').hasClass('disabled')) return;    
    $('#btnCustPINVerify').addClass('disabled');
    $('#btnCustPINVerify').removeClass('btn-primary');
    $('#btnCustPINVerify').addClass('btn-warning');
    $('#btnCustPINVerify').text("Please wait..");
    phoenix.send({
        cgrp: '$members',
        cmnd: 'login',
        prms: {
            'cid': $('#txtCustomerId').val(),
            'pin': $('#txtCustPIN').val()
        }
    }, function callbackF(data) {
        var d = JSON.parse(data);
        if (d.exitCode === 0) {
            $('#btnCustPINVerify').removeClass('btn-warning');
            $('#btnCustPINVerify').addClass('btn-danger');
            $('#btnCustPINVerify').attr('title', d.response.error);
            $('#btnCustPINVerify').text("Id & PIN Mismatch; Try Again.");
            $('#btnCustPINVerify').removeClass('disabled');
        }
        else {
            $('#txtHidden').text(d.response.VisBal);
            $('#diaCustVerify').modal('hide');
            if ((parseFloat($('#txtHidden').text()) - parseFloat($("#txtBillValue").val())) > 0) {
                $('#btnCompIssue').addClass('btn-success');
            } else {
                $('#btnCompIssue').addClass('btn-danger');
                $('#btnCompIssue').text('Insufficient Funds!');                
            }            
            $('#diaCustReceipt').modal('show');
        }
    });    
};

var custVerifyDone = function custVerifyDoneF() {
    if ($('#btnCompIssue').text().indexOf("Success!") !== -1)
        return;
    if (!$('#btnCompIssue').hasClass('btn-success')) {
        $('#btnCustVerify').text("Customer Verification");
        $('#btnCustVerify').removeClass('disabled');
        $('#btnCustPINVerify').text("Verify PIN");
        $('#btnCustPINVerify').removeClass('disabled');
        $('#txtCustPIN').val('');
        $('#diaCustReceipt').modal('hide');
        return;        
    } else {
        $('#btnCompIssue').removeClass('disabled');
        $('#btnCompIssue').text("Verify PIN");        
    }
    phoenix.send({
        cgrp: 'comp',
        cmnd: 'issue',
        prms: {
            'cid': $('#txtCustomerId').val(),
            'ddv': parseFloat($("#txtBillValue").val()).toFixed(2),
            'bil': parseFloat($("#txtBillValue").val()).toFixed(2),
            'tdd': $.totalStorage('TradingDayDate'),
            'cis': $.totalStorage('CompIssueShift'),
            'pci': $.totalStorage('ProfitCenterId'),
            'cxTdd': getFormattedDate(),
            'man':1,
            'frmCil':$.totalStorage('FormPrinterCIL'),
            'acCil':$.totalStorage('AccountingCIL')
        }
    }, function callbackF(data) {
        var d = JSON.parse(data);
        if (d.exitCode === 0) {
            $('#btnCompIssue').removeClass('btn-success');
            $('#btnCompIssue').addClass('btn-danger');
            $('#btnCompIssue').text(d.response.error);
        }
        else {
            $('#btnCompIssue').text("Success! Doc#" + d.response['comp.issue.dno');
            $('#btnCompIssue').addClass('disabled');
        }
    });  
    $('#hiddenExit').attr('onclick','window.location = "index.html";')
};