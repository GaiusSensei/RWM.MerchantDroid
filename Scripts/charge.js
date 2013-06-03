$(document).ready(function readyF() {
    // Initialize stuff
    $('#diaTimeout').modal({
        backdrop: 'static',
        show: false
    });    
    $("#txtMerchant").text($.totalStorage('username'));
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