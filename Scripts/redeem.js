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
    window.plugins.barcodeScanner.scan(    
        function scanGoodF(result) {
            if (!result.cancelled) {
                // process result.text
                var ar = result.text.split(' '),
                    rxCid = /2\d{9}/,
                    Cid, Vid;
                for (var i = 0; i < ar.length; i++) {
                    if (rxCid.test(ar[i])) {
                        Cid = ar[i];
                        break;
                    }        
                };                
                var Cid4 = Cid.substr(Cid.length - 4) 
                for (var i = 0; i < ar.length; i++) {
                    if ((ar[i] !== Cid) && (ar[i].indexOf(Cid4) !== -1)) {
                        Vid = ar[i];
                        break;
                    }        
                };
                $("#txtCid").val(Cid);
                $("#txtVid").val(Vid);
            } else {
                alert("Scanning failed: User Cancelled Scanner.");
            }
        },    
        function scanBadF(error) {
            alert("Scanning failed: " + error);
        });
};