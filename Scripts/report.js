$(document).ready(function readyF() {
    // Initialize stuff
    document.addEventListener("backbutton", function backKeyDownF() {
        // Do nothing
    }, true);   
    Date.prototype.monthNames = [
        "January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"
    ];
    
    Date.prototype.getMonthName = function() {
        return this.monthNames[this.getMonth()];
    };
    Date.prototype.getShortMonthName = function () {
        return this.getMonthName().substr(0, 3);
    };
    $('#diaFilter').modal({
        backdrop: 'static',
        show: false
    });
    // Filter defaults
    $("#txtToday").text(getFormattedDate());
    phoenix.userId = $.totalStorage('userId');
    phoenix.apiKey = $.totalStorage('apiKey');
    // Load Reports
    if (!$.totalStorage('currentReport')) return;
    $("#txtFilter").text($.totalStorage('currentReportFilter'));    
    var total = 0.0;
    $.each($.totalStorage('currentReport').response, function loadReportF(index, value){
        if((index !== 'Document Number') && (index !== 'Serial Number')) {
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
                docu = '<span class="fixedRow1">' + index + '</span>';
                desc = row[0] + '<br/>' + row[3];
                var dDate = new Date(row[4]),
                    mm = (dDate.getMonth() + 1).toString(),
                    dd = dDate.getDate().toString();
                date = (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
            }
            $('#tblData > tbody:last').append(
                $("<tr></tr>").append(
                    $("<td></td>").addClass("fixedRow1").append(docu)).append(
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

var refresh = function refreshF() {
    if ($('#btnRefresh').hasClass('disabled')) return;
    $('#btnRefresh').addClass('disabled');
    $('#btnRefresh').removeClass('btn-primary');
    $('#btnRefresh').addClass('btn-warning');
    $('#btnRefresh').text('Please Wait..');
    if($('#rdoToday').is(':checked')) { 
        if ($('#optFilter').val() === 'Transactions') {
            phoenix.send({
                cgrp:'$merchants',
                cmnd:'getTransReports',
                prms:{
                    'pci':$.totalStorage('ProfitCenterId'),
                    'filter':'today',
                    'startRange':'',
                    'endRange':'',
                }
            }, function callbackF(data) {
                var d = JSON.parse(data);
                if (d.exitCode === 0) {                    
                    $('#btnRefresh').removeClass('btn-warning');
                    $('#btnRefresh').addClass('btn-danger');
                    $('#btnRefresh').text(d.response.error);
                } else {
                    $.totalStorage('currentReportFilter', "Today's Transactions");
                    $.totalStorage('currentReport', d);
                    location.reload();
                }
            });
        } else if ($('#optFilter').val() === 'Coupons') {
            phoenix.send({
                cgrp:'$merchants',
                cmnd:'getCouponReports',
                prms:{
                    'pci':$.totalStorage('ProfitCenterId'),
                    'filter':'today',
                    'startRange':'',
                    'endRange':'',
                }
            }, function callbackF(data) {
                var d = JSON.parse(data);
                if (d.exitCode === 0) {                    
                    $('#btnRefresh').removeClass('btn-warning');
                    $('#btnRefresh').addClass('btn-danger');
                    $('#btnRefresh').text(d.response.error);
                } else {
                    $.totalStorage('currentReportFilter', "Today's Coupons");
                    $.totalStorage('currentReport', d);
                    location.reload();
                }
            });
        }
    }
    if($('#rdoMonthYear').is(':checked')) { 
        var month = parseInt($('#optMonth').val()),
            year = $('#optYear').val(),
            dStart = new Date(year, month, 1),
            dEnd = new Date(year, month + 1, 0);
        if ($('#optFilter').val() === 'Transactions') {
            var dStartMM = (dStart.getMonth()+1).toString(),
                dEndMM = (dEnd.getMonth()+1).toString();
            phoenix.send({
                cgrp:'$merchants',
                cmnd:'getTransReports',
                prms:{
                    'pci':$.totalStorage('ProfitCenterId'),
                    'filter':'dateBetween',
                    'startRange': '0' + dStart.getDate().toString() + 
                        (dStartMM[1] ? dStartMM : "0" + dStartMM[0]) + 
                        dStart.getFullYear().toString()[2] +
                        dStart.getFullYear().toString()[3],
                    'endRange':dEnd.getDate().toString() + 
                        (dEndMM[1] ? dEndMM : "0" + dEndMM[0]) + 
                        dEnd.getFullYear().toString()[2] +
                        dEnd.getFullYear().toString()[3]
                }
            }, function callbackF(data) {
                var d = JSON.parse(data);
                if (d.exitCode === 0) {                    
                    $('#btnRefresh').removeClass('btn-warning');
                    $('#btnRefresh').addClass('btn-danger');
                    $('#btnRefresh').text(d.response.error);
                } else {
                    $.totalStorage('currentReportFilter', dStart.getMonthName() + " Transactions");
                    $.totalStorage('currentReport', d);
                    location.reload();
                }
            });
        } else if ($('#optFilter').val() === 'Coupons') {
            phoenix.send({
                cgrp:'$merchants',
                cmnd:'getCouponReports',
                prms:{
                    'pci':$.totalStorage('ProfitCenterId'),
                    'filter':'dateBetween',
                    'startRange': (dStart.getMonth()+1) + '-' + dStart.getDate() + '-' + dStart.getFullYear(),
                    'endRange': (dEnd.getMonth()+1) + '-' + dEnd.getDate() + '-' + dEnd.getFullYear()
                }
            }, function callbackF(data) {
                var d = JSON.parse(data);
                if (d.exitCode === 0) {                    
                    $('#btnRefresh').removeClass('btn-warning');
                    $('#btnRefresh').addClass('btn-danger');
                    $('#btnRefresh').text(d.response.error);
                } else {
                    $.totalStorage('currentReportFilter', dStart.getMonthName() + " Coupons");
                    $.totalStorage('currentReport', d);
                    location.reload();
                }
            });
        }
    }
};

var cancelFilter = function cancelFilterF() {
    $('#diaFilter').modal('hide');
    $('#btnRefresh').removeClass('disabled');
    $('#btnRefresh').removeClass('btn-danger');
    $('#btnRefresh').removeClass('btn-warning');
    $('#btnRefresh').addClass('btn-primary');
    $('#btnRefresh').text('Refresh Report');
};

var getFormattedDate = function getFormattedDateF() {
    var now = new Date(),
        yyyy = now.getFullYear().toString(),
        mm = (now.getMonth() + 1).toString(), // getMonth() is zero-based
        dd = now.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
};