var isOnline, isAuth,
    publicUserId = 'public',
    publicApiKey = '7CE766FE1473813B97C148EB9F7BD49514B9ECD0';
$(document).ready(function readyF() {
    // Initialize stuff
    showDiaInfo(":| You are not logged in.", "Click the Log In button above.");
    isOnline = false;
    showDiaError(":( There seems to be no internet.", "Please check the current internet status.");
    isAuth = false;
    $('#txtMId').keypress(function (e) {
        if (e.which == 13) {
            $('#txtMPw').focus().click();
            return false;
        }
    });
    $('#txtMPw').keypress(function (e) {
        if (e.which == 13) {
            authSend();
            return false;
        }
    });
    $('#signin, #changepw, #forgotpw').modal({
        backdrop: 'static',
        show: false
    });
    // Initialize Internet/Auth Checker
    if (window.cordova) {
        document.addEventListener("offline", function () {
            if (isOnline) {
                showDiaError(":( There seems to be no internet.", "Please check the current internet status.");
                isOnline = false;
            }
        }, false);
        document.addEventListener("online", function () {
            if (!isOnline) {
                hideDiaError(":( There seems to be no internet.");
                isOnline = true;
            }
        }, false);
    }
    window.setInterval(function checkConnF() {
        // Check if online (Doesn't work with phonegap)
        if (!window.cordova) {
            if (!window.navigator.onLine) {
                if (isOnline) {
                    showDiaError(":( There seems to be no internet.", "Please check the current internet status..");
                    isOnline = false;
                }
            } else {
                if (!isOnline) {
                    hideDiaError(":( There seems to be no internet.");
                    isOnline = true;
                }
            }
        }
        // Check if authenticated
        if (!$.totalStorage('apiKey')) {
            if (isAuth) {
                showDiaInfo(":| You are not logged in.", "Click the Log In button above.");
                isAuth = false;
            }
        } else {
            if (!isAuth) {
                hideDiaInfo(":| You are not logged in.");
                isAuth = true;
            }
        }
    }, 1000);
    // Coupon Check
    refreshCouponCount();
    window.setInterval(function checkCouponsF() {
        refreshCouponCount();
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
    } else {
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
        $('#signin').modal('hide');
    }
});

var auth = function authF() {
    if (!$.totalStorage('apiKey')) {
        $('#diaSignin').hide();
        $('#signin').modal('show');
    } else {
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
    }
}

var authSend = function authSendF() {
    $('#spnErr').hide();
    $('#diaSignin').slideDown();
    $('#diaSignin').removeClass('alert-error');
    $('#diaSignin').addClass('alert-warn');
    $('#spnWait').show();
    phoenix.userId = publicUserId;
    phoenix.apiKey = publicApiKey;
    phoenix.send({
        cgrp: '$merchants',
        cmnd: 'auth',
        prms: {
            'username': $("#txtMId").val(),
            'password': $("#txtMPw").val()
        }
    }, authSendDone);
}

var authSendDone = function authSendDoneF(results) {
    var d = JSON.parse(results);
    if (d.exitCode === 0) {
        $('#spnWait').hide();
        $('#diaSignin').removeClass('alert-warn');
        $('#diaSignin').addClass('alert-error');
        $('#spnErr').show();
    } else {
        $.totalStorage('username', $("#txtMId").val());
        $.totalStorage('userId', d.response['userId']);
        $.totalStorage('apiKey', d.response['apiKey']);
        $.totalStorage('emailAdd', d.response['emailAdd']);
        $.totalStorage('CompIssueShift', d.response['CompIssueShift']);
        $.totalStorage('ProfitCenterId', d.response['ProfitCenterId']);
        $("#spnUser").text($.totalStorage('username'));
        $("#spnUserAction").text("Out");
        getTDD();
        $("#btnCharge").attr("disabled", null);
        $("#btnCoupons").attr("disabled", null);
        $("#btnReports").attr("disabled", null);
        $("#btnLogAct").removeClass("btn-success");
        $("#btnLogAct").addClass("btn-warning");
        $("#btnLogAct").text("Log Out");
        $('#signin').modal('hide');
    }
}

var changePass = function changePassF() {
    $('#signin').modal('hide');
    $('#changepw').modal('show');
    $("#txtCPwMId").val($("#txtMId").val());
}

var changePassSend = function changePassSendF() {
    $('#changepw').modal('hide');
    if ($('#txtCPwMId').val().length < 1) {
        showAlrInfo("Something's wrong!", "Merchant Identifier is required. Please try again..");
    } else if ($('#txtCPwNPw1').val().length < 6) {
        showAlrInfo("Something's wrong!", "The new password is too short! At least six characters are required. Please try again..");
    } else if ($('#txtCPwNPw1').val() !== $('#txtCPwNPw2').val()) {
        showAlrInfo("Something's wrong!", "The new passwords did not match! Please try again..");
    } else {
        phoenix.userId = publicUserId;
        phoenix.apiKey = publicApiKey;
        phoenix.send({
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
                showAlrInfo("Something's wrong!", d.response['error']);
            } else {
                showAlrInfo("Password Change Successful!", "You may now log in using the new credentials.");
            }
        });
    }
}

var forgotPass = function forgotPassF() {
    $('#signin').modal('hide');
    $('#forgotpw').modal('show');
    $("#txtFPWMId").val($("#txtMId").val());
}

var forgotPassSend = function forgotPassSendF() {
    $('#forgotpw').modal('hide');
    if ($('#txtFPWMId').val().length < 1) {
        showAlrInfo("Something's wrong!", "Merchant Identifier is required. Please try again..");
    } else if ($('#txtFPWMEa').val().length < 1) {
        showAlrInfo("Something's wrong!", "Merchant Email Address is required. Please try again..");
    } else {
        phoenix.userId = publicUserId;
        phoenix.apiKey = publicApiKey;
        phoenix.send({
            cgrp: '$merchants',
            cmnd: 'authForgot',
            prms: {
                'username': $('#txtFPWMId').val(),
                'email': $('#txtFPWMEa').val()
            }
        }, function authChangedF(data) {
            var d = JSON.parse(data);
            if (d.exitCode === 0) {
                showAlrInfo("Something's wrong!", d.response['error']);
            } else {
                showAlrInfo("New Password Generated!", "You may now log in using the new credentials sent to your email address.");
            }
        });
    }

}

var getTDD = function getTDDF() {
    if ($.totalStorage('apiKey')) {
        phoenix.userId = $.totalStorage('userId');
        phoenix.apiKey = $.totalStorage('apiKey');
        phoenix.send({
            cmnd: 'gtdd',
            prms: {}
        }, getTDDDone);
    }
}

var getTDDDone = function getTDDDoneF(data) {
    var d = JSON.parse(data);
    $.totalStorage('isTradingDayDateOpen', d.response['gtdd.pop']);
    $.totalStorage('TradingDayDate', d.response['gtdd.ptd']);
    if (d.response['gtdd.pop'] === '0') {
        $("#spnTradingDay").text("Trading Day is CLOSED!");
        $("#btnCharge").attr("disabled", "disabled");
        showDiaInfo(":| Trading day is CLOSED!", "Merchants cannot charge GP when the Pit Trading is closed. Re-Log In to check again.");
    } else {
        $("#spnTradingDay").text("Trading Day: " + d.response['gtdd.ptd']);
    }
}

var showDiaInfo = function showDiaInfoF(header, body) {
    $("#diaInfoHead").text(header);
    $("#diaInfoBody").text(body);
    $("#diaInfo").addClass('in');
}

var hideDiaInfo = function hideDiaInfoF(header) {
    if ($("#diaInfoHead").text() === header) {
        $("#diaInfo").removeClass('in');
    }
}

var showDiaError = function showDiaErrorF(header, body) {
    $("#diaErrorHead").text(header);
    $("#diaErrorBody").text(body);
    $("#diaError").addClass('in');
}

var hideDiaError = function hideDiaErrorF(header) {
    if ($("#diaErrorHead").text() === header) {
        $("#diaError").removeClass('in');
    }
}

var showAlrInfo = function showAlrInfoF(header, body) {
    $("#alrInfoHead").text(header);
    $("#alrInfoBody").text(body);
    $("#alrInfo").modal('show');
}

var refreshCouponCount = function refreshCouponCountF() {
    $("#spnPendingCoupons").text("0");
}