/**
 * Created by m_por on 10/06/2017.
 */

function save_options() {

    var filterSpeed = $('#speed').val();
    if (isNaN(filterSpeed)) filterSpeed = 0;

    chrome.storage.local.set({'filterSpeed' : filterSpeed}, function () {

        var status = $('#status');
        status.text('Options saved. ');
        setTimeout(function() {
            status.text('');
        }, 2000);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    });
}

function restore_options() {
    chrome.storage.local.get("filterSpeed", function(results) {
        $('#speed').val(results.filterSpeed);
    });
}

function init() {
    restore_options();

    $('#save').click(save_options);
}

$(document).ready(init);

