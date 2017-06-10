/**
 * Created by m_por on 10/06/2017.
 */

function save_options() {

    var filterSpeed = document.getElementById('speed').value;
    filterSpeed = filterSpeed ? filterSpeed : 0;

    chrome.storage.local.set({'filterSpeed' : filterSpeed}, function () {
        var status = document.getElementById('status');
        status.textContent = 'Options saved. ';
        setTimeout(function() {
            status.textContent = '';
        }, 750);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            console.log(tabs)
            chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
        });
    });
}

function restore_options() {
    var minBroadbandSpeed = 0;
    chrome.storage.local.get("filterSpeed", function(results) {
        minBroadbandSpeed = results.filterSpeed;
        document.getElementById('speed').value = minBroadbandSpeed
    });

}

function init() {
    restore_options();
    document.getElementById("save").addEventListener("click", save_options);
}

document.addEventListener('DOMContentLoaded', init);
