const host = "http://localhost:5000";
const apiBaseURL = host + "/api/images";
const tokenBaseURL = host + "/token";
const userBaseURL = host + "/api/accounts";
const accountsApiUrl = host + "/accounts";
const registerUrl = accountsApiUrl + "/register";
const verifyUrl = accountsApiUrl + "/verify";
const accountsGet = host + "/api/accounts/";

function HEAD(successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL,
        type: 'HEAD',
        contentType: 'text/plain',
        complete: request => { successCallBack(request.getResponseHeader('ETag')) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function GET_ID(id, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/" + id,
        type: 'GET',
        success: data => { successCallBack(data); },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function GET_ALL(successCallBack, errorCallBack, queryString = null) {
    let url = apiBaseURL + (queryString ? queryString : "");
    $.ajax({
        url: url,
        type: 'GET',
        success: (data, status, xhr) => { successCallBack(data, xhr.getResponseHeader("ETag")) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function POST(data, token, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (data) => { successCallBack(data) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) },
        beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', token ); }
    });
}
function PUT(bookmark, token, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/" + bookmark.Id,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(bookmark),
        success: () => { successCallBack() },
        error: function (jqXHR) { errorCallBack(jqXHR.status) },
        beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', token ); }
    });
}
function DELETE(id, token, successCallBack, errorCallBack) {
    $.ajax({
        url: apiBaseURL + "/" + id,
        type: 'DELETE',
        success: () => { successCallBack() },
        error: function (jqXHR) { errorCallBack(jqXHR.status) },
        beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', token ); }
    });
}
function TOKEN(data, successCallBack, errorCallBack) {
    $.ajax({
        url: tokenBaseURL,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (data) => { successCallBack(data) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}

function GETUSER(data, successCallBack, errorCallBack) {
    $.ajax({
        url: accountsGet + data.UserId,
        type: 'GET',
        success: (data) => { successCallBack(data) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) },
        beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', data.Access_token ); }
    });
}

function REGISTER(data, successCallBack, errorCallBack) {
    $.ajax({
        url: registerUrl,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (data) => { successCallBack(data) },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}
function VERIFY(successCallBack, errorCallBack, id, code) {
    let url = verifyUrl + `?id=${id}&code=${code}`;
    $.ajax({
        url: url,
        type: 'GET',
        success: data => { successCallBack(data); },
        error: function (jqXHR) { errorCallBack(jqXHR.status) }
    });
}