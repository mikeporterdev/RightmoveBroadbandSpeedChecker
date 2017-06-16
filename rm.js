const url = "http://rightmove.co.uk/ajax/broadband-speed-result.html?searchLocation=";

var speedCache = {};
$(document).ready(function () {
    var pathname = window.location.pathname;

    if (pathname === '/property-to-rent/find.html' || pathname === '/property-for-sale/find.html') {
        searchPage();
    } else if (pathname.indexOf('/property-to-rent/property-') > -1 || pathname.indexOf('/property-for-sale/property-') > -1) {
        propertyPage();
    }
});

function propertyPage() {

    var hrefText = $('.icon-broadband').attr("href");
    updateBroadbandSpeedOnPropertyPage(hrefText);
}

function searchPage() {
    $('#searchHeader').append(" (<span id='hiddenCounter'>0</span> filtered for broadband speed)");

    filterCards();

    $('.l-searchResult').bind('DOMNodeInserted, DOMNodeRemoved', function (event) {
        //Ignore the changing of speedtext
        if (!$(event.target).hasClass("speedText")) {
            updateOnChange();
        }
    });
}

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

    if (!(propertyId in speedCache)) {

        speedCache[propertyId] = 0;
        var link = $(property).find('.propertyCard-link').attr("href");
        $.get(link, function (data) {
            var hrefText = $(data).find('.icon-broadband').attr("href");

            if (hrefText) {
                updateBroadbandSpeedOnSearchResult(hrefText, property);
            }
        });
    } else {
        updateCard(property, speedCache[propertyId]);
    }
}

function updateBroadbandSpeedOnSearchResult(hrefText, property) {
    var broadbandLink = hrefText.split('#')[1];
    broadbandLink = broadbandLink.replace("_", "+");

    $.getJSON(url + broadbandLink, function (response) {
        var broadbandSpeed = response['broadbandAverageSpeed'];

        var propertyId = $(property).find('.propertyCard-anchor').attr('id');
        speedCache[propertyId] = broadbandSpeed;


        updateCard(property, broadbandSpeed);
    });
}

function updateBroadbandSpeedOnPropertyPage(hrefText) {
    var broadbandLink = hrefText.split('#')[1];
    broadbandLink = broadbandLink.replace("_", "+");

    $.getJSON(url + broadbandLink, function (response) {
        var broadbandSpeed = response['broadbandAverageSpeed'];
        $('.fs-22').append(" - " + broadbandSpeed + " mbps");
    });
}

function updateCard(property, speed) {
    if (speed > 0) {
        chrome.storage.local.get("filterSpeed", function (results) {
            var minBroadbandSpeed = results.filterSpeed;
            if (minBroadbandSpeed == undefined || minBroadbandSpeed == "") {
                minBroadbandSpeed = 0
            }

            $(property).find('.speedText').text(speed + 'mbps');
            $(property).toggle(minBroadbandSpeed == 0 || speed >= minBroadbandSpeed);

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