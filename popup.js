
function save_options(filterSpeed) {
    chrome.storage.local.set({'filterSpeed' : filterSpeed}, function () {
        displayFeedback('Options saved. ');
        refreshTab();
    });
}

function displayFeedback(feedback) {
    var status = $('#status');
    status.text(feedback);
    setTimeout(function () {
        status.text('');
    }, 2000);
}

function restore_options() {
    chrome.storage.local.get("filterSpeed", function(results) {
        var filterSpeed = results.filterSpeed;

        if (filterSpeed == "") filterSpeed = 0;

        $('#speed').val(filterSpeed);

        if (["0", "17", "52", "200", "1000"].indexOf(filterSpeed) > -1){
            $('#speedSelect').val(filterSpeed);
        } else {
            $('#speedSelect').val("custom");
            $('#speedInput').show();
            $('#speedInput').val(filterSpeed);
            $('#save').show();
        }

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

    $('#speedSelect').on("change", function () {
        var value = $(this).val();

        if (!isNaN(value)) {
            save_options(value);
        }
        $('#speedInput').toggle(value === "custom");
        $('#save').toggle(value === "custom");
    });

    $('#save').click(function () {

        var filterSpeed = $('#speedInput').val();
        if (isNaN(filterSpeed)) displayFeedback("Must be a number");
        else save_options(filterSpeed)
    });

    restore_options();
}

$(document).ready(init);

