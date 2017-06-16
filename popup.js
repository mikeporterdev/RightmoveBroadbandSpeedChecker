

function save_options() {
    var filterSpeed = $('#speed').val();
    if (isNaN(filterSpeed)) filterSpeed = 0;

    chrome.storage.local.set({'filterSpeed' : filterSpeed}, function () {

        var status = $('#status');
        status.text('Options saved. ');
        setTimeout(function() {
            status.text('');
        }, 2000);
        refreshTab();
    });
}

function restore_options() {
    chrome.storage.local.get("filterSpeed", function(results) {
        $('#speed').val(results.filterSpeed);
    });
}

function refreshTab() {
    //TODO: Refactor to only refresh rightmove
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var currentTab = tabs[0];
        chrome.tabs.update(currentTab.id, {url: currentTab.url});
    });
}

function init() {
    restore_options();

    $('#save').click(save_options);
}

$(document).ready(init);

