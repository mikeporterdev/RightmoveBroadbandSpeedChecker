const url = "http://rightmove.co.uk/ajax/broadband-speed-result.html?searchLocation=";

var speedCache = {};

$(document).ready(function () {
    $('#searchHeader').append(" (<span id='hiddenCounter'>0</span> filtered for broadband speed)");

    filterCards();

    $('.l-searchResult').bind('DOMNodeInserted, DOMNodeRemoved', function(event) {
        //Ignore the changing of speedtext
        if (!$(event.target).hasClass("speedText")) {
            updateOnChange();
        }
    });
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
    addSpeedTextIfNotExists(property);

    var propertyId = $(property).find('.propertyCard-anchor').attr('id');

    if (!(propertyId in speedCache))  {

        speedCache[propertyId] = 0;
        var link = $(property).find('.propertyCard-link').attr("href");
        $.get(link, function (data) {
            var hrefText = $(data).find('.icon-broadband').attr("href");

            if (hrefText) {
                var broadbandLink = hrefText.split('#')[1];
                broadbandLink = broadbandLink.replace("_", "+");
                updateBroadbandSpeed(broadbandLink, property);
            }
        });
    } else {
        updateCard(property, speedCache[propertyId]);
    }
}

function updateBroadbandSpeed(broadbandLink, property) {
    $.getJSON(url + broadbandLink, function (response) {
        var broadbandSpeed = response['broadbandAverageSpeed'];

        var propertyId = $(property).find('.propertyCard-anchor').attr('id');
        speedCache[propertyId] = broadbandSpeed;


        updateCard(property, broadbandSpeed);
    });
}

function updateCard(property, speed) {
    if (speed > 0) {
        chrome.storage.local.get("filterSpeed", function(results) {
            var minBroadbandSpeed = results.filterSpeed;
            if (minBroadbandSpeed == undefined) {
                minBroadbandSpeed = 0
            }

            $(property).find('.speedText').text(speed + 'mbps');
            $(property).toggle(minBroadbandSpeed > 0 && speed >= minBroadbandSpeed);

            updateCounter();
        });
    }
}

function addSpeedTextIfNotExists(property) {
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