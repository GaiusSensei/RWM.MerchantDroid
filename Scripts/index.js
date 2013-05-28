var isOnline = false, isAuth = false;
$(document).ready(function readyF() {
    // Initialize stuff
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
    $('#signin').modal({
        backdrop: 'static',
        show: false
    });
    $('#changepw').modal({
        backdrop: 'static',
        show: false
    });
    // Initialize Internet/Auth Checker
    window.setInterval(function checkConnF() {
        // Check if online
        if (!window.navigator.onLine) {
            if (isOnline) {
                $('#diaNoConn').addClass('in');
                isOnline = false;
            }
        } else {
            if (!isOnline) {
                $('#diaNoConn').removeClass('in');
                isOnline = true;
            }
        }
        // Check if authenticated
        if (!$.totalStorage('apiKey')) {
            if (isAuth) {
                $("#spnUser").text('Guest');
                $("#spnUserAction").text('In');
                $('#diaNoAuth').addClass('in');
                isAuth = false;
            }
        } else {
            if (!isAuth) {
                $("#spnUser").text($.totalStorage('username'));
                $("#spnUserAction").text("Out");
                $('#diaNoAuth').removeClass('in');
                isAuth = true;
            }
        }
    }, 1000);
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
    }
}

var authSend = function authSendF() {
    $('#spnErr').hide();
    $('#diaSignin').slideDown();
    $('#diaSignin').removeClass('alert-error');
    $('#diaSignin').addClass('alert-warn');
    $('#spnWait').show();
    phoenix.userId = "public";
    phoenix.apiKey = "7CE766FE1473813B97C148EB9F7BD49514B9ECD0";
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
        $('#signin').modal('hide');
    }
}

var changePass = function changePassF() {
    $('#signin').modal('hide');
    $('#changepw').modal('show');
    $("#txtCPwMId").val($("#txtMId").val());
    $('#diaChangePW').hide();
}

var forgotPass = function forgotPassF() {
    $('#signin').modal('hide');
}