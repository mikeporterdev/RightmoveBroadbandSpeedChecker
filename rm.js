const url = "http://rightmove.co.uk/ajax/broadband-speed-result.html?searchLocation=";

$(document).ready(function () {
    $('#searchHeader').append(" (<span id='hiddenCounter'>0</span> filtered for broadband speed)");

    filterCards();

    $('.l-searchResult').bind('DOMNodeInserted, DOMNodeRemoved', updateOnChange);
});

function updateOnChange() {
    $('#hiddenCounter').text(0);
    setTimeout(function () {
        filterCards();
    }, 500)
}

function filterCards() {
    var properties = $('.propertyCard').not('.is-hidden > div');

    $.each(properties, function (i, property) {
        updatePropertyCard(property);
    });
}

function updatePropertyCard(property) {
    addSpeedTestIfNotExists(property);

    var speedTest = $(property).find('.speedText');
    if (speedTest.text() != "...mbps") {
        //Already got the internet speed for this property
        return;
    }

    var link = $(property).find('.propertyCard-link').attr("href");

    $.get(link, function (data) {
        var hrefText = $(data).find('.icon-broadband').attr("href");

        if (hrefText) {
            var broadbandLink = hrefText.split('#')[1];
            broadbandLink = broadbandLink.replace("_", "+");
            var title = $(property).find('.propertyCard-title');
            updateBroadbandSpeed(broadbandLink, title);
        }
    });
}

function updateBroadbandSpeed(broadbandLink, title) {
    $.getJSON(url + broadbandLink, function (response) {
        var broadbandSpeed = response['broadbandAverageSpeed'];

        chrome.storage.local.get("filterSpeed", function(results) {
            var minBroadbandSpeed = results.filterSpeed;
            if (minBroadbandSpeed == undefined) {
                minBroadbandSpeed = 0
            }

            $(title).find('.speedText').text(broadbandSpeed + 'mbps');

            $(title).closest('.l-searchResult').toggle(minBroadbandSpeed > 0 && broadbandSpeed >= minBroadbandSpeed);

            updateCounter();
        });
    });
}

function addSpeedTestIfNotExists(property) {
    var speedTest = $(property).find('.speedText');

    if (speedTest.length == 0) {
        var title = $(property).find('.propertyCard-title');
        $(title).append('<div class="speedText" style="float:right">...mbps</div>')
    }
}

function updateCounter() {
    var properties = $('.propertyCard:hidden').not('.is-hidden > div');

    $('#hiddenCounter').text(properties.length);
}