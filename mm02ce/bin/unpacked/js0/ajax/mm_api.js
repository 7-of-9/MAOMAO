//////////////////////////////////////////////////////
// AJAX / API CALLS
//

var api_base = //"https://localhost:44384/api"   
                 "https://mmapi00.azurewebsites.net/api";

var ajax_style_hi = "background: blue; color: white;";
var ajax_style = "background: white; color: blue;";
var ajax_style_err = "background: red; color: white;";

//
// api/allowable -- get
//
function ajax_isTldAllowable(tld, callback_success) {
    var domain = null;
    try {
        domain = new URL(tld).hostname;
    } catch (err) { console.log("%c /allowable, BAD TLD: [" + tld + "] - " + err, ajax_style_err); }

    if (domain != null) {
        $.get(
            api_base + "/allowable?tld=" + domain, callback_success
        );
    }
}

//
// api/url_nlpinfo -- get
//
function ajax_get_UrlNlpInfo(url, callback_success) {
    var parsed_url = null;
    try {
        parsed_url = new URL(url);
    } catch (err) { console.log("%c /url_nlpinfo, BAD URL: [" + url + "] - " + err, ajax_style_err); }

    if (parsed_url != null) {
        $.get(
            api_base + "/url_nlpinfo?url=" + url, callback_success
        );
    }
}

//
// api/url_nlpinfo_calais -- put
//
function ajax_put_UrlNlpInfoCalais(nlp_info, callback_success) {

    $.ajax(api_base + "/url_nlpinfo_calais", {
            "type": "PUT",
     "contentType": "application/json",
            "data": JSON.stringify(nlp_info),
     "processData": false,
        "dataType": 'json',
         "success": callback_success,
    });

}
