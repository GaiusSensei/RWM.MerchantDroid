$(document).ready(function readyF() {
    // Initialize stuff
    document.addEventListener("backbutton", function backKeyDownF() {
        // Do nothing
    }, true);   
    
    $('#diaFilter').modal({
        backdrop: 'static',
        show: false
    });
    // Load Reports
    $("#txtFilter").text($.totalStorage('currentReportFilter'));
    var total = 0.0;
    $.each($.totalStorage('currentReport').response, function loadReportF(index, value){
        if((index !== 'Document Number') && (index !== 'Coupon No')) {
            var docu, desc, date, row = value.split('|');
            if ($.totalStorage('currentReportFilter').indexOf("Transaction") !== -1) {
                // Transactions
                docu = '<span class="fixedRow1">' + index + '</span>';
                if (row[3] === 'XCMP')
                    desc = '<span>' + row[4] + '</span><br/>' + "Transaction Cancelled";
                else 
                    desc = '<span>' + row[4] + '</span><br/>' + "Successfully Charged";                    
                desc = desc + '<strong class="pull-right">' + row[5] + '</strong>';
                date = '<span class="pull-right">' + 
                    row[0][3] + row[0][4] + "-" + row[0][0] + row[0][1] + '</span>';
            } else {
                // Coupons
            }
            $('#tblData > tbody:last').append(
                $("<tr></tr>").append(
                    $("<td></td>").addClass("fixed").append(docu)).append(
                    $("<td></td>").append(desc)).append(
                    $("<td></td>").append(date)));
            total = total + parseFloat(row[5]);
        }
    });
    if (total > 0)
        $('#tblData > tbody:last').append(
            $("<tr></tr>").append(
                $("<td></td>").addClass("fixed").append("")).append(
                $("<td></td>").append('<br />Total <strong class="pull-right">' + total.toFixed(2) + '</strong>')).append(
                $("<td></td>").append("")));
});

var filter = function filterF() {
    $("#diaFilter").modal('show');
};