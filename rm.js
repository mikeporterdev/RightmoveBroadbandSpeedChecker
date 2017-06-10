
const url = "http://rightmove.co.uk/ajax/broadband-speed-result.html?searchLocation=";

$(document).ready(function () {

    var properties = $('.propertyCard');

    $.each(properties, function (i, property) {
        var title = $(property).find('.propertyCard-title');

        var link = $(property).find('.propertyCard-link').attr("href");
        getPostcode(link, title);
    });
});

function updateBroadbandSpeed(broadbandLink, title) {
    $.getJSON(url + broadbandLink, function (response) {
        var broadbandSpeed = response['broadbandAverageSpeed'];

        chrome.storage.local.get("filterSpeed", function(results) {
            var minBroadbandSpeed = results.filterSpeed;

            if (broadbandSpeed >= minBroadbandSpeed)
                $(title).append('<div style="float:right">' + broadbandSpeed + 'mbps</div>');
            else if (minBroadbandSpeed > 0)
                hideCard(title)
        });
    });
}

function getPostcode(link, title) {
    $.get(link, function (data) {
        var hrefText = $(data).find('.icon-broadband').attr("href");

        if (hrefText) {
            var broadbandLink = hrefText.split('#')[1];
            broadbandLink = broadbandLink.replace("_", "+");
            updateBroadbandSpeed(broadbandLink, title);
        }
    });
}

function hideCard(title) {
    $(title).closest('.l-searchResult').hide();
}