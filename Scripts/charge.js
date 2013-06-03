$(document).ready(function readyF() {
    // Initialize stuff
    $('#diaTimeout, #diaCustVerify, #diaCustReceipt').modal({
        backdrop: 'static',
        show: false
    });    
    $(".txtMerchant").text($.totalStorage('username'));
    $(".txtTradingDayDate").text($.totalStorage('TradingDayDate'));
    $("#txtTradingDayDate").val($.totalStorage('TradingDayDate'));
    $("#alrPinWait").hide();
    $("#alrFunds").hide();
    $("#txtCurrentDay").val(getFormattedDate());
    $("#divBalance").mousedown(function balanceShowF(){
        $('#txtOpenBal').text("000000.00 GP");
        $('#txtCloseBal').text("000000.00 GP");
    });
    $("#divBalance").mouseup(function balanceHideF(){
        $('#txtOpenBal').text("Touch this box to show.");
        $('#txtCloseBal').text("Touch this box to show.");
    });
    // Timeout after 20 minutes
    window.setInterval(function checkCouponsF() {
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