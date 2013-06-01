$(document).ready(function readyF() {
    // Initialize stuff
    $('#signin').hide();
    $('#changepw').hide();
    $('#forgotpw').hide();
    $('#txtMId').keypress(function(e) {
        if (e.which == 13) {
            $('#txtMPw').focus().click();
            return false;
        }
    });
    $('#txtMPw').keypress(function(e) {
        if (e.which == 13) {
            authSend();
            return false;
        }
    });
    $('#signin, #changepw, #forgotpw, #pleaseWait').modal({
        backdrop: 'static',
        show: false
    });
    // Coupon Check
    refreshCouponCount();
    window.setInterval(function checkCouponsF() {
        if ($.totalStorage('apiKey')) {
            refreshCouponCount();
        }
    }, 60000);
    // Silent Auth
    if (!$.totalStorage('apiKey')) {
        // Log Out
        $.totalStorage('userId', null);
        $.totalStorage('apiKey', null);
        $.totalStorage('emailAdd', null);
        $.totalStorage('CompIssueShift', null);
        $.totalStorage('ProfitCenterId', null);
        $.totalStorage('isTradingDayDateOpen', null);
        $.totalStorage('TradingDayDate', null);
        $("#spnUser").text('Guest');
        $("#spnUserAction").text('In');
        $("#spnTradingDay").text("Trading Day is CLOSED!");
        $("#btnCharge").attr("disabled", "disabled");
        $("#btnCoupons").attr("disabled", "disabled");
        $("#btnReports").attr("disabled", "disabled");
        $("#btnLogAct").removeClass("btn-warning");
        $("#btnLogAct").addClass("btn-success");
        $("#btnLogAct").text("Log In");
        showDiaInfo(":| You are not logged in.", "Click the Log In button above.");
    }
    else {
        // Log In
        $("#spnUser").text($.totalStorage('username'));
        $("#spnUserAction").text("Out");
        getTDD();
        $("#btnCharge").attr("disabled", null);
        $("#btnCoupons").attr("disabled", null);
        $("#btnReports").attr("disabled", null);
        $("#btnLogAct").removeClass("btn-success");
        $("#btnLogAct").addClass("btn-warning");
        $("#btnLogAct").text("Log Out");
        hideDiaInfo(":| You are not logged in.");
    }
});

var auth = function authF() {
    if (!$.totalStorage('apiKey')) {
        $('#diaSignin').hide();
        $('#signin').show();
        $('#signin').modal('show');
    }
    else {
        $.totalStorage('userId', null);
        $.totalStorage('apiKey', null);
        $.totalStorage('emailAdd', null);
        $.totalStorage('CompIssueShift', null);
        $.totalStorage('ProfitCenterId', null);
        $.totalStorage('isTradingDayDateOpen', null);
        $.totalStorage('TradingDayDate', null);
        $("#spnUser").text('Guest');
        $("#spnUserAction").text('In');
        $("#spnTradingDay").text("Trading Day is CLOSED!");
        $("#btnCharge").attr("disabled", "disabled");
        $("#btnCoupons").attr("disabled", "disabled");
        $("#btnReports").attr("disabled", "disabled");
        $("#btnLogAct").removeClass("btn-warning");
        $("#btnLogAct").addClass("btn-success");
        $("#btnLogAct").text("Log In");
        hideDiaInfo(":| Trading day is CLOSED!");
        showDiaInfo(":| You are not logged in.", "Click the Log In button above.");
    }
};

var authSend = function authSendF() {
    $('#spnErr').hide();
    $('#diaSignin').slideDown();
    $('#diaSignin').removeClass('alert-error');
    $('#diaSignin').addClass('alert-warn');
    $('#spnWait').show();
    phoenix.public({
        cgrp: '$merchants',
        cmnd: 'auth',
        prms: {
            'username': $("#txtMId").val(),
            'password': $("#txtMPw").val()
        }
    }, authSendDone);
};

var authSendDone = function authSendDoneF(results) {
    var d = JSON.parse(results);
    if (d.exitCode === 0) {
        $('#spnWait').hide();
        $('#diaSignin').removeClass('alert-warn');
        $('#diaSignin').addClass('alert-error');
        $('#spnErr').show();
    }
    else {
        $.totalStorage('username', $("#txtMId").val());
        $.totalStorage('userId', d.response.userId);
        $.totalStorage('apiKey', d.response.apiKey);
        $.totalStorage('emailAdd', d.response.emailAdd);
        $.totalStorage('CompIssueShift', d.response.CompIssueShift);
        $.totalStorage('ProfitCenterId', d.response.ProfitCenterId);
        $("#spnUser").text($.totalStorage('username'));
        $("#spnUserAction").text("Out");
        getTDD();
        $("#btnCharge").attr("disabled", null);
        $("#btnCoupons").attr("disabled", null);
        $("#btnReports").attr("disabled", null);
        $("#btnLogAct").removeClass("btn-success");
        $("#btnLogAct").addClass("btn-warning");
        $("#btnLogAct").text("Log Out");
        hideDiaInfo(":| You are not logged in.");
        $('#signin').modal('hide');
        $('#signin').hide();
    }
};

var changePass = function changePassF() {
    $('#signin').modal('hide');
    $('#changepw').show();
    $('#changepw').modal('show');
    $("#txtCPwMId").val($("#txtMId").val());
};

var changePassSend = function changePassSendF() {
    $('#changepw').modal('hide');
    if ($('#txtCPwMId').val().length < 1) {
        showAlrInfo("Something's wrong!", "Merchant Identifier is required. Please try again..");
    }
    else if ($('#txtCPwNPw1').val().length < 6) {
        showAlrInfo("Something's wrong!", "The new password is too short! At least six characters are required. Please try again..");
    }
    else if ($('#txtCPwNPw1').val() !== $('#txtCPwNPw2').val()) {
        showAlrInfo("Something's wrong!", "The new passwords did not match! Please try again..");
    }
    else {
        phoenix.public({
            cgrp: '$merchants',
            cmnd: 'authChange',
            prms: {
                'username': $('#txtCPwMId').val(),
                'oldPassword': $('#txtCPwOPw').val(),
                'newPassword': $('#txtCPwNPw1').val()
            }
        }, function authChangedF(data) {
            var d = JSON.parse(data);
            if (d.exitCode === 0) {
                showAlrInfo("Something's wrong!", d.response.error);
            }
            else {
                showAlrInfo("Password Change Successful!", "You may now log in using the new credentials.");
            }
        });
    }
    $('#changepw').hide();
};

var forgotPass = function forgotPassF() {
    $('#signin').modal('hide');
    $('#forgotpw').show();
    $('#forgotpw').modal('show');
    $("#txtFPWMId").val($("#txtMId").val());
};

var forgotPassSend = function forgotPassSendF() {
    $('#forgotpw').modal('hide');
    if ($('#txtFPWMId').val().length < 1) {
        showAlrInfo("Something's wrong!", "Merchant Identifier is required. Please try again..");
    }
    else if ($('#txtFPWMEa').val().length < 1) {
        showAlrInfo("Something's wrong!", "Merchant Email Address is required. Please try again..");
    }
    else {
        phoenix.public({
            cgrp: '$merchants',
            cmnd: 'authForgot',
            prms: {
                'username': $('#txtFPWMId').val(),
                'email': $('#txtFPWMEa').val()
            }
        }, function authChangedF(data) {
            var d = JSON.parse(data);
            if (d.exitCode === 0) {
                showAlrInfo("Something's wrong!", d.response.error);
            }
            else {
                showAlrInfo("New Password Generated!", "You may now log in using the new credentials sent to your email address.");
            }
        });
    }
    $('#forgotpw').hide();
};

var getTDD = function getTDDF() {
    if ($.totalStorage('apiKey')) {
        phoenix.userId = $.totalStorage('userId');
        phoenix.apiKey = $.totalStorage('apiKey');
        phoenix.send({
            cmnd: 'gtdd',
            prms: {}
        }, getTDDDone);
    }
};

var getTDDDone = function getTDDDoneF(data) {
    var d = JSON.parse(data);
    $.totalStorage('isTradingDayDateOpen', d.response['gtdd.pop']);
    $.totalStorage('TradingDayDate', d.response['gtdd.ptd']);
    if (d.response['gtdd.pop'] === '0') {
        $("#spnTradingDay").text("Trading Day is CLOSED!");
        $("#btnCharge").attr("disabled", "disabled");
        showDiaInfo(":| Trading day is CLOSED!", "Merchants cannot charge GP when the Pit Trading is closed. Re-Log In to check again.");
    }
    else {
        $("#spnTradingDay").text("Trading Day: " + d.response['gtdd.ptd']);
    }
};

var checkConnection = function checkConnectionF(callback) {
    if ($.totalStorage('apiKey')) {
        $('#pleaseWait').modal('show');
        window.setTimeout(function delayed(){
            if ($.totalStorage('TradingDayDate') !== getFormattedDate()) {
                phoenix.userId = $.totalStorage('userId');
                phoenix.apiKey = $.totalStorage('apiKey');
                phoenix.send({
                    cmnd: 'gtdd',
                    prms: {}
                }, function checkConnectionDoneF(data) {
                    $('#pleaseWait').modal('hide');
                    var d = JSON.parse(data);
                    if (d.exitCode === 0) {
                        showAlrInfo("Something's wrong!", d.response.error);
                    }
                    else {
                        $.totalStorage('isTradingDayDateOpen', d.response['gtdd.pop']);
                        $.totalStorage('TradingDayDate', d.response['gtdd.ptd']);
                        if (d.response['gtdd.pop'] === '0') {
                            showAlrInfo("Something's wrong!", "Merchants cannot charge GP when the Pit Trading is closed.");
                        }
                        else {
                            callback();
                        }
                    }
                });
            } else {
                $('#pleaseWait').modal('hide');
                callback();
            }
        }, 1000);
    }
};

var goToCharge = function goToChargeF() {
    window.location = "\\charge.html";
};

var showDiaInfo = function showDiaInfoF(header, body) {
    $("#diaInfoHead").text(header);
    $("#diaInfoBody").text(body);
    $("#diaInfo").show();
    $("#diaInfo").addClass('in');
};

var hideDiaInfo = function hideDiaInfoF(header) {
    if ($("#diaInfoHead").text() === header) {
        $("#diaInfo").removeClass('in');
        $("#diaInfo").hide();
    }
};

var showAlrInfo = function showAlrInfoF(header, body) {
    $("#alrInfoHead").text(header);
    $("#alrInfoBody").text(body);
    $("#alrInfo").modal('show');
};

var refreshCouponCount = function refreshCouponCountF() {
    $("#spnPendingCoupons").text("0");
};

var getFormattedDate = function getFormattedDateF() {
    var now = new Date(),
        yyyy = now.getFullYear().toString(),
        mm = (now.getMonth() + 1).toString(), // getMonth() is zero-based
        dd = now.getDate().toString();
    return yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]);
}