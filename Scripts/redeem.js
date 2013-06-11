$(document).ready(function readyF() {
    // Initialize stuff
    document.addEventListener("backbutton", function backKeyDownF() {
        // Ignore backbutton.
    }, true);
    $('#diaTimeout').modal({
        backdrop: 'static',
        show: false
    });
    $(".txtMerchant").text($.totalStorage('username'));
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
        function(result) {
            alert("We got a barcode\n" + 
                "Result: " + result.text + "\n" + 
                "Format: " + result.format + "\n" + 
                "Cancelled: " + result.cancelled);
        },    
        function(error) {
            alert("Scanning failed: " + error);
        });
};